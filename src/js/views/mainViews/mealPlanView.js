/**
 * @fileoverview MealPlanView manages the UI interactions for the meal planner page.
 * It handles rendering the calendar, meals, and nutrition data, as well as event listeners for
 * user actions like adding, moving, and removing meals, and navigating weeks.
 */
import BaseView from "./BaseView.js";

import * as sharedUtils from "../../sharedUtils.js";

class MealPlanView extends BaseView {
  /**
   * Creates an instance of MealPlanView.
   * @extends BaseView
   */
  constructor() {
    super(document.querySelector(".meal-planner"));
  }

  getWeekDays() {
    return this.parentEl.querySelectorAll(".meal-planner__date");
  }

  /**
   * Renders the week slider text for the given date.
   * @param {string} dateString - The date to render in the week slider (e.g., 'Mon Jan 20 2025').
   */
  renderWeekSlider(dateString) {
    const formattedDate = sharedUtils.formatDateStringForSlider(dateString);
    const weekSlider = this.parentEl.querySelector(".week-selection__text");
    weekSlider.textContent = `Week of ${formattedDate}`;
  }

  /**
   * Updates the date displayed on a specific day element in the calendar.
   * @param {string} dateString - The date string to display (e.g., 'Mon Jan 20 2025').
   * @param {HTMLElement} element - The element to update.
   */
  renderWeekDate(dateString, element) {
    element.closest(".meal-planner__day-panel").setAttribute("data-dateString", dateString);
    element.textContent = sharedUtils.formatWeekDateForCalendar(dateString);
  }

  /**
   * Updates the nutrition dropdown for a specific day panel in the UI.
   * @param {string} dayDateString - The date string for the day to update (e.g., 'Mon Jan 20 2025').
   * @param {Object} nutritionObject - An object containing nutritional values (e.g., calories, protein, fats, carbs).
   */
  updateNutritionDropdown(dayDateString, nutritionObject) {
    const dayPanel = this.#getDayPanel(dayDateString);

    Object.keys(nutritionObject).forEach((macro) => {
      const macroEl = dayPanel.querySelector(`.meal-planner__daily-nutrition-total--${macro}`);
      macroEl.textContent = Math.round(nutritionObject[macro]);
    });
  }

  /**
   * Updates the meals displayed for a specific day.
   * @param {string} dayDateString - The date string for the day to update (e.g., 'Mon Jan 20 2025').
   * @param {Object} mealsObject - An object containing meal times (e.g., 'lunch') as keys and recipes as values.
   */
  updateDayMeals(dayDateString, mealsObject) {
    const dayPanel = this.#getDayPanel(dayDateString);

    for (const [mealTime, recipes] of Object.entries(mealsObject)) {
      const mealEntryContainer = dayPanel.querySelector(`.meal-planner__${mealTime}-meals`);
      mealEntryContainer.innerHTML = "";
      recipes.forEach((recipe) => {
        const mealEntryMarkup = this.#generateMealEntryMarkup(recipe);
        mealEntryContainer.insertAdjacentHTML("beforeend", mealEntryMarkup);
      });
    }
  }

