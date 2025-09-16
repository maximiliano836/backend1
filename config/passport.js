const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const cookieExtractor = (req) => {
  if (req && req.cookies && req.cookies.token) return req.cookies.token;
  return null;
};

const fromAuthHeader = ExtractJwt.fromAuthHeaderAsBearerToken();
const fromCookieOrHeader = (req) => cookieExtractor(req) || fromAuthHeader(req);

function initPassport() {
  const opts = {
    jwtFromRequest: fromCookieOrHeader,
    secretOrKey: process.env.JWT_SECRET || 'devsecret'
  };

  passport.use(
    'jwt',
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user = await User.findById(payload.uid).populate('cart');
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}

module.exports = initPassport;
