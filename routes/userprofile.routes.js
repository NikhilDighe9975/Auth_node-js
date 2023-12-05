const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/userprofile.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const { default: mongoose } = require("mongoose");
const UserprofileModel = require("../schema/userprofile.schema");
const UserModel = require("../schema/user.schema");
const AddressesModel = require("../schema/addresses.schema");

router.get("/get-by-user-id/:userId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getProfileByUserId(req.params.userId);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.post(
    "/address/:userId",
    // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.addAddresses(
            req.params.userId,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.post("/save/:userId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }

    try {
        const user = await UserModel.findById(req.params.userId);

        if (!user) {
            return res
                .status(404)
                .json({ status: "Error", message: "User not found" });
        }
        if (!req.body.addresses || req.body.addresses.length === 0) {
            req.body.addresses = [];
        } else { 
            const addressesWithId = req.body.addresses.map((address) => ({
                _id: new mongoose.Types.ObjectId(),
                ...address,
            }));
            await AddressesModel.insertMany(addressesWithId);
            user.addresses = addressesWithId.map((address) => address._id);
        }

        const userProfileData = {
            userId: user._id, // Assuming userId should be stored in userProfile
            addresses: user.addresses,
        };

        const userProfile = new UserprofileModel(userProfileData);
        await userProfile.save();

        const modifiedAddresses = req.body.addresses.map((address) => ({
            _id: new mongoose.Types.ObjectId(),
            ...address,
        }));

        const response = {
            status: "Success",
            data: {
                _id: user._id,
                userId: user,
                addresses: modifiedAddresses 
            },
        };

        requestResponsehelper.sendResponse(res, response);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ status: "Error", message: "An error occurred" });
    }
});



router.delete("/DeleteAddress/:userId/:addressId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.deleteAddressByUserId(
        req.params.userId,
        req.params.addressId
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/getByuserId/:userId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByUserId(req.params.userId);

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get(
    "/getDefaultAddress/:userId/:isdefault",
    // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        const serviceResponse = await service.getDefaultAddress(
            req.params.userId,
            req.params.isdefault
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get(
    "/getAllAddress/:userId/",
    // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.getAllAddressDetailsByUserId(
            req.params.userId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.put("/updateByUserId/:userId", async (req, res) => {
    if (!req.body.addresses || req.body.addresses.length === 0) {
        // If no addresses are provided, assign an empty array to req.body.addresses
        req.body.addresses = [];
    } else {
        // Generate MongoDB ObjectId for each address if it doesn't have an _id already
        req.body.addresses = req.body.addresses.map((address) => {
            if (!address._id) {
                return {
                    _id: new mongoose.Types.ObjectId(),
                    address,
                };
            }
            return address;
        });
    }

    const serviceResponse = await service.updateAddress(
        req.params.userId,
        req.body
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.put(
    "/updateByAddressId/:addressId",
    // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.updateByAddressId(
            req.params.addressId,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put(
    "/setIsDefaultAddress/user/:userId/address/:addressId",
    // Other middleware and error handling...
    async (req, res, next) => {
        try {
            const userId = req.params.userId;
            const addressId = req.params.addressId;
            const userProfile = await service.getUserProfile(userId);
            if (!userProfile) {
                return res
                    .status(404)
                    .json({ message: "User profile not found." });
            }
            const updatedAddress = await service.updateAddressAndSetDefault(
                addressId,
                req.body
            );
            await service.setOtherAddressesAsNotDefault(
                userProfile.addresses,
                addressId
            );
            return res.status(200).json({
                status: "Success",
                data: updatedAddress,
                AllRecord: userProfile,
                message: "Address updated successfully.",
            });
        } catch (error) {}
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
router.put("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const serviceResponse = await service.updateByuserId(userId, updates);
        console.log(serviceResponse);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
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
router.get("/all/userprofile", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});

module.exports = router;
