import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { tableSync } from "../service/tableSync.service";

export class TableSyncController {
  public async getOrderSync(req: Request, res: Response) {
    try {
      const isSync = await tableSync.getSync("Order");

      res.status(200).send({ Order: isSync });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        if (error.code == "P2025") {
          await tableSync.createSyncRow("Order");

          const isSync = await tableSync.getSync("Order");

          res.status(200).send({ Order: isSync });
          return;
        }

      console.log(error);
      throw error;
    }
  }
}
