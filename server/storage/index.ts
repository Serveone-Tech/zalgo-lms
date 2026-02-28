export type { IStorage } from "./IStorage";
export { MemStorage } from "./MemStorage";

import { MemStorage } from "./MemStorage";
export const storage = new MemStorage();
