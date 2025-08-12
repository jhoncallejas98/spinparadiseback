import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    gameNumber: {
        type: Number,
        required: true,
        unique: true // identificador de la partida
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'finished'],
        default: 'open' // open: aceptando apuestas, closed: en curso, finished: resultado listo
    },
    winningNumber: {
        type: Number,
        min: 0,
        max: 36
    },
    winningColor: {
        type: String,
        enum: ['rojo', 'negro', 'verde']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    closedAt: Date,
    finishedAt: Date
});

export default mongoose.model('Game', gameSchema);
