/**
 * @fileoverview Controller for managing interactions and functionality related to the meal planner.
 *
 * Responsibilities:
 * - Handles updates to the calendar view, including rendering the current week and updating meal plan details.
 * - Manages meal removal and meal entry functionalities for the meal planner.
 * - Delegates to various helper functions for updating the model and the UI.
 *
 * Dependencies:
 * - mealPlanView: Provides the UI interactions and rendering for the meal planner.
 * - modalUtils: Provides modal management functions for adding recipes to the planner and opening recipe modals.
 * - mealPlanUtils: Provides functions for updating meal plan data and UI for specific days and weeks.
 * - sharedUtils: Provides utility functions such as creating sorted date arrays.
 */

import * as model from "../model/index.js";

//Import view instance
import MealPlanView from "../views/mainViews/mealPlanView.js";

//Import utilities
import { controlOpenAddMealToSlotModal, controlOpenAddRecipeModal, controlOpenRecipeDetailsModal } from "./controllerUtils/highLevel/modalUtils.js";
import { updateMealPlanDay, updateMealPlanWeek } from "./controllerUtils/featureSpecific/mealPlanUtils.js";
import { createSortedDateStrArr } from "../sharedUtils.js";

/**
 * Updates the calendar view when the user navigates through the weeks using the slider on the UI
 * - Updates the current calendar week in state if applicable (if user pressed forward or backward on slider)
 * - Render week dates, nutrition dropdown, and meals on day panels in planner for the new week
 *
 * @param {string} direction - The direction to update the calendar ('nextWeek' or 'previousWeek').
 */
const controlUpdateCalendarView = function (direction) {
  //Update the current calendar week in the model state
  if (direction) model.updateSliderWeek(direction);

  //Render the new calendar week (Monday) in the week slider
  MealPlanView.renderWeekSlider(model.state.mealCalendarWeek);

  //Update the dates on the week day panels
  updateWeekDates(model.state.mealCalendarWeek);

  //Update meals and nutrition for all day panels
  updateMealPlanWeek(model.state.mealCalendarWeek);
};

/**
 * Removes a recipe from the meal plan for a specific day and meal slot.
 * Re-renders the calendar view for just the modified day.
 *
 * @param {number} recipeId - The ID of the recipe to remove.
 * @param {Object} options - Contains the date and meal information for the removal.
 * @param {string} options.dayDateString - The date (e.g., 'Mon Jan 20 2025') from which the recipe should be removed.
 * @param {string} options.meal - The meal slot (e.g., 'lunch', 'dinner') from which the recipe is removed.
 */
const controlRemoveMealEntry = function (recipeId, { dayDateString, meal }) {
  //Remove the recipe from the meal plan in the model state
  model.deleteRecipeFromMealPlan(recipeId, dayDateString, meal);
  //Re-render the calendar view (day panel) for just the modified day
  updateMealPlanDay(dayDateString);
};

//HELPER FUNCTIONS

/**
 * Updates the displayed dates for each weekday in the meal planner UI.
 *
 * @param {string} firstDayOfWeek - The first date of the  week to display (e.g., 'Mon Jan 20 2025').
 * When the user uses the week slider to adjust the week, this function renders the new dates for the new week (Monday through Friday)
 * @private
 */
const updateWeekDates = function (firstDayOfWeek) {
  const weekObject = model.state.mealPlan[firstDayOfWeek];
  const weekDays = createSortedDateStrArr(weekObject).slice(0, 5);
  const domWeekDays = MealPlanView.getWeekDays();
  weekDays.forEach((weekDay, index) => {
    MealPlanView.renderWeekDate(weekDays[index], domWeekDays[index]);
  });
};

//VIEW INITIALIZATION

/**
 * Initializes the Meal Plan View by attaching event handlers for user interactions with the meal planner.
 *
 * Event handlers:
 * - `controlUpdateCalendarView`: Updates the calendar view when navigating between weeks using the slider.
 * - `controlOpenAddMealToSlotModal`: Opens the Add Meal To Slot Modal when the plus button is clicked for a meal slot in the calendar.
 * - `controlOpenAddRecipeModal`: Opens the Add Recipe Modal when the move button (arrow icon) is clicked on a meal entry in  the calendar.
 * - `controlRemoveMealEntry`: Removes a recipe from the meal plan when the remove button is clicked on a meal entry in the calendar.
 * - `controlOpenRecipeDetailsModal`: Opens the Recipe Details Modal when a meal entry is clicked in the calendar.
 */
export const init = function () {
  controlUpdateCalendarView(); //Part of app initialization
  MealPlanView.addHandlerWeekSlider(controlUpdateCalendarView);
  MealPlanView.addHandlerCalendarBtns(controlOpenAddMealToSlotModal, controlOpenAddRecipeModal, controlRemoveMealEntry, controlOpenRecipeDetailsModal);
};
