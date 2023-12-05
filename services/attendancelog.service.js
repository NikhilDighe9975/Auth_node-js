const AttendanceLogModel = require("../schema/attendancelog.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AttendanceLogService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
}

module.exports = new AttendanceLogService(AttendanceLogModel, 'attendancelog');
