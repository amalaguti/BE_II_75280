import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { verifyToken } from '../utils/jwt.js';
import userModel from '../models/user.model.js';

const options = {
  jwtFromRequest: (req) => {
    // Extract JWT from httpOnly cookie
    return req.cookies.currentUser;
  },
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
  passReqToCallback: true
};

passport.use(new JwtStrategy(options, async (req, payload, done) => {
  try {
    // Fetch user from MongoDB using the ID from JWT payload
    const user = await userModel.findById(payload.id).select('-password');
    
    if (user) {
      return done(null, {
        id: user._id,
        email: user.email,
        name: user.first_name,
        last_name: user.last_name,
        age: user.age
      });
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

export default passport; 