const express = require('express');
const router = express.Router();
const upload = require("../middleWares/uploadMiddleware");
const protect = require("../middleWares/authMiddleware");
const adminOnly =require("../middleWares/roleMiddleware");
const {createProduct, getProducts, getProductById, updateProduct, deleteProduct} = require("../controller/productController");

router.post("/createproducts", protect, adminOnly, upload.array("images", 5), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, adminOnly, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;