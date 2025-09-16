const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    age: { type: Number, required: true, min: 0 },
    password: { type: String, required: true }, // almacenada en hash
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', default: null },
    role: { type: String, default: 'user' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
