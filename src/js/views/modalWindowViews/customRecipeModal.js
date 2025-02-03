/**
 * @fileoverview CustomRecipeModal handles the functionality for the Custom Recipe Modal.
 * It includes methods for dynamically adding ingredients and instructions, collecting user inputs,
 * and managing the modal's reset and validation behavior.
 *
 * The Custom Meal Modal is opened from the 'Add Custom Recipe' button on the Recipe Book Page
 * The modal allows the user to add a custom recipe. It includes a form to fill the title, nutrition info, servings, ingredients, instructions and other info pertaining to the recipe
 *
 * Extends ModalView for shared modal functionality.
 */

import ModalView from "./modalView.js";

//Import utilities
import { getInputValue } from "../viewUtils/highLevel/viewUtils.js";
import { toTitleCase } from "../../sharedUtils.js";

class CustomRecipeModal extends ModalView {
  constructor() {
    super(document.querySelector(".custom-recipe-modal"));
    this.form = this.parentEl.querySelector(".custom-recipe-modal__form");
  }

  //Adds a new ingredient input row in the modal when user clicks 'plus' icon in ingredients section
  addIngredientRow() {
    const ingredientNumber = this.#calculateEntryNumber("custom-recipe-modal__input-row--ingredient");
    const rowMarkup = this.#generateIngredientRowMarkup(ingredientNumber);
    const ingredientsContainer = this.parentEl.querySelector(".custom-recipe-modal__input-rows--ingredients");
    ingredientsContainer.insertAdjacentHTML("beforeend", rowMarkup);
  }

  //Adds a new instruction input row in the modal when user clicks 'plus' icon in instructions section
  addInstructionRow() {
    const instructionNumber = this.#calculateEntryNumber("custom-recipe-modal__input-row--instruction");
    const rowMarkup = this.#generateInstructionRowMarkup(instructionNumber);
    const instructionsContainer = this.parentEl.querySelector(".custom-recipe-modal__input-rows--instructions");
    instructionsContainer.insertAdjacentHTML("beforeend", rowMarkup);
  }

  /**
   * Collects all user inputs from the modal form and returns them in an organized object.
   * @returns {Object} The user inputs including ingredients, instructions, and nutritional details.
   */
  collectUserInputs() {
    const checkboxes = document.querySelectorAll(".custom-recipe-modal__checkbox:checked");
    const checkedValues = Array.from(checkboxes).map((checkbox) => checkbox.value);

    const userInputs = {
      title: toTitleCase(getInputValue("#custom-recipe-name", this.parentEl)),
      dietaryRestrictions: checkedValues,
      cookingTime: getInputValue("#custom-cooktime", this.parentEl),
      cuisine: getInputValue("#custom-cuisine-dropdown", this.parentEl),
      mealType: getInputValue("#custom-recipe-meal-type-dropdown", this.parentEl),
      calories: getInputValue("#custom-number-calories", this.parentEl),
      servings: getInputValue("#custom-number-servings", this.parentEl),
      ingredients: this.#collectIngredients(),
      instructions: this.#collectInstructions(),
      saturatedFat: getInputValue("#custom-sat-fat", this.parentEl),
      sugar: getInputValue("#custom-sugar", this.parentEl),
      fiber: getInputValue("#custom-fiber", this.parentEl),
      sodium: getInputValue("#custom-sodium", this.parentEl),
      cholesterol: getInputValue("#custom-cholesterol", this.parentEl),
      iron: getInputValue("#custom-iron", this.parentEl),
      zinc: getInputValue("#custom-zinc", this.parentEl),
      calcium: getInputValue("#custom-calcium", this.parentEl),
      magnesium: getInputValue("#custom-magnesium", this.parentEl),
      protein: getInputValue("#custom-protein", this.parentEl),
      fats: getInputValue("#custom-fats", this.parentEl),
      carbs: getInputValue("#custom-carbs", this.parentEl),
    };

    return userInputs;
  }

  //Resets the modal form (clears inputs and removes any extra ingredient or instruction rows)
  resetModal() {
    this.form.reset();

    //Remove any ingredient and instruction rows that were added (beyond the first default one)
    this.#removeExtraRows(".custom-recipe-modal__input-row--ingredient");
    this.#removeExtraRows(".custom-recipe-modal__input-row--instruction");
  }

