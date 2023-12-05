const { default: mongoose } = require("mongoose");
const PermissionModel = require("../schema/permission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class PermissionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        // if (criteria.description) query.description = new RegExp(criteria.description, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async getAllPermissionsByApp(appId, criteria) {
        const pagination = {
            pageNumber: criteria.pageNumber,
            pageSize: criteria.pageSize,
        };
        const paginationErrors =
            this.validateAndSanitizePaginationProps(pagination);
        if (paginationErrors) {
            return paginationErrors;
        }

        const query = {
            appId: new mongoose.Types.ObjectId(appId),
        };

        if (criteria.searchTerm) {
            query["$or"] = [
                { name: new RegExp(criteria.searchTerm, "i") },
                { code: new RegExp(criteria.searchTerm, "i") },
            ];
        }

        return this.execute(async () => {
            return {
                items: await this.model.find(
                    query,
                    {},
                    {
                        skip: pagination.pageSize * (pagination.pageNumber - 1),
                        limit: pagination.pageSize,
                    }
                ),
                totalItemsCount: await this.model.countDocuments(query),
            };
        });
    }
    async getByPermissionId(permissionId) {
        return this.execute(() => {
            return this.model.findOne({ permissionId: permissionId });
        });
    }
    async bulkadd(permissions, appId) {
        return this.execute(() => {
            const queries = permissions.map((permission) => {
                return {
                    updateOne: {
                        filter: {
                            name: permission.name,
                            appId: appId,
                        },
                        update: {
                            $set: { ...permission, appId: appId },
                        },
                        upsert: true,
                    },
                };
            });
            return this.model.bulkWrite(queries);
        });
    }
}

module.exports = new PermissionService(PermissionModel, "permission");
