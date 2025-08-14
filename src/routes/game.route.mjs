import { Router } from "express";
import { listGames, openGame, closeGame, spinGame, getGameBets } from "../controller/game.controller.mjs";
import { authUser, requireAdmin } from "../middlewares/auth-user-middlewares.mjs";

const router = Router();


// Juegos de ruleta
router.get('/api/games', authUser, listGames);
router.post('/api/games/open', authUser, openGame);
router.post('/api/games/:gameNumber/close', authUser, closeGame);
router.post('/api/games/:gameNumber/spin', authUser, spinGame);

// Admin: por si necesitas listados o acciones exclusivas
router.get('/api/admin/games', authUser, requireAdmin, listGames);
router.get('/api/admin/games/:gameNumber/bets', authUser, requireAdmin, getGameBets);

export default router;