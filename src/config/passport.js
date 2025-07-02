import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { verifyToken } from '../utils/jwt.js';

const options = {
  jwtFromRequest: (req) => {
    // Extract JWT from httpOnly cookie
    return req.cookies.jwt_token;
  },
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
  passReqToCallback: true
};

passport.use(new JwtStrategy(options, async (req, payload, done) => {
  try {
    // For now, we'll use the payload directly since we're not using a database
    // In a real app, you'd fetch the user from the database using payload.id
    const user = {
      id: payload.id,
      email: payload.email,
      name: payload.name
    };
    
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

export default passport; 