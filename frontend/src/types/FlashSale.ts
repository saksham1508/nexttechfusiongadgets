export interface FlashSaleProduct {
  _id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  stock: number;
  sold: number;
  rating: number;
  reviews: number;
}

export interface FlashSale {
  _id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  products: FlashSaleProduct[];
  isActive: boolean;
  maxQuantityPerUser: number;
  createdAt: string;
  updatedAt: string;
}