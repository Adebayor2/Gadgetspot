const Category = require('../models/categoryModel')

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const existing = await Category.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await Category.create({
            name: name.trim(),
            description: description ? description.trim() : "",
        });

        res.status(201).json({
            success: true,
            category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const { name, description } = req.body;

        if (name !== undefined && name !== "") {
            const duplicate = await Category.findOne({ name: name.trim(), _id: { $ne: category._id } });
            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Category name already exists",
                });
            }
            category.name = name.trim();
        }
        if (description !== undefined) {
            category.description = description.trim();
        }

        const updated = await category.save();

        res.status(200).json({
            success: true,
            category: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error && error.message ? error.message : String(error),
        });
    }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
