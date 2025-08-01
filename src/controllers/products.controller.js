import cartDAO from '../dao/cart.dao.js';
import productDAO from '../dao/product.dao.js';
import userDAO from '../dao/user.dao.js';
import { sendPurchaseConfirmationEmail, sendAdminStockNotificationEmail } from '../utils/mail.js';

export async function createProduct(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden crear productos' });
  }
  try {
    const { name, price, stock, description } = req.body;
    const product = await productDAO.create({ name, price, stock, description });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateProduct(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden actualizar productos' });
  }
  try {
    const { id } = req.params;
    const product = await productDAO.updateById(id, req.body);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteProduct(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden eliminar productos' });
  }
  try {
    const { id } = req.params;
    const product = await productDAO.deleteById(id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado', product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await productDAO.findById(id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getProducts(req, res) {
  try {
    const products = await productDAO.findAll();
    res.json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function addToCart(req, res) {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ error: 'Solo usuarios pueden agregar productos al carrito' });
  }
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;
  const product = await productDAO.findById(productId);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  if (product.stock < qty) return res.status(400).json({ error: 'Stock insuficiente' });
  // Do NOT decrement stock here. Only check stock, but leave update for purchase step.
  // Ensure cart exists and is linked to user
  let cart = await cartDAO.getCartByUserId(req.user.id);
  if (!cart) {
    cart = await cartDAO.createCart(req.user.id);
    await userDAO.updateById(req.user.id, { cart: cart._id });
  }
  await cartDAO.addProductToCart(req.user.id, productId, qty);
  // Fetch updated cart
  const updatedCart = await cartDAO.getCartByUserId(req.user.id);
  res.json(updatedCart);
}

export async function getCart(req, res) {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ error: 'Solo usuarios pueden ver su carrito' });
  }
  const cart = await cartDAO.getCartByUserId(req.user.id);
  res.json(cart || { products: [] });
}

export async function getCartReview(req, res) {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ error: 'Solo usuarios pueden ver su carrito' });
  }
  const cart = await cartDAO.getCartByUserId(req.user.id);
  if (!cart || !cart.products || cart.products.length === 0) {
    return res.json({ products: [], total: 0 });
  }
  // For each product, check if stock is still valid
  let total = 0;
  const products = await Promise.all(cart.products.map(async (item) => {
    const prod = item.product;
    const latest = await productDAO.findById(prod._id);
    const inStock = latest && latest.stock >= item.quantity;
    const price = prod.price * item.quantity;
    total += price;
    return {
      id: prod._id,
      name: prod.name,
      price: prod.price,
      quantity: item.quantity,
      description: prod.description,
      inStock,
      availableStock: latest ? latest.stock : 0
    };
  }));
  res.json({ products, total });
}

export async function removeFromCart(req, res) {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ error: 'Solo usuarios pueden modificar su carrito' });
  }
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'Falta productId' });
  const updatedCart = await cartDAO.removeProductFromCart(req.user.id, productId);
  res.json(updatedCart || { products: [] });
}

export async function checkoutCart(req, res) {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ error: 'Solo usuarios pueden hacer checkout' });
  }
  const cart = await cartDAO.getCartByUserId(req.user.id);
  if (!cart || !cart.products || cart.products.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }
  // Check stock for all items
  const unavailable = [];
  let total = 0;
  const purchasedItems = [];
  for (const item of cart.products) {
    const prod = await productDAO.findById(item.product._id);
    if (!prod || prod.stock < item.quantity) {
      unavailable.push({
        id: item.product._id,
        name: item.product.name,
        requested: item.quantity,
        available: prod ? prod.stock : 0
      });
    } else {
      purchasedItems.push({
        name: prod.name,
        price: prod.price,
        quantity: item.quantity
      });
      total += prod.price * item.quantity;
    }
  }
  if (unavailable.length > 0) {
    return res.status(409).json({ error: 'Algunos productos no tienen stock suficiente', unavailable });
  }
  // All items available, proceed to update stock
  for (const item of cart.products) {
    const prod = await productDAO.findById(item.product._id);
    await productDAO.updateById(prod._id, { stock: prod.stock - item.quantity });
  }
  // Remove cart from DB and clear user.cart
  await cartDAO.deleteCartByUserId(req.user.id);
  await userDAO.updateById(req.user.id, { cart: null });
  // Send emails (to GSMTP_TO and GSMTP_ADMIN)
  try {
    await sendPurchaseConfirmationEmail({ user: req.user, items: purchasedItems, total });
    await sendAdminStockNotificationEmail({ user: req.user, items: purchasedItems, total });
  } catch (err) {
    console.error('Error sending checkout emails:', err);
  }
  res.json({ message: 'Compra realizada con éxito' });
}