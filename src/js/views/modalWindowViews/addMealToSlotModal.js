/**
 * @fileoverview AddMealToSlotModal manages the modal for adding meals from the calendar.
 * The modal is opened by clicking the "plus" button in any meal slot on the calendar.
 * The modal allows the user to add either:
 *  - A recipe from their recipe book via the 'Select from Bookmarked Recipes' sub-view OR
 *  - A custom meal entry (e.g., 'Ate out', 'Leftovers') via the 'Create Custom Entry' subview
 * to the meal slot corresponding to the plus button they clicked
 *
 * Extends AddMealModalView to include specific functionality for this modal.
 */

import AddMealModalView from "./addMealModalView.js";

//Import utilities
import { getInputValue } from "../viewUtils/highLevel/viewUtils.js";

class AddMealToSlotModal extends AddMealModalView {
  /**
   * Creates an instance of AddMealToSlotModal.
   * @extends AddMealModalView
   */
  constructor() {
    super(document.querySelector(".meal-entry-modal"));

    this.selectBookmarkedBtn = this.parentEl.querySelector(".meal-entry-modal__bookmarks-btn");
    this.bookmarkedRecipesSection = this.parentEl.querySelector(".select-bookmarked-recipes");
    this.noBookmarkedRecipesErrEl = this.parentEl.querySelector(".error-message--no-bookmarked-recipes");
    this.bookmarkedRecipesWindow = this.parentEl.querySelector(".select-bookmarked-recipes__recipe-window");
    this.bookmarkedRecipesForm = this.parentEl.querySelector(".select-bookmarked-recipes__form");
    this.servingsContainer = this.parentEl.querySelector(".select-bookmarked-recipes__servings-info");
    this.servingsInput = this.parentEl.querySelector(".select-bookmarked-recipes__servings-input-field");
    this.calories = this.parentEl.querySelector(".select-bookmarked-recipes__calories");
    this.protein = this.parentEl.querySelector(".select-bookmarked-recipes__protein");
    this.carbs = this.parentEl.querySelector(".select-bookmarked-recipes__carbs");
    this.fats = this.parentEl.querySelector(".select-bookmarked-recipes__fats");
    this.addMealBtn = this.parentEl.querySelector(".select-bookmarked-recipes__add-meal-btn");

    this.customEntryBtn = this.parentEl.querySelector(".meal-entry-modal__cstm-entry-btn");
    this.customMealSection = this.parentEl.querySelector(".custom-entry-form");
    this.customRecipeForm = this.parentEl.querySelector(".custom-entry-form__container");
  }

  /**
   * Renders the modal with 'Select from Bookmarked Recipes' showing by defualt.
   * The user can switch views via the 'Create Custom Entry' button on the modal
   *
   * The dateString and meal parameters track which date and meal the plus icon clicked correspond to so the meal can be added in the correct spot.
   *
   * @param {Object[]} recipeBookArray - Array of bookmarked recipe objects.
   * @param {string} dateString - Date corresponding to the panel on which the plus button was clicked (e.g., 'Mon Jan 20 2025').
   * @param {string} meal - Meal type (e.g., 'breakfast', 'lunch', 'dinner', 'snack') corresponding to the meal slot in which the plus button was clicked.
   */
  renderModal(recipeBookArray, dateString, meal) {
    this.#resetModal();
    //Store for access when user hits submit (so meal can be added in correct location)
    super.setModalAttributes(dateString, meal);

    //Generate the recipe book recipe options so the user can add by selecting one
    if (recipeBookArray.length === 0) {
      this.noBookmarkedRecipesErrEl.textContent = "There are currently no recipes in your recipe book. Find recipes and bookmark them to easy add them from here into your calendar.";

      return;
    }
    const recipeMarkup = recipeBookArray.map((recipe) => this.#generateRecipeMarkup(recipe)).join("");
    this.bookmarkedRecipesWindow.innerHTML = recipeMarkup;
  }

  /**
   * Shows the servings input container and the add meal button ( submit button on the modal).
   */
  showServingsContainer() {
    this.servingsContainer.classList.remove("u-invisible");
    this.addMealBtn.classList.remove("u-invisible");
  }

  /**
   * Resets the modal state, clearing content, resetting the custom entry form and hiding the servings input container.
   * The modal is set to its default sub-view, the 'Select from Bookmarked Recipes' sub-view
   * @private
   */
  #resetModal() {
    super.renderRepeatRecipeError("");
    this.noBookmarkedRecipesErrEl.textContent = "";
    this.bookmarkedRecipesWindow.innerHTML = "";
    this.#toggleView(true);
    this.servingsContainer.classList.add("u-invisible");
    this.addMealBtn.classList.add("u-invisible");

    this.customRecipeForm.reset();
  }

