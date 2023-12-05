const mongoose = require("mongoose");

const AddressesSchema = new mongoose.Schema(
    {},
    { strict: false, timestamps: true }
);
AddressesSchema.plugin(require("mongoose-autopopulate"));

const AddressesModel = mongoose.model("addresses", AddressesSchema);
module.exports = AddressesModel;
