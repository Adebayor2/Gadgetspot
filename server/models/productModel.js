const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        discountPrice: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            default: 0,
        },
        sold: {
            type: Number,
            default: 0,
        },
        images: [
            {
                url: String,
                public_id: String,
            },
        ],
        rating: {
            type: Number,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        colors: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);
const product = mongoose.model("Product", productSchema);
module.exports = product