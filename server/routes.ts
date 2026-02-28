import type { Express } from "express";
import type { Server } from "http";
import { applyRoutes } from "./routes/index";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  return applyRoutes(httpServer, app);
}
