import axios, { AxiosError } from "axios";
import { allowedShippingStatus } from "../helper/allowedShippingStatus";
import { getUsers } from "../helper/getUsers";
import { getUTCTime } from "../helper/getUTCTime";
import { ItemDto } from "../helper/types/item.type";
import { VariationDto } from "../helper/types/variation.type";

export class mercadoLivreService {
  public static async getOrders() {
    const users = await getUsers();

    let ordersOfUsers: ItemDto[] = [];

    const usersPromises = users.map(async user => {
      const headers = { authorization: `Bearer ${user.accessToken}` };

      const orderResponse = await axios.get(
        `https://api.mercadolibre.com/orders/search?seller=${user.id}&tags=not_delivered&order.status=paid&sort=date_desc`,
        {
          headers,
          validateStatus: () => true
        }
      );

      if (orderResponse.status == 401)
        throw new AxiosError(
          `Usuário ${user.name} com login inválido ou expirado.`,
          orderResponse.statusText
        );

      if (orderResponse.status != 200)
        throw new AxiosError(
          "Something wrong with ML service",
          orderResponse.statusText
        );

      const orders = orderResponse.data.results;
      // @ts-ignore
      const shipmentPromises = orders.map(async order => {
        const shipmentId = order.shipping.id;

        if (!shipmentId) return;

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

            let variations: VariationDto[] = [];

            //@ts-ignore
            itemVariations.forEach(variation => {
              const itemVariation: VariationDto = {
                name: variation.name,
                value: variation.value_name
              };

              variations.push(itemVariation);
            });

            const date_of_order = getUTCTime(
              shipmentData.status_history.date_handling
            );

            const itemOfOrder: ItemDto = {
              id: order.id,
              title: item.item.title,
              variation: variations,
              quantity: item.quantity,
              username: user.name,
              date_of_order
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
