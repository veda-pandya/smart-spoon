/**
 * @fileoverview Shared controller containing application-wide functions like navigation and bookmarking.
 *
 * Responsibilities:
 * - Manages the navigation bar interactions and view switching logic.
 * - Handles recipe bookmarking functionality and synchronization across views.
 * - Contains helper functions to support core shared functionality.
 *
 * Dependencies:
 * - Multiple main and modal view instances for managing the UI.
 * - Utility functions from controllerUtils and browseRecipesUtils for reusable logic.
 *
 * * Options Object `{source, currentDate, currentMeal}` Parameters:
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

import * as model from "../model/index.js";

//Import main view instances
import NavBarView from "../views/mainViews/navBarView.js";
import HomeView from "../views/mainViews/homeView.js";
import IngredientSearchView from "../views/mainViews/ingredientSearchView.js";
import BrowseRecipesView from "../views/mainViews/browseRecipesView.js";
import RecipeBookView from "../views/mainViews/recipeBookView.js";
import ResultsView from "../views/mainViews/resultsView.js";
import MealPlanView from "../views/mainViews/mealPlanView.js";

//Import modal view instances
import OverlayView from "../views/mainViews/overlayView.js";
import FilterRecipesModal from "../views/modalWindowViews/filterRecipesModal.js";
import BrowseCollectionModal from "../views/modalWindowViews/browseCollectionModal.js";
import CustomRecipeModal from "../views/modalWindowViews/customRecipeModal.js";
import AddRecipeModal from "../views/modalWindowViews/addRecipeModal.js";
import RecipeDetailsModal from "../views/modalWindowViews/recipeDetailsModal.js";
import AddMealToSlotModal from "../views/modalWindowViews/addMealToSlotModal.js";

//Import utilities
import { showView, renderRecipeBook } from "./controllerUtils/highLevel/controllerUtils.js";
import { loadRandomRecipes } from "./controllerUtils/featureSpecific/browseRecipesUtils.js";

/**
 * Handles navigation bar interactions and switches views based on the link code.
 * If an unhandled `linkCode` is passed, defaults to showing the HomeView.
 * - Toggles active class for the clicked link.
 * - Hides all views and selectively shows the targeted view.
 * - Loads initial random recipes for the BrowseRecipesView if it's the first access.
 *
 * @param {string} linkCode - Code representing the view to switch to (e.g., 'home', 'browse').
 */
export const controlNavBar = function (linkCode) {
  NavBarView.toggleActiveClass(linkCode);

  const views = [OverlayView, HomeView, IngredientSearchView, BrowseRecipesView, RecipeBookView, MealPlanView, FilterRecipesModal, BrowseCollectionModal, CustomRecipeModal, AddRecipeModal, RecipeDetailsModal, AddMealToSlotModal];

  views.forEach((view) => view.hide());

  const viewHandlers = {
    home: () => showView(HomeView),
    browse: () => {
      if (!model.state.initializedViews.has("browseRecipes")) {
        loadRandomRecipes();
        model.state.initializedViews.add("browseRecipes");
      }
      showView(BrowseRecipesView);
    },
    ingredients: () => showView(IngredientSearchView),
    book: () => {
      renderRecipeBook();
      showView(RecipeBookView);
    },
    planner: () => showView(MealPlanView),
  };

  if (viewHandlers[linkCode]) {
    viewHandlers[linkCode]();
  } else {
    console.warn(`Unhandled link code: ${linkCode}`);
    showView(HomeView); // Fallback to home
  }

  //Ensure the UI shows the top of the view
  window.scrollTo(0, 0);
};

/**
 * Handles toggling bookmarks for recipes and synchronizing the state across views.
 * - Updates the bookmark status in the model.
 * - Synchronizes bookmark state across the app.
 * - Updates the UI to reflect the bookmark changes.
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
export const controlBookmarks = function (recipeId, { source, currentDate = null, currentMeal = null }) {
  const isNowBookmarked = toggleBookmarkStatus(recipeId, { source, currentDate, currentMeal });
  synchronizeBookmarks(recipeId, isNowBookmarked);
  postBookmarkUIUpdate(recipeId, isNowBookmarked);
};

//HELPER FUNCTIONS FOR CONTROLBOOKMARKS FUNCTION

/**
 * Updates the bookmark status of the recipe in the model state.
 * Adds the recipe to the recipe book if bookmarked, removes if unbookmarked
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.
 *
 * @param {number} recipeId - ID of the recipe.
 * @param {Object} options -Used to locate a recipe in the model
 * @returns {boolean} The new bookmark status.
 * @private
 */
const toggleBookmarkStatus = function (recipeId, { source, currentDate, currentMeal }) {
  const isCurrentlyBookmarked = model.getBookmarkStatus(recipeId, { source, currentDate, currentMeal });

  //Toggle the bookmark status
  const isNowBookmarked = !isCurrentlyBookmarked;

  //Update the recipe's bookmark status in the model
  model.updateBookmarkStatus(recipeId, isNowBookmarked, { source, currentDate, currentMeal });

  //Update the recipe book
  if (isNowBookmarked) {
    model.addRecipeToRecipeBookById(recipeId, { source, currentDate, currentMeal });
  } else {
    model.removeRecipeFromBook(recipeId);
  }

  return isNowBookmarked;
};

/**
 * Synchronizes bookmark status across all instances of a recipe in the app.
 *
 * @param {number} recipeId - ID of the recipe.
 * @param {boolean} isNowBookmarked - The new bookmark status.
 * @private
 */
const synchronizeBookmarks = function (recipeId, isNowBookmarked) {
  model.synchronizeBookmarkStatus(recipeId, isNowBookmarked);
  model.saveMealPlan();
};

/**
 * Updates the UI to reflect the bookmark status change.
 * This includes updating the bookmark button in the search results, Recipe Details Modal, and Recipe Book View (if applicable)
 *
 * @param {number} recipeId - ID of the recipe.
 * @param {boolean} isNowBookmarked - The new bookmark status.
 * @private
 */
const postBookmarkUIUpdate = function (recipeId, isNowBookmarked) {
  ResultsView.updateBookmarkBtn(recipeId, isNowBookmarked); // Update bookmark button on recipe card

  if (RecipeDetailsModal.isVisible()) RecipeDetailsModal.updateBookmarkBtn(isNowBookmarked); // Update bookmark button in Recipe Details Modal

  if (RecipeBookView.isVisible()) renderRecipeBook(); // Re-render the RecipeBookView to reflect new bookmark status if the user is on the recipe book page
};
