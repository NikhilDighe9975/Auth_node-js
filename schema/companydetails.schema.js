const mongoose = require("mongoose");

const CompanyDetailsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        taxId: {
            type: String,
            required: true,
        },
        CIN: {
            type: String,
            required: true,
        },
        
    },
    {strict:false, timestamps: true }
);
CompanyDetailsSchema.plugin(require('mongoose-autopopulate'));

const CompanyDetailsModel = mongoose.model("companydetails", CompanyDetailsSchema);
module.exports = CompanyDetailsModel;
