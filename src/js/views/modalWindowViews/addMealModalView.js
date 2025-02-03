/**
 * @fileoverview AddMealModalView serves as a parent class for modal views related to adding meals to the planner.
 * It includes functionality for managing meal attributes, servings adjustments, and rendering errors, common to both the Add Meal To Slot Modal and the Add Recipe Modal.
 * Extends ModalView for shared modal functionality.
 */

import ModalView from "./ModalView.js";

class AddMealModalView extends ModalView {
  /**
   * Sets data attributes for the currentDate and currentMeal
   * This function is used when trying to move a recipe in the meal plan from one slot to another. the currentDate stores the current date where the meal is located and the currentMeal stores the meal slot it is currently in
   * .
   * @param {string} dateString - The date in string format (e.g., 'Mon Jan 20 2025').
   * @param {string} meal - The meal type (e.g., breakfast, lunch, dinner).
   */
  setModalAttributes(dateString, meal) {
    this.parentEl.setAttribute("data-currentdate", dateString);
    this.parentEl.setAttribute("data-currentmeal", meal);
  }

  //Fetches the currentDate and currentMeal that were stored in the setModalAttrubutes function
  getCurrentMealStats() {
    const { currentdate: currentDate, currentmeal: currentMeal } = this.parentEl.dataset;
    return { currentDate, currentMeal };
  }

  /**
   * Renders an error message for when a user tries to add a recipe that already exists in the selected meal slot.
   * @param {string} message - The error message to display.
   */
  renderRepeatRecipeError(message) {
    const errorField = this.parentEl.querySelector(".error-message--repeat-recipe");
    errorField.textContent = message;
  }

  /**
   * Set default value in servings and macros field on the modal based on values in the recipe object.
   * Stores the defaul servings value in a data attribute so that when the user adjusts the servings input, the new macro values can be calculated using the ratio of new servings/initial servings.
   *
   * @param {Object} recipeDetailsObject - Contains initial servings and macro values (calories, protein, carbs, fats).
   */
  setInitialServings(recipeDetailsObject) {
    const { initServings, initCalories, initProtein, initCarbs, initFats } = recipeDetailsObject;

    this.setDataAttribute(this.servingsInput, "initservings", initServings);
    this.setElementValue(this.servingsInput, initServings);

    const nutrients = {
      calories: initCalories,
      protein: initProtein,
      carbs: initCarbs,
      fats: initFats,
    };

    Object.entries(nutrients).forEach(([key, value]) => {
      this.setDataAttribute(this[key], `init${key}`, value);
      const unit = key === "calories" ? "" : "grams";
      this.setElementValue(this[key], `${Math.round(value)} ${unit}`);
    });
  }

  /**
   * Adds an input event listener to the servings input field to dynamically update macro values.
   * Adjusts macro values proportionally based on the new number of servings when the user adjusts the input.
   * The initial servings stored in the dataset is referenced to do the calculations
   */
  addHandlerServingsInput() {
    this.servingsInput.addEventListener("input", () => {
      const initServings = this.servingsInput.dataset.initservings;
      const initCalories = this.calories.dataset.initcalories;
      const initProtein = this.protein.dataset.initprotein;
      const initCarbs = this.carbs.dataset.initcarbs;
      const initFats = this.fats.dataset.initfats;

      const newServings = Number(this.servingsInput.value);

      if (!newServings || newServings <= 0) {
        this.updateMacros(0, 0, 0, 0);
        return;
      }

      const multiplier = newServings / Number(initServings);

      this.updateMacros(this.calculateMacro(multiplier, initCalories), this.calculateMacro(multiplier, initProtein), this.calculateMacro(multiplier, initCarbs), this.calculateMacro(multiplier, initFats));
    });
  }

  /**
   * Sets a data attribute for a given element.
   * @param {HTMLElement} element - The target element.
   * @param {string} attributeName - The name of the data attribute.
   * @param {string|number} value - The value to set for the attribute.
   */
  setDataAttribute(element, attributeName, value) {
    element.setAttribute(`data-${attributeName}`, value);
  }

  /**
   * Updates the value of an element, supporting both input and non-input elements.
   * @param {HTMLElement} element - The target element.
   * @param {string|number} value - The value to set.
   */
  setElementValue(element, value) {
    if (element.tagName === "INPUT") {
      element.value = value;
    } else {
      element.textContent = value;
    }
  }

  //Updates the macro values (calories, protein, carbs, fats) in the modal.
  updateMacros(calories, protein, carbs, fats) {
    this.calories.textContent = calories;
    this.protein.textContent = `${protein} grams`;
    this.carbs.textContent = `${carbs} grams`;
    this.fats.textContent = `${fats} grams`;
  }

  /**
   * Calculates a macro value based on a multiplier and an initial value.
   * @param {number} multiplier - The multiplier to apply.
   * @param {number} initialValue - The initial macro value.
   * @returns {number} The calculated macro value, rounded to the nearest integer.
   */
  calculateMacro(multiplier, initialValue) {
    return Math.round(multiplier * Number(initialValue));
  }
}

export default AddMealModalView;
