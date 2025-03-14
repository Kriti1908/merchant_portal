import session from "express-session";
import createMemoryStore from "memorystore";
import { User } from "./models/User";
import { Project } from "./models/Project";
import { InsertUser } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(user: InsertUser): Promise<any>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUser(id: string) {
    return User.findById(id);
  }

  async getUserByEmail(email: string) {
    return User.findOne({ email });
  }

  async createUser(insertUser: InsertUser) {
    return User.create(insertUser);
  }
}

export const storage = new MemStorage();