const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        userId: {
            type: Number,
            required: false
        },
        password: {
            type: String,
            required: false,
        },
        otp: {
            type: Number,
            // default: 282812,
        },
        email: {
            type: String,
            required: function () {
                return !this.phoneNumber;
            },
        },
        phoneNumber: {
            type: String,
            required: function () {
                return !this.email;
            },
        },
        mpin: {
            type: Number,
        },

        // profile_pic: {
        //     type: String,
        //     required: false,
        // },
    },
    { strict: false, timestamps: true }
);
UserSchema.index(
    { email: 1 },
    {
        // unique: true,
        partialFilterExpression: {
            email: { $exists: true, $gt: "" },
        },
    }
);
UserSchema.index(
    { phoneNumber: 1 },
    {
        // unique: true,
        partialFilterExpression: {
            phoneNumber: { $exists: true, $gt: "" },
        },
    }
);

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
