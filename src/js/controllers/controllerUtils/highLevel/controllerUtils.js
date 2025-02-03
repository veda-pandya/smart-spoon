/**
 * @fileoverview General helper functions used across controller files and controller utility files
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
 *
 */
import * as model from "../../../model/index.js";

//Import main view instances
import NavBarView from "../../../views/mainViews/navBarView.js";
import HomeView from "../../../views/mainViews/homeView.js";
import IngredientSearchView from "../../../views/mainViews/ingredientSearchView.js";
import BrowseRecipesView from "../../../views/mainViews/browseRecipesView.js";
import RecipeBookView from "../../../views/mainViews/recipeBookView.js";
import ResultsView from "../../../views/mainViews/resultsView.js";
import MealPlanView from "../../../views/mainViews/mealPlanView.js";

//Import modal window view instances
import OverlayView from "../../../views/mainViews/overlayView.js";
import FilterRecipesModal from "../../../views/modalWindowViews/filterRecipesModal.js";
import BrowseCollectionModal from "../../../views/modalWindowViews/browseCollectionModal.js";
import CustomRecipeModal from "../../../views/modalWindowViews/customRecipeModal.js";
import AddRecipeModal from "../../../views/modalWindowViews/addRecipeModal.js";
import RecipeDetailsModal from "../../../views/modalWindowViews/recipeDetailsModal.js";
import AddMealToSlotModal from "../../../views/modalWindowViews/addMealToSlotModal.js";

//Displays the view (and overlay for modal window views)
export const showView = function (view, modal = false) {
  view.show();
  if (modal) {
    OverlayView.show();
    view.enableModalFocusManagement(); //places focus on first focusable element in modal
  }
};

//Hides the view (and overlay for modal window views)
export const hideView = function (view, modal = false) {
  view.disableModalFocusManagement(); // returns focus to pre-modal-open element
  view.hide();
  if (modal) OverlayView.hide();
};

/**
 * Renders the Recipe Book View with the current recipes.
 * If no recipes exist, displays a 'no recipes' message.
 */
export const renderRecipeBook = function () {
  RecipeBookView.hideNoRecipesMessage();
  RecipeBookView.clearRecipeBook();
  ResultsView.renderRecipeCards(model.state.recipeBook, "recipeBook");

  if (model.state.recipeBook.length === 0) RecipeBookView.showNoRecipesMessage();
};

/**
 * Creates a timeout that rejects after a specified number of milliseconds
 * Useful for limiting the time spent waiting for async operations.
 * @param {number} ms - The timeout duration in milliseconds
 * @returns {Promise <never>} A promise that rejects with a timeout error
 */
export const timeout = function (ms) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error("Request timed out"));
    }, ms);
  });
};

/**
 * Generates an options object that contains information about a recipe's location in the model
 * The options object is used across many functions to fetch/retrieve recipes
 * See documentation at the top of this file!
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.
 *
 * @param {string} source - The source of the data (e.g., 'mealPlan').
 * @param {string} [currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string} [currentMeal=null] - Meal slot the recipe is under in the meal plan.

 * @returns {Object} An options object with source, date, and meal information.
 */
export const generateOptionsObject = function (source, currentDate, currentMeal) {
  const options = { source }; // `source` is mandatory
  if (source === "mealPlan" && currentDate && currentMeal) {
    options.currentDate = currentDate;
    options.currentMeal = currentMeal;
  }

  return options;
};

// Creates a lightweight object containing recipe details
export const createRecipeDetailsObject = function (recipe) {
  return { title: recipe.title, id: recipe.id, initServings: recipe.servings, initCalories: recipe.calories, initProtein: recipe.protein, initCarbs: recipe.carbs, initFats: recipe.fats, origin: recipe.origin };
};

/**
 * Calculates a date relative to a given base date by applying an offset.
 * Useful for calculating date range.
 * @param {Date|string} baseDate - The base date as a Date object or string.
 * @param {number} daysOffset - The number of days to offset (positive or negative).
 * @returns {Date} The calculated date.
 */
export const calculateRelativeDate = function (baseDate, daysOffset) {
  const newDate = new Date(baseDate);
  newDate.setDate(newDate.getDate() + daysOffset);
  return newDate;
};
