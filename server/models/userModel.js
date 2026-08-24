const mongoose = require('mongoose')

let userSchema = new mongoose.Schema(
    {

        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: [true, 'error email already exist, please use another mail'],
            lowercase: true,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        authProviders: {
            type: String,
            enum: ['local', 'google'],
            default: 'local'
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product", required: true
                },
                quantity: { type: Number, default: 1, min: 1 },
                color: { type: String, default: "" },
            },
        ],
        favourites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
        phone: {
            type: String,
            default: 'Not provided'
        },
        address: {
            type: String,
            default: 'Not provided'
        },
        role: {
            type: String,
            required: true,
            enum: ['customer', 'admin'],
            default: 'customer'
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
            default: null,
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordTokenExpires: {
            type: Date
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationTokenExpires: {
            type: Date
        },

    },

    {
        timestamps: true,
    }

);

const userInfo = mongoose.model('userInfo', userSchema)
module.exports = userInfo