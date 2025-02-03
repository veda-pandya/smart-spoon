/**
 * @fileoverview Utility functions for managing recipe and meal plan data across the application.
 * This file houses shared utilities used across all model files, including other feature-specific utility files in the model.
 * It provides methods for retrieving recipe and meal plan data as well as general purpose utilities like calculating dates (e.g., the Monday of a week).
 *
 * Dependencies:
 * - `state`: The application's central state object.
 * 
 * Options Object `{source, currentDate, currentMeal}` Parameters:
 * - `source`: Identifies where the recipe was clicked from. Possible values are:
 *    - `'ingredientSearch'`: Recipe was clicked from the ingredient search results.
 *    - `'browseRecipeSearch'`: Recipe was clicked from the browse recipes search results.
 *    - `'recipeBook'`: Recipe was clicked from the recipe book.
 *    - `'mealPlan'`: Recipe was clicked from the meal planner.
 * - `currentDate`: Only relevant when the source is `'mealPlan'`. It specifies the date
 *    under which the recipe exists in the meal plan (e.g., 'Mon Jan 20 2025').
 * - `currentMeal`: Only relevant when the source is `'mealPlan'`. It specifies the meal slot
 *    where the recipe exists (e.g., `'lunch'` or `'dinner'`).
 *    When the source is not `'mealPlan'`, both `currentDate` and `currentMeal` are `null`.
 *
 * The `source` (and `currentDate`/`currentMeal` when applicable) parameters are needed
 * to locate/retrieve the recipe in the model.

 */

//Import application state
import { state } from "../../state.js";

/**
 * Retrieves a recipe object from the application state based on the provided source and options
 * 
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.
 *
 * @param {number} recipeId - ID of the recipe to toggle bookmark status for.
 * @param {Object} options - Used to locate a recipe in the model
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.

 */
export const getRecipe = function (recipeId, { source, currentDate = null, currentMeal = null }) {
  if (source === "mealPlan" && currentDate && currentMeal) {
    return getRecipeFromMealPlan(recipeId, currentDate, currentMeal);
  } else {
    return getRecipeFromBrowse(recipeId, source);
  }
};

/**
 * Used to retrieve a recipe from state when the source is either 'ingredientSearch', 'browseRecipeSearch', or 'recipeBook' (recipe is clicked when user is browsing). The recipe is retrieved from the corresponding array in the state.
 *
 * @param {number} recipeId - The unique ID of the recipe to retrieve.
 * @param {string} source - The source of the recipe (e.g., "ingredientSearch", "browseRecipeSearch").
 * @returns {Object|null} The recipe object if found, otherwise `null`.
 */
export const getRecipeFromBrowse = function (recipeId, source) {
  // Retrieve the correct array in the state based on source
  const recipes = getSourceArray(source);

  // Return the recipe if found, otherwise null
  return recipes.find((recipe) => recipe.id === recipeId) || null;
};

/**
 * Used to retrieve a recipe from state when the source is 'mealPlan' in the getRecipe function.
 * Retrieves a recipe from the meal plan based on date and meal time where the recipe is located.
 *
 * @param {number} recipeId - The unique ID of the recipe to retrieve.
 * @param {string} dayDateString - Date the recipe is under in the meal plan (e.g., 'Mon Jan 20 2025')
 * @param {string} mealTime - Meal slot the recipe is under in the meal plan (e.g., "breakfast").
 * @returns {Object|null} The recipe object if found, otherwise `null`.
 */
export const getRecipeFromMealPlan = function (recipeId, dayDateString, mealTime) {
  const { dayMealPlan } = getDayMealPlan(dayDateString);
  return dayMealPlan.meals[mealTime].find((meal) => meal.id === recipeId);
};

/**
 * Retrieves the meal plan data for a specific day.
 *
 * @param {string} dayDateString - The date string for the day (e.g., 'Mon Jan 20 2025').
 * @returns {Object} An object containing the `weekKey` and `dayMealPlan` for the given date.
 * The weekKey is the Monday of the week of the specific day we want the meal plan for
 * The dayMealPlan contains all the meals in each meal slot for the day as well as the nutrition info for the day.
 */
export const getDayMealPlan = function (dayDateString) {
  //Get the monday of the week containing the day in question (the weekKey)
  const weekKey = getMondayOfTheWeek(dayDateString).toDateString();
  //Use the weekKey and day to access the meal data for the day in the meal plan
  const dayMealPlan = state.mealPlan[weekKey][dayDateString];

  return { weekKey, dayMealPlan };
};

/**
 * Calculates the date of the Monday of the week for a given date.
 *
 * @param {Date|string} [selectedDate=new Date()] - The date to calculate the Monday for. Defaults to today if no date provided.
 * @returns {Date} A `Date` object representing the Monday of the given week.
 */
export const getMondayOfTheWeek = function (selectedDate = new Date()) {
  const date = new Date(selectedDate);
  const mondayDate = date.getDate() - date.getDay() + 1;
  date.setDate(mondayDate); // Set the date to the calculated Monday
  return date;
};

/**
 * Retrieves the appropriate array of recipes from the state based on the given source.
 *
 * @param {string} source - The source type (e.g., "ingredientSearch", "browseRecipeSearch").
 * @returns {Array|null} The array of recipes in the state corresponding to the source, or `null` if the source is invalid.
 * @private
 */
const getSourceArray = function (source) {
  const sourcesMap = {
    ingredientSearch: state.ingredientSearchResults,
    browseRecipeSearch: state.browseSearchResults,
    recipeBook: state.recipeBook,
  };

  return sourcesMap[source] || null; // Return null if the source is invalid
};
