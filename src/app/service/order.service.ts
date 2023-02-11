import axios from "axios";
import { allowedShippingStatus } from "../helper/allowedShippingStatus";
import { getUsers } from "../helper/getUsers";
import { ItemDto } from "../helper/types/item.type";
import { OrderDto } from "../helper/types/order.type";
import { OrdersOfUser } from "../helper/types/ordersOfUser.type";
import { VariationDto } from "../helper/types/variation.type";

export class orderService {
  private async getDetailOfOrders(orders: any) {}

  public static async getOrders() {
    const users = await getUsers();

    let ordersOfUsers: OrdersOfUser[] = [];

    const usersPromises = users.map(async user => {
      const headers = { authorization: `Bearer ${user.accessToken}` };
      console.log(user);
      const orderResponse = await axios.get(
        `https://api.mercadolibre.com/orders/search?seller=${user.id}&tags=not_delivered&order.status=paid&sort=date_desc`,
        {
          headers
        }
      );

      const orders = orderResponse.data.results;

      let notReadyOrders: ItemDto[] = [];
      // @ts-ignore
      const shipmentPromises = orders.map(async order => {
        const shipmentId = order.shipping.id;

        const shipmentResponse = await axios.get(
          `https://api.mercadolibre.com/shipments/${shipmentId}`,
          { headers }
        );

        const shipmentStatus = shipmentResponse.data.substatus;

        if (allowedShippingStatus.includes(shipmentStatus)) {
          const items = order.order_items;
          //@ts-ignore
          items.forEach(item => {
            const itemVariations = item.item.variation_attributes;

            const itemVariation: VariationDto = {
              name: itemVariations[0].name,
              value: itemVariations[0].value_name
            };

            const itemOfOrder: ItemDto = {
              title: item.item.title,
              variation: itemVariation,
              quantity: item.quantity
            };

            notReadyOrders.push(itemOfOrder);
          });
        }
      });

      await Promise.all(shipmentPromises);

      const ordersOfUser: OrdersOfUser = {
        username: user.name,
        notReadyOrders
      };

      ordersOfUsers.push(ordersOfUser);
    });

    await Promise.all(usersPromises);

    return ordersOfUsers;
  }
}
