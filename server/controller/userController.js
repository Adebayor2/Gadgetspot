const User = require('../models/userModel')

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -refreshToken -resetPasswordToken -resetPasswordTokenExpires')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

module.exports = { getUsers };
