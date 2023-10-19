const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const { registrationSchema, loginSchema1, generateOtp, otpSchema, resendOtpSchema, resetSchema, updateUserSchema, updateUserProfileSchema } = require('../validations/userValidation');



exports.register = async (req, res) => {
    try {
        const { mobileNumber, } = req.body;

        const { error } = registrationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({ $or: [{ mobileNumber }] });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'User already exists with this mobile' });
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


exports.login = async (req, res) => {
    try {
        const { mobileNumber, password } = req.body;

        const { error } = loginSchema1.validate({ mobileNumber, password });
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found with this mobile number' });
        }

        if (user.mobileNumber !== mobileNumber) {
            return res.status(401).json({ status: 401, message: 'Invalid Mobile Number' });
        }

        if (user.password !== password) {
            return res.status(401).json({ status: 401, message: 'Invalid Password' });
        }

        user.isVerified = true;
        await user.save();
        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME });
        console.log("Created Token:", token);
        console.log(process.env.SECRET)


        return res.status(200).json({ status: 200, message: 'Login successfully', token: token, data: user });
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


exports.forgotPassword = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        const existingUser = await User.findOne({ mobileNumber });

        if (!existingUser) {
            return res.status(400).json({ status: 400, message: 'User Not exists' });
        }
        const resetCode = generateRandomCode();
        console.log(`Reset code for ${mobileNumber}: ${resetCode}`);

        const otp = generateOtp();
        existingUser.otp = otp;
        existingUser.resetCode = resetCode;

        await existingUser.save();

        return res.status(200).json({ status: 200, message: 'Reset code sent successfully', resetCode: resetCode, existingUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reset code', error: error.message });
    }
};


function generateRandomCode() {
    const length = 10;
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        code += charset.charAt(randomIndex);
    }
    return code;
}


exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const resetCode = req.params.resetCode

        const { error } = resetSchema.validate({ resetCode, password, confirmPassword });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({ resetCode: resetCode });

        if (!existingUser) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password  and confirmPassword should be match' });
        }

        existingUser.password = password;

        await existingUser.save();

        return res.status(200).json({ status: 200, message: 'Password reset successfully', data: existingUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
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
        if (req.body.password) {
            user.password = req.body.password;
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
            return res.status(404).json({ status: 404, message: 'User not found' });
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

        return res.status(200).json({ status: 200, message: 'Profile updated successfully', user });
    } catch (error) {
        return res.status(500).json({ message: 'Profile update failed', error: error.message });
    }
};


exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { image: req.file.path, }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({ status: 200, message: 'Profile picture uploaded successfully', data: updatedUser });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to upload profile picture', error: error.message });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Failed to get users' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Failed to get user' });
    }
};


