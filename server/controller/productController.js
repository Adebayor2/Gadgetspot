const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');

const createProduct = async (req, res) => {
    const { title, description, category, brand, price, discountPrice, stock, featured, colors } = req.body;
    try {
        if (!title || !description || !category || !brand) {
            return res.status(400).json({
                success: false,
                message: "Title, description, category and brand are required",
            });
        }

        if (price === undefined || price === "" || Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "A valid price is required",
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one image",
            });
        }

        const images = req.files.map((file) => ({
            url: file.secure_url || file.path,
            public_id: file.public_id || file.filename,
        }));
   
        const newProduct = await Product.create({
            title,
            description,
            category,
            brand,
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : 0,
            stock: stock ? Number(stock) : 0,
            featured: featured === true || featured === "true",
            images,
            colors: colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        });

        res.status(201).json({
            success: true,
            product: newProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const getProducts = async (req, res) => {
    try {
        let query = {};
        if (req.query.featured === "true") {
            query.featured = true;
        }
        if (req.query.category) {
            const categories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
            query.category = { $in: categories };
        }
        if (req.query.brand) {
            const brands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
            query.brand = { $in: brands };
        }
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: "i" } },
                { category: { $regex: req.query.search, $options: "i" } },
                { brand: { $regex: req.query.search, $options: "i" } },
            ];
        }
        if (req.query.maxPrice) {
            query.price = { ...query.price, $lte: Number(req.query.maxPrice) };
        }

        let sortOption = { createdAt: -1 };
        if (req.query.sort === 'price_asc') sortOption = { price: 1 };
        else if (req.query.sort === 'price_desc') sortOption = { price: -1 };
        else if (req.query.sort === 'rating') sortOption = { rating: -1 };
        else if (req.query.sort === 'featured') sortOption = { featured: -1, rating: -1 };

        const totalProducts = await Product.countDocuments(query);

        // Support returning all products when explicitly requested (for full catalog / client-side filtering)
        if (req.query.limit === 'all' || req.query.limit === '0' || req.query.all === 'true') {
            const products = await Product.find(query).sort(sortOption);
            return res.status(200).json({
                success: true,
                count: products.length,
                totalProducts,
                totalPages: 1,
                currentPage: 1,
                products,
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit) || 1,
            currentPage: page,
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const { title, description, category, brand, price, discountPrice, stock, featured, colors } = req.body;

        product.title = title ?? product.title;
        product.description = description ?? product.description;
        product.category = category ?? product.category;
        product.brand = brand ?? product.brand;
        if (price !== undefined && price !== '') product.price = Number(price);
        if (discountPrice !== undefined && discountPrice !== '') product.discountPrice = Number(discountPrice);
        if (stock !== undefined && stock !== '') product.stock = Number(stock);
        if (featured !== undefined) product.featured = featured === true || featured === "true";
        if (colors !== undefined) {
            product.colors = typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(Boolean) : colors;
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file) => ({
                url: file.secure_url || file.path,
                public_id: file.public_id || file.filename,
            }));
            product.images = [...product.images, ...newImages];
        }

        const updatedProduct = await product.save();

        res.status(200).json({
            success: true,
            product: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (product.images && product.images.length > 0) {
            await Promise.all(
                product.images
                    .filter((img) => img.public_id)
                    .map((img) => cloudinary.v2.uploader.destroy(img.public_id).catch(() => null))
            );
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };