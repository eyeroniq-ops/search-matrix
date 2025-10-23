export interface Business {
  name: string;
  category: string;
  servicesOrProducts: string[];
  phone: string;
  email: string;
  address: string;
  googleMapsUrl?: string;
  websiteOrSocialMedia: string;
  source: string; // 'Google', 'Yelp', or 'Google & Yelp'
  yelpUrl?: string;
}

export interface SearchParams {
  category: string;
  niche: string;
  address: string;
  radius: number;
  price: string;
  reviews: number;
  keywords: string;
}