  /**
   * Retrieves the day panel for a specific date.
   * @param {string} dayDateString - The date string for the day (e.g., 'Mon Jan 20 2025').
   * @returns {HTMLElement} The day panel element.
   * @private
   */
  #getDayPanel(dayDateString) {
    const dayOfWeek = dayDateString.split(" ")[0];
    return this.parentEl.querySelector(`.meal-planner__day-panel[data-day="${dayOfWeek}"]`);
  }

  //Gets data regarding a meal entry in the planner
  #getMealEntryData(mealEntry) {
    const dayPanel = mealEntry.closest(".meal-planner__day-panel");
    const mealSection = mealEntry.closest(".meal-planner__meal-section");

    const recipeId = Number(mealEntry.dataset.id);
    const source = "mealPlan";

    //Track current location (date and meal slot) of clicked meal entry so we can move or delete it
    const currentDate = dayPanel.dataset.datestring;
    const currentMeal = mealSection.dataset.meal;

    return { recipeId, source, currentDate, currentMeal };
  }

  /**
   * Generates the HTML markup for a meal entry in the calendar.
   * @param {Object} recipe - The recipe object containing details for the meal.
   * @returns {string} The HTML markup for the meal entry.
   * @private
   */
  #generateMealEntryMarkup(recipe) {
    const macroMarkup = recipe.origin === "customMealEntry" ? this.#generateMacroMarkup(recipe) : "";
    return `
    <li class="meal-planner__meal-entry ${recipe.origin === "customMealEntry" ? "meal-planner__meal-entry--custom no-hover" : ""}" data-id="${recipe.id}">
      <div class="meal-planner__action-btns">
        <button class="u-icn-btn meal-planner__move-entry-btn" aria-label="Move meal">
          <i class="bi bi-arrow-right-short meal-planner__move-entry-icn"></i>
        </button>
        <button class="u-icn-btn meal-planner__remove-entry-btn" aria-label="Remove meal">&times;</button>
      </div>
        <img class="meal-planner__meal-entry-img" src="${recipe.image}" alt="${recipe.title}" />
        <div class=meal-planner__meal-entry-details>
          <button class="meal-planner__meal-entry-title">${recipe.title}</button>
          ${macroMarkup}
        </div>
    </li>`;
  }

  /**
   * Generates the HTML markup for macro details within the meal entry HTML markup.
   * @param {Object} recipe - The recipe object containing macro details.
   * @returns {string} The HTML markup for the macro details.
   * @private
   */
  #generateMacroMarkup(recipe) {
    return `
    <div class="meal-planner__entry-macros">
      <p class="meal-planner__entry-detail">Cal: ${Math.round(recipe.calories)}</p>
      <p class="meal-planner__entry-detail">P: ${Math.round(recipe.protein)}g</p>
      <p class="meal-planner__entry-detail">C: ${Math.round(recipe.carbs)}g</p>
      <p class="meal-planner__entry-detail">F: ${Math.round(recipe.fats)}g</p>
    </div>`;
  }

  /**
   * Toggles the visibility of a nutrition dropdown.
   * @param {HTMLElement} nutritionDropdown - The dropdown element to toggle.
   * @private
   */
  #toggleNutritionDropdown(nutritionDropdown) {
    const container = nutritionDropdown.closest(".meal-planner__daily-nutrition-container");
    container.classList.toggle("meal-planner__daily-nutrition-container--open");
  }

  /**
   * If any of the plus buttons on any meal slot are clicked, open the Add Meal To Slot Modal
   * Stores the date and meal slot in which the plus icon was clicked, so the recipe can be added in the correct location
   * @param {HTMLElement} addEntryBtn - The plus button element that was clicked
   * @param {Function} addEntryHandler - callback that runs when a plus button is clicked (pulls up Add Meal To Slot Modal so a recipe can be chosen to be added in the given slot)
   * @private
   */
  #handleAddEntry(addEntryBtn, addEntryHandler) {
    const dayPanel = addEntryBtn.closest(".meal-planner__day-panel");
    const mealSection = addEntryBtn.closest(".meal-planner__meal-section");

    const dayDateString = dayPanel.dataset.datestring;
    const meal = mealSection.dataset.meal;

    addEntryHandler({ dayDateString, meal });
  }

  /**
   *Handles clicks inside a meal entry on the calendar

   
   * @param {Event} e - The click event that was registered
   * @param {HTMLElement} mealEntry - The meal entry inside which a click event was registered
   * @param {Function} moveMealHandler - callback for opening the Add Recipe Modal so recipe can be moved to new location in planner
   * @param {Function} removeMealHandler - callback for removing a meal from the calendar
   * @param {Function} openModalHandler - callback for pulling up the Recipe Details Modal
   * @returns
   */
  #handleMealEntryClick(e, mealEntry, moveMealHandler, removeMealHandler, openModalHandler) {
    const { recipeId, source, currentDate, currentMeal } = this.#getMealEntryData(mealEntry);
    //If the move button (arrow icon) on the meal entry was clicked
    const moveBtn = e.target.closest(".meal-planner__move-entry-btn") || e.target.closest(".meal-planner__move-entry-icn");
    if (moveBtn) {
      moveMealHandler(recipeId, { source, currentDate, currentMeal });
      return;
    }

    //If the remove button ('x' icon) on the meal entry was clicked
    const removeBtn = e.target.classList.contains("meal-planner__remove-entry-btn");
    if (removeBtn) {
      removeMealHandler(recipeId, { dayDateString: currentDate, meal: currentMeal });
      return;
    }

    //In all other cases (a general click on the meal entry), open the Recipe Details Modal by running the openModalHandler
    openModalHandler(recipeId, false, { source, currentDate, currentMeal });
  }

  /**
   * Adds click event listeners for the calendar's interactive buttons.
   * @param {Function} addEntryHandler - Callback for adding a meal entry from the 'plus' button.
   * @param {Function} moveMealHandler - Callback for moving a meal entry.
   * @param {Function} removeMealHandler - Callback for removing a meal entry.
   * @param {Function} openModalHandler - Callback for opening the Recipe Details Modal.
   */
  addHandlerCalendarBtns(addEntryHandler, moveMealHandler, removeMealHandler, openModalHandler) {
    const mealCalendar = this.parentEl.querySelector(".meal-planner__calendar");

    //Adds event handler to entire meal calendar, then uses event delegation to figure out what was clicked and what action should be taken
    mealCalendar.addEventListener("click", (e) => {
      //If a nutrition dropdown was clicked, open the dropdown if it was closed/close it if it was open
      const nutritionDropdown = e.target.closest(".meal-planner__daily-nutrition-dropdown");
      if (nutritionDropdown) {
        this.#toggleNutritionDropdown(nutritionDropdown);
        return;
      }
      //If any of the plus buttons on any meal slot are clicked, open the Add Meal To Slot Modal
      const addEntryBtn = e.target.closest(".add-entry-btn");
      if (addEntryBtn) {
        this.#handleAddEntry(addEntryBtn, addEntryHandler);
        return;
      }

      //If anything inside the meal entry itself was clicked
      const mealEntry = e.target.closest(".meal-planner__meal-entry");
      if (mealEntry) {
        this.#handleMealEntryClick(e, mealEntry, moveMealHandler, removeMealHandler, openModalHandler);
        return;
      }

      return;
    });
  }

  /**
   * Adds click event listeners to the week slider navigation arrows.
   * @param {Function} handler - Callback for navigating weeks (next/previous).
   */
  addHandlerWeekSlider(handler) {
    const weekSlider = this.parentEl.querySelector(".week-selection");

    weekSlider.addEventListener("click", (e) => {
      const clickedArrow = e.target.closest(".week-selection__arrow-btn");
      if (!clickedArrow) return;

      const direction = clickedArrow.classList.contains("week-selection__arrow-btn--previous") ? "previousWeek" : "nextWeek";
      handler(direction);
    });
  }
}

export default new MealPlanView();
