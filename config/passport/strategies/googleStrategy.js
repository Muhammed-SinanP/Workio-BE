import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../../../models/userModel.js";
import { generateToken } from "../../../utils/token.js";
import bcrypt from "bcrypt";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/googleSignIn/callback",
    passReqToCallback: true,
    session: false,
  },

  async (req, accessToken, refreshToken, profile, cb) => {
    try {
      const googleEmail = profile.emails[0]?.value;

      const googleName = profile.displayName;
      const state = req.query.state || "{}";

      const parsedState = JSON.parse(state); // Parse the state string to an object
      const userRole = parsedState.userRole;

      const user = await User.findOne({ email: googleEmail, role: userRole });

      if (!user && userRole === "admin") {
        return cb(new Error("Not allowed to signup as admin"), null);
      }

      if (!user && userRole !== "admin") {
        const saltRounds = 10;
        const googlePassword = generateRandomPassword();
        const hashedGooglePassword = bcrypt.hashSync(
          googlePassword,
          saltRounds
        );

        const newUser = new User({
          name: googleName,
          email: googleEmail,
          password: hashedGooglePassword,
          role: userRole,
        });
        await newUser.save();
        const userId = newUser._id;

        const token = generateToken(userId, userRole);
        
        return cb(null, token);
      }
      const userId = user._id;
      const token = generateToken(userId, userRole);
      return cb(null, token);
    } catch (err) {
    
      return cb(err, null);
    }
  }
);

function generateRandomPassword(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?";
  let newPassword = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    newPassword += characters[randomIndex];
  }

  return newPassword;
}

export { googleStrategy };
