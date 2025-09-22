export const GENDERS = ['Female', 'Male', 'Other'] as const;

export const ACTIVITY_LEVELS = [
    { name: 'Sedentary', description: 'Little or no exercise' },
    { name: 'Lightly Active', description: 'Light exercise/sports 1-3 days/week' },
    { name: 'Moderately Active', description: 'Moderate exercise/sports 3-5 days/week' },
    { name: 'Very Active', description: 'Hard exercise/sports 6-7 days a week' },
    { name: 'Extra Active', description: 'Very hard exercise & physical job' }
];

export const DIETARY_PREFERENCES = [
    { name: 'Vegetarian', description: 'No meat, poultry, or fish.' },
    { name: 'Non-Vegetarian', description: 'Includes meat, poultry, and fish.' },
    { name: 'Eggetarian', description: 'Vegetarian diet, but includes eggs.' },
    { name: 'Jain', description: 'Strict vegetarian diet, excludes root vegetables.' }
];

export const DIETARY_RESTRICTIONS = [
    'No Gluten (Wheat allergy)', 'No Dairy (Lactose intolerant)', 'No Nuts', 'No Soy', 'Low Sodium (for BP)', 'No Shellfish'
];

export const HEALTH_GOALS = [
    'Weight Loss', 'Muscle Gain', 'Maintain Weight', 'Improve Energy', 'Better Digestion', 'Heart Health', 'Manage Stress'
];

export const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy'] as const;
export const SWEETNESS_LEVELS = ['Low', 'Medium', 'High'] as const;

export const MEAL_TIMINGS = {
    breakfast: [{ name: 'Early Bird', time: 'Before 8 AM'}, { name: 'Regular', time: '8 AM - 10 AM' }, { name: 'Late Start', time: 'After 10 AM'}],
    lunch: [{ name: 'Early', time: '12 PM - 1 PM'}, { name: 'Standard', time: '1 PM - 3 PM' }, { name: 'Late', time: 'After 3 PM'}],
    dinner: [{ name: 'Early Evening', time: '6 PM - 8 PM'}, { name: 'Standard', time: '8 PM - 10 PM' }, { name: 'Late Night', time: 'After 10 PM'}],
};

export const EATING_OUT_FREQUENCY = [
    { name: 'Never', description: 'I always eat at home.' },
    { name: 'Rarely', description: '1-2 times a week.' },
    { name: 'Occasionally', description: '3-5 times a week.' },
    { name: 'Frequently', description: 'More than 5 times a week.' },
];


export const COMMON_CRAVINGS = ['Pizza', 'Burger', 'Ice Cream', 'Pasta', 'French Fries', 'Chocolate Cake'];
