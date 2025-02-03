/**
 * @fileoverview AddRecipeModal manages the modal for adding recipes to the meal planner.
 *
 * The user inputs the date and the meal slot where they would like to add the meal.
 * The user inputs the number of servings of the meal they are adding
 * The user specifies if they want to add the recipe to the meal slot or replace the meal in the meal slot with the recipe they are adding
 *
 * The Add Recipe To Planner Modal is opened from 3 places in the app:
 *
 * - The 'Add to Planner' button on a recipe card
 * - The 'Add to Planner' button in the Recipe Details Modal
 * - The 'Move Entry' button on the meal calendar (arrow button)
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
 * - The `source` (and `currentDate`/`currentMeal` when applicable) parameters are needed
 * to locate/retrieve the recipe in the model.

 * This modal extends AddMealModalView to include specific functionality for adding recipes via the Add Recipe Modal
 *
 */

import AddMealModalView from "./addMealModalView.js";

import { decodeDateFromInput } from "../../sharedUtils.js";

class AddRecipeModal extends AddMealModalView {
  /**
   * Creates an instance of AddRecipeModal.
   * @extends AddMealModalView
   */
  constructor() {
    super(document.querySelector(".add-recipe-modal"));

    this.placeRecipeForm = this.parentEl.querySelector(".add-recipe-modal__form");
    this.recipeName = this.parentEl.querySelector(".add-recipe-modal__recipe-name");
    this.datePicker = this.parentEl.querySelector(".add-recipe-modal__date-picker");
    this.secondaryInputs = this.parentEl.querySelector(".add-recipe-modal__secondary-inputs");
    this.servingsInput = this.parentEl.querySelector(".add-recipe-modal__num-servings");
    this.servingsInputLabel = this.parentEl.querySelector(".add-recipe-modal__num-servings-label");
    this.calories = this.parentEl.querySelector(".add-recipe-modal__calories");
    this.protein = this.parentEl.querySelector(".add-recipe-modal__protein");
    this.carbs = this.parentEl.querySelector(".add-recipe-modal__carbs");
    this.fats = this.parentEl.querySelector(".add-recipe-modal__fats");
    this.submitBtn = this.parentEl.querySelector(".add-recipe-modal__submit-btn");
  }

  /**
   * Renders the Add Recipe Modal
   * Uses the recipe details object to render the meal title and set the default value for the servings input (which the user may choose to modify)
   * Store the recipe id, source, and currendDate/currentMeal (only if source='mealPlan') in data attributes. They are needed to fetch the recipe from the model state when the user clicks 'Add' to add the recipe.
   *
   * Parameters use the shared "source-currentDate-currentMeal" pattern.
   * For details, see the documentation at the top of this file.

   * @param {Object} recipeDetailsObject - Recipe details, including title, ID, origin, current servings, current macros (determined by current Servings).
   * @param {Object} options - Used to locate a recipe in the model
   * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
   * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
   * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.

   */
  renderModal(recipeDetailsObject, { source, currentDate = null, currentMeal = null }) {
    this.#resetModal();

    const { title, id, origin } = recipeDetailsObject;
    //Set the title in the modal
    this.recipeName.textContent = title;
    //Set dataset values for future reference
    this.recipeName.dataset.id = id;
    this.recipeName.dataset.source = source;
    //Only need to store currentDate and currentMeal if the recipe is being moved in the meal plan
    if (source === "mealPlan" && currentDate && currentMeal) {
      super.setModalAttributes(currentDate, currentMeal);
    }
    //Hide servings input for custom meal entries
    const isCustomMeal = origin === "customMealEntry";
    this.#toggleServingsInput(isCustomMeal);
    //Store initial numServings and macro values in data attributes so that we can access them to calculate new macros when user updates number of servings input
    super.setInitialServings(recipeDetailsObject);
  }

  /**
   * Configures the meal dropdown on the modal when the date input is modified.
   * The dropdown shows the current meals in each meal slot for the date that is selected
   *
   * @param {Object} mealEntriesObject - Object containing meal titles for each meal slot on a given day.
   */
  configureMealDropdown(mealEntriesObject) {
    const mealTimes = [
      { type: "breakfast", label: "Breakfast" },
      { type: "lunch", label: "Lunch" },
      { type: "snacks", label: "Snacks" },
      { type: "dinner", label: "Dinner" },
    ];

    mealTimes.forEach(({ type, label }) => {
      const dropdownOption = this.parentEl.querySelector(`.add-recipe-modal__${type}-dropdown-option`);
      dropdownOption.textContent = `${label} (Current: ${mealEntriesObject[type]}`;
    });
  }

