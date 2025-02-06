/**
 * @fileoverview Controller for managing the AddRecipeModal and AddMealToSlotModal views (both of which allow a user to add a recipe to the meal plan)
 *
 * This file handles logic for:
 * - Adding recipes to the meal planner from both modals.
 * - Initializing event listeners for both modals.
 * - Managing user interactions on both modals.
 *
 * Dependencies:
 * - `model`: For state management and data manipulation.
 * - `addRecipeModal`: Handles the Add Recipe Modal UI.
 * - `addMealToSlotModal`: Handles the Add Meal To Slot Modal UI.
 * - Utility functions:
 *    - `generateOptionsObject`: To create the options object for recipe operations.
 *    - `mealPlanUtils`: For updating meal plan day and week UI.
 *    - `modalUtils`: For handling modal interactions.
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
import AddRecipeModal from "../views/modalWindowViews/addRecipeModal.js";
import AddMealToSlotModal from "../views/modalWindowViews/addMealToSlotModal.js";

//Import utility functions
import { generateOptionsObject } from "./controllerUtils/highLevel/controllerUtils.js";
import { controlCloseAddRecipeModal, controlCloseAddMealToSlotModal } from "./controllerUtils/highLevel/modalUtils.js";
import { updateMealPlanDay, updateMealPlanWeek } from "../controllers/controllerUtils/featureSpecific/mealPlanUtils.js";

/**
 * Adds a recipe to the meal plan based on user inputs from either modal.
 * - Validates to ensure no duplicate recipes are added to the same meal slot.
 * - Closes the respective modal after successfully adding the recipe.
 * - Updates the meal calendar UI to reflect changes.
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.

 * @param {number} recipeId - The ID of the recipe to add.
 * @param {Object} userInputs - User inputs for the meal (date and  meal slot to add the recipe to, operation type (add receipe to meal slot or replace existing recipe in meal slot)).
 * @param {Object} options - Options object containing source, currentDate, and currentMeal.
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.

 */
const controlAddRecipeToPlan = function (recipeId, userInputs, { source, currentDate = null, currentMeal = null }) {
  //Destructure data and meal slot where the recipe will be placed
  const { date: dateToBePlaced, meal: mealToBePlaced, operation } = userInputs;

  //Throw error if the recipe already exists in the meal slot
  if (isRecipeAlreadyInMealSlot(recipeId, dateToBePlaced, mealToBePlaced, operation)) {
    renderMealExistsError();
    return;
  }

  //Close the modal
  closeOpenModals();

  //Fetch and add recipe to plan. To fetch- source, currentDate, currentMeal are needed
  const options = generateOptionsObject(source, currentDate, currentMeal);
  model.addRecipeToMealPlan(recipeId, userInputs, options);

  //Update the meal plan UI
  updateMealPlanWeek(model.state.mealCalendarWeek);
};

// Helper function to close modals if they're visible
const closeOpenModals = function () {
  if (AddRecipeModal.isVisible()) controlCloseAddRecipeModal();
  if (AddMealToSlotModal.isVisible()) controlCloseAddMealToSlotModal();
};

// Helper function to check if recipe already exists in meal slot
const isRecipeAlreadyInMealSlot = function (recipeId, dateToBePlaced, mealToBePlaced, operation) {
  const currentRecipes = model.mealsInMealSlot(dateToBePlaced, mealToBePlaced);
  return currentRecipes.includes(recipeId) && operation !== "replace";
};

/**
 * Renders an error message if the user attempts to place the recipe in a meal slot which already contains that recipe.
 * @private
 */
const renderMealExistsError = function () {
  const repeatRecipeErrorMessage = "This recipe already exists in the meal slot you selected. Please place the recipe in another slot or adjust the servings for this recipe in your meal plan.";

  if (AddMealToSlotModal.isVisible()) AddMealToSlotModal.renderRepeatRecipeError(repeatRecipeErrorMessage);

  if (AddRecipeModal.isVisible()) AddRecipeModal.renderRepeatRecipeError(repeatRecipeErrorMessage);
};

//SPECIFIC TO AddRecipeModal

/**
 * Updates and shows the meal dropdown in the Add Recipe Modal when the date picker value is changed.
 * - Retrieves meals in all meal slots for the selected date from the model.
 * - Configures and displays the meal dropdown in the modal.
 *
 * @param {string} dateString - The selected date in dateString format (e.g., 'Mon Jan 20 2025').
 */
