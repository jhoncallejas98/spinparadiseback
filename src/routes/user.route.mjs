import { createUser, getAllUsers,   updateUsersById, removeUsersById, loginUser, setUserRole, listUsersAdmin, adjustUserBalance, getMyDeposits, getMyHistory } from "../controller/user.controller.mjs";
import express from "express";
import { authUser, requireAdmin } from "../middlewares/auth-user-middlewares.mjs";

const router = express.Router();


// Auth
router.post('/api/auth/login', loginUser);

// Users (protegidas excepto crear)
router.get('/api/users', authUser, getAllUsers);
router.post('/api/users', createUser);
router.put('/api/users/:id', authUser, updateUsersById);
router.delete('/api/users/:id', authUser, removeUsersById);

// Admin
router.post('/api/admin/users/:id/role', authUser, requireAdmin, setUserRole);
router.get('/api/admin/users', authUser, requireAdmin, listUsersAdmin);
router.post('/api/admin/users/:id/balance/adjust', authUser, requireAdmin, adjustUserBalance);

// Historial del usuario autenticado
router.get('/api/me/deposits', authUser, getMyDeposits);
router.get('/api/me/history', authUser, getMyHistory);

export default router;