const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/group.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");

router.post(
    "/",
    checkSchema(require("../dto/group.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        // Generate the auto ID
        const groupId = +Date.now();
        // Set the generated ID in the request body
        req.body.groupId = groupId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get("/get-by-short-name/:shortName", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByShortName(req.params.shortName);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/getByGroupId/:groupId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getBygroupId(req.params.groupId);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);
    
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.put("/updateBygroupId/:groupId", async (req, res) => {
    const serviceResponse = await service.updateUser(
        req.params.groupId,
        req.body
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        phone: req.query.phone,
        name: req.query.name,
        type: req.query.type,
        user_id: req.query.user_id,
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/group", async (req, res) => {
    const serviceResponse = await service.preparePaginationAndReturnData(
        { name: new RegExp(req.query.name, "i") },
        req.query
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
//for child group or company details
router.post(
    "/companydetails/:groupId",
    // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.addCompanydetails(
            req.params.groupId,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put(
    "/companydetails/:companyId",
    // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.updateCompanyDetails(
            req.params.companyId,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/companydetails/:companyId",
    // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.getCompanyDetailsById(
            req.params.companyId,
            req.query
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete(
    "/companydetails/:groupId/:companyId",

    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.deleteCompanyDetails(
            req.params.groupId,
            req.params.companyId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/get-all-companydetails/:groupId/",
    // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.getAllCompanyDetailsByGroupId(
            req.params.groupId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

module.exports = router;
