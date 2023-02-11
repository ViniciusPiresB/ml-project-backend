import { prisma } from "../../database/prismaClient";
import { mercadoLivreService } from "./mercadoLivre.service";
import {ItemDto} from "../helper/types/item.type"

export class orderService {
  public static async getOrders() {
    const orders = await mercadoLivreService.getOrders();

    await this.insertOrdersInDatabase(orders)

    return orders;
  }

  private static async insertOrdersInDatabase(orders: ItemDto[]) {
    orders.forEach(async order => {
      const { id, title, quantity, username, date_of_order } = order;

      const isOrder = await prisma.order.findFirst({where: {id: id}})

      if(isOrder) return;

      const createdOrder = await prisma.order.create({
        data: { id, title, quantity, username, date_of_order }
      });

      const orderId = createdOrder.id;

      const promises = order.variation?.map(async variation => {
        const { name, value } = variation;
        await prisma.variation.create({ data: { name, value, orderId } });
      });

      if(promises)
        await Promise.all(promises);
    });
  }
}
