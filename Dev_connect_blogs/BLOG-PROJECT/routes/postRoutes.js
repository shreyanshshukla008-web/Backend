const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost
} = require("../controllers/postController");

const authMiddleware = require("../middlewares/authMiddleware");

// CREATE
router.post("/", authMiddleware, createPost);

// READ ALL
router.get("/", getPosts);

// READ SINGLE
router.get("/:id", getSinglePost);

// UPDATE
router.put("/:id", authMiddleware, updatePost);

// DELETE
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;