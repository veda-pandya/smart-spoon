/**
 * @fileoverview Controller for managing the Recipe Book and Custom Recipe Modal Views.
 * The 'Custom Recipe Modal' is accessed from the Recipe Book page
 *
 * Responsibilities:
 * - Handles user interactions within the Recipe Book view, such as adding custom recipes.
 * - Manages the lifecycle of the Custom Recipe Modal, including adding ingredients, instructions, and creating recipes.
 *
 * Dependencies:
 * - recipeBookView: Handles UI interactions and updates related to the Recipe Book.
 * - customRecipeModal: Manages the UI for the Custom Recipe Modal, including user input collection.
 * - controllerUtils: Provides the `renderRecipeBook` function for re-rendering the RecipeBookView.
 * - modalUtils: Utilities for managing openening and closing of the Custom Recipe Modal.
 */

import * as model from "../model/index.js";

//Import view instances
import RecipeBookView from "../views/mainViews/recipeBookView.js";
import CustomRecipeModal from "../views/modalWindowViews/customRecipeModal.js";

//Import Utilities
import { renderRecipeBook } from "./controllerUtils/highLevel/controllerUtils.js";
import { controlOpenCustomRecipeModal, controlCloseCustomRecipeModal } from "./controllerUtils/highLevel/modalUtils.js";

/**
 * Collects user inputs from the Custom Recipe Modal and adds a new custom recipe to the Recipe Book.
 * - Collect user inputs from the modal and close the modal
 * - creates new recipe object in the model state (recipe book)
 * - Updates the RecipeBookView if it is currently visible.
 */
const controlAddCustomRecipe = function () {
  const userInputs = CustomRecipeModal.collectUserInputs();
  controlCloseCustomRecipeModal();
  model.addCustomRecipeToRecipeBook(userInputs);
  //Reload recipe book page which should show the newly added recipe (with user icn)
  if (RecipeBookView.isVisible()) renderRecipeBook();
};

/**
 * Adds a new entry row (ingredient or instruction) in the Custom Recipe Modal.
 *
 * @param {string} type - The type of entry to add ('ingredient' or 'instruction').
 */
const controlAddEntry = function (type) {
  type === "ingredient" ? CustomRecipeModal.addIngredientRow() : CustomRecipeModal.addInstructionRow();
};

//VIEW INITIALIZATION

/**
 * Initializes the Recipe Book view by attaching event handlers for user interactions.
 *
 * Event handlers:
 * - Opens the Custom Recipe Modal when the "Add Custom Recipe" button is clicked.
 * @private
 */
const initializeRecipeBookView = function () {
  RecipeBookView.addHandlerAddCustomRecipe(controlOpenCustomRecipeModal);
};

/**
 * Initializes the Custom Recipe Modal by attaching event handlers for user interactions.
 *
 * Event handlers:
 * - `controlCloseCustomRecipeModal`: Closes the modal when the close button is clicked.
 * - `controlAddEntry`: Adds an ingredient or instruction row when the respective button is clicked.
 * - `controlAddCustomRecipe`: Creates a new custom recipe when the user submits the modal form.
 * @private
 */
const initializeCustomRecipeModal = function () {
  CustomRecipeModal.addHandlerCloseModal(controlCloseCustomRecipeModal);
  CustomRecipeModal.addHandlerAddIngredient(controlAddEntry);
  CustomRecipeModal.addHandlerAddInstruction(controlAddEntry);
  CustomRecipeModal.addHandlerCreateCustomMeal(controlAddCustomRecipe);
};

/**
 * Initializes the Recipe Book and Custom Recipe Modal views by setting up their respective event handlers.
 */
export const init = function () {
  initializeRecipeBookView();
  initializeCustomRecipeModal();
};
