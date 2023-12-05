const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/groupApp.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");


router.get("/group/:groupId", async (req, res) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    try {
        const serviceResponse = await service.getGroupAppByGroupId(req.params.groupId, page, size);

        const data = await serviceResponse.data;

        res.status(200).json({
            message: "Data fetch successfully",
            data,
            totalItemsCount: serviceResponse.totalItemsCount,
            page,
            size
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post(
    "/",
    checkSchema(require("../dto/groupApp.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const group_app_id = +Date.now();
        req.body.group_app_id = group_app_id;
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

module.exports = router;