/**
 * @fileoverview Handles pantry ingredient operations for the ingredient search functionality.
 * Includes methods to add, remove, and check the status of ingredients in the user's pantry.
 *
 * Dependencies:
 * - `state`: The application's central state object.
 */

import { state } from "./state.js";

//PANTRY INGREDIENT OPERATIONS

//Add an ingredient input from the user into the pantry
export const addIngredientToPantry = function (ingredient) {
  state.pantry.push(ingredient);
};

//Remove an ingredient from the pantry
export const removeIngredientFromPantry = function (ingredient) {
  const index = state.pantry.findIndex((pantryItem) => pantryItem === ingredient);
  state.pantry.splice(index, 1);
};

//Returns true if pantry is full (25 ingredients), false if not.
export const isPantryFull = function () {
  return state.pantry.length > 24;
};

//Returns true if the ingredient is in the pantry, false if not
export const isIngredientInPantry = function (ingredient) {
  return state.pantry.includes(ingredient);
};
