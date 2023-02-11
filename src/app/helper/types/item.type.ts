import { VariationDto } from "./variation.type";

export type ItemDto = {
  id: number;
  title: string;
  variation?: VariationDto[];
  quantity: number;
  username: string;
  date_of_order: Date;
};
