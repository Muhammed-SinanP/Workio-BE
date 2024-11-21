import passport from "passport";
import { googleStrategy } from "./strategies/googleStrategy.js";

passport.use("google", googleStrategy);

export { passport };
