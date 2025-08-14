import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener mínimo 3 caracteres'],
        maxlength: [30, 'El nombre de usuario no puede superar los 30 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    role: {
        type: String,
        enum: ['player', 'admin'],
        default: 'player'
    },
    balance: {
        type: Number,
        default: 1000, // saldo inicial
        min: [0, 'El balance no puede ser negativo']
    },
    totalDeposited: [
		    {
		        amount: {
		            type: Number,
		            required: [true, 'El monto agregado es obligatorio'],
		            min: [0, 'El monto no puede ser negativo']
		        },
		        date: {
		            type: Date,
		            default: Date.now
		        }
		    }
		],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);
