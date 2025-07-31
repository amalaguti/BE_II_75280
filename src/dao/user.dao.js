// DAO pattern: In Node.js/Mongoose projects, it is most common to use a plain object or exported functions for DAOs.
// This keeps things simple and stateless.
//
// A class for DAO is used if:
//   - Maintain state (e.g., hold a DB connection or context)
//   - Use inheritance (e.g., extend a BaseDAO)
//   - Support dependency injection (e.g., for testing or multiple DBs)
//   - Add extensibility for future features
// For most simple, stateless DAOs, a plain object is preferred.
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
  },
  async findByResetToken(token) {
    return userModel.findOne({ resetPasswordToken: token });
  }
};

export default userDAO; 