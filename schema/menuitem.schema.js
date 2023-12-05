const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
    {
        menu_item_id: {
            type: Number,
            required: true,
        },
        groupId: {
            type: Number,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        parent_menu_id: {
            type: Number,
            required: false,
        },
        desc: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: true,
        },
        app_id: {
            type: Number,
            required: true,
        },
    },
    { strict: false, timestamps: true }
);

const MenuItemModel = mongoose.model("menuitem", MenuItemSchema);
module.exports = MenuItemModel;
