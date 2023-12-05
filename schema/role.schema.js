const mongoose = require("mongoose");
const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    // groupId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: false,
    // },
    groupId: {
        type: Number,
        required: false
    },
    roleType: {
        type: String,
        required: false,
    },
    roleId: {
        type: Number,
        required: false,
    },
    appId: {
        type: Number,
        required: true,
    },
    permissions: {
        type: Array
    },
    // permissions: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Permission",
    //         autopopulate: true,
    //     },
    // ],
});

RoleSchema.plugin(require("mongoose-autopopulate"));

const RoleModel = mongoose.model("Role", RoleSchema);

module.exports = RoleModel;
