/**
 * @fileoverview Initializes the reipe book array and meal plan object in the application state, when the app first loads.
 *
 * Retrives the saved recipe book array from local storage and sets it as the recipe book in the application state (user's bookmarked recipes are persistent across sessions),
 *
 * Initializes a meal plan for a date range of 9 weeks (4 weeks prior, current week, and 4 weeks in the future). Retrieves the saved meal plan from local storage and populated the state with parts that apply to the current date range. Initializes new weekly plans for any weeks unavailable in local storage.
 *
 * Dependencies:
 * - `state`: The application's central state object.
 * - Utility function from `modelUtils.js`:
 *   - `getMondayOfTheWeek`: Calculates the Monday of a given week.
 */

//Import application state
import { state } from "./state.js";

//Import utilities
import { getMondayOfTheWeek } from "./modelUtils/highLevel/modelUtils.js";

//RECIPE BOOK INITIALIZATION

/**
 * Initializes the recipe book by loading saved data from localStorage.
 * If no saved data exists, initializes an empty recipe book.
 */
export const initializeRecipeBook = function () {
  const savedRecipeBook = JSON.parse(localStorage.getItem("recipeBook"));
  state.recipeBook = savedRecipeBook ? savedRecipeBook : [];
};

//MEAL PLAN INITIALIZATION

/**
 * The `initializeMealPlan` function, in conjunction with `createWeeklyMealPlan` and `createEmptyMealObj`,
 * generates a `mealPlan` object stored in the `state`. Below is an example structure of the meal plan:
 *
 * Example meal plan object:
 * {
 *   "Mon Jan 13 2025": { // Week starting from Monday
 *     "Mon Jan 13 2025": { // Daily meal plan for Monday
 *       meals: {
 *         breakfast: [],   // Array of meal entries for breakfast
 *         lunch: [],       // Array of meal entries for lunch
 *         snacks: [],      // Array of meal entries for snacks
 *         dinner: [],      // Array of meal entries for dinner
 *       },
 *       nutrition: {        // Nutrition totals for the day
 *         calories: 0,
 *         protein: 0,
 *         carbs: 0,
 *         fats: 0,
 *       },
 *     },
 *     "Tue Jan 14 2025": { // Daily meal plan for Tuesday
 *       meals: {
 *         breakfast: [],
 *         lunch: [],
 *         snacks: [],
 *         dinner: [],
 *       },
 *       nutrition: {
 *         calories: 0,
 *         protein: 0,
 *         carbs: 0,
 *         fats: 0,
 *       },
 *     },
 *     // ... similarly for Wed, Thu, and Fri of this week.
 *   },
 *   "Mon Jan 20 2025": { // Next week
 *     "Mon Jan 20 2025": { ... },
 *     "Tue Jan 21 2025": { ... },
 *     // ... similarly for the rest of the days in this week.
 *   },
 *   // Additional weeks (4 weeks before and after the current week)
 *   // would have the same structure as the above weeks.
 * }
 *
 * - Each week is identified by the Monday date as the key. The keys of the meal plan object are the Monday of the current week, Mondays of 4 weeks prior, and Mondays of 4 weeks ahead (total 9 keys)
 * - Each Monday week object contains 5 properties (for the 5 weekdays in that week). Each of those 5 weekdays include the meals for that day and the nutrition for that day
 * - Each day within the week is initialized with empty meal arrays and zeroed-out nutrition data.
 */

/**
 * Initializes the meal plan for the user by setting up the meal plan structure
 * for the current week, as well as 4 weeks before and after the current week.
 * See above documentation for meal plan structure.
 *
 * It checks for saved data in localStorage and populates the state with either
 * saved data or newly created meal plans (depending on what parts of the saved meal plan fall in the date range- 4 weeks prior and 4 weeks past the current date)
 *
 * * Example:
 * If the current date is January 15, 2025 (a Wednesday):
 * - `mondayOfCurrentWeek` would be January 13, 2025.
 * - `weeksRange` would contain:
 *   [
 *     "Mon Dec 16 2024",  // 4 weeks before
 *     "Mon Dec 23 2024",
 *     "Mon Dec 30 2024",
 *     "Mon Jan 06 2025",
 *     "Mon Jan 13 2025",  // current week
 *     "Mon Jan 20 2025",
 *     "Mon Jan 27 2025",
 *     "Mon Feb 03 2025",
 *     "Mon Feb 10 2025"   // 4 weeks after
 *   ]
 *
 * Now suppose the last time the user opened the app was in the week of "Mon Jan 06 2025". The meal plan saved to local storage will include weeks "Mon Dec 09 2024" to "Mon Feb 03 2025". This time when we open the app on January 15, 2025 (a Wednesday), the week range will be as shown above. Since the week plans for "Mon Dec 16 2024"-"Mon Feb 03 2025" exist from last time, they will be copied from local storage. A new week plan will be created for "Mon Feb 10 2025" in the meal plan state object.
 */
