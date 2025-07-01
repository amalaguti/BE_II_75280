import passport from 'passport';

export const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

export const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (user) {
      req.user = user;
    }
    
    next();
  })(req, res, next);
}; 