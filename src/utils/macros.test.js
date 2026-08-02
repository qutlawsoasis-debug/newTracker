import { describe, it, expect } from 'vitest';
import { calculateTargetMacros, calculateEatenMacros } from './macros';

describe('macros utils', () => {
  describe('calculateTargetMacros', () => {
    it('calculates correct macros based on weight and target calories', () => {
      // Test for 70kg person, 3000 kcal target
      // Proteins: 70 * 2 = 140g (560 kcal)
      // Fats: 70 * 1 = 70g (630 kcal)
      // Carbs: (3000 - 560 - 630) / 4 = 1810 / 4 = 452.5g (rounded to 453g)
      
      const target = calculateTargetMacros(70, 3000);
      
      expect(target.protein).toBe(140);
      expect(target.fats).toBe(70);
      expect(target.carbs).toBe(453);
    });

    it('returns zeroes if weight or calories is invalid', () => {
      const target = calculateTargetMacros(0, 0);
      expect(target.protein).toBe(0);
      expect(target.fats).toBe(0);
      expect(target.carbs).toBe(0);
    });
  });

  describe('calculateEatenMacros', () => {
    const targetCalories = 3000;
    const targetMacros = { protein: 140, fats: 70, carbs: 453 };
    
    it('calculates eaten macros strictly from meals with exact macros', () => {
      const meals = {
        breakfast: { calories: 500, protein: 30, fats: 20, carbs: 50 },
        lunch: { calories: 800, protein: 40, fats: 30, carbs: 90 }
      };
      const eatenMeals = ['breakfast', 'lunch'];
      
      const result = calculateEatenMacros(meals, eatenMeals, targetCalories, targetMacros);
      
      expect(result.protein).toBe(70);
      expect(result.fats).toBe(50);
      expect(result.carbs).toBe(140);
    });

    it('approximates macros correctly when meal lacks specific macros but has calories', () => {
      const meals = {
        breakfast: { calories: 1000 } // only calories are provided
      };
      const eatenMeals = ['breakfast'];
      
      const result = calculateEatenMacros(meals, eatenMeals, targetCalories, targetMacros);
      
      // Expected:
      // P ratio = 140 / 3000 ≈ 0.0466
      // F ratio = 70 / 3000 ≈ 0.0233
      // C ratio = 453 / 3000 ≈ 0.151
      // Approximated for 1000 kcal:
      // P = 1000 * 0.0466 ≈ 47
      // F = 1000 * 0.0233 ≈ 23
      // C = 1000 * 0.151 ≈ 151
      
      expect(result.protein).toBe(47);
      expect(result.fats).toBe(23);
      expect(result.carbs).toBe(151);
    });

    it('ignores meals not in eatenMeals', () => {
      const meals = {
        breakfast: { calories: 500, protein: 30, fats: 20, carbs: 50 },
        lunch: { calories: 800, protein: 40, fats: 30, carbs: 90 }
      };
      const eatenMeals = ['breakfast'];
      
      const result = calculateEatenMacros(meals, eatenMeals, targetCalories, targetMacros);
      
      expect(result.protein).toBe(30);
      expect(result.fats).toBe(20);
      expect(result.carbs).toBe(50);
    });
  });

  // --- calculateTargetMacros edge cases ---
  describe('calculateTargetMacros edge cases', () => {
    it('returns zeroes if only weight is 0', () => {
      const result = calculateTargetMacros(0, 2000);
      expect(result.protein).toBe(0);
      expect(result.fats).toBe(0);
      expect(result.carbs).toBe(0);
    });

    it('returns zeroes if only calories is 0', () => {
      const result = calculateTargetMacros(70, 0);
      expect(result.protein).toBe(0);
      expect(result.fats).toBe(0);
      expect(result.carbs).toBe(0);
    });

    it('carbs never go negative when protein+fat exceed calories', () => {
      // 200kg person, 1000 kcal — protein(400g=1600kcal) + fat(200g=1800kcal) > 1000kcal
      const result = calculateTargetMacros(200, 1000);
      expect(result.carbs).toBeGreaterThanOrEqual(0);
    });

    it('rounds protein and fats correctly', () => {
      // 75kg: protein = 75*2 = 150g, fats = 75*1 = 75g
      const result = calculateTargetMacros(75, 3000);
      expect(result.protein).toBe(150);
      expect(result.fats).toBe(75);
    });
  });

  // --- calculateEatenMacros edge cases ---
  describe('calculateEatenMacros edge cases', () => {
    const targetCalories = 3000;
    const targetMacros = { protein: 140, fats: 70, carbs: 453 };

    it('returns zeroes for empty eatenMeals array', () => {
      const meals = {
        breakfast: { calories: 500, protein: 30, fats: 20, carbs: 50 }
      };
      const result = calculateEatenMacros(meals, [], targetCalories, targetMacros);
      expect(result.protein).toBe(0);
      expect(result.fats).toBe(0);
      expect(result.carbs).toBe(0);
    });

    it('returns zeroes if meals is null', () => {
      const result = calculateEatenMacros(null, ['breakfast'], targetCalories, targetMacros);
      expect(result.protein).toBe(0);
      expect(result.fats).toBe(0);
      expect(result.carbs).toBe(0);
    });

    it('handles meal with fat field instead of fats', () => {
      const meals = {
        lunch: { calories: 600, protein: 35, fat: 25, carbs: 60 }
      };
      const result = calculateEatenMacros(meals, ['lunch'], targetCalories, targetMacros);
      expect(result.fats).toBe(25);
      expect(result.protein).toBe(35);
      expect(result.carbs).toBe(60);
    });

    it('ignores unknown meal keys in eatenMeals', () => {
      const meals = {
        breakfast: { calories: 500, protein: 30, fats: 20, carbs: 50 }
      };
      const result = calculateEatenMacros(meals, ['breakfast', 'nonexistent'], targetCalories, targetMacros);
      expect(result.protein).toBe(30);
      expect(result.fats).toBe(20);
      expect(result.carbs).toBe(50);
    });

    it('handles all four meal sections together', () => {
      const meals = {
        breakfast: { calories: 500, protein: 20, fats: 10, carbs: 60 },
        lunch:     { calories: 800, protein: 40, fats: 25, carbs: 80 },
        snack:     { calories: 300, protein: 10, fats: 8,  carbs: 35 },
        night:     { calories: 400, protein: 15, fats: 12, carbs: 50 }
      };
      const result = calculateEatenMacros(meals, ['breakfast', 'lunch', 'snack', 'night'], targetCalories, targetMacros);
      expect(result.protein).toBe(85);
      expect(result.fats).toBe(55);
      expect(result.carbs).toBe(225);
    });
  });
});
