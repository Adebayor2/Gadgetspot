const multer = require("multer");
const CloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "gadget-spot",
        allowedFormats: [
            "jpg",
            "jpeg",
            "png",
            "webp",
        ],
    },
});

const upload = multer({storage,});

module.exports = upload;