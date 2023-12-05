const { default: mongoose } = require("mongoose");
const GroupModel = require("../schema/group.schema");
const companyDetailsService = require("./companydetails.service");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

class GroupService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    getAllRequestsByCriteria(criteria) {
        const query = {};

        if (criteria.groupId) {
            query.groupId = criteria.groupId;
        }

        if (criteria.name) {
            query.name = criteria.name;
        }

        return this.getAllByCriteria(query);
    }
    //for company details
    async addCompanydetails(groupId, memberObject) {
        const newMember = await companyDetailsService.create(memberObject);

        const updatedGroup = await GroupModel.findOneAndUpdate(
            groupId,
            { $push: { parentId: newMember.data._id } },
            { new: true }
        ).lean();

        const response = {
            status: "Success",
            data: updatedGroup,
            message: "group updated successfully",
        };

        delete response.data.memberObject; // Remove the memberObject from the response

        return response;
    }

    async updateCompanyDetails(companyId, memberObject) {
        return companyDetailsService.updateById(companyId, memberObject);
    }
    async getCompanyDetailsById(companyId) {
        return companyDetailsService.getById(companyId);
    }

    async updateUser(groupId, data) {
        try {
            const resp = await GroupModel.findOneAndUpdate(
                { groupId: groupId },

                data,
                { upsert: true, new: true }
            );

            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async deleteCompanyDetails(groupId, companyId) {
        const deletedMember = await companyDetailsService.deleteById(companyId);

        if (deletedMember.isError) {
            return deletedMember;
        }

        return GroupModel.findOneAndUpdate(
            groupId,
            {
                $pull: { parentId: deletedMember.data._id },
            },
            { new: true }
        ).lean();
    }
    async getAllCompanyDetailsByGroupId(groupId) {
        const company = await this.model
            .findOne({ groupId: groupId })
            .populate("parentId");

        return new ServiceResponse({
            data: company,
        });
    }
    //for group..
        getAllDataByGroupId(groupId, criteria) {
            const query = {
                groupId: groupId,
            };

            if (criteria.name) query.name = new RegExp(criteria.name, "i");
            if (criteria.type) query.type = new RegExp(criteria.type, "i");
            if (criteria.phone) query.phone = new RegExp(criteria.phone, "i");

            if (criteria.user_id) query.user_id = criteria.user_id;

            return this.preparePaginationAndReturnData(query, criteria);
        }
    async getBygroupId(groupId) {
        return this.execute(() => {
            return this.model.findOne({ groupId: groupId });
        });
    }
    async getByShortName(shortName) {
        return this.execute(() => {
            return this.model.findOne({ shortName: shortName });
        });
    }
}

module.exports = new GroupService(GroupModel, "group");
