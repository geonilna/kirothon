import { createServerFn } from "@tanstack/react-start";
import data from "../data/restaurants.json";

export type Restaurant = {
  id: number;
  name: string;
  category: string;
  menu: string[];
  imageUrl: string;
};

export const getRestaurants = createServerFn({ method: "GET" }).handler(
  (): Restaurant[] => data as Restaurant[]
);
