/**
 * Calculates target macros based on weight and target calories.
 * @param {number} weight - Weight in kg
 * @param {number} targetCalories - Total target calories
 * @returns {{protein: number, fats: number, carbs: number}}
 */
export function calculateTargetMacros(weight, targetCalories) {
  if (!weight || !targetCalories) return { protein: 0, fats: 0, carbs: 0 };
  
  // Protein: 2g per kg of body weight
  const protein = Math.round(weight * 2.0);
  
  // Fats: 1g per kg of body weight
  const fats = Math.round(weight * 1.0);
  
  const proteinCals = protein * 4;
  const fatsCals = fats * 9;
  
  // Remaining calories are for carbs (4 kcal per gram)
  const remainingCals = targetCalories - proteinCals - fatsCals;
  const carbs = Math.max(0, Math.round(remainingCals / 4));
  
  return { protein, fats, carbs };
}

/**
 * Calculates eaten macros from an array of daily meals and scanned foods.
 * @param {Object} meals - Meals object { breakfast, lunch, snack, night }
 * @param {Array} eatenMeals - Array of eaten meal keys e.g. ['breakfast', 'lunch']
 * @param {number} targetCalories - User's target calories
 * @param {Object} targetMacros - The target macros { protein, fats, carbs }
 * @returns {{protein: number, fats: number, carbs: number}}
 */
export function calculateEatenMacros(meals, eatenMeals, targetCalories, targetMacros) {
  let protein = 0;
  let fats = 0;
  let carbs = 0;
  
  if (!meals || !eatenMeals) return { protein, fats, carbs };

  // Calculate the ratio of each macro per 1 kcal to approximate missing data
  const proteinPerKcal = targetCalories > 0 ? targetMacros.protein / targetCalories : 0;
  const fatsPerKcal = targetCalories > 0 ? targetMacros.fats / targetCalories : 0;
  const carbsPerKcal = targetCalories > 0 ? targetMacros.carbs / targetCalories : 0;

  eatenMeals.forEach(key => {
    const meal = meals[key];
    if (meal) {
      if (meal.protein !== undefined) protein += meal.protein;
      else protein += (meal.calories || 0) * proteinPerKcal;
      
      if (meal.fats !== undefined) fats += meal.fats;
      else if (meal.fat !== undefined) fats += meal.fat;
      else fats += (meal.calories || 0) * fatsPerKcal;
      
      if (meal.carbs !== undefined) carbs += meal.carbs;
      else carbs += (meal.calories || 0) * carbsPerKcal;
    }
  });
  
  return { protein: Math.round(protein), fats: Math.round(fats), carbs: Math.round(carbs) };
}
