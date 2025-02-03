/**
 * @fileoverview Controller for managing the Recipe Details Modal.
 *
 * Responsibilities:
 * - Handles interactions within the Recipe Details Modal (supports the RecipeDetailsModal), including:
 *   - Updating recipe servings.
 *   - Bookmarking recipes.
 *   - Adding recipes to the meal planner.
 *
 * Dependencies:
 * - recipeDetailsModal: For managing UI rendering.
 * - sharedController: Provides the `controlBookmarks` function for managing recipe bookmarks.
 * - Utility functions for meal plan updates, modal management, and serving adjustments.
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
import * as model from "../model/index.js";

//Import view instances
import RecipeDetailsModal from "../views/modalWindowViews/recipeDetailsModal.js";
import ResultsView from "../views/mainViews/resultsView.js";

//Import from shared controller
import { controlBookmarks } from "./sharedController.js";

//Import utilities
import { generateOptionsObject } from "./controllerUtils/highLevel/controllerUtils.js";
import { controlCloseRecipeDetailsModal, controlOpenAddRecipeModal } from "./controllerUtils/highLevel/modalUtils.js";
import { updateMealPlanDayUI } from "./controllerUtils/featureSpecific/mealPlanUtils.js";

/**
 * Updates the servings for a recipe and synchronizes the model and UI.
 * - Adjusts recipe servings in the model based on the operation.
 * - Re-renders the Recipe Details Modal with updated values.
 * - Updates relevant recipe cards to reflect new servings info if the source is a browsing view.
 * - Updates the meal plan UI if the source is the meal planner (servings update will trigger change in nutrition information which should be reflected in the nutrition dropdown).
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.
 *
 * @param {number} recipeId - ID of the recipe to adjust servings for.
 * @param {string} operation - Operation type (`'increase'` or `'decrease'`).
 * @param {Object} options - Used to locate the recipe in the model.
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.
 */
const controlUpdateServings = function (recipeId, operation, { source, currentDate = null, currentMeal = null }) {
  const isUserBrowsing = ["ingredientSearch", "browseRecipeSearch", "recipeBook"].includes(source);

  // Build the options object and adjust recipe servings in the model
  const options = generateOptionsObject(source, currentDate, currentMeal);
  model.adjustServings(recipeId, operation, options);

  const updatedRecipe = model.getRecipe(recipeId, { source, currentDate, currentMeal });
  renderPostServingsUpdate(updatedRecipe, source, options);

  //Update the relevant recipe card with new num sevrings and calories if user was browsing
  if (isUserBrowsing) updateRecipeHighlights(updatedRecipe);

  if (isUserBrowsing && updatedRecipe.isBookmarked) model.saveRecipeBook();

  //Update the meal plan day panel UI for the modified day (nutrition dropdown)
  if (source === "mealPlan") updateMealPlanDayUI(currentDate);
};

//HELPER FUNCTIONS FOR CONTROLUPDATESERVINGS

/**
 * Renders the updated Recipe Details Modal content after servings change.
 *
 * @param {Object} updatedRecipe - Updated recipe object with adjusted servings.
 * @param {string} source - Source of the recipe.
 * @param {Object} options - Options object with additional context.
 * @private
 */
const renderPostServingsUpdate = function (updatedRecipe, source, options) {
  const showIngredientAvailability = source === "ingredientSearch" ? true : false;
  RecipeDetailsModal.renderRecipeContent(updatedRecipe, showIngredientAvailability, options);
};

/**
 * Updates the recipe cards to reflect the updated servings and calories.
 * Applies to all sources where recipe cards are displayed, in case the recipe is in multiple places
 *
 * @param {Object} updatedRecipe - Updated recipe object with adjusted servings.
 * @private
 */
const updateRecipeHighlights = function (updatedRecipe) {
  // Update the recipe highlights for all sources (ingredientSearch, browseRecipes, recipeBook)
  const sources = ["ingredientSearch", "browseRecipeSearch", "recipeBook"];
  sources.forEach((source) => {
    ResultsView.updateRecipeHighlights(updatedRecipe, source);
  });
};

//VIEW INITIALIZATION

/**
 * Initializes the Recipe Details Modal by attaching event handlers for user interactions.
 *
 * Event handlers:
 * - `controlCloseRecipeDetailsModal`: Closes the Recipe Details modal when the close button is clicked.
 * - `controlBookmarks`: Toggles the bookmark status for the displayed recipe when bookmark button is clicked.
 * - `controlOpenAddRecipeModal`: Opens the Add Recipe Modal when the "Add to Planner" button is clicked.
 * - `controlUpdateServings`: Adjusts the recipe servings when the servings adjustment buttons are clicked (plus or minus)
 */
export const init = function () {
  RecipeDetailsModal.addHandlerCloseModal(controlCloseRecipeDetailsModal);
  RecipeDetailsModal.addHandlerBookmarkBtn(controlBookmarks);
  RecipeDetailsModal.addHandlerAddToPlanner(controlOpenAddRecipeModal);
  RecipeDetailsModal.addHandlerUpdateServings(controlUpdateServings);
};
