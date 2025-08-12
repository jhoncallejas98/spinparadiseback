import { createUser, getAllUsers,   updateUsersById, removeUsersById, } from "../controller/user.controller.mjs";
import userSchemas from "../schemas/user.schemas.mjs";
import express from "express";

const router = express.Router();


// Definición de rutas para la entidad "users"
router.get('api/users', getAllUsers);
router.post('api/users', createUser);
router.put('api/users/:id', updateUsersById);
router.delete('api/users/:id', removeUsersById);

export default router;