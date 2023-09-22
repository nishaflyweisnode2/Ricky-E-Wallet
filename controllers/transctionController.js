const Wallet = require('../models/walletModel');
const Transaction = require('../models/transctionModel');
const User = require('../models/userModel');




exports.checkBalance = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({ status: 404, message: 'Wallet not found' });
        }

        return res.status(200).json({ status: 200, balance: wallet.balance });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to check balance', error: error.message });
    }
};


exports.makeTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, amount, description } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({ status: 404, message: 'Wallet not found' });
        }

        if (type === 'debit' && wallet.balance < amount) {
            return res.status(400).json({ status: 400, message: 'Insufficient balance' });
        }

        const transaction = new Transaction({
            userId,
            type,
            amount,
            description,
        });

        if (type === 'credit') {
            wallet.balance += amount;
        } else {
            wallet.balance -= amount;
        }

        wallet.transactions.push(transaction._id);

        await transaction.save();
        await wallet.save();

        return res.status(201).json({ status: 201, message: 'Transaction successful', transaction });
    } catch (error) {
        return res.status(500).json({ message: 'Transaction failed', error: error.message });
    }
};


exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const wallet = await Wallet.findOne({ userId }).populate('transactions');

        if (!wallet) {
            return res.status(404).json({status: 404, message: 'Wallet not found' });
        }

        return res.status(200).json({ status: 200, transactions: wallet.transactions });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch transaction history', error: error.message });
    }
};
