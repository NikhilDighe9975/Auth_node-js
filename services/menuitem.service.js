const MenuItemModel = require("../schema/menuitem.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class MenuItemService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }


    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        // if (criteria.description) query.description = new RegExp(criteria.description, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async getMenuData(appId, menuItemId, parentMenuItemId, subMenuItemId) {
        try {
            const query = {
                app_id: appId,
            };

            if (menuItemId) {
                query.menu_item_id = menuItemId;
            }

            if (parentMenuItemId && subMenuItemId) {
                query.parent_menu_id = parentMenuItemId;
                query.menu_item_id = subMenuItemId;
            } else if (parentMenuItemId) {
                query.parent_menu_id = parentMenuItemId;
            }

            let menuItemData = null;

            if (subMenuItemId) {
                menuItemData = await MenuItemModel.findOne(query);
            } else if (parentMenuItemId) {
                menuItemData = await MenuItemModel.find(query);
            } else if (menuItemId) {
                menuItemData = await MenuItemModel.findOne(query);
            } else {
                menuItemData = await MenuItemModel.find(query);
            }

            if (!menuItemData) {
                return null;
            }

            return menuItemData;
        } catch (error) {
            throw error;
        }
    }


    async updateMenuData(appId, menuItemId, parentMenuItemId, subMenuItemId, updateData) {
        try {
            const query = {
                app_id: appId
            };

            if (menuItemId) {
                query.menu_item_id = menuItemId;
            }

            if (parentMenuItemId && subMenuItemId) {
                query.parent_menu_id = parentMenuItemId;
                query.menu_item_id = subMenuItemId;
            }

            let updatedItem;

            if (subMenuItemId) {
                updatedItem = await MenuItemModel.findOneAndUpdate(query, updateData, { new: true });
            } else if (menuItemId) {
                updatedItem = await MenuItemModel.findOneAndUpdate(query, updateData, { new: true });
            }

            return updatedItem;
        } catch (error) {
            throw error;
        }
    }



    async deleteMenuData(appId, menuItemId, parentMenuItemId, subMenuItemId) {
        try {
            const query = {
                app_id: appId
            };

            if (menuItemId) {
                query.menu_item_id = menuItemId;
            }

            if (parentMenuItemId && subMenuItemId) {
                query.parent_menu_id = parentMenuItemId;
                query.menu_item_id = subMenuItemId;
            }

            let menuitemData;

            if (subMenuItemId) {
                menuitemData = await MenuItemModel.findOneAndDelete(query);
            } else if (menuItemId) {
                menuitemData = await MenuItemModel.findOneAndDelete(query);
            }

            return menuitemData;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = new MenuItemService(MenuItemModel, 'menuitem');
