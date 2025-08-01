import cartModel from '../models/cart.model.js';

const cartDAO = {
  async getCartByUserId(userId) {
    return cartModel.findOne({ user: userId }).populate('products.product');
  },
  async createCart(userId) {
    return cartModel.create({ user: userId, products: [] });
  },
  async addProductToCart(userId, productId, quantity = 1) {
    let cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      cart = await cartModel.create({ user: userId, products: [] });
    }
    const prodIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (prodIndex >= 0) {
      cart.products[prodIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
    await cart.save();
    return cart.populate('products.product');
  },
  async updateProductQuantity(userId, productId, quantity) {
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) return null;
    const prod = cart.products.find(p => p.product.toString() === productId);
    if (prod) {
      prod.quantity = quantity;
      await cart.save();
      return cart.populate('products.product');
    }
    return null;
  },
  async removeProductFromCart(userId, productId) {
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) return null;
    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    await cart.save();
    return cart.populate('products.product');
  },
  async deleteCartByUserId(userId) {
    return cartModel.findOneAndDelete({ user: userId });
  }
};

export default cartDAO;