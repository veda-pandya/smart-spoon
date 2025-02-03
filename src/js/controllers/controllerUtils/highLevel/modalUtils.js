/**
 * @fileoverview Utility functions for managing the opening and closing of modal windows.
 *
 * This file provides centralized functionality for opening and closing various modal windows,
 * such as the recipe details modal, add to planner modal, and more. These functions are used
 * across multiple controllers to maintain consistent modal behavior.
 *
 * Dependencies:
 * - model: Provides access to the application state and recipe data.
 * - Various modal view instances: Handles the rendering and visibility of specific modal windows.
 * - Controller utilities: Functions like `showView` and `hideView` to manage modal visibility.
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

import * as model from "../../../model/index.js";

//Import modal window view instances
import OverlayView from "../../../views/mainViews/overlayView.js";
import FilterRecipesModal from "../../../views/modalWindowViews/filterRecipesModal.js";
import BrowseCollectionModal from "../../../views/modalWindowViews/browseCollectionModal.js";
import CustomRecipeModal from "../../../views/modalWindowViews/customRecipeModal.js";
import AddRecipeModal from "../../../views/modalWindowViews/addRecipeModal.js";
import RecipeDetailsModal from "../../../views/modalWindowViews/recipeDetailsModal.js";
import AddMealToSlotModal from "../../../views/modalWindowViews/addMealToSlotModal.js";

//Import utility functions
import { createRecipeDetailsObject, generateOptionsObject, calculateRelativeDate, showView, hideView } from "./controllerUtils.js";

//Import external Libraries
import flatpickr from "flatpickr";

//MODAL WINDOW 1 (ADD RECIPE MODAL)

/**
 * Opens the "Add to Planner by Date" modal with the given recipe details.
 * Configures the date picker on the modal and renders the modal content.
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
export const controlOpenAddRecipeModal = function (recipeId, { source, currentDate = null, currentMeal = null }) {
  const recipe = model.getRecipe(recipeId, { source, currentDate, currentMeal });
  const recipeDetailsObject = createRecipeDetailsObject(recipe);
  const options = generateOptionsObject(source, currentDate, currentMeal);

  configureDatePicker();
  AddRecipeModal.renderModal(recipeDetailsObject, options);
  showView(AddRecipeModal, true);
};

export const controlCloseAddRecipeModal = function () {
  // Returns focus to pre-modal-open element
  AddRecipeModal.disableModalFocusManagement();
  AddRecipeModal.hide();

  // Ensure the overlay remains visible if the Recipe Details modal is still open underneath the modal
  if (!AddRecipeModal.isAnyModalOpen()) OverlayView.hide();
};

/**
 * Configures the date picker for the "Add to Planner" modal, setting minimum and maximum dates.
 * @private
 */
const configureDatePicker = function () {
  const datePicker = AddRecipeModal.getDatePicker();
  const mondayOfCurrentWeek = model.getMondayOfTheWeek();

  const minDate = calculateRelativeDate(mondayOfCurrentWeek, -28); // 4 weeks prior
  const maxDate = calculateRelativeDate(mondayOfCurrentWeek, 32); // 4 weeks later, Friday

  initializeDatePicker(datePicker, minDate, maxDate);
};

/**
 * Initializes the date picker on the modal with specific configuration options.
 *
 * @param {HTMLElement} datePicker - The date picker input element.
 * @param {Date} minDate - The earliest selectable date.
 * @param {Date} maxDate - The latest selectable date.
 * @private
 */
const initializeDatePicker = function (datePicker, minDate, maxDate) {
  if (datePicker._flatpickr) {
    datePicker._flatpickr.destroy();
  }

  flatpickr(datePicker, {
    dateFormat: "Y-m-d", // Matches the native HTML date input format
    minDate: minDate,
    maxDate: maxDate,
    defaultDate: new Date(), // Set today's date as the default visible date
    static: true,
    disable: [
      (date) => date.getDay() === 0 || date.getDay() === 6, // Disable weekends
    ],
  });
};

//MODAL WINDOW 2 (RECIPE DETAILS MODAL)
/**
 * Opens the Recipe Details modal with content for the specified recipe.
 * 
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.

 *
 * @param {number} recipeId - The ID of the recipe to display.
 * @param {boolean} showIngredientAvailability - Whether to highlight available ingredients.
 * @param {Object} options - Used to locate a recipe in the model
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.

 */
export const controlOpenRecipeDetailsModal = function (recipeId, showIngredientAvailability, { source, currentDate = null, currentMeal = null }) {
  const recipe = model.getRecipe(recipeId, { source, currentDate, currentMeal });

  if (recipe.origin === "customMealEntry") return;

  const options = generateOptionsObject(source, currentDate, currentMeal);

  RecipeDetailsModal.renderRecipeContent(recipe, showIngredientAvailability, options);
  showView(RecipeDetailsModal, true);
};

export const controlCloseRecipeDetailsModal = function () {
  hideView(RecipeDetailsModal, true);
};

//MODAL WINDOW 3 (ADD CUSTOM RECIPE MODAL)
export const controlOpenCustomRecipeModal = function () {
  showView(CustomRecipeModal, true);
};

export const controlCloseCustomRecipeModal = function () {
  CustomRecipeModal.resetModal();
  hideView(CustomRecipeModal, true);
};

//MODAL WINDOW 4 (ADD MEAL TO SLOT MODAL)
/**
 * Opens the "Add Meal To Slot" Modal.
 *
 * @param {Object} options - Details to track the date and meal slot in which the recipe should be placed.
 * @param {string} options.dayDateString - The date panel on which the user is placing the meal (e.g., 'Mon Jan 20 2025').
 * @param {string} options.meal - The meal time slot (e.g., "dinner") in which the user is placing the meal.
 */
export const controlOpenAddMealToSlotModal = function ({ dayDateString, meal }) {
  AddMealToSlotModal.renderModal(model.state.recipeBook, dayDateString, meal);
  showView(AddMealToSlotModal, true);
};

export const controlCloseAddMealToSlotModal = function () {
  hideView(AddMealToSlotModal, true);
};

//MODAL WINDOW 5 (FILTER RECIPES MODAL)
export const controlOpenFilterRecipesModal = function () {
  showView(FilterRecipesModal, true);
};

export const controlCloseFilterRecipesModal = function () {
  hideView(FilterRecipesModal, true);
};

//MODAL WINDOW 6 (BROWSE RECIPE COLLECTION MODAL)

export const controlOpenBrowseCollectionModal = function () {
  showView(BrowseCollectionModal, true);
};

export const controlCloseBrowseCollectionModal = function () {
  hideView(BrowseCollectionModal, true);
};
