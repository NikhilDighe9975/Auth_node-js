const { userId } = require("../dto/userRoleMapping.dto");
const GroupModel = require("../schema/group.schema");
const RoleModel = require("../schema/role.schema");
const UserModel = require("../schema/user.schema");
const UserGroupModel = require("../schema/usergroup.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const serviceResponse = require("@baapcompany/core-api/services/serviceResponse")
const jwt = require('jsonwebtoken');


class UserGroupService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };

        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        if (criteria.phoneNo) query.phoneNo = criteria.phoneNo;

        return this.preparePaginationAndReturnData(query, criteria);
    }

    async updateMembership(custId, data) {
        try {
            const resp = await UserGroupModel.findOneAndUpdate(
                { custId: custId },

                data,
                { upsert: true, new: true }
            );

            return new serviceResponse({
                data: resp,
            });
        } catch (error) {
            return new serviceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async getAllRequestsByCriteria(criteria) {
        const query = {};

        if (criteria.groupId) {
            query.groupId = criteria.groupId;
        }

        if (criteria.phoneNo) {
            query.phoneNo = criteria.phoneNo;
        }

        return this.getAllByCriteria(query);
    }

    async findMembershipByGroupIdAndUserId(groupId, userId) {
        let is_member = false;

        const membership = await UserGroupModel.findOne({
            groupId: groupId,
            userId: userId,
        });

        if (membership) {
            is_member = true;
        }

        const group = await GroupModel.findOne({ groupId: groupId });

        return { group: group, is_member: is_member, membership: membership };
    }

    async getGroupUserByUserId(userId, page, limit, sort_by, asc = 1) {
        try {
            console.log("Fetching data for userId:", userId);
            const skip = (page - 1) * limit;
            const sortCriteria = { [sort_by]: asc };
            const totalItemsCount = await UserGroupModel.countDocuments({ userId: userId });
            console.log("Total items count:", totalItemsCount);

            if (skip >= totalItemsCount) {
                throw new Error("Page out of range");
            }

            const options = {
                skip,
                limit,
            };

            const userGroup = await UserGroupModel
                .find({ userId: userId })
                .sort(sortCriteria)
                .skip(skip)
                .limit(limit);

            const userGroupData = await this.getGroupData(userGroup);

            const combinedData = this.combineData(userGroup, userGroupData);

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

    async getRefreshToken(groupId, token) {
        try {
            const decoded = jwt.verify(token, process.env.API_SECRET);
            const userId = decoded.userId;

            const userGroup = await UserGroupModel.findOne({ groupId: groupId, userId: userId });

            if (!userGroup) {
                throw new Error("User group not found");
            }

            const userData = await UserModel.findOne({ userId: userId });
            const roleData = await RoleModel.findOne({ roleId: userGroup.roleId });

            if (!userData || !roleData) {
                throw new Error("User or role not found");
            }

            const payload = {
                userId: userData.userId,
                name: userData.name,
                emailId: userData.email,
                phoneNumber: userData.phoneNumber,
                role: {
                    roleId: roleData.roleId,
                    name: roleData.name,
                    permissions: roleData.permissions
                }
            };

            const secretKey = process.env.API_SECRET;
            const options = { expiresIn: 86400 };

            const generatedToken = jwt.sign(payload, secretKey, options);

            return generatedToken;
        } catch (error) {
            console.error("Token generation error:", error);
            throw new Error('Token generation failed');
        }
    }

    async getGroupUserByPhoneNumber(phoneNumber, page, limit, sort_by, asc = 1) {
        try {
            const skip = (page - 1) * limit;
            const sortCriteria = { [sort_by]: asc };

            const users = await UserModel.find({ phoneNumber: phoneNumber });

            const userIds = users.map(user => user.userId);

            const totalItemsCount = await UserGroupModel.countDocuments({ userId: { $in: userIds } });

            if (skip >= totalItemsCount) {
                throw new Error("Page out of range");
            }

            const options = {
                skip,
                limit,
            };

            const userGroup = await UserGroupModel
                .find({ userId: { $in: userIds } })
                .sort(sortCriteria)
                .skip(skip)
                .limit(limit);

            const groupData = await this.getGroupData(userGroup);

            const combinedData = this.combineData(userGroup, groupData, users);

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

    async getGroupData(groups) {
        if (Array.isArray(groups)) {
            const groupIds = groups.map(group => group.groupId);
            return await GroupModel.find({ groupId: { $in: groupIds } });
        } else {
            const groupData = await GroupModel.findOne({ groupId: groups.groupId });
            return groupData ? [groupData] : [];
        }
    }

    async getUsersData(groups) {
        const userIds = groups.map(group => group.userId);
        const userData = await UserModel.find({ userId: { $in: userIds } });
        return userData;
    }

    async combineSingleData(group, groupData, userData) {
        const combinedData = [];

        if (!group || !groupData || !userData) {
            throw new Error('Invalid input data');
        }

        const groupInfo = groupData.find(item => item.groupId === group.groupId);
        const userInfo = userData.find(item => item.userId === group.userId);

        if (groupInfo && userInfo) {
            const role = await RoleModel.findOne({ roleId: group.roleId });

            if (role) {
                const responseObj = {
                    _id: group._id,
                    user_group_id: group.user_group_id,
                    groupId: {
                        _id: groupInfo._id,
                        groupId: groupInfo.groupId,
                        name: groupInfo.name,
                        type: groupInfo.type,
                        shortName: groupInfo.shortName,
                        logo_url: groupInfo.logo_url,
                        mobile_logo_url: groupInfo.mobile_logo_url
                    },
                    user: {
                        _id: userInfo._id,
                        userId: userInfo.userId,
                        name: userInfo.name,
                        email: userInfo.email,
                        phoneNumber: userInfo.phoneNumber
                    },
                    role: {
                        roleId: role.roleId,
                        name: role.name,
                        permissions: role.permissions
                    },
                    createdAt: group.createdAt,
                    updatedAt: group.updatedAt,
                    __v: group.__v
                };

                combinedData.push(responseObj);
            }
        }

        return combinedData;
    }

    async combineData(groups, groupData, userData) {
        const combinedData = [];

        if (!Array.isArray(groups) || !Array.isArray(groupData) || !Array.isArray(userData)) {
            throw new Error('Invalid input data');
        }

        for (const group of groups) {
            const groupInfo = groupData.find(item => item.groupId === group.groupId);
            const userInfo = userData.find(item => item.userId === group.userId);

            if (groupInfo && userInfo) {
                const role = await RoleModel.findOne({ roleId: group.roleId });

                if (role) {
                    const responseObj = {
                        _id: group._id,
                        user_group_id: group.user_group_id,
                        groupId: {
                            _id: groupInfo._id,
                            groupId: groupInfo.groupId,
                            name: groupInfo.name,
                            type: groupInfo.type,
                            shortName: groupInfo.shortName,
                            logo_url: groupInfo.logo_url,
                            mobile_logo_url: groupInfo.mobile_logo_url
                        },
                        user: {
                            _id: userInfo._id,
                            userId: userInfo.userId,
                            name: userInfo.name,
                            email: userInfo.email,
                            phoneNumber: userInfo.phoneNumber
                        },
                        role: {
                            roleId: role.roleId,
                            name: role.name
                        },
                        createdAt: group.createdAt,
                        updatedAt: group.updatedAt,
                        __v: group.__v
                    };

                    combinedData.push(responseObj);
                }
            }
        }
        return combinedData;
    }

}

module.exports = new UserGroupService(UserGroupModel, "usergroup");
