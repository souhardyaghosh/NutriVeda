import { DietPlan, FamilyMember, FoodAnalysis } from './types';

export const familyMembers: FamilyMember[] = [
  { id: 1, name: 'Rajesh Kumar', age: 42, gender: 'Male', goal: 'Weight Loss, Heart Health', diet: 'Non-vegetarian', restrictions: [], dislikes: ['Okra'] },
  { id: 2, name: 'Priya Sharma', age: 38, gender: 'Female', goal: 'Maintain Weight, Improve Energy', diet: 'Vegetarian', restrictions: ['No Gluten (Wheat allergy)'], dislikes: ['Mushrooms'] },
  { id: 3, name: 'Anjali Singh', age: 16, gender: 'Female', goal: 'Muscle Gain, Improve Energy', diet: 'Eggetarian', restrictions: [], dislikes: ['Spinach'] },
  { id: 4, name: 'Rohan Verma', age: 12, gender: 'Male', goal: 'Maintain Weight', diet: 'Vegetarian', restrictions: ['No Nuts'], dislikes: ['Broccoli', 'Cauliflower'] },
];

const dummyVegetarianPlan: DietPlan = {
  title: "Quick Start: Indian Vegetarian Plan",
  description: "A balanced and delicious 7-day Indian vegetarian meal plan designed to boost energy and promote wellness. This is a sample plan to get you started instantly.",
  dailyPlans: [
    {
      day: "Monday",
      meals: {
        breakfast: { name: "Vegetable Poha", description: "Lightly spiced flattened rice with peas, onions, and peanuts. A classic Indian breakfast.", calories: 350, macronutrients: { protein: 8, carbs: 65, fat: 7 }, ayurvedicBalance: { vata: 40, pitta: 30, kapha: 30 }, ayurvedicProperties: { rasas: ["Sweet", "Salty"], notes: "Light, easy to digest, and provides steady energy." } },
        lunch: { name: "Rajma Chawal with Salad", description: "A comforting bowl of kidney bean curry served with steamed basmati rice and a side of fresh cucumber-tomato salad.", calories: 550, macronutrients: { protein: 20, carbs: 90, fat: 12 }, ayurvedicBalance: { vata: 30, pitta: 40, kapha: 30 }, ayurvedicProperties: { rasas: ["Sweet", "Astringent"], notes: "Hearty, grounding, and protein-rich." } },
        dinner: { name: "Dal Tadka with Roti", description: "Yellow lentils tempered with cumin, garlic, and spices, served with two whole wheat rotis.", calories: 450, macronutrients: { protein: 18, carbs: 70, fat: 10 }, ayurvedicBalance: { vata: 35, pitta: 35, kapha: 30 }, ayurvedicProperties: { rasas: ["Sweet", "Salty"], notes: "Warm, nourishing, and excellent for digestion." } },
        snacks: { name: "Sprouts Chaat", description: "A refreshing mix of sprouted moong dal, chopped onions, tomatoes, and a squeeze of lime.", calories: 150, macronutrients: { protein: 10, carbs: 25, fat: 1 }, ayurvedicBalance: { vata: 50, pitta: 30, kapha: 20 }, ayurvedicProperties: { rasas: ["Astringent", "Sour"], notes: "A light, crunchy, and enzyme-rich snack." } },
      },
      totalCalories: 1500,
      ayurvedicRating: 5,
      ayurvedicQuote: "When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need."
    },
  ]
};

