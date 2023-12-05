const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/usergroup.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const jwt = require('jsonwebtoken');

router.post(
    "/",
    checkSchema(require("../dto/usergroup.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const user_group_id = +Date.now();
        req.body.user_group_id = user_group_id;
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

router.put("/updateByCustId/:custId", async (req, res) => {
    const serviceResponse = await service.updateMembership(
        req.params.custId,
        req.body
    );

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/find/get-membership-details", async (req, res) => {
    const groupId = parseInt(req.query.groupId);
    const userId = req.query.userId;

    if (!groupId) {
        res.status(400).send({
            status: 400,
            success: false,
            data: undefined,
            message: "Group ID is required",
        });
        return;
    }

    const serviceResponse = await service.findMembershipByGroupIdAndUserId(
        groupId,
        userId
    );

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        phoneNo: req.query.phoneNo,
        name: req.query.name,
    };

    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/userGroup", async (req, res) => {
    const serviceResponse = await service.getAllRequestsByCriteria({
        groupId: req.query.groupId,
        phoneNo: req.query.phoneNo,
    });

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/user/:userId", async (req, res) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    try {
        const serviceResponse = await service.getGroupUserByUserId(req.params.userId, page, size);

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

router.get("/all/:phoneNumber", async (req, res) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }

    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token verification failed" });
        }


        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        try {
            const serviceResponse = await service.getGroupUserByPhoneNumber(req.params.phoneNumber, page, size);

            const data = await serviceResponse.data;

            res.status(200).json({
                message: "Data fetch successfully",
                data,
                totalItemsCount: serviceResponse.totalItemsCount,
                page,
                size
            });
        } catch (error) {
            res.status(400).json({ error: "Please enter a valid phoneNumber there is no data for this phoneNumber." });
        }
    })
});

router.post("/refresh-token", async (req, res) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    try {
        const {groupId, token} = req.body;
        const serviceResponse = await service.getRefreshToken(groupId, token);

        res.status(200).json({message: "Data fetch successfully", data:serviceResponse});
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
