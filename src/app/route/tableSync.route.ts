import { Router } from "express";
import { TableSyncController } from "../controller/tableSync.controller";

const tableSyncRouter = Router();
const tableSyncController = new TableSyncController();

tableSyncRouter.get("/", tableSyncController.getOrderSync);

export { tableSyncRouter };
