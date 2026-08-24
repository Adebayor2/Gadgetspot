const express = require("express");
const router = express.Router();
const protect = require("../middleWares/authMiddleware");
const adminOnly = require("../middleWares/roleMiddleware");
const { getUsers } = require("../controller/userController");

router.get("/", protect, adminOnly, getUsers);

module.exports = router;
