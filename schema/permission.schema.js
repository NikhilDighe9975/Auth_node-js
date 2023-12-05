const mongoose = require("mongoose");
const PermissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    shortCode: {
        type: Number,
        required: false,
    },
    type: {
        type: String,
        enum: ["UI", "API"],
    },
    appId:{
        type: Number
    },
    // appId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "application",
    //     autopopulate: true,
    //     required: true,
    // },
    permissionId: {
        type: Number,
        required: false,
    },
});

PermissionSchema.plugin(require("mongoose-autopopulate"));

const PermissionModel = mongoose.model("Permission", PermissionSchema);

module.exports = PermissionModel;