  /**
   * Calculates the entry number for dynamically added rows.
   * @param {string} entryClass - The class of the entry rows (e.g., "custom-recipe-modal__input-row--ingredient" or "custom-recipe-modal__input-row--instruction").
   * @returns {number} The new entry number.
   */
  #calculateEntryNumber(entryClass) {
    const currentEntries = this.parentEl.querySelectorAll(`.${entryClass}`).length;
    return currentEntries + 1;
  }

  /**
   * Generates the HTML markup for an ingredient input row.
   * @param {number} ingredientNumber - The ingredient number for labeling.
   * @returns {string} The HTML string for the ingredient row.
   */
  #generateIngredientRowMarkup(ingredientNumber) {
    return `
    <div class="u-flex-gap-1rem custom-recipe-modal__input-row custom-recipe-modal__input-row--ingredient">
        <label class="g-visually-hidden" for="ingredient-${ingredientNumber}-qty">Ingredient ${ingredientNumber} Qty:</label>
        <input type="number" class="custom-recipe-modal__ingredient-qty modal-window__text-input" type="text" id="ingredient-${ingredientNumber}-qty" placeholder="eg. 1" min="0" step="0.0001" required/>
        <label class="g-visually-hidden" for="ingredient-${ingredientNumber}-qty-unit">Ingredient ${ingredientNumber} quantity unit:</label>
        <input class="custom-recipe-modal__ingredient-unit modal-window__text-input" type="text" id="ingredient-${ingredientNumber}-qty-unit" placeholder="eg. cup" title="Enter a common unit like tsp, tbsp, ml, l, fl oz, pt, qt, g, kg, oz, lb, or count" required/>
        <label class="g-visually-hidden" for="ingredient-${ingredientNumber}-name">Ingredient ${ingredientNumber} name:</label>
        <input class="custom-recipe-modal__ingredient-name modal-window__text-input" type="text" id="ingredient-${ingredientNumber}-name" placeholder="flour" title="Only letters and spaces are allowed." pattern="[A-Za-z\\s]+" required/>
    </div>`;
  }

  /**
   * Generates the HTML markup for an instruction input row.
   * @param {number} instructionNumber - The instruction number for labeling.
   * @returns {string} The HTML string for the instruction row.
   */
  #generateInstructionRowMarkup(instructionNumber) {
    return `
    <div class="u-flex-gap-1rem custom-recipe-modal__input-row custom-recipe-modal__input-row--instruction">
        <label class="custom-recipe-modal__step-label" for="step-${instructionNumber}">
        Step
        <span class="custom-recipe-modal__step-number">${instructionNumber}</span>
        </label>
        <input class="modal-window__text-input custom-recipe-modal__instruction-input" id="step-${instructionNumber}" type="text" placeholder="eg. Pour broth into pan and cook for 10 minutes." required/>
    </div>`;
  }

  /**
   * Collects all ingredient inputs into an array of ingredient objects.
   * @returns {Array} Array of ingredient objects with quantity, unit, and name properties.
   */
  #collectIngredients() {
    return Array.from(this.parentEl.querySelectorAll(".custom-recipe-modal__input-row--ingredient")).map((row) => ({
      quantity: Number(row.querySelector(".custom-recipe-modal__ingredient-qty")?.value),
      unit: row.querySelector(".custom-recipe-modal__ingredient-unit")?.value,
      name: row.querySelector(".custom-recipe-modal__ingredient-name")?.value,
    }));
  }

  /**
   * Collects all instruction inputs into an array of instruction strings.
   * @returns {Array} Array of instruction strings.
   */
  #collectInstructions() {
    return Array.from(this.parentEl.querySelectorAll(".custom-recipe-modal__instruction-input")).map((input) => input.value);
  }

  /**
   * Removes extra rows for a given selector, keeping only the first row.
   * @param {string} selector - The selector for the rows to remove.
   */
  #removeExtraRows(selector) {
    const rows = this.parentEl.querySelectorAll(selector);
    rows.forEach((row, index) => {
      if (index > 0) row.remove();
    });
  }

  /**
   * Adds an event listener for the "Add Ingredient" button (plus icon in the ingredients section) .
   * @param {Function} handler - The function to call when the button is clicked (adds an ingredient input row).
   */
  addHandlerAddIngredient(handler) {
    const addIngredientBtn = this.parentEl.querySelector(".add-entry-btn--ingredient");
    addIngredientBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handler("ingredient");
    });
  }

  /**
   * Adds an event listener for the "Add Instruction" button (plus icon in the instruction section) .
   * @param {Function} handler - The function to call when the button is clicked (adds an instruction input row).
   */
  addHandlerAddInstruction(handler) {
    const addInstructionBtn = this.parentEl.querySelector(".add-entry-btn--instruction");
    addInstructionBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handler("instruction");
    });
  }

  /**
   * Adds an event listener for the form submission to create the custom recipe.
   * @param {Function} handler - The function to call when the form is submitted (the handler function will take the user inputs and format them into a structured recipe object in the recipe book model state using the Recipe class).
   */
  addHandlerCreateCustomMeal(handler) {
    this.form.addEventListener("submit", (e) => {
      if (!this.form.checkValidity()) return;
      e.preventDefault();
      handler();
    });
  }
}

export default new CustomRecipeModal();
