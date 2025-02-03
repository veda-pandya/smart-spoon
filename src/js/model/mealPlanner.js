/**
 * @fileoverview Manages meal planning functionality, including adding, removing, and updating recipes in the meal plan.
 * Handles custom meal entries, updating weekly and daily nutrition data, and saving the meal plan to localStorage.
 *
 * Dependencies:
 * - `state`: The application's central state object.
 * - `Recipe` class: For creating recipe objects.
 * - Utilities:
 *   - `getRecipe`, `getDayMealPlan`, `getMondayOfTheWeek` from `modelUtils.js`
 *   - `adjustServings` from `servingsUtils.js`
 *   - `createSortedDateStrArr`, `generateUniqueId` from `sharedUtils.js`
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

//Import application state
import { state } from "./state.js";

//Import Recipe class
import Recipe from "./RecipeClass.js";

//Import utilities
import { getRecipe, getDayMealPlan, getMondayOfTheWeek } from "./modelUtils/highLevel/modelUtils.js";
import { adjustServings } from "./modelUtils/featureSpecific/servingsUtils.js";
import { createSortedDateStrArr, generateUniqueId, deepCopy } from "../sharedUtils.js";

//UPDATE CALENDAR WEEK

/**
 * Updates the current meal planner week by navigating to the previous or next week depending on if the user clicked the next or previous arrow on the week slider.
 *
 * @param {string} direction - The direction to navigate (`"previousWeek"` or `"nextWeek"`).
 */
export const updateSliderWeek = function (direction) {
  //put all the week keys (plus and minus 4 weeks from current week) in an array and sort in ascending order (Ex: ["Mon Dec 16 2024", "Mon Dec 23 2024", "Mon Dec 30 2024"...])
  const weekKeys = createSortedDateStrArr(state.mealPlan);
  //Get index of the current week dateString from the array
  const currentIndex = weekKeys.indexOf(state.mealCalendarWeek);
  const directionModifier = direction === "previousWeek" ? -1 : 1;
  //Get new Monday week key based on if the user selected 'next' or 'previous'
  const newIndex = currentIndex + directionModifier;
  if (newIndex >= 0 && newIndex < weekKeys.length) {
    state.mealCalendarWeek = weekKeys[newIndex];
  }
};

//ADD, REMOVE, AND MOVE RECIPE IN MEAL PLAN

/**
 * Adds a recipe to the meal plan for a specific day and meal.
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.
 *
 * @param {number} recipeId - The ID of the recipe to add.
 * @param {Object} userInputs - User inputs specifying the date, meal, and operation.
 * @param {string} userInputs.date - The date to add the recipe to.
 * @param {string} userInputs.meal - The meal time to add the recipe to (e.g., "breakfast").
 * @param {string} userInputs.operation - The operation type (`"replace"` the current meal in that slot or `"add"` to the meal in the slot).
 * @param {number} userInputs.numServings - The number of servings of the recipe the user wants to add to the meal plan.
 * @param {Object} options - Used to locate a recipe in the model
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.
 */
export const addRecipeToMealPlan = function (recipeId, userInputs, { source, currentDate = null, currentMeal = null }) {
  //Destructure user inputs
  const { date, meal, operation, numServings } = userInputs;
  //Get the meal plan for the day the user wants to add the meal to
  const { weekKey, dayMealPlan } = getDayMealPlan(date);
  //Get the recipe that the user wants to add from the state
  const recipe = getRecipe(recipeId, { source, currentDate, currentMeal });

  // Clone the recipe to avoid mutating the original object
  const recipeCopy = deepCopy(recipe);

  //Clear other meals in the meal slot if the user selected 'replace'
  if (operation === "replace") dayMealPlan.meals[meal] = [];

  //Add a copy of the fetched recipe into the meal plan
  dayMealPlan.meals[meal].push(recipeCopy);

  //No servings adjustment required if user is adding a custom entry
  if (recipeCopy.origin !== "customMealEntry") {
    //Adjust the servings of the newly added recipe in the meal plan to the number of servings input by the user
    adjustServings(recipeCopy.id, null, { source: "mealPlan", currentDate: date, currentMeal: meal }, numServings);
  }

  //Update the nutrition since a recipe was added. Save the changes to the meal plan
  updateNutritionForWeek(weekKey);
  saveMealPlan();

  //If the source was meal plan, it means the user was moving a recipe from one slot to another. So add the recipe to the new slot and delete it from the previous slot.
  if (source === "mealPlan") {
    deleteRecipeFromMealPlan(recipeId, currentDate, currentMeal);
  }
};

/**
 * Deletes a recipe from the meal plan.
 *
 * @param {number} recipeId - The ID of the recipe to delete.
 * @param {string} dayDateString - The date from which to delete the recipe in the meal plan (e.g., 'Mon Jan 20 2025').
 * @param {string} mealTime - The meal time (e.g., "breakfast") to delete the recipe from.
 */
export const deleteRecipeFromMealPlan = function (recipeId, dayDateString, mealTime) {
  const { weekKey, dayMealPlan } = getDayMealPlan(dayDateString);

  const recipeToDeleteIndex = dayMealPlan.meals[mealTime].findIndex((meal) => meal.id === recipeId);
  dayMealPlan.meals[mealTime].splice(recipeToDeleteIndex, 1);

  updateNutritionForWeek(weekKey);
  saveMealPlan();
};

