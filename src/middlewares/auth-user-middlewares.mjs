import { verifyToken } from '../helpers/jwt.helper.mjs';

const authUser = (req, res, next) => {
    const xToken = req.header('X-Token');
    const authHeader = req.header('Authorization');

    let token = xToken;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring('Bearer '.length);
    }

    if (!token) {
        return res.status(401).json({ msg: 'Token no proporcionado. Usa header Authorization: Bearer <token> o X-Token.' });
    }

    try {
        const payload = verifyToken(token);
        delete payload.iat;
        delete payload.exp;
        req.authUser = payload;
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Token inválido o expirado' });
    }
};

export { authUser };

export const requireAdmin = (req, res, next) => {
    if (!req.authUser || req.authUser.role !== 'admin') {
        return res.status(403).json({ msg: 'Requiere rol admin' });
    }
    next();
};