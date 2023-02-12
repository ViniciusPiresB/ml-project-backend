import { prisma } from "../../database/prismaClient";

export class tableSync {
  public static async getSync(table: string) {
    const { isSync } = await prisma.tableSync.findUniqueOrThrow({
      where: { name: table }
    });

    return isSync;
  }

  public static async setSync(table: string, isSync: boolean) {
    await prisma.tableSync.update({ where: { name: table }, data: { isSync } });
  }

  public static async createSyncRow(table: string) {
    const createdSync = await prisma.tableSync.create({
      data: { name: table, isSync: false }
    });

    return createdSync;
  }
}
