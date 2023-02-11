import axios from "axios";
import { allowedShippingStatus } from "../helper/allowedShippingStatus";
import { getUsers } from "../helper/getUsers";
import { ItemDto } from "../helper/types/item.type";
import { VariationDto } from "../helper/types/variation.type";

export class orderService {
  public static async getOrders() {
    const users = await getUsers();

    let ordersOfUsers: ItemDto[] = [];

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
      // @ts-ignore
      const shipmentPromises = orders.map(async order => {
        const shipmentId = order.shipping.id;

        const shipmentResponse = await axios.get(
          `https://api.mercadolibre.com/shipments/${shipmentId}`,
          { headers }
        );

        const shipmentStatus = shipmentResponse.data.substatus;
        const shipmentData = shipmentResponse.data;

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
              id: order.id,
              title: item.item.title,
              variation: itemVariation,
              quantity: item.quantity,
              username: user.name,
              date_of_order: shipmentData.status_history.date_handling
            };

            ordersOfUsers.push(itemOfOrder);
          });
        }
      });

      await Promise.all(shipmentPromises);
    });

    await Promise.all(usersPromises);

    return ordersOfUsers;
  }
}
