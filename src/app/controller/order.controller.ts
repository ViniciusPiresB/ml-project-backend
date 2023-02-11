import { AxiosError } from "axios";
import { Request, Response } from "express";
import { bigIntToJson } from "../helper/bigIntToJson";
import { orderService } from "../service/order.service";

export class OrderController {
  public async getOrders(req: Request, res: Response) {
    try {
      const orders = await orderService.getOrders();

      const ordersToJson = bigIntToJson(orders);

      res.status(200).send(ordersToJson);
    } catch (error) {
      if (error instanceof AxiosError)
        res.status(401).send({
          reason: error.code,
          message: error.message
        });
    }
  }
}
