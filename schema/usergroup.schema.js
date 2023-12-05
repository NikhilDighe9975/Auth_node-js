const mongoose = require("mongoose");

const UserGroupSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            required: true
        },
        userId: {
            type: Number,
            required: true
        },
        roleId: {
            type: Number,
            required: true
        },
    },
    { strict: false, timestamps: true }
);

UserGroupSchema.plugin(require("mongoose-autopopulate"));
const UserGroupModel = mongoose.model("usergroup", UserGroupSchema);
module.exports = UserGroupModel;
