import userModel from '../models/user.model.js';

const userDAO = {
  async create(userData) {
    return userModel.create(userData);
  },
  async findById(id) {
    return userModel.findById(id);
  },
  async findByEmail(email) {
    return userModel.findOne({ email: email.toLowerCase() });
  },
  async findAll() {
    return userModel.find();
  },
  async updateById(id, updateData) {
    return userModel.findByIdAndUpdate(id, updateData, { new: true });
  },
  async deleteById(id) {
    return userModel.findByIdAndDelete(id);
  }
};

export default userDAO; 