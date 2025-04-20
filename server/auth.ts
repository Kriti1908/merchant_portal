import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { User } from "./models/User";
import { insertUserSchema } from "@shared/schema";
import mongoose from "mongoose";
import createMemoryStore from "memorystore";
import crypto from "crypto";
import nodemailer from "nodemailer";


const MemoryStore = createMemoryStore(session);

declare global {
  namespace Express {
    interface User {
      _id: string;
      email: string;
      createdAt: Date;
    }
  }
}

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // MongoDB Connection with retries and support for local MongoDB
  const connectWithRetry = () => {
    // Try local MongoDB first, fallback to Atlas
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://dassteam13:zreL2IO0JnLAY56u@cluster0.tgkgnj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    return mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
  };

  connectWithRetry();

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours,
      sameSite: "lax",
      httpOnly: true
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Add this before your routes
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Is Authenticated:', req.isAuthenticated());
  console.log('Session:', req.session);
  next();
});

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }

        const userObject = {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          phone_no: user.phone_no,
          createdAt: user.createdAt,
        };
        return done(null, userObject);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      if (!user) return done(null, false);

      const userObject = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        phone_no: user.phone_no,
        createdAt: user.createdAt,
      };
      done(null, userObject);
    } catch (err) {
      done(err);
    }
  });

  // Forgot Password Route
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      // Save reset token to user
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      // TODO: Setup email transport and send reset email
      // For now, just return the token
      res.json({ 
        message: "Password reset instructions sent", 
        token: resetToken // Remove this in production
      });

    } catch (err) {
      res.status(500).json({ message: "Error processing request" });
    }
  });

  // Reset Password Route
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Update password and clear reset token
      user.password = await hashPassword(newPassword);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.json({ message: "Password updated successfully" });

    } catch (err) {
      res.status(500).json({ message: "Error resetting password" });
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create the user in the database
      const user = await User.create({
        username: validatedData.username,
        email: validatedData.email,
        phone_no: validatedData.phone_no,
        password: hashedPassword,
      });

      // Prepare the user object for the session
      const userObject = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        phone_no: user.phone_no,
        createdAt: user.createdAt,
      };

      req.login(userObject, (err) => {
        if (err) return next(err);
        res.status(201).json(userObject);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    res.json(req.user);
  });
}