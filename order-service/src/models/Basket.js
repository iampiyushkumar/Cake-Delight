const mongoose = require('mongoose');

const basketItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 }
});

const basketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [basketItemSchema],
    totalPrice: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Basket', basketSchema);