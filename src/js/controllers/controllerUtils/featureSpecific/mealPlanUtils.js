/**
 * @fileoverview Utility functions for updating and rendering the MealPlanView.
 *
 * Dependencies:
 * - model: Provides access to the application state and nutrition calculations.
 * - mealPlanView: Handles UI updates for the MealPlanView.
 * - sharedUtils: Provides utility functions like sorting date strings.
 */

import * as model from "../../../model/index.js";

//Import view instances
import MealPlanView from "../../../views/mainViews/mealPlanView.js";

//Import utilities
import { createSortedDateStrArr } from "../../../sharedUtils.js";

/**
 * Recalculates nutrition totals for a specific day in the model and updates the UI.
 *
 * @param {string} dateString - The date string of the day to update (e.g., 'Mon Jan 20 2025').
 */
export const updateMealPlanDayUI = function (dateString) {
  model.updateNutritionForDay(dateString); // Recalculate nutrition totals for the day in the model
  model.saveMealPlan(); //Save the updated meal plan state
  updateMealPlanDay(dateString); // Update the day in the UI to reflect updated nutrition in dropdown
};

/**
 * Updates the meal plan UI for an entire week.
 * - Calculates all dates in the week starting from the given Monday.
 * - Updates the UI for each day in the week.
 *
 * @param {string} mondayOfWeekDateString - The date string of the Monday to start the week (e.g., 'Mon Jan 20 2025').
 */
export const updateMealPlanWeek = function (mondayOfWeekDateString) {
  //Get the 5 days of the week starting with the monday passed in to the function
  const daysOfWeek = createSortedDateStrArr(model.state.mealPlan[mondayOfWeekDateString]).slice(0, 5);
  //For each week day, update the  day panel on the meal plan UI (meals and nutriton dropdown)
  daysOfWeek.forEach((day) => updateMealPlanDay(day));
};

/**
 * Updates the UI for a single day in the meal planner.
 * - Retrieves meal and nutrition data for the day from the model.
 * - Renders the updated data in the MealPlanView.
 *
 * @param {string} dayDateString - The date string of the day to update (e.g., 'Mon Jan 20 2025').
 */
export const updateMealPlanDay = function (dayDateString) {
  const { dayMealPlan } = model.getDayMealPlan(dayDateString); //Get the day's meal plan from model
  const { meals, nutrition } = dayMealPlan; // Extract meals and nutrition data
  //Update nutrition totals in the dropdown and render the meals for the day
  MealPlanView.updateNutritionDropdown(dayDateString, nutrition);
  MealPlanView.updateDayMeals(dayDateString, meals);
};
