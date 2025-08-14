import jwt from 'jsonwebtoken';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    return secret;
}

const generateToken = (payload) => {
    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '5h' });
    return token;
};

const verifyToken = (token) => {
    const payload = jwt.verify(token, getJwtSecret());
    return payload;
};

export { generateToken, verifyToken };