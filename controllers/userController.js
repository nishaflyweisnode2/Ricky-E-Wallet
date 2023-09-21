const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const { registrationSchema, generateOtp, otpSchema, resendOtpSchema, updateUserSchema, updateUserProfileSchema } = require('../validations/userValidation');



exports.register = async (req, res) => {
    try {
        const { mobileNumber, } = req.body;

        const { error } = registrationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({ $or: [{ mobileNumber }] });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'User already exists' });
        }

        const user = new User({
            mobileNumber,
            otp: generateOtp()
        });

        await user.save();

        return res.status(201).json({ status: 201, message: 'User registered successfully', data: user });
    } catch (error) {
        return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};


exports.verifyOTP = async (req, res) => {
    try {
        const userId = req.params.userId
        const { otp } = req.body;

        const { error } = otpSchema.validate({ userId, otp });
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        if (user.otp !== otp) {
            return res.status(401).json({ status: 401, message: 'Invalid OTP' });
        }
        user.isVerified = true;
        await user.save();
        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME });
        console.log("Created Token:", token);
        console.log(process.env.SECRET)


        return res.status(200).json({ status: 200, message: 'OTP verified successfully', token: token, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};


exports.resendOTP = async (req, res) => {
    try {
        const { error } = resendOtpSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 400, message: 'User not found' });
        }

        const newOTP = generateOtp();
        user.otp = newOTP;
        await user.save();

        return res.status(200).json({ status: 200, message: 'OTP resent successfully', data: user.otp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { error } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (req.body.name) {
            user.name = req.body.name;
        }
        if (req.body.email) {
            user.email = req.body.email;
        }

        await user.save();

        return res.status(200).json({ status: 200, message: 'User details updated successfully', data: user });
    } catch (error) {
        return res.status(500).json({ message: 'User details update failed', error: error.message });
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const { error } = updateUserProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.mobileNumber) {
            user.mobileNumber = req.body.mobileNumber;
        }
        if (req.body.name) {
            user.name = req.body.name;
        }
        if (req.body.email) {
            user.email = req.body.email;
        }
        if (req.body.dateOfBirth) {
            user.dateOfBirth = req.body.dateOfBirth;
        }
        if (req.body.gender) {
            user.gender = req.body.gender;
        }

        await user.save();

        return res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        return res.status(500).json({ message: 'Profile update failed', error: error.message });
    }
};
