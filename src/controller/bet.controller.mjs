import betSchemas from "../schemas/bet.schemas.mjs";
import gameSchemas from "../schemas/game.schemas.mjs";
import userSchemas from "../schemas/user.schemas.mjs";

export const getAllBets = async (req, res) => {
    try {
        const bets = await betSchemas.find({ user: req.authUser.id }).populate('game');
        return res.json(bets);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al listar apuestas' });
    }
};

export const createBet = async (req, res) => {
    const { gameNumber, bets } = req.body;
    try {
        if (!Array.isArray(bets) || bets.length === 0) {
            return res.status(400).json({ msg: 'Debes enviar una o más apuestas' });
        }

        const game = await gameSchemas.findOne({ gameNumber: Number(gameNumber) });
        if (!game) {
            return res.status(404).json({ msg: 'Juego no encontrado' });
        }
        if (game.status !== 'open') {
            return res.status(400).json({ msg: 'El juego no está abierto para apostar' });
        }

        let totalAmount = 0;
        for (const b of bets) {
            if (!['numero', 'color'].includes(b.type)) {
                return res.status(400).json({ msg: 'Tipo de apuesta inválido' });
            }
            if (typeof b.amount !== 'number' || b.amount <= 0) {
                return res.status(400).json({ msg: 'Monto de apuesta inválido' });
            }
            totalAmount += b.amount;
        }

        const user = await userSchemas.findById(req.authUser.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        if (user.balance < totalAmount) {
            return res.status(400).json({ msg: 'Saldo insuficiente' });
        }

        user.balance -= totalAmount;
        await user.save();

        const created = await betSchemas.create({ user: user._id, game: game._id, bets, result: 'pendiente', payout: 0 });
        return res.status(201).json(created);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al crear apuesta' });
    }
};

export const updateBetById = async (req, res) => {
    const { id } = req.params;
    const { bets } = req.body;
    try {
        const bet = await betSchemas.findById(id).populate('game');
        if (!bet) {
            return res.status(404).json({ msg: 'Apuesta no encontrada' });
        }
        if (String(bet.user) !== req.authUser.id) {
            return res.status(403).json({ msg: 'No autorizado' });
        }
        if (!bet.game || bet.game.status !== 'open') {
            return res.status(400).json({ msg: 'No se puede modificar. Juego no está abierto' });
        }
        let totalAmount = 0;
        for (const b of bets || []) {
            if (!['numero', 'color'].includes(b.type)) {
                return res.status(400).json({ msg: 'Tipo de apuesta inválido' });
            }
            if (typeof b.amount !== 'number' || b.amount <= 0) {
                return res.status(400).json({ msg: 'Monto de apuesta inválido' });
            }
            totalAmount += b.amount;
        }
        // No re-calculamos saldo por simplicidad en este MVP
        const updated = await betSchemas.findByIdAndUpdate(id, { bets }, { new: true });
        return res.json(updated);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al actualizar apuesta' });
    }
};

export const removeBetById = async (req, res) => {
    const { id } = req.params;
    try {
        const bet = await betSchemas.findById(id).populate('game');
        if (!bet) {
            return res.status(404).json({ msg: 'Apuesta no encontrada' });
        }
        if (String(bet.user) !== req.authUser.id) {
            return res.status(403).json({ msg: 'No autorizado' });
        }
        if (!bet.game || bet.game.status !== 'open') {
            return res.status(400).json({ msg: 'No se puede eliminar. Juego no está abierto' });
        }
        await betSchemas.findByIdAndDelete(id);
        return res.json({ msg: 'Apuesta eliminada' });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al eliminar apuesta' });
    }
};

export default { getAllBets, createBet, updateBetById, removeBetById };

// Admin: listar apuestas con filtros
export const listBetsAdmin = async (req, res) => {
    try {
        const { status, gameNumber, userId } = req.query;
        const query = {};
        if (status) query.result = status;
        if (userId) query.user = userId;
        if (gameNumber) {
            const game = await gameSchemas.findOne({ gameNumber: Number(gameNumber) });
            if (game) query.game = game._id; else return res.json([]);
        }
        const bets = await betSchemas.find(query).populate('user').populate('game').sort({ createdAt: -1 });
        return res.json(bets);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al listar apuestas' });
    }
};

