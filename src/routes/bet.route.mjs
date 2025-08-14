import { Router } from "express";
import betController, { listBetsAdmin } from "../controller/bet.controller.mjs";
import { authUser, requireAdmin } from "../middlewares/auth-user-middlewares.mjs";

const router = Router();


// Definición de rutas para la entidad "Bet"
router.get('/api/bets', authUser, betController.getAllBets);
router.post('/api/bets', authUser, betController.createBet);
router.put('/api/bets/:id', authUser, betController.updateBetById);
router.delete('/api/bets/:id', authUser, betController.removeBetById);

// Admin
router.get('/api/admin/bets', authUser, requireAdmin, listBetsAdmin);

export default router;