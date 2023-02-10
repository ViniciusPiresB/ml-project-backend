import { getUsers } from "../helper/getUsers";

export class orderService {
  public static async getOrders() {
    const users = await getUsers();

    users.forEach(user => {
      console.log(user);
    });
  }
}