// ADD CUSTOM MEAL ENTRY TO MEAL PLAN

/**
 * Creates a custom meal entry and adds it to the meal plan.
 *
 * @param {Object} customEntryInputsObject - The details of the custom meal entry the user wants to add.
 * @param {string} customEntryInputsObject.date - The date in the meal plan to which the user wants to add the  custom meal entry (e.g., 'Mon Jan 20 2025').
 * @param {string} customEntryInputsObject.meal - The meal time (e.g., "lunch") to which the user wants to add the custom entry.
 * @param {string} customEntryInputsObject.mealName - The name of the custom meal.
 * @param {number} customEntryInputsObject.mealCalories - The calorie count of the custom meal.
 * @param {number} customEntryInputsObject.mealProtein - The protein content (grams) of the custom meal.
 * @param {number} customEntryInputsObject.mealCarbs - The carbohydrate content (grams) of the custom meal.
 * @param {number} customEntryInputsObject.mealFats - The fat content (grams) of the custom meal.
 */
export const createCustomMealEntry = function (customEntryInputsObject) {
  //Get the date and meal where the user wants to place the custom entry
  const { date, meal } = customEntryInputsObject;
  //Access the meal plan for that date
  const { weekKey, dayMealPlan } = getDayMealPlan(date);
  //Create a recipe object for the custom meal
  const customEntryRecipe = createCustomRecipeObject(customEntryInputsObject);
  //Add the custom meal to the meal plan
  dayMealPlan.meals[meal].push(customEntryRecipe);
  //Update nutrition and save changes
  updateNutritionForWeek(weekKey);
  saveMealPlan();
};

/**
 *Creates a custom recipe object for the custom meal entry details input by the user. 
 *The Recipe class is used to create the recipe object

 *For a custom meal entry, the only details needed are meal title, Id, calories and macros. Custom meal entries are things like "Leftovers" or "Ate out"

 * @param {*} customEntryInputsObject - The details of the custom meal entry the user wants to add to the meal plan
 * @returns {Recipe} - A `Recipe` object to represent the custom meal.
 * 
 * @private
 */

const createCustomRecipeObject = function (customEntryInputsObject) {
  const { mealName, mealCalories, mealProtein, mealCarbs, mealFats } = customEntryInputsObject;

  return new Recipe(
    mealName,
    "images/custom-recipe-image.avif",
    generateUniqueId(),
    false,
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    +mealCalories,
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    +mealProtein,
    +mealFats,
    +mealCarbs,
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "Unavailable",
    "N/A",
    "customMealEntry"
  );
};

//GET DAY MEAL TITLES

/**
 * Collects the titles of all meals for a given day, grouped by meal time.
 *
 * @param {string} dayDateString - The date to retrieve meal titles for (e.g., 'Mon Jan 20 2025').
 * @returns {Object} An object where keys are meal times (e.g., "breakfast") and values are meal titles in that meal slot.
 */
export const getMealTimeRecipeNames = function (dayDateString) {
  const { dayMealPlan } = getDayMealPlan(dayDateString);

  const { meals, nutrition } = dayMealPlan;

  return Object.keys(meals).reduce((mealEntryNames, mealTime) => {
    mealEntryNames[mealTime] = meals[mealTime].length ? meals[mealTime].map((recipe) => recipe.title).join(", ") : "None";
    return mealEntryNames;
  }, {});
};

//HELPER FUNCTIONS

/**
 * Updates the nutrition data for a given week.
 *
 * @param {string} mondayOfWeekDateString - The date string of the week's Monday (e.g., 'Mon Jan 20 2025').
 * @private
 */
const updateNutritionForWeek = function (mondayOfWeekDateString) {
  const weekPlan = state.mealPlan[mondayOfWeekDateString];
  for (const day in weekPlan) {
    updateNutritionForDay(day);
  }
};

/**
 * Updates the nutrition data for a specific day.
 * Loops though each recipe on the day and adds up the total calories, protein, carbs, and fats
 *
 * @param {string} dayDateString - The date string of the day to update nutrition for (e.g., 'Mon Jan 20 2025').
 */
export const updateNutritionForDay = function (dayDateString) {
  const { dayMealPlan } = getDayMealPlan(dayDateString);

  const { meals, nutrition } = dayMealPlan;

  // Reset the nutrition object
  Object.keys(nutrition).forEach((key) => (nutrition[key] = 0));

  for (const mealType in meals) {
    meals[mealType].forEach((recipe) => {
      nutrition.calories += recipe.calories;
      nutrition.protein += recipe.protein;
      nutrition.carbs += recipe.carbs;
      nutrition.fats += recipe.fats;
    });
  }
};

//Saves the meal plan to localStorage.
export const saveMealPlan = function () {
  localStorage.setItem("mealPlan", JSON.stringify(state.mealPlan));
};

/**
 * Retrieves the IDs of all recipes in a specific meal slot.
 *
 * @param {string} dateString - The date of the meal slot (e.g., 'Mon Jan 20 2025').
 * @param {string} meal - The meal time (e.g., "dinner").
 * @returns {Array<number>} An array of recipe IDs in the specified meal slot.
 */
export const mealsInMealSlot = function (dateString, meal) {
  const mondayOfWeek = getMondayOfTheWeek(dateString).toDateString();
  const mealsArray = state.mealPlan[mondayOfWeek][dateString].meals[meal];
  return mealsArray.map((recipe) => recipe.id);
};
