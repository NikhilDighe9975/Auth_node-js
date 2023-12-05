const mongoose = require("mongoose");

const AttendanceLogSchema = new mongoose.Schema(
    {},
    { strict: false, timestamps: true }
);

const AttendanceLogModel = mongoose.model("attendancelog", AttendanceLogSchema);
module.exports = AttendanceLogModel;
