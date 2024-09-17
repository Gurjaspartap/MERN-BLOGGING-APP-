import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getMyProfile,
  getAdmins,
} from "../controller/user.Controller.js";
import { isAuthenticated } from "../middleware/authUser.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/myprofile", isAuthenticated, getMyProfile);
router.get("/admins", getAdmins);
export default router;