const dummyNonVegetarianPlan: DietPlan = {
  title: "Quick Start: Indian Non-Vegetarian Plan",
  description: "A sample 7-day Indian non-vegetarian meal plan focused on lean proteins and balanced nutrients for energy and muscle support.",
  dailyPlans: [
    {
      day: "Monday",
      meals: {
        breakfast: { name: "Egg Bhurji with Pav", description: "Spiced Indian scrambled eggs with onions and tomatoes, served with a lightly toasted bread roll.", calories: 380, macronutrients: { protein: 18, carbs: 30, fat: 20 }, ayurvedicBalance: { vata: 40, pitta: 40, kapha: 20 }, ayurvedicProperties: { rasas: ["Salty", "Pungent"], notes: "A flavorful and high-protein start to the day." } },
        lunch: { name: "Chicken Tikka Salad", description: "Tandoori-spiced chicken breast pieces over mixed greens with a mint-yogurt dressing.", calories: 450, macronutrients: { protein: 40, carbs: 15, fat: 25 }, ayurvedicBalance: { vata: 50, pitta: 40, kapha: 10 }, ayurvedicProperties: { rasas: ["Pungent", "Astringent"], notes: "Smoky, light, and packed with lean protein." } },
        dinner: { name: "Home-Style Fish Curry", description: "A simple and flavorful fish curry with coconut milk and mild spices, served with brown rice.", calories: 550, macronutrients: { protein: 35, carbs: 45, fat: 25 }, ayurvedicBalance: { vata: 30, pitta: 40, kapha: 30 }, ayurvedicProperties: { rasas: ["Sweet", "Salty"], notes: "Rich in omega-3s, warming, and deeply satisfying." } },
        snacks: { name: "Masala Chaas", description: "Spiced buttermilk with roasted cumin powder and fresh cilantro.", calories: 80, macronutrients: { protein: 4, carbs: 6, fat: 4 }, ayurvedicBalance: { vata: 30, pitta: 20, kapha: 50 }, ayurvedicProperties: { rasas: ["Sour", "Salty"], notes: "Cooling, aids digestion, and is a great probiotic." } },
      },
      totalCalories: 1460,
      ayurvedicRating: 4,
      ayurvedicQuote: "Health requires healthy food."
    },
  ]
};

const dummyEggetarianPlan: DietPlan = {
  title: "Quick Start: Indian Eggetarian Plan",
  description: "A delicious 7-day Indian eggetarian meal plan that balances plant-based foods with the high-quality protein of eggs.",
  dailyPlans: [
    {
      day: "Monday",
      meals: {
        breakfast: { name: "Masala Omelette", description: "A two-egg omelette with chopped onions, tomatoes, cilantro, and Indian spices, served with whole-wheat toast.", calories: 320, macronutrients: { protein: 18, carbs: 25, fat: 16 }, ayurvedicBalance: { vata: 40, pitta: 45, kapha: 15 }, ayurvedicProperties: { rasas: ["Salty", "Pungent"], notes: "Warming, satisfying, and flavorful." } },
        lunch: { name: "Paneer Butter Masala (Light)", description: "Cubes of paneer in a light, home-style tomato gravy, served with two rotis and a side salad.", calories: 500, macronutrients: { protein: 22, carbs: 50, fat: 23 }, ayurvedicBalance: { vata: 25, pitta: 40, kapha: 35 }, ayurvedicProperties: { rasas: ["Sweet", "Salty"], notes: "A healthier take on a classic, providing protein and satisfaction." } },
        dinner: { name: "Egg Curry with Jeera Rice", description: "Hard-boiled eggs in a spiced onion-tomato gravy, served with cumin-flavored basmati rice.", calories: 480, macronutrients: { protein: 20, carbs: 55, fat: 20 }, ayurvedicBalance: { vata: 35, pitta: 50, kapha: 15 }, ayurvedicProperties: { rasas: ["Pungent", "Sweet", "Salty"], notes: "A wholesome and comforting meal." } },
        snacks: { name: "Makhana (Fox Nuts)", description: "A bowl of fox nuts roasted in a teaspoon of ghee and sprinkled with salt.", calories: 150, macronutrients: { protein: 5, carbs: 25, fat: 4 }, ayurvedicBalance: { vata: 30, pitta: 30, kapha: 40 }, ayurvedicProperties: { rasas: ["Sweet", "Astringent"], notes: "A crunchy, light, and nutritious snack." } },
      },
      totalCalories: 1450,
      ayurvedicRating: 5,
      ayurvedicQuote: "To eat is a necessity, but to eat intelligently is an art."
    },
  ]
};

