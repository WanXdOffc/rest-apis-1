const express = require("express");
const router = express.Router();
const blogController = require("../controller/blogController");

module.exports = () => {
  // Rute untuk menghapus semua blog
  router.delete("/dell-all", blogController.deleteAllBlogs);

  // Get all blogs
  router.get("/", blogController.getAllBlogs);

  // Get blog by ID
  router.get("/:id", blogController.getBlogById);

  // Create a new blog
  router.get('/create-blog', (req, res) => {
    res.render('create-blog');
  });
  
  router.post('/create-blogs', async (req, res) => {
    try {
      const { title, content } = req.body;
  
      const newBlog = new Blog({
        title,
        content,
      });
      const savedBlog = await newBlog.save();
      res.render('blog-success', { blog: savedBlog });
    } catch (err) {
      console.error(err); // Cetak pesan kesalahan untuk debugging
      res.status(400).json({ message: err.message });
    }
  });

  // Update a blog by ID
  router.put("/:id", blogController.updateBlog);

  // Delete a blog by ID
  router.delete("/:id", blogController.deleteBlog);

  // Search blogs by title
  router.get("/search", blogController.searchBlogs);

  return router;
};