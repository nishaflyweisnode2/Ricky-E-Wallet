const Wallet = require('../models/walletModel');
const User = require('../models/userModel');


exports.createWallet = async (req, res) => {
    try {
        const userId = req.user.id;

        const existingWallet = await Wallet.findOne({ userId });

        if (existingWallet) {
            return res.status(400).json({ message: 'User already has a wallet' });
        }

        const wallet = new Wallet({ userId: userId });
        await wallet.save();

        return res.status(201).json({ message: 'Wallet created successfully', wallet });
    } catch (error) {
        return res.status(500).json({ message: 'Wallet creation failed', error: error.message });
    }
};



exports.getWallet = async (req, res) => {
    try {
        const userId = req.user.id;

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        return res.status(200).json({ wallet });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch wallet', error: error.message });
    }
};
