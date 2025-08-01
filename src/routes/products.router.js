import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticateJWT, createProduct);
router.put('/:id', authenticateJWT, updateProduct);
router.delete('/:id', authenticateJWT, deleteProduct);

export default router;