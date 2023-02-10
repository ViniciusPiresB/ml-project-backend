import { Request, Response } from "express";
import { orderService } from "../service/order.service";

export class OrderController {
  public async getOrders(req: Request, res: Response) {
    const orders = await orderService.getOrders();

    res.status(200).send(orders);
  }
}
