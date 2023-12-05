const mongoose = require("mongoose");

const UserprofileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: false,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"user",
            autopopulate: true,
            required: false,
        },
        groupId: {
            type: Number,
            required: false,
        },

        addresses: { type: [mongoose.Schema.ObjectId], ref: 'addresses', defaultValue: [] },
    },
    { strict: false, timestamps: true }
);
UserprofileSchema.plugin(require("mongoose-autopopulate"));
const UserprofileModel = mongoose.model("userprofile", UserprofileSchema);
module.exports = UserprofileModel;
