const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const postImageController = require("../controllers/postImage.controller");

router.post("/", upload.single("image"), postImageController.uploadImage);

module.exports = router;