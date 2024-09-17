import mongoose from "mongoose";
import Blog from "../models/Blog.model.js";

import cloudinary from "cloudinary";

export const createBlog = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).json({ error: "Blog image is required" });
  }
  const { blogImage } = req.files;
  const allowedFormats = ["image/jpg", "image/png", "image/jpeg"];
  if (!allowedFormats.includes(blogImage.mimetype)) {
    return res.status(400).json({ error: "Invalid file format" });
  }

  const { title, category, about } = req.body;
  if (!title || !category || !about) {
    return res.status(400).json({ error: "All fields are required" });
  }
  console.log("user object", req.user);
  const adminName = req?.user?.name;
  const adminPhoto = req?.user?.photo;
  const createdBy = req?.user?._id;
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(
      blogImage.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      return res.status(400).json({ error: "Error uploading photo" });
    }

    const blogData = await Blog.create({
      title,
      about,
      category,
      adminName,
      adminPhoto,

      blogImage: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.url,
      },
    });
    const blog = await blogData.save();
    res.status(201).json({ "blog created": blog });
  } catch (err) {
    console.log("Error creating blog", err);
  }
};
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete image from Cloudinary
    if (blog.blogImage && blog.blogImage.public_id) {
      await cloudinary.uploader.destroy(blog.blogImage.public_id);
    }

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog", error);
    res.status(500).json({ error: "Server error while deleting blog" });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json("got all blogs");
  } catch (err) {
    console.log("Error getting all blogs", err);
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myBlogs = async (req, res) => {
  try {
    const createdBy = req.user._id;
    const myBlogs = await Blog.find({ createdBy });
    res.status(200).json(myBlogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the provided ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    // Update the blog and return the updated document
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // Check if the blog was found and updated
    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Respond with the updated blog
    res.status(200).json(updatedBlog);
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ message: error.message });
  }
};
