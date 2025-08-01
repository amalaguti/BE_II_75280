import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser, requestAdminRole, approveAdminRequest, denyAdminRequest, getAllUsers, updateUserRole } from '../controllers/users.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post('/request-admin', authenticateJWT, requestAdminRole);
router.get('/approve-admin', approveAdminRequest);
router.get('/deny-admin', denyAdminRequest);
router.get('/admin', authenticateJWT, getAllUsers);
router.put('/:uid/role', authenticateJWT, updateUserRole);
router.put("/:uid", updateUser);
router.delete("/:uid", deleteUser);

export default router;