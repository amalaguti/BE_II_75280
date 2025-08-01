import cartDAO from '../dao/cart.dao.js';
import productDAO from '../dao/product.dao.js';
import userDAO from '../dao/user.dao.js';

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
  // Decrement stock
  await productDAO.updateById(productId, { stock: product.stock - qty });
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