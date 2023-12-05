const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
    {
        subGroupId: {
            type: Number
        },
        name: {
            type: String,
            required: true,
            unique: true,
        },
        shortName: {
            type: String,
            required: true,
            unique: true,
        },
        groupId: {
            type: Number,
            required: false,
        },
        user_id: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: false,
        },
        parentId: { type: [mongoose.Schema.ObjectId], ref: 'companydetails', defaultValue: [] },

    },
    { strict: false, timestamps: true }
);

const GroupModel = mongoose.model("group", GroupSchema);
module.exports = GroupModel;
