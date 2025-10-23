import { GoogleGenAI, Type } from "@google/genai";
import { Business, SearchParams } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for environments where the key is not set.
  // In a real deployed environment, this should be configured.
  // console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const findBusinesses = async (
  searchParams: SearchParams,
  userLocation: { latitude: number; longitude: number } | null,
  excludeBusinesses: string[]
): Promise<Business[]> => {
  const { category, niche, address, radius, price, reviews, keywords } = searchParams;

  const priceQuery = price ? `with a price range of '${price}'` : '';
  const reviewsQuery = reviews > 0 ? `with at least a ${reviews}-star review rating` : '';
  const nicheQuery = niche ? `specifically focusing on '${niche}'` : '';
  const keywordsQuery = keywords ? `The user also provided these specific keywords to focus on: '${keywords}'.` : '';
  const exclusionQuery = excludeBusinesses.length > 0
    ? `IMPORTANT: Do NOT include any of the following businesses in your response: ${excludeBusinesses.join(', ')}.`
    : '';

  const prompt = `
    You are an expert business finder. Find the 20 most relevant businesses based on the user's criteria.

    User Location for Search: ${address || 'user\'s current location'}
    Search Criteria:
    - Business Category: '${category}'
    - Niche: ${nicheQuery}
    - Search Radius: Within ${radius} miles
    - Price Range: ${priceQuery}
    - Minimum Review Rating: ${reviewsQuery}

    ${keywordsQuery}
    ${exclusionQuery}

    Your response MUST be a valid JSON array of business objects. Each object must have the following keys: 'name', 'category', 'servicesOrProducts' (an array of up to 4 strings), 'phone', 'email', 'address', 'googleMapsUrl', and 'websiteOrSocialMedia'. If a website or social media page is not available, return an empty string for that field.
    Ensure the 'googleMapsUrl' is a direct, valid URL to the business on Google Maps.
    Provide ONLY the raw JSON array string as the output, with no additional text, explanations, or markdown formatting (like \`\`\`json).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: userLocation ? {
          retrievalConfig: {
            latLng: userLocation
          }
        } : undefined,
      },
    });
    
    const text = response.text.trim();
    if (!text) {
      throw new Error("Received an empty response from the API.");
    }
    
    // The model might occasionally wrap the response in markdown, so we strip it.
    const jsonText = text.replace(/^```json\s*/, '').replace(/```$/, '');

    const businesses = JSON.parse(jsonText);
    return businesses as Business[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to find businesses: ${error.message}`);
    }
    throw new Error("An unknown error occurred while finding businesses.");
  }
};