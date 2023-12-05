const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/menuitem.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post("/", checkSchema(require("../dto/menuitem.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const menuItemId = +Date.now();
        req.body.menu_item_id = menuItemId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/menuItem", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        name: req.query.name,
        // description: req.query.description,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get('/appId/:appId', async (req, res) => {
    try {
        const appId = req.params.appId;
        const menuItemId = req.query.menuItemId;
        const parentMenuItemId = req.query.parentMenuItemId;
        const subMenuItemId = req.query.subMenuItemId;

        if (!appId) {
            return res.status(400).json({ error: 'appId is required' });
        }

        const resultData = await service.getMenuData(appId, menuItemId, parentMenuItemId, subMenuItemId);

        if (!resultData) {
            return res.status(404).json({ error: 'Data not found' });
        }

        return res.status(200).json({
            message: 'Data fetch successfully',
            data: resultData,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/appId/:appId', async (req, res) => {
    try {
        const appId = req.params.appId;
        const menuItemId = req.query.menuItemId;
        const parentMenuItemId = req.query.parentMenuItemId;
        const subMenuItemId = req.query.subMenuItemId;
        const updateData = req.body;

        if (!appId) {
            return res.status(400).json({ error: 'appId is required' });
        }

        const resultData = await service.updateMenuData(appId, menuItemId, parentMenuItemId, subMenuItemId, updateData);

        if (!resultData) {
            return res.status(404).json({ error: 'Data not found to update' });
        }

        return res.status(200).json(resultData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/appId/:appId', async (req, res) => {
    try {
        const appId = req.params.appId;
        const menuItemId = req.query.menuItemId;
        const parentMenuItemId = req.query.parentMenuItemId;
        const subMenuItemId = req.query.subMenuItemId;


        if (!appId) {
            return res.status(400).json({ error: 'appId is required' });
        }

        const resultData = await service.deleteMenuData(appId, menuItemId, parentMenuItemId, subMenuItemId);

        if (!resultData) {
            return res.status(404).json({ error: 'Data not found to delete' });
        }

        return res.status(200).json(resultData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
