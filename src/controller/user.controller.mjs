import userSchemas from "../schemas/user.schemas.mjs"; 
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { generateToken } from "../helpers/jwt.helper.mjs";
import betSchemas from "../schemas/bet.schemas.mjs";
import gameSchemas from "../schemas/game.schemas.mjs";

function isValidObjectId(id) {
    return typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
}

// Crear Usuario
const createUser = async (req, res) => {
    const inputData = req.body;

    try {
        // Verificar si el usuario existe por email
        const userFound = await userSchemas.findOne({ email: inputData.email });
        if (userFound) {
            return res.status(400).json({ msg: 'El usuario ya existe con este correo.' });
        }
        // Eliminado: verificación por cédula (no aplica en este modelo)

        // Encriptar la contraseña
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(inputData.password, salt);
        inputData.password = hashPassword;

        // Crear usuario
        const newUser = await userSchemas.create(inputData);
        res.status(201).json(newUser);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error: No se pudo crear el usuario.' });
    }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await userSchemas.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los usuarios.' });
    }
};

// Obtener usuario por ID
const getUsersById = async (req, res) => {
    const userId = req.params.id;
    try {
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ msg: 'ID inválido' });
        }
        const user = await userSchemas.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el usuario.' });
    }
};

// Actualizar usuario por ID
const updateUsersById = async (req, res) => {
    const userId = req.params.id;
    const inputData = req.body;
    try {
        // Si viene password, encriptar nuevamente
        if (inputData.password) {
            const salt = bcrypt.genSaltSync(10);
            inputData.password = bcrypt.hashSync(inputData.password, salt);
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ msg: 'ID inválido' });
        }
        const updatedUser = await userSchemas.findByIdAndUpdate(userId, inputData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado para actualizar.' });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el usuario.' });
    }
};

// Eliminar usuario por ID
const removeUsersById = async (req, res) => {
    const userId = req.params.id;
    try {
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ msg: 'ID inválido' });
        }
        const deletedUser = await userSchemas.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado para eliminar.' });
        }
        res.json({ msg: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar el usuario.' });
    }
};

export {
    createUser,
    getAllUsers,
    getUsersById,
    updateUsersById,
    removeUsersById,
};

// Auth Controller
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'email y password son obligatorios' });
        }

        const user = await userSchemas.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const token = generateToken({
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role
        });

        return res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                balance: user.balance,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al iniciar sesión' });
    }
};

export const setUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // 'admin' | 'player'
    try {
        if (!['admin', 'player'].includes(role)) {
            return res.status(400).json({ msg: 'Rol inválido' });
        }
        const updated = await userSchemas.findByIdAndUpdate(id, { role }, { new: true });
        if (!updated) return res.status(404).json({ msg: 'Usuario no encontrado' });
        return res.json({ msg: 'Rol actualizado', user: updated });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al actualizar rol' });
    }
};

// Admin: listar usuarios
export const listUsersAdmin = async (req, res) => {
    try {
        const users = await userSchemas.find({}).sort({ createdAt: -1 });
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al listar usuarios' });
    }
};

// Admin: ajustar saldo manualmente
export const adjustUserBalance = async (req, res) => {
    const { id } = req.params;
    const { amount, reason } = req.body; // amount puede ser negativo
    try {
        const numeric = Number(amount);
        if (!Number.isFinite(numeric) || numeric === 0) {
            return res.status(400).json({ msg: 'Monto inválido' });
        }
        const user = await userSchemas.findById(id);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

        user.balance += numeric;
        if (numeric > 0) {
            user.totalDeposited.push({ amount: numeric, date: new Date() });
        }
        await user.save();

        return res.json({ msg: 'Saldo actualizado', user, reason: reason || null });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al ajustar saldo' });
    }
};

// Historial: depósitos del usuario autenticado
export const getMyDeposits = async (req, res) => {
    try {
        const user = await userSchemas.findById(req.authUser.id).lean();
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
        const deposits = (user.totalDeposited || []).map(d => ({ type: 'deposit', amount: d.amount, date: d.date }));
        return res.json(deposits.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
        return res.status(500).json({ msg: 'Error al obtener depósitos' });
    }
};

// Historial: movimientos combinados (depósitos, apuestas, pagos)
export const getMyHistory = async (req, res) => {
    try {
        const user = await userSchemas.findById(req.authUser.id).lean();
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

        const deposits = (user.totalDeposited || []).map(d => ({ type: 'deposit', amount: d.amount, date: d.date }));

        const bets = await betSchemas.find({ user: req.authUser.id }).lean();
        const gameIds = [...new Set(bets.map(b => String(b.game)))];
        const games = await gameSchemas.find({ _id: { $in: gameIds } }).lean();
        const gameMap = new Map(games.map(g => [String(g._id), g]));

        const betMovements = [];
        for (const b of bets) {
            const stake = (b.bets || []).reduce((sum, it) => sum + (it.amount || 0), 0);
            if (stake > 0) {
                betMovements.push({ type: 'bet', amount: -stake, date: b.createdAt, gameNumber: gameMap.get(String(b.game))?.gameNumber });
            }
            if (b.payout && b.payout > 0) {
                const g = gameMap.get(String(b.game));
                betMovements.push({ type: 'payout', amount: b.payout, date: (g && g.finishedAt) || b.createdAt, gameNumber: g?.gameNumber });
            }
        }

        const all = [...deposits, ...betMovements].sort((a, b) => new Date(b.date) - new Date(a.date));
        return res.json(all);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al obtener historial' });
    }
};

// Obtener saldo actual del usuario
export const getMyBalance = async (req, res) => {
    try {
        const user = await userSchemas.findById(req.authUser.id).select('balance username');
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        return res.json({
            balance: user.balance,
            username: user.username
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al obtener saldo' });
    }
};