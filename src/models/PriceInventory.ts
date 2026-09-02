import mongoose, { Schema, Document, Model, Types } from "mongoose";
import fs from "fs";
import path from "path";

// --- Baseline Default Pricing Schema & Catalog ---
export const DEFAULT_BASELINE_PRICING: Record<string, Record<string, { repair: number; replace: number }>> = {
  "Mid-size Sedan": {
    "Window Glass": { repair: 0, replace: 9500 },
    "Rear Bumper Panel": { repair: 4500, replace: 9000 },
    "Front Bumper": { repair: 5000, replace: 11000 },
    "Headlight": { repair: 1200, replace: 3500 },
    "Fender": { repair: 1800, replace: 4500 },
    "Side Door": { repair: 5400, replace: 12000 },
    "Side View Mirror": { repair: 1000, replace: 2800 },
    "Wiper Blades": { repair: 0, replace: 850 },
    "Grille": { repair: 1500, replace: 6000 },
    "Hood": { repair: 3500, replace: 14000 },
    "Reflector": { repair: 0, replace: 950 },
    "A-Pillar Trim": { repair: 2500, replace: 5000 },
  },
  "SUV / Crossover": {
    "Window Glass": { repair: 0, replace: 12000 },
    "Rear Bumper Panel": { repair: 5500, replace: 11000 },
    "Front Bumper": { repair: 6000, replace: 13500 },
    "Headlight": { repair: 1500, replace: 4800 },
    "Fender": { repair: 2200, replace: 5500 },
    "Side Door": { repair: 6500, replace: 15000 },
    "Side View Mirror": { repair: 1200, replace: 3500 },
    "Wiper Blades": { repair: 0, replace: 1000 },
    "Grille": { repair: 1800, replace: 8000 },
    "Hood": { repair: 4500, replace: 18000 },
    "Reflector": { repair: 0, replace: 1200 },
    "A-Pillar Trim": { repair: 3000, replace: 6000 },
  },
  "Hatchback": {
    "Window Glass": { repair: 0, replace: 7500 },
    "Rear Bumper Panel": { repair: 3500, replace: 7500 },
    "Front Bumper": { repair: 4000, replace: 8500 },
    "Headlight": { repair: 1000, replace: 2800 },
    "Fender": { repair: 1500, replace: 3500 },
    "Side Door": { repair: 4500, replace: 9500 },
    "Side View Mirror": { repair: 800, replace: 2200 },
    "Wiper Blades": { repair: 0, replace: 700 },
    "Grille": { repair: 1200, replace: 4500 },
    "Hood": { repair: 2800, replace: 10000 },
    "Reflector": { repair: 0, replace: 800 },
    "A-Pillar Trim": { repair: 2000, replace: 4000 },
  },
};

// --- Mongoose Price/Inventory Interface & Schema ---
export interface IPriceInventory extends Document {
  adminId: string;
  prices: Record<string, Record<string, { repair: number; replace: number }>>;
  createdAt: Date;
  updatedAt: Date;
}

const PriceInventorySchema = new Schema<IPriceInventory>(
  {
    adminId: {
      type: String,
      required: [true, "adminId field is required to associate price list with specific admin"],
      unique: true,
      index: true,
    },
    prices: {
      type: Schema.Types.Mixed,
      required: [true, "Prices object matrix is required"],
      default: DEFAULT_BASELINE_PRICING,
    },
  },
  {
    timestamps: true,
  }
);

export const PriceInventoryModel: Model<IPriceInventory> =
  mongoose.models.PriceInventory ||
  mongoose.model<IPriceInventory>("PriceInventory", PriceInventorySchema);

// --- Local Persistent Disk Storage Backup ---
const DATA_DIR = path.join(process.cwd(), "data");
const PRICES_FILE = path.join(DATA_DIR, "admin_prices_db.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn("Could not create data dir for prices:", err);
    }
  }
}

