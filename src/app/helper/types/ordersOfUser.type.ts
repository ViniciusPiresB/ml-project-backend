import { ItemDto } from "./item.type";

export type OrdersOfUser = {
  username: string;
  notReadyOrders: ItemDto[];
};
