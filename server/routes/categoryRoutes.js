const express = require("express");
const router = express.Router();
const protect = require("../middleWares/authMiddleware");
const adminOnly = require("../middleWares/roleMiddleware");
const { createCategory, getCategories, updateCategory, deleteCategory } = require("../controller/categoryController");

router.get("/", getCategories);
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
