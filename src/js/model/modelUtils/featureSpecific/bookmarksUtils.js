/**
 * @fileoverview Handles bookmark-related operations for recipes across the application.
 * This file provides utilities to get, update, and synchronize bookmark statuses
 * across different recipe sources and the meal planner.
 *
 * Dependencies:
 * - `state`: The application's central state object.
 * - Utility functions from `modelUtils.js`:
 *   - `getRecipe`
 *   - `getMondayOfTheWeek`
 *   - `getRecipeFromBrowse`
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
import { getRecipe, getMondayOfTheWeek, getRecipeFromBrowse } from "../highLevel/modelUtils.js";

/**
 * Retrieves the bookmark status of a recipe.
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.
 *
 * @param {number} recipeId - ID of the recipe to toggle bookmark status for.
 * @param {Object} options - Used to locate a recipe in the model
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.
 * @returns {boolean} `true` if the recipe is bookmarked, otherwise `false`.
 */
export const getBookmarkStatus = function (recipeId, { source, currentDate, currentMeal }) {
  //Fetch the recipe in question from state
  const recipe = getRecipe(recipeId, { source, currentDate, currentMeal });
  //Return isBookmarked property value
  return recipe.isBookmarked;
};

/**
 * Updates the bookmark status of a recipe to the new bookmark status provided.
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.
 *
 * @param {number} recipeId - The unique ID of the recipe.
 * @param {boolean} newBookmarkStatus - The new bookmark status (`true` if bookmarked or `false` if not).
 * @param {Object} options - Used to locate a recipe in the model
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.
 */
export const updateBookmarkStatus = function (recipeId, newBookmarkStatus, { source, currentDate, currentMeal }) {
  // Handle meal plan bookmark updates (if recipe source is 'mealPlan')
  if (source === "mealPlan" && currentDate && currentMeal) {
    const mondayOfWeek = getMondayOfTheWeek(currentDate).toDateString();
    state.mealPlan[mondayOfWeek][currentDate].meals[currentMeal].forEach((meal) => {
      if (meal.id === recipeId) meal.isBookmarked = newBookmarkStatus;
    });

    return;
  }

  // Handle bookmark updates for browse sources (ingredientSearch, browseSearch, recipeBook)
  const recipe = getRecipeFromBrowse(recipeId, source);
  recipe.isBookmarked = newBookmarkStatus;
};

/**
 * Synchronizes the bookmark status of a recipe across all sources.
 * Ensure all instances of a recipe acorss all sources have the same bookmark status
 * e.g., a recipe card that appears in the user's ingredient search results, browse recipe search results, and recipe book should all display the same bookmark status.
 * If this same recipe is opened from the meal plan, its bookmark status should also be the same as the above recipe cards.
 *
 * @param {number} recipeId - The unique ID of the recipe.
 * @param {boolean} newBookmarkStatus - The new bookmark status (`true` or `false`).
 */
export const synchronizeBookmarkStatus = function (recipeId, newBookmarkStatus) {
  // Sync recipes in ingredient search results
  state.ingredientSearchResults.forEach((recipe) => {
    if (recipe.id === recipeId) recipe.isBookmarked = newBookmarkStatus;
  });

  // Sync recipes in  browse search results
  state.browseSearchResults.forEach((recipe) => {
    if (recipe.id === recipeId) recipe.isBookmarked = newBookmarkStatus;
  });

  // Sync recipes in recipe book
  state.recipeBook.forEach((recipe) => {
    if (recipe.id === recipeId) recipe.isBookmarked = newBookmarkStatus;
  });

  // Sync recipes in meal planner
  syncMealPlannerBookmarkStatus(recipeId, newBookmarkStatus);
};

/**
 * Sets the bookmark status of all instances of a recipe in the meal planner to a certain bookmark status ('newBookmarkStatus')
 *
 * @param {number} recipeId - The unique ID of the recipe.
 * @param {boolean} newBookmarkStatus - The new bookmark status (`true` or `false`).
 */
export const syncMealPlannerBookmarkStatus = function (recipeId, newBookmarkStatus) {
  //loop through all recipes in the meal plan and for each that is the recipe in question (matches the recipeId passed in), update the bookmark status to newBookmarkStatus
  Object.values(state.mealPlan).forEach((weekPlan) => {
    Object.values(weekPlan).forEach((dayPlan) => {
      Object.values(dayPlan.meals).forEach((meals) => {
        meals.forEach((meal) => {
          if (meal.id === recipeId) {
            meal.isBookmarked = newBookmarkStatus;
          }
        });
      });
    });
  });
};
