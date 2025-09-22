import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserData, DietPlan, Meal, FamilyMember, FoodAnalysis, MoodAnalysisResult, WellnessData, MoodInputType, DoshaBalance } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mealSchemaProperties = {
  name: { type: Type.STRING },
  description: { type: Type.STRING },
  calories: { type: Type.INTEGER },
  macronutrients: {
    type: Type.OBJECT, properties: { protein: { type: Type.INTEGER }, carbs: { type: Type.INTEGER }, fat: { type: Type.INTEGER } }
  },
  ayurvedicBalance: {
    type: Type.OBJECT, properties: { vata: { type: Type.INTEGER }, pitta: { type: Type.INTEGER }, kapha: { type: Type.INTEGER } }
  },
  ayurvedicProperties: {
    type: Type.OBJECT, properties: { rasas: { type: Type.ARRAY, items: { type: Type.STRING } }, notes: { type: Type.STRING } }
  },
};

const mealSchema = {
    type: Type.OBJECT,
    properties: mealSchemaProperties,
};

const dietPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    dailyPlans: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          totalCalories: { type: Type.INTEGER },
          ayurvedicRating: { type: Type.INTEGER },
          ayurvedicQuote: { type: Type.STRING },
          meals: {
            type: Type.OBJECT,
            properties: {
              breakfast: { type: Type.OBJECT, properties: mealSchemaProperties },
              lunch: { type: Type.OBJECT, properties: mealSchemaProperties },
              dinner: { type: Type.OBJECT, properties: mealSchemaProperties },
              snacks: { type: Type.OBJECT, properties: mealSchemaProperties },
            },
          },
        },
      },
    },
  },
};

// Schema for Food Analysis
const nutrientSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        amount: { type: Type.STRING },
        percentDV: { type: Type.INTEGER },
    }
};

const foodAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        foodName: { type: Type.STRING },
        servingSize: { type: Type.STRING },
        calories: { type: Type.INTEGER },
        macronutrients: {
            type: Type.OBJECT,
            properties: {
                protein: { type: Type.INTEGER },
                carbs: { type: Type.INTEGER },
                fat: { type: Type.INTEGER },
            }
        },
        vitamins: { type: Type.ARRAY, items: nutrientSchema },
        minerals: { type: Type.ARRAY, items: nutrientSchema },
        ayurvedicAnalysis: {
            type: Type.OBJECT,
            properties: {
                effect: { type: Type.STRING, enum: ['Heating', 'Cooling', 'Neutral'] },
                tastes: { type: Type.ARRAY, items: { type: Type.STRING } },
                qualities: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING },
                doshaBalance: {
                    type: Type.OBJECT,
                    properties: {
                        vata: { type: Type.INTEGER },
                        pitta: { type: Type.INTEGER },
                        kapha: { type: Type.INTEGER },
                    }
                }
            }
        }
    }
};

const moodAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        detectedMood: { type: Type.STRING },
        doshaBalance: {
            type: Type.OBJECT,
            properties: {
                vata: { type: Type.INTEGER, description: "Vata percentage (must sum to 100 with others)" },
                pitta: { type: Type.INTEGER, description: "Pitta percentage (must sum to 100 with others)" },
                kapha: { type: Type.INTEGER, description: "Kapha percentage (must sum to 100 with others)" },
            }
        },
        summary: { type: Type.STRING, description: "A brief, insightful Ayurvedic summary of the mood." },
        recommendations: {
            type: Type.OBJECT,
            properties: {
                diet: { type: Type.STRING, description: "A short, actionable dietary recommendation." },
                lifestyle: { type: Type.STRING, description: "A short, actionable lifestyle recommendation." },
                mindfulness: { type: Type.STRING, description: "A short, actionable mindfulness or meditation recommendation." }
            }
        },
        weeklyMoods: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
                    doshaBalance: {
                        type: Type.OBJECT,
                        properties: {
                            vata: { type: Type.INTEGER },
                            pitta: { type: Type.INTEGER },
                            kapha: { type: Type.INTEGER },
                        },
                        description: "The dosha balance for that day. Values must sum to 100."
                    }
                }
            },
            description: "A 7-day dosha balance history for chart visualization. The last day's balance should reflect the current analysis."
        },
        wellnessAdvice: { type: Type.STRING, description: "Advice based on the provided wellness data (sleep, heart rate). Omit if no data is provided." }
    }
};


function isFamilyMemberArray(data: any): data is FamilyMember[] {
  return Array.isArray(data) && data.length > 0 && 'name' in data[0] && 'goal' in data[0];
}

