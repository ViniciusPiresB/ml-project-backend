import { VariationDto } from "./variation.type";

export type ItemDto = {
  title: string;
  variation?: VariationDto;
  quantity: number;
};
