import { verifyToken } from '../helpers/jwt.helper.mjs';

const authUser = (req, res, next) => {
    const token = req.header('X-Token'); // extraemos el token de la cabecera
    console.log('Token recibido:', token);
    
    if (!token) {
        console.log('No se encontró token en el header X-Token');
        return res.status(401).json({msg: "Error al obtener el token - No se envió token en el header X-Token"});
    }
    
    try {
        //verificamos el token
        const payload = verifyToken(token);
        delete payload.iat;
        delete payload.exp;

        // crear una propiedad en el objeto request de express y guardar el payload
        req.authUser = payload;
        console.log('Token verificado correctamente:', payload);
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({msg: "Token inválido o expirado"});
    }
}

export {
    authUser
}