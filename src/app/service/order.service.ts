import { prisma } from "../../database/prismaClient";
import { mercadoLivreService } from "./mercadoLivre.service";
import {ItemDto} from "../helper/types/item.type"

export class orderService {
  public static async getOrders() {
    const ordersFromMercadoLivre = await mercadoLivreService.getOrders();

    await this.insertOrdersInDatabase(ordersFromMercadoLivre)
    await this.deleteDeliveredOrders(ordersFromMercadoLivre)

    const orders = await this.findMany()

    return orders;
  }

  private static async findMany() {
    return prisma.order.findMany()
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

  private static async deleteDeliveredOrders(ordersFromMercadoLivre: ItemDto[]) {
    const ordersInDatabase = await this.findMany();

    const idsFromMercadoLivre = ordersFromMercadoLivre.map(order => { return order.id });
    const idsFromDatabase = ordersInDatabase.map(order => { return order.id});

    const idOfItemsToBeDeleted = idsFromDatabase.filter(id => !idsFromMercadoLivre.includes(id));

    const promises = idOfItemsToBeDeleted.map(async id => await prisma.order.delete({where: { id }}));

    await Promise.all(promises);
  }
}
