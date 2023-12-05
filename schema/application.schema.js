const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        shortName: {
            type: String,
            required: true,
        },
        discription: {
            type: String,
        },
        appId: {
            type: Number
        },
        type: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const ApplicationModel = mongoose.model("application", ApplicationSchema);
module.exports = ApplicationModel;
