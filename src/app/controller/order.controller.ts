import { Request, Response } from "express";
import { bigIntToJson } from "../helper/bigIntToJson";
import { orderService } from "../service/order.service";

export class OrderController {
  public async getOrders(req: Request, res: Response) {
    const orders = await orderService.getOrders();

    const ordersToJson = bigIntToJson(orders);

    res.status(200).send(ordersToJson);
  }
}
