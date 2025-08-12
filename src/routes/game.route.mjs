import { Router } from "express";
import gameSchemas from "../schemas/game.schemas.mjs";
import gameController from "../controller/game.controller.mjs";

const router = Router();


// Definición de rutas para la entidad "Game"
router.get('api/games');
router.post('api/games');
router.put('api/games/');
router.delete('api/games/');

export default router;