import mongoose from "mongoose";

const userCollection = "users";
const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        max: [100, 'El nombre no puede tener más de 100 caracteres'],   
    },
    last_name: {
        type: String,
        required: [true, 'El apellido es requerido'],
        max: [100, 'El apellido no puede tener más de 100 caracteres'],
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        max: [100, 'El email no puede tener más de 100 caracteres'],
        unique: true, // Ensure email uniqueness
        lowercase: true, // Store emails in lowercase
    },
    age: {
        type: Number,
        required: [true, 'La edad es requerida'],
        min: [18, 'La edad debe ser al menos 18 años'],
        max: [120, 'La edad no puede ser mayor a 120 años'],
    },
    password: {
        type: String,
        required: true,
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts', // Reference to carts collection
        default: null,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium'],
        default: 'user',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    }
});

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Create index on email for faster lookups
userSchema.index({ email: 1 });

const userModel = mongoose.model(userCollection, userSchema);
export default userModel;