export const initializeMealPlan = function () {
  // Get the starting date of the current week (Monday).
  const mondayOfCurrentWeek = getMondayOfTheWeek();
  //Set the mealCalendarWeek in state
  state.mealCalendarWeek = mondayOfCurrentWeek.toDateString();

  //Retrive saved meal plan from last session (should contain 9 weeks)
  const savedMealPlan = JSON.parse(localStorage.getItem("mealPlan")) || {};

  // Create a range of 9 weeks (4 weeks before, current week, and 4 weeks after).
  const weeksRange = Array.from({ length: 9 }, (_, i) => {
    const weekOffset = (i - 4) * 7; // Calculate week offset from the current week
    const weekDate = new Date(mondayOfCurrentWeek);
    weekDate.setDate(weekDate.getDate() + weekOffset);
    return weekDate.toDateString();
  });

  // Loop over the range of weeks and initialize data for each week
  weeksRange.forEach((week) => {
    //If the week is in the meal plan from the last user session, use that week object. If not, create a new one for that week.
    state.mealPlan[week] = savedMealPlan[week] || createWeeklyMealPlan(week);
  });
};

/**
 * Creates a weekly meal plan starting from the provided Monday date.
 *
 * Example:
 * If `mondayOfWeek` is "Mon Jan 13 2025", the returned structure will look like:
 * {
 *   "Mon Jan 13 2025": { // Daily meal plan for Monday
 *     meals: {
 *       breakfast: [],   // Array of meal entries for breakfast
 *       lunch: [],       // Array of meal entries for lunch
 *       snacks: [],      // Array of meal entries for snacks
 *       dinner: [],      // Array of meal entries for dinner
 *     },
 *     nutrition: {        // Nutrition totals for the day
 *       calories: 0,
 *       protein: 0,
 *       carbs: 0,
 *       fats: 0,
 *     },
 *   },
 *   "Tue Jan 14 2025": { // Daily meal plan for Tuesday
 *     meals: {
 *       breakfast: [],
 *       lunch: [],
 *       snacks: [],
 *       dinner: [],
 *     },
 *     nutrition: {
 *       calories: 0,
 *       protein: 0,
 *       carbs: 0,
 *       fats: 0,
 *     },
 *   },
 *   "Wed Jan 15 2025": { ... }, // Similarly for the rest of the days (Wed, Thu, Fri).
 *   "Thu Jan 16 2025": { ... },
 *   "Fri Jan 17 2025": { ... },
 * }
 *
 * @private
 */
const createWeeklyMealPlan = function (mondayOfWeek) {
  let dayMeals = {};
  for (let i = 0; i <= 4; i++) {
    const dateKey = new Date(mondayOfWeek);
    dateKey.setDate(dateKey.getDate() + i);
    dayMeals[dateKey.toDateString()] = createEmptyMealObj();
  }
  return dayMeals;
};

/**
 * Creates an empty meal object for a single day.
 *
 * Example:
 * The returned structure will look like:
 * {
 *   meals: {
 *     breakfast: [],   // Array of meal entries for breakfast
 *     lunch: [],       // Array of meal entries for lunch
 *     snacks: [],      // Array of meal entries for snacks
 *     dinner: [],      // Array of meal entries for dinner
 *   },
 *   nutrition: {        // Nutrition totals for the day
 *     calories: 0,
 *     protein: 0,
 *     carbs: 0,
 *     fats: 0,
 *   },
 * }
 *
 * @private
 */
const createEmptyMealObj = function () {
  return { meals: { breakfast: [], lunch: [], snacks: [], dinner: [] }, nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 } };
};
