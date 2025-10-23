import { Business, SearchParams } from '../types';

// IMPORTANT: Storing API keys in frontend code is insecure and not recommended for production.
// This is for demonstration purposes only. Use a backend proxy to protect keys in a real application.
const YELP_API_KEY = 'G_8zuIoBRXT6m9JAaQkG5PO65e76Zgcq0QQRwBPNzH6yu13BP1TatMIOGdDUw05XHu2VWLWrig8ZjYeTPp332W1octLZJoglJDIb_gPn6G1PrbJXg8gBD1vGh4_5aHYx';
const YELP_API_URL = 'https://api.yelp.com/v3/businesses/search';
// Using a CORS proxy to bypass browser restrictions. This is not suitable for production.
const PROXY_URL = 'https://cors.eu.org/';

const priceMap: { [key: string]: string } = {
  '$': '1',
  '$$': '2',
  '$$$': '3',
  '$$$$': '4',
};

export const findBusinessesOnYelp = async (
  searchParams: SearchParams,
  userLocation: { latitude: number; longitude: number } | null
): Promise<Business[]> => {
  const { category, niche, address, radius, price, reviews, keywords } = searchParams;

  const queryParams = new URLSearchParams();

  const term = [category, niche, keywords].filter(Boolean).join(' ');
  queryParams.append('term', term);
  
  if (address) {
    queryParams.append('location', address);
  } else if (userLocation) {
    queryParams.append('latitude', userLocation.latitude.toString());
    queryParams.append('longitude', userLocation.longitude.toString());
  } else {
      // Yelp API requires a location
      throw new Error("Yelp search requires a location (address or coordinates).");
  }

  // Convert miles to meters for Yelp API, capped at 40000m (~25 miles)
  queryParams.append('radius', Math.min(Math.round(radius * 1609.34), 40000).toString());

  if (price && priceMap[price]) {
    queryParams.append('price', priceMap[price]);
  }
  
  queryParams.append('limit', '20');
  queryParams.append('sort_by', 'best_match');

  try {
    const response = await fetch(`${PROXY_URL}${YELP_API_URL}?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Yelp API Error:", errorData);
        throw new Error(`Yelp API request failed: ${errorData.error?.description || response.statusText}`);
    }

    const data = await response.json();

    if (!data.businesses) {
      return [];
    }

    let yelpBusinesses = data.businesses
        .filter((b: any) => b.rating >= reviews)
        .map((business: any): Business => ({
            name: business.name,
            category: business.categories.map((c: any) => c.title).join(', '),
            servicesOrProducts: [], // Yelp API doesn't provide this directly
            phone: business.display_phone,
            email: '', // Yelp API doesn't provide email
            address: business.location.display_address.join(', '),
            yelpUrl: business.url,
            websiteOrSocialMedia: business.url, // Using Yelp URL as a fallback
            source: 'Yelp',
        }));
    
    return yelpBusinesses;

  } catch (error) {
    console.error("Error calling Yelp API:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to find businesses on Yelp: ${error.message}`);
    }
    throw new Error("An unknown error occurred while finding businesses on Yelp.");
  }
};
