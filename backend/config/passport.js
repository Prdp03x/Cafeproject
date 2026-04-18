const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Cafe = require("../models/Cafe");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // 🔥 Step 1: Check if user exists by EMAIL
        let user = await Cafe.findOne({ email });

        if (user) {
          // 🔥 Step 2: If exists, just attach googleId (if not already)
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        } else {
          // 🔥 Step 3: If NOT exists → create new
          user = await Cafe.create({
            name: profile.displayName,
            email,
            googleId: profile.id, 
            isVerified: true,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

module.exports = passport;
