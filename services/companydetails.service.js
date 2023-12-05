const CompanyDetailsModel = require("../schema/companydetails.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CompanyDetailsService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
}

module.exports = new CompanyDetailsService(CompanyDetailsModel, 'companydetails');
