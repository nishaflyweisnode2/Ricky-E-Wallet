const auth = require("../controllers/userController");
const express = require("express");
const router = express()


const authJwt = require("../middleware/auth");




module.exports = (app) => {

    // api/user/

    app.post('/api/user/register', auth.register);
    app.post('/api/user/verify/:userId', auth.verifyOTP);
    app.post('/api/user/resend/:userId', auth.resendOTP);
    app.put('/api/user/update', [authJwt.verifyToken], auth.updateUser);
    app.put('/api/user/updateProfile', [authJwt.verifyToken], auth.updateProfile);

}