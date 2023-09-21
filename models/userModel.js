const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    otp: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum: ["Admin", "User"], default: "User"
    },

}, { timestamps: true });


const User = mongoose.model('User', userSchema);



module.exports = User;
