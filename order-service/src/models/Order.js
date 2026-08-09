const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);