const dummyFamilyPlan: DietPlan = {
  title: "Quick Start: Unified Family Plan",
  description: "A sample 7-day unified Indian meal plan designed for a family with diverse needs. It's balanced, delicious, and considers common dietary variations.",
  dailyPlans: [
    {
      day: "Monday",
      meals: {
        breakfast: { name: "Idli with Sambar & Chutney", description: "Soft, steamed rice cakes (Idli) served with a lentil-based vegetable stew (Sambar) and coconut chutney. A wholesome, gluten-free start for the whole family.", calories: 400, macronutrients: { protein: 12, carbs: 70, fat: 8 }, ayurvedicBalance: { vata: 30, pitta: 40, kapha: 30 }, ayurvedicProperties: { rasas: ["Sweet", "Salty", "Sour"], notes: "Light, easy to digest, and universally loved." } },
        lunch: { name: "Vegetable Pulao with Raita", description: "A one-pot rice dish cooked with mixed vegetables and aromatic spices, served with a cooling yogurt raita. For non-vegetarians, add a side of boiled eggs or grilled chicken.", calories: 500, macronutrients: { protein: 15, carbs: 85, fat: 10 }, ayurvedicBalance: { vata: 35, pitta: 35, kapha: 30 }, ayurvedicProperties: { rasas: ["Sweet", "Salty"], notes: "A complete and balanced meal that is easy to prepare in larger quantities." } },
        dinner: { name: "Paneer & Veggie Skewers", description: "Cubes of paneer, bell peppers, onions, and tomatoes marinated in yogurt and spices, then grilled. Serve with a side of quinoa or millet. Gluten-free and nut-free.", calories: 450, macronutrients: { protein: 20, carbs: 40, fat: 22 }, ayurvedicBalance: { vata: 45, pitta: 40, kapha: 15 }, ayurvedicProperties: { rasas: ["Pungent", "Salty"], notes: "A fun, protein-rich, and light dinner option." } },
        snacks: { name: "Fruit Chaat", description: "A mix of seasonal fruits like apple, banana, and pomegranate, tossed with a pinch of chaat masala.", calories: 120, macronutrients: { protein: 2, carbs: 30, fat: 0 }, ayurvedicBalance: { vata: 40, pitta: 30, kapha: 30 }, ayurvedicProperties: { rasas: ["Sweet", "Sour"], notes: "Refreshing, hydrating, and packed with vitamins." } },
      },
      totalCalories: 1470,
      ayurvedicRating: 5,
      ayurvedicQuote: "A family that eats together, stays healthy together."
    },
  ]
};

// Add full 7-day plans for all types
for (let i = 1; i < 7; i++) {
    const nextDay = (day: string) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return days[(days.indexOf(day) + 1) % 7];
    }
    const vegDay = JSON.parse(JSON.stringify(dummyVegetarianPlan.dailyPlans[0]));
    vegDay.day = nextDay(dummyVegetarianPlan.dailyPlans[i-1].day);
    dummyVegetarianPlan.dailyPlans.push(vegDay);

    const nonVegDay = JSON.parse(JSON.stringify(dummyNonVegetarianPlan.dailyPlans[0]));
    nonVegDay.day = nextDay(dummyNonVegetarianPlan.dailyPlans[i-1].day);
    dummyNonVegetarianPlan.dailyPlans.push(nonVegDay);
    
    const eggDay = JSON.parse(JSON.stringify(dummyEggetarianPlan.dailyPlans[0]));
    eggDay.day = nextDay(dummyEggetarianPlan.dailyPlans[i-1].day);
    dummyEggetarianPlan.dailyPlans.push(eggDay);

    const familyDay = JSON.parse(JSON.stringify(dummyFamilyPlan.dailyPlans[0]));
    familyDay.day = nextDay(dummyFamilyPlan.dailyPlans[i-1].day);
    dummyFamilyPlan.dailyPlans.push(familyDay);
}

