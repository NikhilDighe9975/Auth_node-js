const VerifiedModel = require("../schema/verified.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

class VerifiedService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getVerifiedUserByPhoneNumber(userName) {
        try {
            const user = await VerifiedModel.findOne({
                $or: [{ phoneNumber: userName }, { email: userName }],
            });
            return user
                ? new ServiceResponse({
                      data: user,
                  })
                : new ServiceResponse({
                      isError: true,
                      message: "User not found",
                  });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

}

module.exports = new VerifiedService(VerifiedModel, 'verified');
