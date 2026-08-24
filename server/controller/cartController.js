const mongoose = require('mongoose')
const User = require('../models/userModel')

const toObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value) && typeof value !== 'object') {
    return new mongoose.Types.ObjectId(value);
  }
  return value;
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, color = '' } = req.body
    const userId = req.user?.id || req.user?._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const existingItem = user.cart.find((item) =>
      item.product.toString() === productId && item.color === color
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      user.cart.push({ product: productId, quantity, color })
    }

    await user.save()
    await user.populate('cart.product')

    res.status(200).json({ message: 'Added to cart', cart: user.cart })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params
    const { color = '' } = req.body
    const userId = req.user?.id || req.user?._id
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { product: toObjectId(productId), color } } },
      { returnDocument: 'after' }
    ).populate('cart.product')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({ message: 'Removed from cart', cart: user.cart })
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params
    const { quantity, color = '' } = req.body
    const userId = req.user?.id || req.user?._id

    if (quantity <= 0) return removeFromCart(req, res)

    const user = await User.findById(userId).populate('cart.product')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const itemExists = user.cart.some(
      (item) => item.product.toString() === productId && item.color === color
    )

    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Cart item not found' })
    }

    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { 'cart.$[item].quantity': quantity } },
      {
        arrayFilters: [{ 'item.product': toObjectId(productId), 'item.color': color }],
        returnDocument: 'after',
      }
    ).populate('cart.product')

    res.json(updated.cart)
  } catch (error) {
    console.error('Update cart quantity error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id
    const user = await User.findById(userId).populate('cart.product')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.status(200).json(user.cart)
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { cart: [] } },
      { returnDocument: 'after' }
    ).populate('cart.product')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({ message: 'Cart cleared', cart: user.cart })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

module.exports = { addToCart, removeFromCart, getCart, updateCartQuantity, clearCart }