export const generateDietPlan = async (userData: UserData | FamilyMember[]): Promise<DietPlan> => {
  let prompt: string;

  if (isFamilyMemberArray(userData)) {
    const familyProfiles = userData.map(member => `
- Name: ${member.name} (${member.age}, ${member.gender})
  - Goal: ${member.goal}
  - Diet: ${member.diet}
  - Restrictions: ${member.restrictions.join(', ') || 'None'}
  - Dislikes: ${member.dislikes.join(', ')}
`).join('');

    prompt = `
Objective: Generate a 7-day UNIFIED family diet plan as a JSON object matching the provided schema. The goal is to create meals that MOST family members can eat, accommodating everyone's restrictions.

Family Profiles:${familyProfiles}

JSON Generation Rules:
1. Create a SINGLE set of meals (breakfast, lunch, dinner, snacks) for each day for the whole family.
2. CRITICAL: The plan MUST respect ALL restrictions. For example, if one person is gluten-free, the shared meal MUST be gluten-free. If one is vegetarian, the main dish should be vegetarian. If one has a nut allergy, NO nuts should be used.
3. Suggest simple modifications within the meal "description" where necessary. For example: "A hearty lentil soup for everyone. For non-vegetarians, add pre-cooked shredded chicken."
4. Balance the nutritional needs and goals of the entire family. The plan should be generally healthy and suitable for a diverse group with different ages and goals.
5. The plan should primarily feature Indian cuisine.
6. The output must be a single, valid JSON object without any markdown or extra text.
7. All fields in the schema are mandatory.
8. Create exactly 7 daily plans.
    `;
  } else {
    const individualData = userData as UserData;
    const { age, gender, height, weight, activityLevel, dietaryPreference, dietaryRestrictions, healthGoals, spiceLevel, sweetnessLevel, mealHabits } = individualData;
  
    prompt = `
    Objective: Generate a 7-day personalized diet plan as a JSON object matching the provided schema.

    User Profile:
    - Age: ${age}
    - Gender: ${gender}
    - Height: ${height} cm
    - Weight: ${weight} kg
    - Activity Level: ${activityLevel}
    - Dietary Preference: ${dietaryPreference}
    - Restrictions: ${dietaryRestrictions.join(', ') || 'None'}
    - Health Goals: ${healthGoals.join(', ')}
    - Taste Profile: Spice: ${spiceLevel}, Sweetness: ${sweetnessLevel}
    - Meal Habits: Breakfast: ${mealHabits.breakfastTime}, Lunch: ${mealHabits.lunchTime}, Dinner: ${mealHabits.dinnerTime}, Eats out: ${mealHabits.eatingOutFrequency}, Family-friendly: ${mealHabits.familyFriendly}
    - Cuisine Style: The plan should primarily feature Indian cuisine, adapted to the user's taste profile.

    JSON Generation Rules:
    1. Strictly adhere to the user's dietary preferences and restrictions.
    2. The output must be a single, valid JSON object. Do not add any text before or after the JSON. Do not use markdown.
    3. All fields in the schema are mandatory.
    4. For each meal (breakfast, lunch, dinner, snacks), provide all details: name, description, calories, macronutrients (protein, carbs, fat in grams), ayurvedicBalance (vata, pitta, kapha as percentages summing to 100), and ayurvedicProperties (rasas array, notes string).
    5. For each day, provide totalCalories, a 1-5 star ayurvedicRating, and an ayurvedicQuote.
    6. The plan must contain exactly 7 daily plans.
  `;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dietPlanSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as DietPlan;
  } catch (error) {
    console.error("Error generating diet plan:", error);
    throw new Error("Failed to generate diet plan from AI service.");
  }
};


