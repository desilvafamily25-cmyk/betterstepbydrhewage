const USDA_API_KEY = 'cSDOvm7bXWeQoYiiK6oQ6NHytA1zgL1SVjDN9FvZ';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = {
  search: 24 * 60 * 60 * 1000,
  food: 7 * 24 * 60 * 60 * 1000,
};

function getCached(key: string, maxAge: number) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < maxAge) return cached.data;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

export interface FoodSearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
}

export interface FoodNutrient {
  nutrient: { name: string; unitName: string };
  amount: number;
}

export interface FoodDetail {
  description: string;
  foodNutrients: FoodNutrient[];
  dataType: string;
}

export async function searchFoods(query: string, pageSize = 10): Promise<FoodSearchResult[]> {
  if (query.length < 3) throw new Error('Query must be at least 3 characters');
  const cacheKey = `search:${query}:${pageSize}`;
  const cached = getCached(cacheKey, CACHE_DURATION.search);
  if (cached) return cached as FoodSearchResult[];

  const url = `${BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=Foundation,SR%20Legacy`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`USDA API error: ${response.status}`);
  const data = await response.json();
  const foods = data.foods || [];
  setCache(cacheKey, foods);
  return foods;
}

export async function getFoodDetails(fdcId: number): Promise<FoodDetail> {
  const cacheKey = `food:${fdcId}`;
  const cached = getCached(cacheKey, CACHE_DURATION.food);
  if (cached) return cached as FoodDetail;

  const url = `${BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`USDA API error: ${response.status}`);
  const data: FoodDetail = await response.json();
  setCache(cacheKey, data);
  return data;
}

export function getProteinNutrient(foodNutrients: FoodNutrient[]) {
  return foodNutrients.find(n => n.nutrient.name === 'Protein');
}
