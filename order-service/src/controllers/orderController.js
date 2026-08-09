const Basket = require('../models/Basket');
const Order = require('../models/Order');
const orderQueue = require('../queues/orderQueue');

// Helper to recalculate price
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// GET Basket
exports.getBasket = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    let basket = await Basket.findOne({ userId });
    if (!basket) {
      basket = await Basket.create({ userId, items: [], totalPrice: 0 });
    }
    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST Add or Update Basket Item
exports.addToBasket = async (req, res) => {
  try {
    const { userId, productId, name, price, quantity } = req.body;

    let basket = await Basket.findOne({ userId });
    if (!basket) {
      basket = new Basket({ userId, items: [] });
    }
   console.log('Adding to basket:', { userId, productId, name, price, quantity });
    const existingIndex = basket.items.findIndex((item) => item.productId === productId);
    if (existingIndex > -1) {
      basket.items[existingIndex].quantity += quantity;
    } else {
      basket.items.push({ productId, name, price, quantity });
    }

    basket.totalPrice = calculateTotal(basket.items);
    await basket.save();

    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT Update Item Quantity
exports.updateBasketItem = async (req, res) => {
  try {
    const { id } = req.params; // itemId or productId
    const { userId, quantity } = req.body;

    const basket = await Basket.findOne({ userId });
    if (!basket) return res.status(404).json({ message: 'Basket not found' });

    const item = basket.items.find((item) => item.productId === id || item._id.toString() === id);
    if (!item) return res.status(404).json({ message: 'Item not found in basket' });

    if (quantity <= 0) {
      basket.items = basket.items.filter((item) => item.productId !== id && item._id.toString() !== id);
    } else {
      item.quantity = quantity;
    }

    basket.totalPrice = calculateTotal(basket.items);
    await basket.save();

    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE Clear Basket Item
exports.deleteBasketItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const basket = await Basket.findOne({ userId });
    if (!basket) return res.status(404).json({ message: 'Basket not found' });

    basket.items = basket.items.filter((item) => item.productId !== id && item._id.toString() !== id);
    basket.totalPrice = calculateTotal(basket.items);
    await basket.save();

    res.status(200).json(basket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST Checkout Flow
exports.checkout = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body;
    console.log('Checkout request received for userId:', userId);

    // 1. Fetch user basket
    const basket = await Basket.findOne({ userId });
    if (!basket || basket.items.length === 0) {
      return res.status(400).json({ message: 'Basket is empty' });
    }
    console.log('Basket fetched for checkout:', basket);

    // 2. Save Order to Database
    const newOrder = await Order.create({
      userId,
      items: basket.items,
      totalPrice: basket.totalPrice,
      shippingAddress,
      status: 'PENDING'
    });

    // 3. Publish Event via BullMQ Queue
    try
    {
       await orderQueue.add('ORDER_CREATED', {
      orderId: newOrder._id.toString(),
      userId: newOrder.userId,
      totalPrice: newOrder.totalPrice,
         items: newOrder.items
    });
    }
   
    catch (queueError) {
      console.error('Error adding order to queue:', queueError);
      return res.status(500).json({ message: 'Failed to queue order for processing' });
    }


    // 4. Clear Basket
    basket.items = [];
    basket.totalPrice = 0;
    await basket.save();

    res.status(201).json({
      message: 'Order created successfully and queued for processing',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};