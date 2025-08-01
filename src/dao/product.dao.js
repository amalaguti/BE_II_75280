import productModel from '../models/product.model.js';

const productDAO = {
  async create(productData) {
    return productModel.create(productData);
  },
  async findById(id) {
    return productModel.findById(id);
  },
  async findAll() {
    return productModel.find();
  },
  async updateById(id, updateData) {
    return productModel.findByIdAndUpdate(id, updateData, { new: true });
  },
  async deleteById(id) {
    return productModel.findByIdAndDelete(id);
  }
};

export default productDAO;