function loadLocalPrices(): Record<string, any> {
  ensureDataDir();
  try {
    if (fs.existsSync(PRICES_FILE)) {
      const content = fs.readFileSync(PRICES_FILE, "utf-8");
      return JSON.parse(content) || {};
    }
  } catch (err) {
    console.error("Error reading admin prices disk database:", err);
  }
  return {};
}

function saveLocalPrices(allPrices: Record<string, any>) {
  ensureDataDir();
  try {
    fs.writeFileSync(PRICES_FILE, JSON.stringify(allPrices, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing admin prices disk database:", err);
  }
}

// --- Unified Asynchronous Controller Helpers ---

/**
 * Retrieves the price list for a given adminId.
 * If not found, creates a new default document linked to this adminId.
 */
export async function getOrCreatePriceList(
  adminId: string,
  fallbackEmail?: string
): Promise<{
  prices: Record<string, Record<string, { repair: number; replace: number }>>;
  isNew: boolean;
}> {
  const isMongoReady = mongoose.connection.readyState === 1;
  const key = String(adminId).trim();

  if (isMongoReady) {
    try {
      const queryList: any[] = [{ adminId: key }];
      if (fallbackEmail && fallbackEmail !== key) {
        queryList.push({ adminId: String(fallbackEmail).trim().toLowerCase() });
      }

      let doc = await PriceInventoryModel.findOne({ $or: queryList });
      if (doc && doc.prices && Object.keys(doc.prices).length > 0) {
        return { prices: doc.prices, isNew: false };
      }

      // If document doesn't exist, create it with default prices
      const created = await PriceInventoryModel.create({
        adminId: key,
        prices: DEFAULT_BASELINE_PRICING,
      });

      // Also mirror to local disk backup
      const local = loadLocalPrices();
      local[key] = DEFAULT_BASELINE_PRICING;
      saveLocalPrices(local);

      return { prices: created.prices, isNew: true };
    } catch (err) {
      console.warn("MongoDB price query error, falling back to disk cache:", err);
    }
  }

  // Persistent disk storage fallback
  const local = loadLocalPrices();
  if (local[key]) {
    return { prices: local[key], isNew: false };
  }
  if (fallbackEmail && local[fallbackEmail.toLowerCase()]) {
    return { prices: local[fallbackEmail.toLowerCase()], isNew: false };
  }

  // Create new default entry
  local[key] = JSON.parse(JSON.stringify(DEFAULT_BASELINE_PRICING));
  saveLocalPrices(local);
  return { prices: local[key], isNew: true };
}

/**
 * Updates or upserts the custom price list strictly for the requesting adminId.
 */
export async function updateAdminPriceList(
  adminId: string,
  prices: Record<string, Record<string, { repair: number; replace: number }>>,
  fallbackEmail?: string
): Promise<Record<string, Record<string, { repair: number; replace: number }>>> {
  const isMongoReady = mongoose.connection.readyState === 1;
  const key = String(adminId).trim();

  if (isMongoReady) {
    try {
      const queryList: any[] = [{ adminId: key }];
      if (fallbackEmail && fallbackEmail !== key) {
        queryList.push({ adminId: String(fallbackEmail).trim().toLowerCase() });
      }

      let doc = await PriceInventoryModel.findOne({ $or: queryList });
      if (doc) {
        doc.prices = prices;
        doc.markModified("prices");
        await doc.save();
      } else {
        doc = await PriceInventoryModel.create({
          adminId: key,
          prices,
        });
      }

      // Mirror to disk cache
      const local = loadLocalPrices();
      local[key] = prices;
      if (fallbackEmail) local[fallbackEmail.toLowerCase()] = prices;
      saveLocalPrices(local);

      return doc.prices;
    } catch (err) {
      console.warn("MongoDB price update error, falling back to disk cache:", err);
    }
  }

  // Persistent disk storage fallback
  const local = loadLocalPrices();
  local[key] = prices;
  if (fallbackEmail) local[fallbackEmail.toLowerCase()] = prices;
  saveLocalPrices(local);
  return prices;
}
