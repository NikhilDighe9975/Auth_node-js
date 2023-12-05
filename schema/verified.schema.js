const mongoose = require("mongoose");

const VerifiedSchema = new mongoose.Schema(
    {
        email: {
            type: String,
        },
        phoneNumber: {
            type: Number,
        },
        otp: {
            type: Number,
        },
    },
    { timestamps: true }
);

const VerifiedModel = mongoose.model("verified", VerifiedSchema);
module.exports = VerifiedModel;
