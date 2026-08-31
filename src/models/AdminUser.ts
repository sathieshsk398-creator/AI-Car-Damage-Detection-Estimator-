import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// --- Mongoose Admin Interface & Schema ---
export interface IAdminUser extends Document {
  email: string;
  password: string; // bcrypt hash
  role: string;
  shopName: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Admin password hash is required"],
    },
    role: {
      type: String,
      default: "Showroom Admin",
    },
    shopName: {
      type: String,
      default: "AutoGuard Custom Repairs",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password against bcrypt hash
AdminUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if model is already compiled to avoid hot reload errors
export const AdminUserModel: Model<IAdminUser> =
  mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

// --- User Schema for General App Users ---
export interface IUser extends Document {
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      default: "User",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// --- Centralized Database Manager & Fallback Adapter ---
// Automatically utilizes MongoDB Cloud Database when MONGODB_URI is provided,
// and gracefully coordinates with persistent storage as a zero-downtime fallback.

const DATA_DIR = path.join(process.cwd(), "data");
const ADMINS_FILE = path.join(DATA_DIR, "admins_db.json");
const USERS_FILE = path.join(DATA_DIR, "users_db.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn("Could not create data dir:", err);
    }
  }
}

// Initial default admin & user credentials seeded if storage is empty
const INITIAL_PRESET_ADMINS = [
  {
    id: "o_default_admin",
    email: "admin@autoguard.com",
    password: bcrypt.hashSync("admin123", 10),
    role: "Showroom Admin",
    shopName: "AutoGuard Care Center",
    createdAt: new Date().toISOString(),
  },
  {
    id: "o_default_owner",
    email: "owner@autoguard.com",
    password: bcrypt.hashSync("autoguard2026", 10),
    role: "Showroom Admin",
    shopName: "AutoGuard Custom Repairs",
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_PRESET_USERS = [
  {
    id: "u_demo_user",
    email: "user@autoguard.com",
    password: bcrypt.hashSync("user123", 10),
    role: "User",
    createdAt: new Date().toISOString(),
  },
];

export interface DatabaseStatus {
  engine: "mongodb" | "persistent_disk";
  connected: boolean;
  message: string;
}

let isMongoConnected = false;
let dbStatus: DatabaseStatus = {
  engine: "persistent_disk",
  connected: true,
  message: "Built-in persistent JSON database active.",
};

export function getDatabaseStatus(): DatabaseStatus {
  return dbStatus;
}

function isPlaceholderUri(uri: string): boolean {
  if (!uri || typeof uri !== "string") return true;
  const trimmed = uri.trim();
  if (
    trimmed === "" ||
    trimmed.includes("username:password") ||
    trimmed.includes("<password>") ||
    trimmed.includes("<username>") ||
    trimmed === "mongodb://localhost:27017" ||
    (trimmed.includes("cluster.mongodb.net") && trimmed.includes("username"))
  ) {
    return true;
  }
  return false;
}

export async function connectDatabase(mongoUri?: string): Promise<boolean> {
  const uri = mongoUri || process.env.MONGODB_URI;

  if (!uri || isPlaceholderUri(uri)) {
    seedLocalDefaults();
    isMongoConnected = false;
    dbStatus = {
      engine: "persistent_disk",
      connected: true,
      message: "Built-in persistent database is active and operational for cross-device sessions.",
    };
    console.log("Centralized DB: Initialized persistent storage engine for authentication.");
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true;
      dbStatus = {
        engine: "mongodb",
        connected: true,
        message: "Connected to MongoDB Cloud Database.",
      };
      return true;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
      connectTimeoutMS: 4000,
    });

    isMongoConnected = true;
    dbStatus = {
      engine: "mongodb",
      connected: true,
      message: "Connected to MongoDB Cloud Database successfully.",
    };
    console.log("Centralized DB: Connected to MongoDB Cloud Database successfully.");

    // Seed default admin accounts if collection is empty
    const count = await AdminUserModel.countDocuments();
    if (count === 0) {
      for (const preset of INITIAL_PRESET_ADMINS) {
        await AdminUserModel.create({
          email: preset.email,
          password: preset.password,
          role: preset.role,
          shopName: preset.shopName,
        });
      }
      console.log("Centralized DB: Seeded initial default showroom admins into MongoDB.");
    }
    return true;
  } catch (err: any) {
    isMongoConnected = false;
    seedLocalDefaults();
    dbStatus = {
      engine: "persistent_disk",
      connected: true,
      message:
        "MongoDB Atlas connection unreached (ensure 0.0.0.0/0 is in Atlas IP whitelist). Active engine: Built-in Persistent Database.",
    };
    console.log(
      "Centralized DB: Running on Built-in Persistent Storage engine (MongoDB Atlas access restricted or unwhitelisted)."
    );
    return false;
  }
}

function loadLocalAdmins(): any[] {
  ensureDataDir();
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = fs.readFileSync(ADMINS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading admins disk database:", err);
  }
  return INITIAL_PRESET_ADMINS;
}

function saveLocalAdmins(admins: any[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing admins disk database:", err);
  }
}

function loadLocalUsers(): any[] {
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading users disk database:", err);
  }
  return INITIAL_PRESET_USERS;
}

function saveLocalUsers(users: any[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users disk database:", err);
  }
}

