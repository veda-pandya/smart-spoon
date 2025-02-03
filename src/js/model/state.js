/**
 * @fileoverview Defines the central application state object.
 * This object stores the data shared across different parts of the application,
 * including search results and persistent data like the meal plan and recipe book.
 */

/**
 * The central state object for the application.
 *
 * @type {Object}
 * @property {Set<string>} initializedViews - Tracks the views that have been initialized to prevent redundant setups.
 * @property {string[]} pantry - List of ingredients added by the user to their pantry.
 * @property {Object[]} ingredientSearchResults - Results of ingredient-based recipe searches (list of recipe objects created using the Recipe class).
 * @property {Object[]} browseSearchResults - Results of browse-based recipe searches (list of recipe objects created using the Recipe class).
 * @property {Object[]} recipeBook - Array of bookmarked recipes saved by the user (list of recipe objects created using the Recipe class).
 * @property {string} mealCalendarWeek - The Monday representing the current week displayed in the meal planner (e.g., 'Mon Jan 20 2025').
 * @property {Object} mealPlan - A detailed plan of meals, organized by dates and meal types. See initializeApp.js for example structure of the mealPlan object.
 */
export let state = {
  initializedViews: new Set(),
  pantry: [],
  ingredientSearchResults: [],
  browseSearchResults: [],
  recipeBook: [],
  mealCalendarWeek: "",
  mealPlan: {},
};
