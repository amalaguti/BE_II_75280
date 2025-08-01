import productDAO from '../dao/product.dao.js';

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