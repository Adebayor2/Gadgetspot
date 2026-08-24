const User = require('../models/userModel');

const removeFavourites = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { favourites: productId } },
            { returnDocument: 'after' }
        ).populate('favourites');

        return res.status(200).json({
            message: 'Removed from favourite',
            favourites: user?.favourites || [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server Error',
        });
    }
};

const addFavourites = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favourites: productId } },
            { returnDocument: 'after' }
        ).populate('favourites');

        return res.status(200).json({
            message: 'Added to favourite',
            favourites: user?.favourites || [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server Error',
        });
    }
};

const getFavourites = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const user = await User.findById(userId).populate('favourites');
        res.status(200).json({ success: true, favourites: user?.favourites || [] });
    } catch (error) {
        console.error('Get favourites error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const mergeFavourites = async (req, res) => {
    try {
        const { productIds = [] } = req.body;
        const userId = req.user?.id || req.user?._id;
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favourites: { $each: productIds } } },
            { returnDocument: 'after' }
        ).populate('favourites');

        res.status(200).json({ success: true, favourites: user?.favourites || [] });
    } catch (error) {
        console.error('Merge favourites error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { removeFavourites, addFavourites, getFavourites, mergeFavourites };
