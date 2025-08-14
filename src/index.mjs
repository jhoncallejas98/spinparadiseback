//const express = require('express'); // CommonJS
import express from 'express';  //ESModule
import cors from 'cors';
import userRouter from './routes/user.route.mjs';
import gameRouter from './routes/game.route.mjs';
import betRouter from './routes/bet.route.mjs';
// import product from './routes/product.route.mjs'
import dbConnect from './config/mongo.config.mjs';
// import cors from 'cors'; // Importamos cors para permitir peticiones desde el frontend

// Paso 2: Ejecutar express
const app = express();
const PORT = process.env.PORT || 3000;
// app.use(product); // implementar la ruta como un Middleware de express

app.use(express.json());
app.use(cors());

console.log('Cargando rutas de usuario...');
console.log('Middleware de router disponible:', typeof userRouter);
console.log('Número de handlers en router (si aplica):', userRouter && userRouter.stack ? userRouter.stack.length : 'desconocido');

app.use('/', userRouter);
app.use('/', gameRouter);
app.use('/', betRouter);

app.get('/', (req, res) => {
    res.send('API de SpinParadise funcionando 🚀');
});

//invocar la cofiguracion de la conexion a la base de datos. 


dbConnect();


app.listen(PORT, () => {
    console.log(`Servidor lanzado exitosamente en http://localhost:${PORT}`);
});

// // Paso 4: Lanzar el servidor web en el puerto 3000
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Servidor lanzado exitosamente en http://0.0.0.0:${PORT}`);
// });