import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller.js';

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:uid", updateUser);
router.delete("/:uid", deleteUser);

export default router;