import { Router } from "express";
import userModel from "../models/user.model.js";

const router = Router();

// Endpoints
// router.get("/", (req, res) => {
//     res.send("Hello World");
// });
router.get("/", async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route POST to create a user
router.post("/", async (req, res) => {
    let { first_name, last_name, email } = req.body;
    if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const user = await userModel.create({ first_name, last_name, email });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route PUT to update a user
router.put("/:uid", async (req, res) => {
    let { uid } = req.params;
    let { first_name, last_name, email } = req.body;
    if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const user = await userModel.findByIdAndUpdate(uid, { first_name, last_name, email }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route DELETE to delete a user
router.delete("/:uid", async (req, res) => {
    let { uid } = req.params;
    try {
        const user = await userModel.findByIdAndDelete(uid);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;