  /**
   * Generates markup for a bookmarked recipe button option (that a user can click to select).
   * @param {Object} recipe - The recipe object for the recipe book recipe.
   * @returns {string} Markup string for the recipe button.
   * @private
   */
  #generateRecipeMarkup(recipe) {
    return `
      <button class="select-bookmarked-recipes__bookmarked-recipe" data-id="${recipe.id}">
        <img class="select-bookmarked-recipes__bookmarked-img" src="${recipe.image}" alt="${recipe.title}" />
        <p class="select-bookmarked-recipes__bookmarked-title">${recipe.title}</p>
      </button>`;
  }

  /**
   * Toggles between the 'Select from Bookmarked Recipes' and 'Create Custom Entry' sub-views
   * @param {boolean} isBookmarkedRecipeView - Whether to show the 'Select from Bookmarked Recipes' sub-view.
   * @private
   */
  #toggleView(isBookmarkedRecipeView) {
    if (isBookmarkedRecipeView) {
      this.bookmarkedRecipesSection.classList.remove("u-hidden");
      this.customMealSection.classList.add("u-hidden");
      this.customEntryBtn.classList.remove("modal-window__btn-small--selected");
      this.selectBookmarkedBtn.classList.add("modal-window__btn-small--selected");
    } else {
      this.customMealSection.classList.remove("u-hidden");
      this.bookmarkedRecipesSection.classList.add("u-hidden");
      this.selectBookmarkedBtn.classList.remove("modal-window__btn-small--selected");
      this.customEntryBtn.classList.add("modal-window__btn-small--selected");
    }
  }

  /**
   * Function that becomes necessary when a user hits the submit button to add a recipe to the meal calendar. Retrieves inputs from the 'Select Bookmarked Recipes' sub-view so that recipe selected can be added to the meal slot
   *
   * - Retrieves date and meal attributes so it is known what date and meal slot the meal must be added to on the calendar
   * - Sets the operation to 'add', so the recipe will be added in the meal slot
   * - Retrieves the number of servings of the recipe that the user input/wants added to the meal slot
   * @returns {Object} User inputs, including date, meal, operation, and servings.
   */
  #getBookmarkedRecipeInputs() {
    const { currentDate: date, currentMeal: meal } = super.getCurrentMealStats();
    const operation = "add";
    const numServings = this.servingsInput.value;
    return { date, meal, operation, numServings };
  }

  /**
   * Retrieves inputs from the custom meal entry form.
   * @returns {Object} User inputs, including date, meal name, calories, and macros.
   * @private
   */
  #getCustomEntryInputs() {
    const { currentDate: date, currentMeal: meal } = super.getCurrentMealStats();
    const mealName = getInputValue(".custom-entry-form__meal-name-input", this.parentEl).replace(/^\w/, (c) => c.toUpperCase());
    const mealCalories = getInputValue(".custom-entry-form__meal-calories-input", this.parentEl);
    const mealProtein = getInputValue(".custom-entry-form__meal-protein", this.parentEl);
    const mealCarbs = getInputValue(".custom-entry-form__meal-carbs", this.parentEl);
    const mealFats = getInputValue(".custom-entry-form__meal-fats", this.parentEl);

    return { date, meal, mealName, mealCalories, mealProtein, mealCarbs, mealFats };
  }

  #getIDAndSource(recipe) {
    const recipeId = Number(recipe.dataset.id);
    const source = "recipeBook";

    return { recipeId, source };
  }

  /**
   * Adds a click event listener to switch to the 'Select from Bookmarked Recipes' sub-view.
   */
  addHandlerBookmarkedRecipesBtn() {
    this.selectBookmarkedBtn.addEventListener("click", () => {
      this.#toggleView(true);
    });
  }

  /**
   * Adds a click event listener to switch to the 'Create Custom Entry' subview.
   */
  addHandlerCustomEntryBtn() {
    this.customEntryBtn.addEventListener("click", () => {
      this.#toggleView(false);
    });
  }

  /**
   * Adds a click event listener to handle recipe selection in the 'Select from Bookmarked Recipes' sub-view.
   * @param {Function} handler - Callback function for handling recipe selection.
   */
  addHandlerRecipeOptionContainer(handler) {
    this.bookmarkedRecipesWindow.addEventListener("click", (e) => {
      //Store which bookmarked recipe was selected, return if none were clicked
      const clickedRecipe = e.target.closest(".select-bookmarked-recipes__bookmarked-recipe");
      if (!clickedRecipe) return;

      //Deselect all the bookmarked recipe options
      const recipeBookOptions = this.parentEl.querySelectorAll(".select-bookmarked-recipes__bookmarked-recipe");
      recipeBookOptions.forEach((recipeOption) => recipeOption.classList.remove("select-bookmarked-recipes__bookmarked-recipe--selected"));

      //Mark the clciked bookmarked recipe as selected (green border)
      clickedRecipe.classList.add("select-bookmarked-recipes__bookmarked-recipe--selected");

      //Provide recipeId and source to the handler (handler adds recipe to plan)
      const { recipeId, source } = this.#getIDAndSource(clickedRecipe);
      handler(recipeId, source);
    });
  }

  /**
   * Adds a submit event listener to handle adding a bookmarked recipe to the meal plan when the 'Add Meal' button is clicked in the 'Select from Bookmarked Recipes' sub-view.
   * @param {Function} handler - Callback function for handling the submission.
   */
  addHandlerAddMealBtn(handler) {
    this.bookmarkedRecipesForm.addEventListener("submit", (e) => {
      if (!this.bookmarkedRecipesForm.checkValidity()) return;

      e.preventDefault();
      const userInputs = this.#getBookmarkedRecipeInputs();
      const selectedRecipe = this.parentEl.querySelector(".select-bookmarked-recipes__bookmarked-recipe--selected");

      const { recipeId, source } = this.#getIDAndSource(selectedRecipe);

      //Pass all information necessary in order for the handler to add the meal in the correct spot on the calendar and update the model state)
      handler(recipeId, userInputs, { source });
    });
  }

  /**
   * Adds a submit event listener to handle adding a custom meal entry to the meal plan when the 'Save Meal' button is clicked in the 'Create Custom Entry' sub-view.
   * @param {Function} handler - Callback function for handling the submission.
   */
  addHandlerSaveMealBtn(handler) {
    this.customRecipeForm.addEventListener("submit", (e) => {
      if (!this.customRecipeForm.checkValidity()) return;

      e.preventDefault();
      //Get the details of the custom meal entry to be added as long as which meal slot it should be added to
      const customEntryInputs = this.#getCustomEntryInputs();
      //handler adds the custom meal entry to the planner
      handler(customEntryInputs);
    });
  }
}

export default new AddMealToSlotModal();
