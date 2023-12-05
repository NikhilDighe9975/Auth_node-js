const { application } = require("express");
const AppModel = require("../schema/application.schema");
const GroupAppModel = require("../schema/groupApp.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const serviceResponse = require("@baapcompany/core-api/services/serviceResponse")
class GroupAppService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getGroupAppByGroupId(groupId, page, limit, sort_by, asc = 1) {
        try {
            const skip = (page - 1) * limit;
            const sortCriteria = { [sort_by]: asc };
            const totalItemsCount = await GroupAppModel.countDocuments({ groupId: groupId });

            if (skip >= totalItemsCount) {
                throw new Error("Page out of range");
            }

            const options = {
                skip,
                limit,
            };

            const groupApp = await GroupAppModel
                .find({ groupId: groupId })
                .sort(sortCriteria)
                .skip(skip)
                .limit(limit);

            const groupAppData = await this.getGroupData(groupApp);

            const combinedData = this.combineData(groupApp, groupAppData);

            return {
                data: combinedData,
                totalItemsCount,
                page,
                size: limit,
            };
        } catch (error) {
            throw error;
        }
    }

    async getGroupData(apps) {
        const appIds = apps.map(app => app.appId);
        const appData = await AppModel.find({ appId: { $in: appIds } });
        return appData;
    }

    async combineData(apps, groupAppData) {
        const combinedData = [];

        for (const app of apps) {
            const appInfo = groupAppData.find(groupApp => groupApp.appId === app.appId);

            if (appInfo) {
                const responseObj = {
                    _id: app._id,
                    groupId: app.groupId,
                    group_app_id: app.group_app_id,
                    appId: {
                        _id: appInfo._id,
                        name: appInfo.name,
                        shortName: appInfo.type,
                        appId: appInfo.appId,
                        type: appInfo.type,
                        createdAt: appInfo.createdAt,
                        updatedAt: appInfo.updatedAt,
                        __v: appInfo.__v
                    },
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt,
                    __v: app.__v
                };

                combinedData.push(responseObj);
            }
        }
        return combinedData;
    }

}

module.exports = new GroupAppService(GroupAppModel, "groupApp");