export const getCheatDaySwap = async (craving: string): Promise<string> => {
    const prompt = `
        A user is craving ${craving}. Provide a healthier, delicious Indian alternative they can make or find.
        Keep the response concise, friendly, and encouraging.
        For example, if the craving is 'Pizza', suggest something like 'Try a whole wheat naan pizza with paneer, lots of veggies, and a mint chutney. It's a desi twist that's both delicious and healthier!'.
        Give just one primary suggestion.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting cheat day swap:", error);
        throw new Error("Failed to get cheat day swap from AI service.");
    }
}

export const visualizeMealPlate = async (mealName: string, mealDescription: string): Promise<string> => {
    const prompt = `A photorealistic image of "${mealName}", an Indian dish. Description: "${mealDescription}". The food is presented beautifully in traditional or modern Indian serveware, looking delicious and healthy. Shot from a top-down angle with bright, natural lighting.`;
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error visualizing plate:", error);
        throw new Error("Failed to visualize plate from AI service.");
    }
};

export const getMealSwap = async (userData: UserData, mealToSwap: Meal, mealType: string): Promise<Meal> => {
    const prompt = `
        A user wants to swap a meal.
        User Profile:
        - Dietary Preference: ${userData.dietaryPreference}
        - Restrictions: ${userData.dietaryRestrictions.join(', ') || 'None'}
        - Health Goals: ${userData.healthGoals.join(', ')}
        
        Original Meal (${mealType}):
        - Name: ${mealToSwap.name}
        - Calories: ${mealToSwap.calories}
        - Description: ${mealToSwap.description}

        Task:
        Generate a single, new Indian meal suggestion as a valid JSON object matching the provided schema.
        The new meal should:
        1. Be a suitable ${mealType}.
        2. Adhere strictly to the user's dietary profile.
        3. Be different from the original meal.
        4. Have a calorie count within 10% of the original meal.
        5. The output must be only the JSON object, with no other text or markdown.
    `;
    
     try {
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: mealSchema,
        },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Meal;
    } catch (error) {
        console.error("Error generating meal swap:", error);
        throw new Error("Failed to generate meal swap from AI service.");
    }
};

export const analyzeFoodImage = async (base64ImageData: string, mimeType: string): Promise<FoodAnalysis> => {
    const prompt = `
    Analyze the provided image of a meal. Identify the food and provide a detailed nutritional and Ayurvedic breakdown. The food is likely Indian cuisine.

    Your response MUST be a single, valid JSON object that adheres to the provided schema.

    - foodName: Identify the primary dish (e.g., "Chicken 65").
    - servingSize: Estimate a reasonable serving size (e.g., "6-8 pieces with garnishes (approx. 200g)").
    - calories, macronutrients: Provide accurate estimates for the serving size.
    - vitamins, minerals: List at least 3 key vitamins and 3 key minerals present in the dish. Estimate their amount and percentage of Daily Value (%DV).
    - ayurvedicAnalysis:
      - effect: State if the meal's primary energy ('Virya') is 'Heating', 'Cooling', or 'Neutral'.
      - tastes: List the dominant tastes ('Rasas').
      - qualities: List the primary qualities ('Gunas') e.g., Heavy, Light, Oily, Dry, Pungent.
      - doshaBalance: Estimate the meal's impact on the doshas as percentages for Vata, Pitta, and Kapha. The three values MUST sum to 100.
      - summary: Provide a brief summary of its effect on the body and the three doshas (Vata, Pitta, Kapha).
    `;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64ImageData,
      },
    };
    const textPart = { text: prompt };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: foodAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FoodAnalysis;
    } catch (error) {
        console.error("Error analyzing food image:", error);
        throw new Error("Failed to analyze food image from AI service.");
    }
};

export const analyzeMood = async (
    inputType: MoodInputType,
    inputData: string, // Can be text, base64 image, or base64 audio
    wellnessData: WellnessData,
    mimeType?: string
): Promise<MoodAnalysisResult> => {

    let wellnessPrompt = "";
    if (wellnessData.sleepHours || wellnessData.heartRate || wellnessData.spo2) {
        wellnessPrompt += "\n\nAdditional Wellness Data:";
        if (wellnessData.sleepHours) wellnessPrompt += `\n- Last Night's Sleep: ${wellnessData.sleepHours} hours.`;
        if (wellnessData.heartRate) wellnessPrompt += `\n- Current Heart Rate: ${wellnessData.heartRate} bpm.`;
        if (wellnessData.spo2) wellnessPrompt += `\n- Current SpO2: ${wellnessData.spo2}%.`;
    }

    const mainPrompt = `
    Analyze the user's mood based on the provided input and provide an Ayurvedic analysis.

    Input Type: ${inputType}
    ${wellnessPrompt}

    Task:
    Your response MUST be a single, valid JSON object that adheres to the provided schema.
    1.  **detectedMood**: Infer the user's primary emotion (e.g., "Peaceful", "Stressed", "Joyful", "Tired").
    2.  **doshaBalance**: Based on the mood, estimate the current dominance of the three doshas (Vata, Pitta, Kapha). The percentages must sum to 100. For example, stress might increase Vata and Pitta. Joy might indicate balanced doshas.
    3.  **summary**: Write a brief, empathetic summary connecting the detected mood to the likely doshic imbalance.
    4.  **recommendations**: Provide one concise, actionable tip for each category (diet, lifestyle, mindfulness) to help balance their doshas based on their current state.
    5.  **weeklyMoods**: Generate a realistic 7-day dosha balance history for a chart. The values for each dosha should be plausible and between 0-80. The last day's dosha balance should reflect the current analysis.
    6.  **wellnessAdvice**: If wellness data was provided, give a brief, relevant piece of advice. For example, if sleep is low, advise on better sleep hygiene. If it's not provided, omit this field.
    `;

    const contents: any = { parts: [{ text: mainPrompt }] };

    if (inputType === 'selfie' && mimeType) {
        contents.parts.unshift({
            inlineData: { mimeType: mimeType, data: inputData }
        });
    } else if (inputType === 'chatbot') {
        // Prepend the user's text message for analysis
        contents.parts.unshift({ text: `User's message: "${inputData}"` });
    }
     // Note: Voice/audio input is simplified to text for this prompt.
     // A real implementation would involve a speech-to-text step first.
    else if (inputType === 'voice') {
         contents.parts.unshift({ text: `User's spoken words: "${inputData}"` });
    }


    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: moodAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MoodAnalysisResult;
    } catch (error) {
        console.error("Error analyzing mood:", error);
        throw new Error("Failed to get mood analysis from AI service.");
    }
};