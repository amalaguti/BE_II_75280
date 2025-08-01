import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addToCart, getCart, getCartReview, removeFromCart, checkoutCart } from '../controllers/products.controller.js';

const router = Router();

router.get('/', getProducts);
// IMPORTANT: Define /cart and /cart/add routes BEFORE /:id to prevent '/cart' from being interpreted as a product ID.
// This avoids 'Cast to ObjectId failed for value "cart"' errors when accessing /api/products/cart.
router.post('/cart/add', authenticateJWT, addToCart);
router.get('/cart', authenticateJWT, getCart);
router.get('/cart/review', authenticateJWT, getCartReview);
router.delete('/cart/remove', authenticateJWT, removeFromCart);
router.post('/cart/checkout', authenticateJWT, checkoutCart);
router.get('/:id', getProduct);
router.post('/', authenticateJWT, createProduct);
router.put('/:id', authenticateJWT, updateProduct);
router.delete('/:id', authenticateJWT, deleteProduct);

export default router;