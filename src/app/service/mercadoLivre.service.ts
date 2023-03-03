import { Account } from "@prisma/client";
import axios, { AxiosError } from "axios";
import * as dotenv from "dotenv";
import { prisma } from "../../database/prismaClient";
import { allowedShippingStatus } from "../helper/allowedShippingStatus";
import { getUsers } from "../helper/getUsers";
import { getUTCTime } from "../helper/getUTCTime";
import { ItemDto } from "../helper/types/item.type";
import { VariationDto } from "../helper/types/variation.type";
dotenv.config();

export class mercadoLivreService {
  public static async getOrders() {
    let users: Account[];
    let isTokenReloaded: boolean = false;

    users = await getUsers();

    const checkUsersTokenPromises = users.map(async user => {
      const headers = { authorization: `Bearer ${user.accessToken}` };

      const checkTokenResponse = await axios.get(
        `https://api.mercadolibre.com/users/${user.id}`,
        {
          headers,
          validateStatus: () => true
        }
      );

      if (checkTokenResponse.status == 401) {
        await this.renewToken(user);
        isTokenReloaded = true;
      }
    });

    await Promise.all(checkUsersTokenPromises);
    if (isTokenReloaded) {
      users = await getUsers();
    }

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

      if (orderResponse.status == 401) {
        throw new AxiosError(
          `Usuário ${user.name} com problemas, recarregue a pagina, caso não funcionar, contate um administrador do sistema.`,
          orderResponse.statusText
        );
      }

      if (orderResponse.status != 200)
        throw new AxiosError(
          "Algo errado com serviço ML, recarregue a pagina, caso não funcionar, contate um administrador do sistema",
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

            const manufacturing_ending_date = order.manufacturing_ending_date;
            let manufacturing_ending_date_utc = undefined;

            if (manufacturing_ending_date) {
              manufacturing_ending_date_utc = getUTCTime(
                manufacturing_ending_date
              );
            }

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
              date_of_order,
              manufacturing_ending_date: manufacturing_ending_date_utc,
              value: order.total_amount
            };

            ordersOfUsers.push(itemOfOrder);
          });
        }
      });

      await Promise.all(shipmentPromises);
    });

    await Promise.all(usersPromises);

    console.log(ordersOfUsers);
    return ordersOfUsers;
  }

  public static async renewToken(user: Account) {
    const { CLIENT_ID, CLIENT_SECRET } = process.env;

    const response = await axios.post(
      "https://api.mercadolibre.com/oauth/token",
      {
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: user.refreshToken
      }
    );

    const { access_token, refresh_token } = response.data;

    await prisma.account.update({
      where: { id: user.id },
      data: { accessToken: access_token, refreshToken: refresh_token }
    });
  }
}
