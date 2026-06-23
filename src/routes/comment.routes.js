const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller"); 

// Rutas del CRUD
router.post("/", commentController.createComment);
router.put("/:id", commentController.updateComment);
router.delete("/:id", commentController.deleteComment);

module.exports = router;