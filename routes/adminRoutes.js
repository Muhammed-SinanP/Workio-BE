import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import {  allUsers, deleteUser, specificUsers } from "../controllers/adminController.js";

const router = express.Router();

router.get("/users",userAuth,allUsers);
router.get("/users/:userType",userAuth,specificUsers)

// router.put("/users/:userId");
router.delete("/users/:userId",userAuth,deleteUser);



// router.get("applications");

export { router as adminRouter };
