const AddressesModel = require("../schema/addresses.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AddressesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
}

module.exports = new AddressesService(AddressesModel, 'addresses');
