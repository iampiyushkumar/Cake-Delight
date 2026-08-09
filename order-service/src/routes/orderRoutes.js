const express = require('express');
const router = express.Router();
const {
  getBasket,
  addToBasket,
  updateBasketItem,
  deleteBasketItem,
  checkout
} = require('../controllers/orderController');


router.get('/basket', getBasket);
router.post('/basket', addToBasket);
router.put('/basket/:id', updateBasketItem);
router.delete('/basket/:id', deleteBasketItem);


router.post('/checkout', checkout);

module.exports = router;