function seedLocalDefaults() {
  ensureDataDir();
  if (!fs.existsSync(ADMINS_FILE)) {
    saveLocalAdmins(INITIAL_PRESET_ADMINS);
  }
  if (!fs.existsSync(USERS_FILE)) {
    saveLocalUsers(INITIAL_PRESET_USERS);
  }
}

// --- Unified Asynchronous Database Service Methods ---

export interface AdminRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  shopName: string;
  createdAt: string;
}

export async function findAdminByEmail(email: string): Promise<AdminRecord | null> {
  const trimmed = email.toLowerCase().trim();
  if (isMongoConnected) {
    try {
      const doc = await AdminUserModel.findOne({ email: trimmed });
      if (doc) {
        return {
          id: doc._id.toString(),
          email: doc.email,
          passwordHash: doc.password,
          role: doc.role,
          shopName: doc.shopName,
          createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn("MongoDB query error, falling back to disk cache:", err);
    }
  }

  const local = loadLocalAdmins();
  const found = local.find((a) => a.email.toLowerCase().trim() === trimmed);
  if (found) {
    return {
      id: found.id || `admin_${Date.now()}`,
      email: found.email,
      passwordHash: found.password || found.passwordHash,
      role: found.role || "Showroom Admin",
      shopName: found.shopName || "AutoGuard Custom Repairs",
      createdAt: found.createdAt || new Date().toISOString(),
    };
  }
  return null;
}

export async function createAdmin(
  email: string,
  plainPassword: string,
  shopName?: string,
  role: string = "Showroom Admin"
): Promise<AdminRecord> {
  const trimmed = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const effectiveShopName = shopName?.trim() || "AutoGuard Custom Repairs";

  if (isMongoConnected) {
    try {
      const created = await AdminUserModel.create({
        email: trimmed,
        password: passwordHash,
        role,
        shopName: effectiveShopName,
      });
      return {
        id: created._id.toString(),
        email: created.email,
        passwordHash: created.password,
        role: created.role,
        shopName: created.shopName,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("MongoDB write error, syncing to disk:", err);
    }
  }

  const local = loadLocalAdmins();
  const newAdmin = {
    id: `o_${Date.now()}`,
    email: trimmed,
    password: passwordHash,
    passwordHash: passwordHash,
    role,
    shopName: effectiveShopName,
    createdAt: new Date().toISOString(),
  };
  local.push(newAdmin);
  saveLocalAdmins(local);

  return {
    id: newAdmin.id,
    email: newAdmin.email,
    passwordHash: newAdmin.passwordHash,
    role: newAdmin.role,
    shopName: newAdmin.shopName,
    createdAt: newAdmin.createdAt,
  };
}

export async function verifyAdminPassword(admin: AdminRecord, plainPassword: string): Promise<boolean> {
  if (!admin || !admin.passwordHash) return false;
  return bcrypt.compare(plainPassword, admin.passwordHash);
}

export async function getAllAdmins(): Promise<Array<Omit<AdminRecord, "passwordHash">>> {
  if (isMongoConnected) {
    try {
      const docs = await AdminUserModel.find({}, { password: 0 }).sort({ createdAt: -1 });
      return docs.map((d) => ({
        id: d._id.toString(),
        email: d.email,
        role: d.role,
        shopName: d.shopName,
        createdAt: d.createdAt?.toISOString() || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn("MongoDB list query error, using local fallback:", err);
    }
  }

  const local = loadLocalAdmins();
  return local.map((a) => ({
    id: a.id,
    email: a.email,
    role: a.role,
    shopName: a.shopName,
    createdAt: a.createdAt,
  }));
}

// --- General User Operations ---
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const trimmed = email.toLowerCase().trim();
  if (isMongoConnected) {
    try {
      const doc = await UserModel.findOne({ email: trimmed });
      if (doc) {
        return {
          id: doc._id.toString(),
          email: doc.email,
          passwordHash: doc.password,
          role: doc.role,
          createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn("MongoDB user query error:", err);
    }
  }

  const local = loadLocalUsers();
  const found = local.find((u) => u.email.toLowerCase().trim() === trimmed);
  if (found) {
    return {
      id: found.id || `u_${Date.now()}`,
      email: found.email,
      passwordHash: found.password || found.passwordHash,
      role: found.role || "User",
      createdAt: found.createdAt || new Date().toISOString(),
    };
  }
  return null;
}

export async function createUser(
  email: string,
  plainPassword: string,
  role: string = "User"
): Promise<UserRecord> {
  const trimmed = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  if (isMongoConnected) {
    try {
      const created = await UserModel.create({
        email: trimmed,
        password: passwordHash,
        role,
      });
      return {
        id: created._id.toString(),
        email: created.email,
        passwordHash: created.password,
        role: created.role,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("MongoDB user create error:", err);
    }
  }

  const local = loadLocalUsers();
  const newUser = {
    id: `u_${Date.now()}`,
    email: trimmed,
    password: passwordHash,
    passwordHash: passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  local.push(newUser);
  saveLocalUsers(local);

  return {
    id: newUser.id,
    email: newUser.email,
    passwordHash: newUser.passwordHash,
    role: newUser.role,
    createdAt: newUser.createdAt,
  };
}

export async function verifyUserPassword(user: UserRecord, plainPassword: string): Promise<boolean> {
  if (!user || !user.passwordHash) return false;
  return bcrypt.compare(plainPassword, user.passwordHash);
}
