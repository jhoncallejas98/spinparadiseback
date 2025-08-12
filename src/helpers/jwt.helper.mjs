import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
console.log('JWT_SECRET:', JWT_SECRET); // DEPURACIÓN: Verificar valor de la variable de entorno


const generateToken = (payload) => {
    const token = jwt.sign(payload, JWT_SECRET,
        { expiresIn: '5h' })
        return token
}

const verifyToken = (token) => {
    const payload =  jwt.verify(token, process.env.JWT_SECRET);
    return payload;
}

export { generateToken, verifyToken }