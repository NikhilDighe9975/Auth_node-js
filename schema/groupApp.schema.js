const mongoose = require("mongoose");

const GroupAppSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        appId: {
            type: Number,
            required: true
        },
        date: {
            type: Date
        },
    },
    { strict: false, timestamps: true }
);

GroupAppSchema.plugin(require("mongoose-autopopulate"));
const GroupAppModel = mongoose.model("groupApp", GroupAppSchema);
module.exports = GroupAppModel;
