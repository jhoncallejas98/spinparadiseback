import { Router } from "express";
import betController from "../controller/bet.controller.mjs";
import betSchemas from "../schemas/bet.schemas.mjs";

const router = Router();


// Definición de rutas para la entidad "Appoiment
router.get('api/bets');
router.post('api/bets');
router.put('api/bets/');
router.delete('api/bets/');

export default router;