  /**
   * Toggles the visibility of the meal dropdown and submit button based on the date picker value.
   * The dropdown and submit button should only show when the user inputs a valid date
   */
  toggleMealDropdownVisibility = () => {
    const shouldShow = this.#getDatePickerValue();

    this.secondaryInputs.classList.toggle("u-invisible", !shouldShow);
    this.submitBtn.classList.toggle("u-invisible", !shouldShow);
  };
  //Retrieves the date picker HTML input element.
  getDatePicker() {
    return this.datePicker;
  }

  /**
   * Resets the modal state:
   * - Clears any previous error messages
   * - Resets the form (clearing any past inputs)
   * - Hides the meal dropdown and submit button (should only be revealed when a valid date is input)
   * - Clear any previously set currentDate and currentMeal attributes
   * @private
   */
  #resetModal() {
    super.renderRepeatRecipeError("");
    this.placeRecipeForm.reset();

    this.toggleMealDropdownVisibility();

    //remove any previous data attributes
    this.parentEl.removeAttribute("data-currentdate");
    this.parentEl.removeAttribute("data-currentmeal");
  }

  /**
   * Toggles the visibility of the servings input based on whether the recipe is a custom meal.
   * When the user is adding a custom meal, the servings input should be hidden
   * @param {boolean} isCustomMeal - Whether the recipe is a custom meal.
   * @private
   */
  #toggleServingsInput(isCustomMeal) {
    this.servingsInputLabel.classList.toggle("u-hidden", isCustomMeal);
    this.servingsInput.classList.toggle("u-hidden", isCustomMeal);

    if (isCustomMeal) {
      this.servingsInput.removeAttribute("required");
    } else {
      this.servingsInput.setAttribute("required", "required");
    }
  }

  //Retrieves the value from the date picker.
  #getDatePickerValue() {
    return this.datePicker.value ? decodeDateFromInput(this.datePicker.value) : null;
  }

  /**
   * Collects user inputs from the modal form:
   * - the date on which the user wants to add the meal
   * - the meal slot in which the user wants to add the meal
   * - the number of servings of the recipe that the user wants to add
   * - if the user wants to add to the selected meal slot, or replace the meal in the meal slot
   *
   * @returns {Object} User inputs including date, meal, operation, and servings.
   * @private
   */
  #collectUserInputs() {
    const date = decodeDateFromInput(this.datePicker.value);
    const meal = this.parentEl.querySelector(".dropdown").value;
    const operation = this.parentEl.querySelector('input[name="meal-action"]:checked').value;
    const numServings = this.servingsInput.value;
    return { date, meal, operation, numServings };
  }

  /**
   * Add event listener to listen for change in date input
   * @param {Function} handler - Callback function to handle the date input change (will configure and show meal dropdown).
   */
  addHandlerDateInputChange(handler) {
    this.datePicker.addEventListener("change", () => {
      const datePickerValue = this.#getDatePickerValue();
      handler(datePickerValue);
    });
  }

  /**
   * Adds an event listener for the submit button to handle recipe addition.
   * @param {Function} handler - Callback function to handle the form submission/adding the recipe to the meal plan.
   */
  addHandlerSubmitBtn(handler) {
    this.placeRecipeForm.addEventListener("submit", (e) => {
      if (!this.placeRecipeForm.checkValidity()) return;

      e.preventDefault();
      //Retrieve recipeId, source, and currentdate/currentMeal info from data attributes. This info is passed to the handler so it can locate the recipe in the model state and add it to the meal plan
      const recipeId = Number(this.recipeName.dataset.id);
      const source = this.recipeName.dataset.source;
      const userInputs = this.#collectUserInputs();
      const currentMealStats = super.getCurrentMealStats() || {};

      handler(recipeId, userInputs, { source, ...currentMealStats });
    });
  }
}

export default new AddRecipeModal();
