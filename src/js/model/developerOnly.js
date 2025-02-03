/**
 * @fileoverview Developer-only utilities for resetting app data.
 * This file contains functions to clear the recipe book and meal plan
 * from both the application state and local storage.
 *
 * Dependencies:
 * - `state`: The central state object of the application.
 */

import { state } from "./state.js";

//Reset recipe book (clears the recipe book from the application state and local storage)
export const clearRecipeBook = function () {
  // Clear the recipe book in state
  state.recipeBook = [];

  // Clear the recipe book from local storage
  localStorage.removeItem("recipeBook");

  // Log to confirm it's cleared
  console.log("Recipe book cleared:", state.recipeBook);
};

//Reset meal plan (clears the meal plan from the application state and local storage)
export const clearMealPlan = function () {
  // Clear the meal plan in state
  state.mealPlan = {};

  // Clear the meal plan from local storage
  localStorage.removeItem("mealPlan");

  // Log to confirm it's cleared
  console.log("Meal Plan cleared:", state.mealPlan);
};
