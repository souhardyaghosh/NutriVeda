export interface UserData {
  planFor: 'individual' | 'family';
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  height: number;
  weight: number;
  activityLevel: string;
  dietaryPreference: string;
  dietaryRestrictions: string[];
  healthGoals: string[];
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  sweetnessLevel: 'Low' | 'Medium' | 'High';
  mealHabits: {
    breakfastTime: string;
    lunchTime: string;
    dinnerTime: string;
    eatingOutFrequency: string;
    familyFriendly: 'Yes' | 'No';
  }
}

export interface FamilyMember {
  id: number;
  name: string;
  age: number;
  gender: 'Female' | 'Male';
  goal: string;
  diet: 'Non-vegetarian' | 'Vegetarian' | 'Eggetarian';
  restrictions: string[];
  dislikes: string[];
}


export interface Macronutrients {
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface DoshaBalance {
  vata: number; // percentage
  pitta: number; // percentage
  kapha: number; // percentage
}

export interface AyurvedicProperties {
  rasas: string[]; // Tastes e.g., Sweet, Salty, Pungent
  notes: string;
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  macronutrients: Macronutrients;
  ayurvedicBalance: DoshaBalance;
  ayurvedicProperties: AyurvedicProperties;
}

export interface DailyPlan {
  day: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
  totalCalories: number;
  ayurvedicRating: number; // 1 to 5 stars
  ayurvedicQuote: string;
}

export interface DietPlan {
  title: string;
  description: string;
  dailyPlans: DailyPlan[];
}

// Types for Food Scanner
export interface Nutrient {
  name: string;
  amount: string; // e.g., "300mg"
  percentDV: number; // e.g., 30
}

export interface FoodAnalysis {
  foodName: string;
  servingSize: string;
  calories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
  vitamins: Nutrient[];
  minerals: Nutrient[];
  ayurvedicAnalysis: {
    effect: 'Heating' | 'Cooling' | 'Neutral';
    tastes: string[]; // Rasas
    qualities: string[]; // Gunas
    summary: string;
    doshaBalance: DoshaBalance;
  };
}

// --- Mood Tracker Types ---
export type MoodInputType = 'selfie' | 'voice' | 'chatbot';

export interface WellnessData {
  sleepHours?: number;
  heartRate?: number;
  spo2?: number;
}

export interface MoodAnalysisResult {
  detectedMood: string;
  doshaBalance: DoshaBalance;
  summary: string;
  recommendations: {
    diet: string;
    lifestyle: string;
    mindfulness: string;
  };
  weeklyMoods: { day: string; doshaBalance: DoshaBalance }[];
  wellnessAdvice?: string; // Optional advice based on wellness data
}