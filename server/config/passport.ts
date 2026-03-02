import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "../storage";
import { SESSION_USER_KEY } from "./constants";

export const isGoogleConfigured = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (isGoogleConfigured) {
  const callbackURL =
    process.env.NODE_ENV === "production"
      ? `${process.env.APP_URL}/api/auth/google/callback`
      : "http://localhost:5000/api/auth/google/callback";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email from Google profile"));

          let user = await storage.getUserByGoogleId(profile.id);

          if (!user) {
            user = await storage.getUserByEmail(email);
            if (user) {
              user = await storage.updateUser(user.id, {
                googleId: profile.id,
                photoUrl: user.photoUrl || profile.photos?.[0]?.value || "",
              }) ?? user;
            } else {
              user = await storage.createUser({
                userName: profile.displayName || email.split("@")[0],
                email,
                password: null,
                googleId: profile.id,
                role: "user",
                photoUrl: profile.photos?.[0]?.value || "",
                description: "",
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
} else {
  console.warn("[passport] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google login disabled.");
}

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user ?? false);
  } catch (err) {
    done(err);
  }
});

export default passport;