export type SourceType = 'Amazon' | 'Walmart';

export interface SkuInput {
  Type: SourceType;
  SKU: string;
}

export interface ProductData {
    sku: string,
    source: SourceType
    title: string,
    price: string,
    description: string,
    numberOfReviews: string,
    rating: number
    url: string; 
}