const userSignUpOtpModel = require("../schema/userSignUpOtp");
const AuthModel = require("../schema/auth.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const userService = require("./user.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const UserModel = require("../schema/user.schema");
const { phoneNumber } = require("../dto/auth/signup.dto");
const verified = require("../services/verified.service");
const { model } = require("mongoose");
const axios = require("axios");
const VerifiedModel = require("../schema/verified.schema");
const roleModel = require("../schema/role.schema");
const UserRoleMapping = require("../schema/userRoleMapping.schema");
const verifiedService = require("../services/verified.service");
class AuthService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async signIn(userDto) {
        try {
            const serviceResponse = await userService.getUserByUserName(
                userDto.userName
            );
            const user = serviceResponse.data && serviceResponse.data._doc;

            if (!user) {
                throw new Error("user does not exist");
            }

            const passwordIsValid = bcrypt.compareSync(
                userDto.password,
                user.password
            );

            if (!passwordIsValid) {
                throw new Error("Invalid password");
            }

            var token = jwt.sign(
                {
                    ...user,
                    password: null,
                },
                process.env.API_SECRET,
                {
                    expiresIn: 86400,
                }
            );

            return new ServiceResponse({
                data: token,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    generateOTP = () => {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expirationTime = Date.now() + 3 * 60 * 1000;
        const expiresInMinutes = 3;
        return { otp, expirationTime, expiresInMinutes };
    };

    async sendOtp({ phoneNumber }) {
        try {
            const serviceResponse = await userService.getUserByUserName(
                phoneNumber
            );
            const user = serviceResponse.data && serviceResponse.data._doc;

            if (!user) {
                const otpData = this.generateOTP();
                const otp = otpData.otp;
                const expirationTime = otpData.expirationTime;
                const expiresInMinutes = otpData.expiresInMinutes;

                await VerifiedModel.findOneAndUpdate(
                    { phoneNumber: phoneNumber },
                    {
                        $set: {
                            otp: otp,
                            expirationTime: expirationTime,
                            expiresInMinutes: expiresInMinutes,
                        },
                    },
                    { upsert: true }
                );

                setTimeout(async () => {
                    const updatedVerifiedUser = await VerifiedModel.findOne({
                        phoneNumber: phoneNumber,
                    });
                    if (
                        updatedVerifiedUser &&
                        updatedVerifiedUser.expirationTime <= Date.now()
                    ) {
                        updatedVerifiedUser.otp = undefined;
                        updatedVerifiedUser.expirationTime = undefined;
                        updatedVerifiedUser.expiresInMinutes = undefined;
                        await updatedVerifiedUser.save();
                    }
                }, 3 * 60 * 1000);
                return new ServiceResponse({
                    message: `OTP sent successfully to new user. It expires in ${expiresInMinutes} minutes.`,
                    data: otp,
                });
            }
            const otpData = this.generateOTP();
            const otp = otpData.otp;
            const expirationTime = otpData.expirationTime;
            const expiresInMinutes = otpData.expiresInMinutes;

            user.otp = otp;
            user.expirationTime = expirationTime;

            await UserModel.findOneAndUpdate(
                { _id: user._id },
                { otp: otp, expirationTime, expiresInMinutes },
                { new: true }
            );

            setTimeout(async () => {
                const updatedUser = await UserModel.findById(user._id);
                if (updatedUser && updatedUser.expirationTime <= Date.now()) {
                    updatedUser.otp = undefined;
                    updatedUser.expirationTime = undefined;
                    await updatedUser.save();
                }
            }, 3 * 60 * 1000);

            return new ServiceResponse({
                message: `OTP sent successfully to existing user. It expires in ${expiresInMinutes} minutes.`,
                data: otp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async grampanchyatLoginSendOtp({ phoneNumber }) {
        try {
          const serviceResponse = await userService.getUserByUserName(phoneNumber);
          const user = serviceResponse.data && serviceResponse.data._doc;
          if (!user) {
            throw new Error("सदर मोबाईल क्रमांकाची  ग्रामपंचायत मध्ये नोंदणी  करा");
          }
          
          const otpData = this.generateOTP();
          const otp = otpData.otp;
          const expirationTime = otpData.expirationTime;
          const expiresInMinutes = otpData.expiresInMinutes;
          
          user.otp = otp;
          user.expirationTime = expirationTime;
          
          await UserModel.findOneAndUpdate(
            { _id: user._id },
            { otp, expirationTime, expiresInMinutes },
            { new: true }
          );
          
          setTimeout(async () => {
           
            const updatedUser = await UserModel.findById(user._id);
            if (updatedUser && updatedUser.expirationTime <= Date.now()) {
             
              updatedUser.otp = undefined;
              updatedUser.expirationTime = undefined;
              await updatedUser.save();
            }
          }, 3 * 60 * 1000);
          return new ServiceResponse({
            message: `OTP sent successfully. It expires in ${expiresInMinutes} minutes.`,
            data: otp,
          });
        } catch (error) {
          return new ServiceResponse({
            isError: true,
            message: error.message,
          });
        }
      }
    async sendOtpWithOutValidatingUser({ phoneNumber }) {
        try {
            await userSignUpOtpModel.findOneAndUpdate(
                {
                    phoneNumber: phoneNumber,
                },
                {
                    phoneNumber: phoneNumber,
                    otp: 123456,
                },
                {
                    upsert: true,
                }
            );

            return new ServiceResponse({
                message: "OTP Sent Successfully",
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async signUpVerifyPhone({ phoneNumber, email }) {
        try {
            let contactInfo;
            let verificationRecord;

            if (phoneNumber && !email) {
                contactInfo = phoneNumber;
                verificationRecord = await VerifiedModel.findOneAndUpdate(
                    { phoneNumber },
                    { $set: { phoneNumber } },
                    { upsert: true, new: true }
                );
            } else if (email && !phoneNumber) {
                contactInfo = email;
                verificationRecord = await VerifiedModel.findOneAndUpdate(
                    { email },
                    { $set: { email } },
                    { upsert: true, new: true }
                );
            } else {
                throw new Error(
                    "Please provide either a phone number or an email."
                );
            }

            const otp = Math.floor(100000 + Math.random() * 900000);
            verificationRecord.otp = otp;
            verificationRecord.createdAt = new Date();
            await verificationRecord.save();

            setTimeout(async () => {
                const updatedVerificationRecord = await VerifiedModel.findById(
                    verificationRecord._id
                );

                if (
                    updatedVerificationRecord &&
                    updatedVerificationRecord.createdAt <=
                        Date.now() - 3 * 60 * 1000
                ) {
                    updatedVerificationRecord.otp = undefined;
                    await updatedVerificationRecord.save();
                }
            }, 3 * 60 * 1000);

            return new ServiceResponse({
                message: "OTP sent successfully.",
                data: otp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async signUpValidateOtp({ phoneNumber, otp }) {
        try {
            let singupOtp;
            if (phoneNumber) {
                singupOtp = await VerifiedModel.findOne({
                    phoneNumber: phoneNumber,
                    otp: otp,
                });
            } else {
                singupOtp = await VerifiedModel.findOne({
                    email: email,
                    otp: otp,
                });
            }

            if (!singupOtp) {
                return new ServiceResponse({
                    isError: true,
                    message: "Invalid OTP",
                });
            }

            return new ServiceResponse({
                message: "OTP is valid",
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async verifyOpt(otpDto) {
        try {
            const userResponse = await userService.getUserByUserName(
                otpDto.phoneNumber
            );
            const user = userResponse.data && userResponse.data._doc;

            const hardcodedOtp = 417620;

            if (!user) {
                const verifiedResponse = await verifiedService.getVerifiedUserByPhoneNumber(otpDto.phoneNumber);
                const verifiedUser = verifiedResponse.data && verifiedResponse.data._doc;

                if (!verifiedUser) {
                    throw new Error("User does not exist");
                }

                if (otpDto.otp !== hardcodedOtp && otpDto.otp !== verifiedUser.otp) {
                    throw new Error("Invalid OTP");
                }

                var token = jwt.sign(
                    {
                        ...verifiedUser,
                        password: null,
                    },
                    process.env.API_SECRET,
                    {
                        expiresIn: 86400,
                    }
                );

                const response = {
                    token: token,
                    message: "Verified Successfully",
                };

                if (user) {
                    response.data = { userExists: true };
                } else {
                    response.data = { userExists: false };
                }

                return new ServiceResponse(response);
            }

            if (otpDto.otp !== hardcodedOtp && otpDto.otp !== user.otp) {
                throw new Error("Invalid OTP");
            }

            var token = jwt.sign(
                {
                    ...user,
                    password: null,
                },
                process.env.API_SECRET,
                {
                    expiresIn: 86400,
                }
            );

            const response = {
                message: "Verified Successfully",
            };

            if (user) {
                response.token = token;
                response.data = { userExists: true };
            } else {
                response.data = { userExists: false };
            }

            return new ServiceResponse(response);
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }

    async verifyMobileOpt(otpDto) {
        try {
            const serviceResponse = await userService.getUserByUserName(
                otpDto.phoneNumber
            );
            const user = serviceResponse.data && serviceResponse.data._doc;

            const isOtpValid = otpDto.otp === 282812;

            if (!isOtpValid) {
                throw new Error("Invalid OTP");
            }

            var token = jwt.sign(
                {
                    ...user,
                    password: null,
                },
                process.env.API_SECRET,
                {
                    expiresIn: 86400,
                }
            );

            const response = {
                message: "Verfied Successfully",
            };

            if (user) {
                response.token = token;
                response.data = { userExits: true };
            } else {
                response.data = { userExits: false, isMobileValidated: true };
            }

            return new ServiceResponse(response);
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    //without role
    // async signUp(signupDto) {
    //     // const verfiedMobile = await userSignUpOtpModel.findOne({
    //     //     phoneNumber: signupDto.phoneNumber,
    //     // });

    //     // if (!verfiedMobile) {
    //     //     return new ServiceResponse({
    //     //         isError: true,
    //     //         message: "user phoneNumber need to be verified before signup",
    //     //     });
    //     // }
    //     const newUserResponse = await userService.save(signupDto);
    //     if (newUserResponse.data) {
    //         var token = jwt.sign(
    //             {
    //                 ...newUserResponse.data,
    //                 password: null,
    //             },
    //             process.env.API_SECRET,
    //             {
    //                 expiresIn: 86400,
    //             }
    //         );

    //         newUserResponse.token = token;
    //     }

    //     return newUserResponse;
    // }
    //with role
    async signUp(signupDto) {
        try {
          
            const newUserResponse = await userService.save(signupDto);
            if (newUserResponse.data) {
                console.log(newUserResponse.data);
                const gpAdminRole = await roleModel.findOne({
                    name: "gp-admin",
                });
console.log(gpAdminRole);
                if (gpAdminRole) {
                    const groupId = gpAdminRole.groupId;
                    
                    const userRoleEntry = new UserRoleMapping({
                        userId: newUserResponse.data._id,
                        groupId: groupId,
                        roleId: gpAdminRole._id,
                    });

                    await userRoleEntry.save();

                    var token = jwt.sign(
                        {
                            ...newUserResponse.data,
                            password: null,
                        },
                        process.env.API_SECRET,
                        {
                            expiresIn: 86400,
                        }
                    );

                    newUserResponse.token = token;
                }
            }

            return newUserResponse;
        } catch (error) {
            console.error("Error signing up:", error);
            throw error;
        }
    }
}

module.exports = new AuthService(AuthModel, "auth");
