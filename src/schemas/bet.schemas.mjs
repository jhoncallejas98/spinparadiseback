import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    bets: [
            {
				  type: {
			        type: String,
			        enum: ['numero', 'color'], // apostar a un número o a un color
			        required: true
			    },
			    value: {
			        type: mongoose.Schema.Types.Mixed,   // permite cualquier tipo soportado por Mongoose
			        required: true // Ej: 17 o "rojo"
			    },
			    amount: {
			        type: Number,
			        required: true,
			        min: [1, 'La apuesta mínima es de 1']
			    },
		    }
	    ],
    result: {
        type: String,
        enum: ['ganada', 'perdida', 'pendiente'],
        default: 'pendiente'
    },
    payout: {
        type: Number,
        default: 0 // lo que gana
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Bet', betSchema);