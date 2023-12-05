const { default: mongoose } = require("mongoose");
const UserprofileModel = require("../schema/userprofile.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const addressesService = require("./addresses.service");
const AddressesModel = require("../schema/addresses.schema");

class UserprofileService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    // getAllRequestsByCriteria(criteria) {
    //     const query = {};

    //     if (criteria.name) {
    //         query.name = criteria.name;
    //     }

    //     if (criteria.phoneNo) {
    //         query.phoneNo = criteria.phoneNo;
    //     }

    //     return this.getAllByCriteria(query);
    // }

    // Assume this function fetches the user profile from the database
    async getUserProfile(userId) {
        const userProfile = await UserprofileModel.findOne({ userId }).populate(
            "addresses"
        );
        return userProfile;
    }

    // Assume this function updates an address and sets it as default
    async updateAddressAndSetDefault(addressId, addressObject) {
        const updatedAddress = await AddressesModel.findByIdAndUpdate(
            addressId,
            { ...addressObject, isdefault: true },
            { new: true }
        );
        return updatedAddress;
    }

    // Assume this function sets all other addresses as not default
    async setOtherAddressesAsNotDefault(addresses, currentAddressId) {
        for (const address of addresses) {
            if (address._id.toString() !== currentAddressId) {
                await AddressesModel.findByIdAndUpdate(
                    address._id,
                    { ...address.toObject(), isdefault: false },
                    { new: true }
                );
            }
        }
    }

    updateByuserId = async (userId, updates) => {
        try {
            const user = await this.updateById(
                { "userId._id": userId },
                updates,
                { new: true }
            );

            if (!user) {
                throw new Error("User not found");
            }

            return user;
        } catch (error) {
            throw error;
        }
    };
    async getByUserId(userId) {
        return this.execute(() => {
            return this.model.findOne({ userId: userId });
        });
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };

        if (criteria.name) query.name = new RegExp(criteria.name, "i");

        if (criteria.phoneNo) query.phoneNo = criteria.phoneNo;

        return this.preparePaginationAndReturnData(query, criteria);
    }
    getProfileByUserId(userId) {
        return this.execute(() => {
            return this.model.findOne({
                userId: new mongoose.Types.ObjectId(userId),
            });
        });
    }
    async getDefaultAddress(userId, isDefault) {
        const user = await this.model
            .findOne({ userId: new mongoose.Types.ObjectId(userId) })
            .populate("addresses");
       
        if (!user) {
            return new ServiceResponse({
                status: "Error",
                message: "User not found",
            });
        }
        let defaultAddress;
        if (isDefault === "true") {
            defaultAddress = user.addresses.find(
                (address) => address.isdefault === true
            );
        } else {
            defaultAddress = user.addresses[0];
        }
        return new ServiceResponse({
            data: defaultAddress,
        });
    }
    async getAllAddressDetailsByUserId(userId) {
        const address = await this.model
            .findOne({ userId: new mongoose.Types.ObjectId(userId) })
            .populate("addresses");

        return new ServiceResponse({
            data: address,
        });
    }
    async updateAddress(userId, data) {
        try {
            const resp = await UserprofileModel.findOneAndUpdate(
                { userId: userId },

                data,
                { upsert: true, new: true }
            );

            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async updateByAddressId(addressId, addressObject) {
        return addressesService.updateById(addressId, addressObject);
    }
    async deleteAddressByUserId(userId, addressId) {
        let customer = await UserprofileModel.findOne({ userId: userId });
        customer.addresses.forEach((element, index) => {
            if (element._id == addressId) {
                customer.addresses.splice(index, 1);
                return;
            }
        });
        const updatedCustomer = await UserprofileModel.findOneAndUpdate(
            { userId: userId },
            customer,
            { new: true }
        );
        if (!updatedCustomer) {
            return {
                status: "Failed",
                message: "Failed to update customer",
            };
        }

        return {
            status: "Success",
            data: updatedCustomer,
            message: "Address deleted successfully",
        };
    }

    async addAddresses(userId, memberObject) {
        const newMember = await addressesService.create(memberObject);
        const updatedGroup = await this.model
            .findOneAndUpdate(
                { userId: userId }, // Updated line - provide the correct query
                { $push: { addresses: newMember.data } },
                { new: true, upsert: true }
            )
            .populate("addresses");
    
        const response = {
            status: "Success",
            data: updatedGroup.addresses,
            message: "Address updated successfully",
        };
    
        delete response.data.memberObject; // Remove the memberObject from the response
    
        return response;
    }
    

    saveProfileByUserId(userId, data) {
        return this.execute(() => {
            return this.model.findOneAndUpdate(
                {
                    userId: new mongoose.Types.ObjectId(userId),
                },
                { ...data, userId: userId },
                {
                    new: true,
                    upsert: true,
                }
                
            );
            
        });
    }
}
// Define a function to update an address and set it as default

module.exports = new UserprofileService(UserprofileModel, "userprofile");
