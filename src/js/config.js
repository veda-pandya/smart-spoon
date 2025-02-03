/**
 * @fileoverview Configuration file housing application-wide constants and settings.
 * These variables are centralized here to facilitate easy access, modification, and maintenance.
 *
 * Purpose:
 * - Stores API-related constants for external service integration.
 * - Provides default values for nutritional calculations and filtering.
 * - Defines shared data structures and reusable settings across the app.
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

//API / SEARCH RELATED
export const API_BASE_URL = "https://api.spoonacular.com";
export const API_KEY = process.env.API_KEY;
export const MAX_CALORIES = "550"; //Max calories for low calorie filter
export const MIN_PROTEIN = "30"; //Min grams protein for high protein filter
export const API_TIMEOUT_MESSAGE = "The request is taking longer than expected. Please check your connection or try again later.";

////////////////////////////////////////////////////////////////////////////////

//RECIPE DETAILS MODAL
export const RECOMMENDED_PROTEIN_DV = 50;
export const RECOMMENDED_FATS_DV = 275;
export const RECOMMENDED_CARBS_DV = 78;

//4-4-9 method for calculating percent protein, fat, and carb
//1 gram of protein provides approximately 4 calories
//1 gram of carbohydrate provides approximately 4 calories
//1 gram of fat provides approximately 9 calories
export const MACRONUTRIENT_FACTORS = { protein: 4, fats: 9, carbs: 4 };

export const RECIPE_NUTRIENTS = ["calories", "saturatedFat", "sugar", "fiber", "sodium", "cholesterol", "iron", "zinc", "calcium", "magnesium", "protein", "carbs", "fats"];

export const CHART_COLORS = {
  carbs: "#B9D8B8",
  protein: "#D0E2F2",
  fat: "#D9C6E8",
};

export const PIE_CHART_TOOLTIP_MESSAGES = ["High in energy, essential for fuel.", "Crucial for muscle growth and repair.", "Important for hormone production and energy."];

////////////////////////////////////////////////////////////////////////////////

//INGREDIENT AVAILABILITY

export const COMMON_PANTRY_ITEMS = ["salt", "table salt", "pepper", "salt and pepper", "salt & pepper", "salt&pepper", "black pepper", "ground pepper", "water", "flour", "oil"];
export const INGREDIENT_SYNONYMS = {
  cheese: ["parmesan", "mozzarella", "cheddar", "feta", "brie", "provolone", "gruyere", "gorgonzola", "fontina", "gouda", "burrata", "monterey jack", "graviera"],
  bread: ["focaccia", "ciabatta", "sourdough", "baguette", "brioche"],
  pasta: ["spaghetti", "fettuccine", "penne", "rigatoni", "macaroni", "lasagna", "ramen", "udon", "soba", "rice noodle"],
  onion: ["shallot"],
  butter: ["margarine"],
  milk: ["soy milk", "almond milk"],
};
