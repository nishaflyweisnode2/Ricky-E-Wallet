const Joi = require('joi');


exports.registrationSchema = Joi.object({
    mobileNumber: Joi.string().required(),
});

exports.generateOtp = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

exports.otpSchema = Joi.object({
    userId: Joi.string().length(24).hex().required(),
    otp: Joi.string().length(5).required(),
});


exports.resendOtpSchema = Joi.object({
    userId: Joi.string().length(24).hex().required()
});

exports.loginSchema = Joi.object({
    mobileNumber: Joi.string().required(),
});

exports.updateUserSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().required(),
});


exports.updateUserProfileSchema = Joi.object({
    mobileNumber: Joi.string().optional(),
    name: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('Male', 'Female').optional(),
});

