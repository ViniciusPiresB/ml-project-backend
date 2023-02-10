import { prisma } from "../../database/prismaClient";

export const getUsers = async () => {
  return prisma.account.findMany();
};
