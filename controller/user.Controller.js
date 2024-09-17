import { User } from "../models/User.model.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";
import createTokenAndSaveCookies from "../jwt/AuthToken.js";
export const registerUser = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).json({ error: "No files were uploaded" });
  }
  const { photo } = req.files;
  const allowedFormats = ["image/jpg", "image/png", "image/jpeg"];
  if (!allowedFormats.includes(photo.mimetype)) {
    return res.status(400).json({ error: "Invalid file format" });
  }
  const { name, email, phone, password, role } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ error: "User already exists" });
  }
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(
      photo.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      return res.status(400).json({ error: "Error uploading photo" });
    }
    // bycrypt password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      photo: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.url,
      },
    });
    await newUser.save();
    if (newUser) {
      const token = await createTokenAndSaveCookies(newUser._id, res);
      res.status(201).json({ "user created": newUser, "token created": token });
    }
  } catch (err) {
    console.log("Error registering user", err);
  }
};
export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || !user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: `Given role ${role} not found` });
    }

    const token = await createTokenAndSaveCookies(user._id, res);

    res.status(200).json({ "user logged in": user, "token created": token });
  } catch (err) {
    console.log("Error logging in user", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getMyProfile = async (req, res) => {
  try {
    const user = await req.user;
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting my profile", error);
  }
};

export const getAdmins = async (req, res) => {
  const admins = await User.find({ role: "admin" });
  res.status(200).json(admins);
};