const controlDatePickerChange = function (dateString) {
  //Get recipe titles in all meal slots for the day
  const mealEntryNames = model.getMealTimeRecipeNames(dateString);
  //Configure the meal dropdown with appropriate dropdown options and the recipe titles
  AddRecipeModal.updateDropdownOptions(mealEntryNames);
  //Reveal dropdown
  AddRecipeModal.toggleMealDropdownVisibility();
};

//SPECIFIC TO AddMealToSlotModal

/**
 * Retrieves and displays serving information for a selected recipe.
 * - Fetches the recipe details from the model based on the recipe ID and source.
 * - Displays initial serving size and nutritional information in the modal.
 *
 * @param {number} recipeId - The ID of the selected recipe.
 * @param {string} source - The source of the recipe (e.g., 'browseRecipes', 'mealPlan').
 */
const controlGetServingInfo = function (recipeId, source) {
  const recipe = model.getRecipeFromBrowse(recipeId, source);
  const recipeDetailsObject = { initServings: recipe.servings, initCalories: recipe.calories, initProtein: recipe.protein, initCarbs: recipe.carbs, initFats: recipe.fats };
  AddMealToSlotModal.setInitialServings(recipeDetailsObject);
  AddMealToSlotModal.showServingsContainer();
};

/**
 * Adds a custom meal entry to the meal plan.
 * - Creates a custom meal entry in the model using user inputs.
 * - Updates the meal plan for the specified day.
 * - Closes the AddMealToSlotModal.
 *
 * @param {Object} customEntryInputs - User inputs for the custom meal entry, including:
 *    - `date`: The date for the meal entry.
 *    - `meal`: The meal slot (e.g., 'lunch', 'dinner').
 *    - `details`: Additional details for the custom meal (e.g., name, macros).
 */
const controlAddCustomMealEntry = function (customEntryInputs) {
  model.createCustomMealEntry(customEntryInputs);
  const mealDay = customEntryInputs.date;
  updateMealPlanDay(mealDay);
  controlCloseAddMealToSlotModal();
};

//INITIALIZE THE VIEWS

/**
 * Initializes the Add Recipe Modal by setting up event handlers for user interactions.
 *
 * Event handlers:
 * - `controlDatePickerChange`: Updates and shows meal dropdown when the user changes the date picker.
 * - `addHandlerServingsInput`: Handles servings input changes for recipes.
 * - `controlCloseAddRecipeModal`: Closes the modal when the close button is clicked.
 * - `controlAddRecipeToPlan`: Adds the selected recipe to the meal plan when the submit button is clicked on the modal.
 *
 * @private
 */

const initializeAddRecipeModal = function () {
  AddRecipeModal.addHandlerDateInputChange(controlDatePickerChange);
  AddRecipeModal.addHandlerServingsInput();
  AddRecipeModal.addHandlerCloseModal(controlCloseAddRecipeModal);
  AddRecipeModal.addHandlerSubmitBtn(controlAddRecipeToPlan);
};

/**
 * Initializes the Add Meal To Slot Modal by attaching event handlers for user interactions.
 *
 * Event handlers:
 * - `addHandlerBookmarkedRecipesBtn`: Handles interactions with the "Bookmarked Recipes" button.
 * - `addHandlerCustomEntryBtn`: Handles interactions with the "Custom Entry" button.
 * - `controlCloseAddMealToSlotModal`: Closes the modal when the close button is clicked.
 * - `controlGetServingInfo`: Displays default recipe serving information.
 * - `addHandlerServingsInput`: Handles changes to the servings input field.
 * - `addHandlerAddMealBtn`: Adds the selected recipe to the meal plan when the "Add Meal" button is clicked.
 * - `addHandlerSaveMealBtn`: Saves a custom meal entry when the "Save Meal" button is clicked.
 *
 * @private
 */
const initializeAddMealToSlotModal = function () {
  AddMealToSlotModal.addHandlerBookmarkedRecipesBtn();
  AddMealToSlotModal.addHandlerCustomEntryBtn();
  AddMealToSlotModal.addHandlerCloseModal(controlCloseAddMealToSlotModal);
  AddMealToSlotModal.addHandlerRecipeOptionContainer(controlGetServingInfo);
  AddMealToSlotModal.addHandlerServingsInput();
  AddMealToSlotModal.addHandlerAddMealBtn(controlAddRecipeToPlan);
  AddMealToSlotModal.addHandlerSaveMealBtn(controlAddCustomMealEntry);
};

/**
 * Initializes the Add Recipe Modal and Add Meal To Slot Modal
 */
export const init = function () {
  initializeAddRecipeModal();
  initializeAddMealToSlotModal();
};
