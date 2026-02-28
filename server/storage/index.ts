export type { IStorage } from "./IStorage";
export { MemStorage } from "./MemStorage";
export { DbStorage } from "./DbStorage";

import { MemStorage } from "./MemStorage";
import { DbStorage } from "./DbStorage";

function createStorage() {
  if (process.env.DATABASE_URL) {
    console.log("[storage] Using PostgreSQL (DbStorage)");
    return new DbStorage();
  }
  console.log("[storage] Using in-memory storage (MemStorage) — set DATABASE_URL to use PostgreSQL");
  return new MemStorage();
}

export const storage = createStorage();
