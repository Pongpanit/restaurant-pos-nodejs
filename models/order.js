const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
        quantity: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
