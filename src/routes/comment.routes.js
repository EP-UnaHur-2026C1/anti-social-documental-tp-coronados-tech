const express = require("express");
const router = express.Router();
// Asegurate de que apunte a comment.controller en minúscula y con la "s" correcta si la usaste
const commentController = require("../controllers/comment.controller"); 

// Rutas del CRUD
router.post("/", commentController.createComment);
router.put("/:id", commentController.updateComment);
router.delete("/:id", commentController.deleteComment);

module.exports = router;