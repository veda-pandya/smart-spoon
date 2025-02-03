/**
 * @fileoverview Provides utility functions for adjusting recipe servings.
 * Includes methods to recalculate ingredient quantities, nutrient values, and daily value percentages
 * based on updated servings. Also synchronizes serving updates across different recipe sources.
 *
 * Dependencies:
 * - `state`: The application's central state object.
 * - `getRecipe` from `modelUtils.js`: To retrieve recipes based on their source and context.
 * - Constants from `config.js`:`RECIPE_NUTRIENTS`, `RECOMMENDED_PROTEIN_DV`, `RECOMMENDED_FATS_DV`, `RECOMMENDED_CARBS_DV`
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

//Import utilities
import { getRecipe } from "../highLevel/modelUtils.js";

//Import variables from config file
import { RECIPE_NUTRIENTS, RECOMMENDED_PROTEIN_DV, RECOMMENDED_FATS_DV, RECOMMENDED_CARBS_DV } from "../../../config.js";
import { deepCopy } from "../../../sharedUtils.js";

/**
 * Adjusts the servings of a recipe and updates its ingredient quantities, nutrient values,
 * and daily value percentages. Synchronizes updates across sources if the recipe is not in the meal plan (meal plan recipe servings updates are indpendent and decoupled from serving updates made during browsing)
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.
 *
 * @param {number} recipeId - The unique ID of the recipe to update.
 * @param {string} operation - The type of operation ("increaseServings" or "decreaseServings").
 * @param {Object} options - Used to locate a recipe in the model
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.
 * @param {number|null} [newServings=null] - The updated number of servings, overriding the operation if provided.
 */
export const adjustServings = function (recipeId, operation, { source, currentDate = null, currentMeal = null }, newServings = null) {
  //Get the recipe for which we want to update servings
  const recipe = getRecipe(recipeId, { source, currentDate, currentMeal });

  //Calculate the updated number of servings based on the operation ("increaseServings" or "decreaseServings")
  const updatedServings = calculateUpdatedServings(recipe.servings, operation, newServings);
  if (!isValidServings(updatedServings)) return;

  //Calculate servings ratio needed to calculate updated ingredient/nutrient quantities
  const servingsRatio = updatedServings / recipe.servings;

  //Update ingredient and nutrient quantities per new servings value
  updateIngredientQuantities(recipe.ingredients, servingsRatio);
  updateNutrientQuantities(recipe, servingsRatio);
  updatePercentDV(recipe);

  //Update the number of servings in the recipe object
  recipe.servings = updatedServings;

  //if the user is browsing (the recipe being modified was opened from any source other than 'mealPlan'), synchronize serving updates everywhere
  if (source !== "mealPlan") {
    synchronizeRecipeInstances(recipe);
  }
};

/**
 * Synchronizes updated recipe servings/ingredient & nutrient quantities across ingredient search results, browse search results, and the recipe book.
 * If the servings are updated in a recipe clicked from ingredient search results, if the user opens the same recipe from the browse recipes page or recipe book, the Recipe Details Modal should open with the servings updates made in the ingredient search recipe result
 *
 * @param {Object} updatedRecipe - The updated recipe object (with updated servings and ingredient/nutrient quantities)
 * @private
 */
const synchronizeRecipeInstances = function (updatedRecipe) {
  const recipeId = updatedRecipe.id;

  state.ingredientSearchResults.forEach((recipe) => {
    if (recipe.id === recipeId) updateProperties(recipe, updatedRecipe);
  });

  state.browseSearchResults.forEach((recipe) => {
    if (recipe.id === recipeId) updateProperties(recipe, updatedRecipe);
  });

  state.recipeBook.forEach((recipe) => {
    if (recipe.id === recipeId) updateProperties(recipe, updatedRecipe);
  });
};

/**
 * Updates the properties of a recipe with those from an updated recipe object.
 * The point is to propogate servings updates to other insatnces of the same recipe
 * The number of servings and recipe ingredient & nutrient quantities are updated
 * @param {Object} recipe - The original recipe object to update.
 * @param {Object} updatedRecipe - The updated recipe object.
 * @private
 */
const updateProperties = (recipe, updatedRecipe) => {
  recipe.servings = updatedRecipe.servings;
  recipe.ingredients = deepCopy(updatedRecipe.ingredients);
  RECIPE_NUTRIENTS.forEach((nutrient) => {
    recipe[nutrient] = updatedRecipe[nutrient];
  });
};

/**
 * Calculates the new servings based on the operation or directly from the provided value.
 * If a new servings value is provided, return that as the updated servings value
 * If not, increase or decrease the current servings by 1 depending on the operation
 *
 * When adding a recipe to the meal plan (or moving a recipe in the meal plan), the user can manually input the number of servings they wish to add. In this case, the newServings parameter is used to set the servings property in the recipe object
 *
 * The operation parameter comes from whether the user clicks the 'plus' or 'minus' button in the Recipe Details Modal
 * @param {number} currentServings - The current number of servings.
 * @param {string} operation - The type of operation ("increaseServings" or "decreaseServings").
 * @param {number|null} newServings - The updated number of servings, overriding the operation if provided.
 * @returns {number} The updated number of servings.
 * @private
 */
const calculateUpdatedServings = function (currentServings, operation, newServings) {
  return newServings !== null ? +newServings : operation === "increaseServings" ? currentServings + 1 : currentServings - 1;
};

/**
 * Validates if the updated servings value is within a reasonable range.
 *
 * @param {number} servings - The updated number of servings.
 * @returns {boolean} `true` if the servings value is valid, otherwise `false`.
 * @private
 */
const isValidServings = function (servings) {
  if (servings < 1 || servings > 50) {
    return false;
  }
  return true;
};

/**
 * Updates the quantities of ingredients based on the servings ratio when the number of servings is updated for a recipe
 *
 * @param {Array<Object>} ingredients - The array of ingredients in the recipe.
 * @param {number} servingsRatio - The ratio of updated servings to current servings.
 * @private
 */
const updateIngredientQuantities = function (ingredients, servingsRatio) {
  ingredients.forEach((ingredient) => {
    ingredient.quantity *= servingsRatio;
  });
};

/**
 * Updates the nutrient quantities in a recipe based on the servings ratio when the number of servings is updated for a recipe.
 *
 * @param {Object} recipe - The recipe object containing nutrient values.
 * @param {number} servingsRatio - The ratio of updated servings to current servings.
 * @private
 */
const updateNutrientQuantities = function (recipe, servingsRatio) {
  RECIPE_NUTRIENTS.forEach((nutrient) => {
    if (Number.isFinite(recipe[nutrient])) {
      recipe[nutrient] *= servingsRatio;
    }
  });
};

/**
 * Updates the daily value percentages for protein, fats, and carbs in a recipe.
 *
 * @param {Object} recipe - The recipe object containing nutrient values.
 * @private
 */
const updatePercentDV = function (recipe) {
  recipe.percentDVProtein = (recipe.protein / RECOMMENDED_PROTEIN_DV) * 100;
  recipe.percentDVFats = (recipe.fats / RECOMMENDED_FATS_DV) * 100;
  recipe.percentDVCarbs = (recipe.carbs / RECOMMENDED_CARBS_DV) * 100;
};
