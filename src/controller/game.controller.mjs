import gameSchemas from "../schemas/game.schemas.mjs";
import betSchemas from "../schemas/bet.schemas.mjs";
import userSchemas from "../schemas/user.schemas.mjs";

function getColorForNumber(number) {
    if (number === 0) {
        return 'verde';
    }
    const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    return redNumbers.has(number) ? 'rojo' : 'negro';
}

async function getNextGameNumber() {
    const lastGame = await gameSchemas.findOne({}, {}, { sort: { gameNumber: -1 } });
    return lastGame ? lastGame.gameNumber + 1 : 1;
}

export const listGames = async (req, res) => {
    try {
        const includeStats = String(req.query.includeStats || 'false') === 'true';
        const games = await gameSchemas.find({}).sort({ createdAt: -1 }).lean();

        if (!includeStats || games.length === 0) {
            return res.json(games);
        }

        const pendingAgg = await betSchemas.aggregate([
            { $match: { result: 'pendiente' } },
            { $unwind: '$bets' },
            { $group: { _id: '$game', amount: { $sum: '$bets.amount' }, count: { $sum: 1 } } }
        ]);

        const totalAgg = await betSchemas.aggregate([
            { $unwind: '$bets' },
            { $group: { _id: '$game', amount: { $sum: '$bets.amount' }, count: { $sum: 1 } } }
        ]);

        const pendingMap = new Map(pendingAgg.map(x => [String(x._id), { amount: x.amount, count: x.count }]));
        const totalMap = new Map(totalAgg.map(x => [String(x._id), { amount: x.amount, count: x.count }]));

        const withStats = games.map(g => {
            const id = String(g._id);
            const p = pendingMap.get(id) || { amount: 0, count: 0 };
            const t = totalMap.get(id) || { amount: 0, count: 0 };
            return {
                ...g,
                betsCountPending: p.count,
                betsAmountPending: p.amount,
                betsCountTotal: t.count,
                betsAmountTotal: t.amount,
            };
        });

        return res.json(withStats);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al listar juegos' });
    }
};

export const openGame = async (req, res) => {
    try {
        const existingOpen = await gameSchemas.findOne({ status: 'open' });
        if (existingOpen) {
            return res.json(existingOpen);
        }
        const nextNumber = await getNextGameNumber();
        const game = await gameSchemas.create({ gameNumber: nextNumber, status: 'open' });
        return res.status(201).json(game);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al abrir juego' });
    }
};

export const closeGame = async (req, res) => {
    const { gameNumber } = req.params;
    try {
        const game = await gameSchemas.findOne({ gameNumber: Number(gameNumber) });
        if (!game) {
            return res.status(404).json({ msg: 'Juego no encontrado' });
        }
        if (game.status !== 'open') {
            return res.status(400).json({ msg: 'El juego no está en estado open' });
        }
        game.status = 'closed';
        game.closedAt = new Date();
        await game.save();
        return res.json(game);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al cerrar juego' });
    }
};

export const spinGame = async (req, res) => {
    const { gameNumber } = req.params;
    try {
        const game = await gameSchemas.findOne({ gameNumber: Number(gameNumber) });
        if (!game) {
            return res.status(404).json({ msg: 'Juego no encontrado' });
        }
        if (game.status !== 'closed') {
            return res.status(400).json({ msg: 'El juego debe estar cerrado antes de girar' });
        }

        const winningNumber = Math.floor(Math.random() * 37);
        const winningColor = getColorForNumber(winningNumber);

        game.winningNumber = winningNumber;
        game.winningColor = winningColor;
        game.status = 'finished';
        game.finishedAt = new Date();
        await game.save();

        const bets = await betSchemas.find({ game: game._id }).lean();
        for (const bet of bets) {
            let totalPayout = 0;
            let totalStake = 0;
            for (const item of bet.bets) {
                totalStake += item.amount;
                if (item.type === 'numero') {
                    if (Number(item.value) === winningNumber) {
                        totalPayout += item.amount * 36;
                    }
                } else if (item.type === 'color') {
                    if (String(item.value).toLowerCase() === winningColor) {
                        totalPayout += item.amount * 2;
                    }
                }
            }

            const resultStatus = totalPayout > 0 ? 'ganada' : 'perdida';
            await betSchemas.updateOne({ _id: bet._id }, { $set: { result: resultStatus, payout: totalPayout } });

            if (totalPayout > 0) {
                await userSchemas.updateOne({ _id: bet.user }, { $inc: { balance: totalPayout } });
            }
        }

        return res.json({ game });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al girar juego' });
    }
};

export const getGameBets = async (req, res) => {
    const { gameNumber } = req.params;
    const { status } = req.query; // pendiente|ganada|perdida (opcional)
    try {
        const game = await gameSchemas.findOne({ gameNumber: Number(gameNumber) });
        if (!game) return res.status(404).json({ msg: 'Juego no encontrado' });
        const query = { game: game._id };
        if (status) query.result = status;
        const bets = await betSchemas.find(query).populate('user').sort({ createdAt: -1 });
        return res.json(bets);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al listar apuestas del juego' });
    }
};