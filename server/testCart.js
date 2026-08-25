require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
require('./models/productModel');

async function testCart() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne();
    if (!user) {
      console.log('No user found');
      process.exit(1);
    }

    console.log('Testing addToCart with empty cart...');
    const userId = user._id;
    const productId = '6a798f12a62be92cae24ae8f'; // iphone 17 pro

    const existingItem = user.cart.find(item => item.product.toString() === productId);
    console.log('Existing item before add:', existingItem);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1, color: '' });
    }

    await user.save();
    await user.populate('cart.product');
    console.log('Cart after add:', JSON.stringify(user.cart, null, 2));
    console.log('SUCCESS: addToCart logic works correctly');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testCart();