export const dummyPlans = {
    'Vegetarian': dummyVegetarianPlan,
    'Non-Vegetarian': dummyNonVegetarianPlan,
    'Eggetarian': dummyEggetarianPlan,
    'Jain': dummyVegetarianPlan, // Fallback for Jain
    'Family': dummyFamilyPlan,
};


// --- AYUSH HEALTH CARD DUMMY DATA ---

export const patientProfile = {
  name: "Debeshi Sen",
  age: 21,
  gender: "Female",
  abhaId: "78-3345-9981",
  allergies: ["Shrimps", "Milk"],
  chronicConditions: ["None"],
  emergencyContact: "Anand Sen (Father), +91 9876543210",
};

export const appointments = [
  { date: "01 Oct 25", doctor: "Dr. Neel", specialty: "Panchakarma Therapy", mode: "OPD", status: "Scheduled" },
  { date: "27 Sep 25", doctor: "Dr. Kavita", specialty: "Ayurveda Gynae", mode: "OPD", status: "Upcoming" },
  { date: "25 Sep 25", doctor: "Dr. Arjun", specialty: "Ayurveda Nutrition", mode: "Telemed", status: "Upcoming" },
  { date: "21 Sep 25", doctor: "Dr. Sharma", specialty: "General Medicine", mode: "OPD", status: "Completed" },
  { date: "18 Sep 25", doctor: "Dr. Meera", specialty: "Ayurveda Gynae", mode: "Telemed", status: "Completed" },
];

export const prescriptions = [
  { name: "Shatavari Capsules", dosage: "2 caps daily after breakfast", duration: 60, daysCompleted: 10, status: "Active", notes: "Hormonal support ⚖️" },
  { name: "Ashwagandha Tab", dosage: "1 tab, twice daily after meals", duration: 30, daysCompleted: 15, status: "Active", notes: "Stress balance 🌿" },
  { name: "Triphala Churna", dosage: "1 tsp with lukewarm water", duration: 20, daysCompleted: 20, status: "Active", notes: "Digestion 💧" },
  { name: "Brahmi Powder", dosage: "1 tsp in warm milk, night", duration: 15, daysCompleted: 15, status: "Completed", notes: "Focus & memory 🧠" },
  { name: "Tulsi Tea", dosage: "1 cup morning & evening", duration: 10, daysCompleted: 10, status: "Completed", notes: "Immunity 🍵" },
];

export const labReports = {
  reports: [
    { test: "CBC", date: "15 Sep 25", result: "Normal", status: "normal" },
    { test: "Sugar Fasting", date: "12 Sep 25", result: "110 mg/dL", status: "high" },
    { test: "Thyroid (TSH)", date: "10 Sep 25", result: "5.1 µIU/mL", status: "high" },
    { test: "Vitamin D", date: "05 Sep 25", result: "18 ng/mL", status: "deficient" },
  ],
  trends: {
    sugar: [
      { date: "Jan 25", value: 95 },
      { date: "Apr 25", value: 105 },
      { date: "Jul 25", value: 102 },
      { date: "Sep 25", value: 110 },
    ],
  },
};


export const ayurvedicInsight = {
  prakriti: "Pitta-Kapha",
  currentDosha: { vata: 20, pitta: 55, kapha: 25 },
  recommendations: [
    { text: "Cooling diet (coconut, cucumber)", icon: "🥥" },
    { text: "Avoid fried & spicy foods", icon: "🌶️" },
    { text: "Brahmi tea for calmness", icon: "🍵" },
    { text: "Evening meditation", icon: "🧘‍♀️" },
  ],
};

export const billing = {
  grandTotal: 3400,
  items: [
    { item: "OPD Consultation Fee", cost: 600 },
    { item: "Lab Test – CBC", cost: 300 },
    { item: "Lab Test – Sugar Fasting", cost: 400 },
    { item: "Lab Test – Thyroid", cost: 600 },
    { item: "Ayurvedic Medicines (30d)", cost: 1500 },
  ],
  breakdown: [
      { category: 'Consultation', value: 600 },
      { category: 'Lab Tests', value: 1300 },
      { category: 'Medicines', value: 1500 },
  ]
};
