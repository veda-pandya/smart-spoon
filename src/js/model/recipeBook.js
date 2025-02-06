/**
 * @fileoverview Manages operations for the recipe book in the application state, including adding, removing, and saving recipes.
 * Handles both user-created custom recipes and recipes added by ID from other sources (ingredient search results and browse recipe search results).
 *
 * Dependencies:
 * - `state`: The application's central state object.
 * - `Recipe` class: For creating standardized recipe objects.
 * - Utility functions:
 *   - `getRecipe` from `modelUtils.js`
 *   - `generateUniqueId` from `sharedUtils.js`
 * - Constants from `config.js`: `RECOMMENDED_PROTEIN_DV`, `RECOMMENDED_FATS_DV`, `RECOMMENDED_CARBS_DV`
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
import { getRecipe } from "./modelUtils/highLevel/modelUtils.js";
import { deepCopy, generateUniqueId } from "../sharedUtils.js";

//Import variables from config file
import { RECOMMENDED_PROTEIN_DV, RECOMMENDED_FATS_DV, RECOMMENDED_CARBS_DV } from "../config.js";

//Import default recipe image
import defaultRecipeImage from "../../images/custom-recipe-image.avif";

//Retrieves the IDs of all recipes in the recipe book.
export const getRecipeBookIds = function () {
  return state.recipeBook.map((recipe) => recipe.id);
};

/**
 * Adds a custom recipe to the recipe book.
 * User can add a custom recipe via the 'Add Custom Recipe' button on the recipe book page
 *
 * @param {Object} newRecipe - The details of the custom recipe (gathered from user inputs).
 * @param {string} newRecipe.title - The title of the recipe.
 * @param {string} newRecipe.mealType - The meal type (e.g., "main course").
 * @param {string} newRecipe.dietaryRestrictions - Dietary restrictions (e.g., "vegan").
 * @param {string} newRecipe.cookingTime - Cooking time in minutes.
 * @param {string} newRecipe.cuisine - The cuisine type (e.g., "Italian").
 * @param {number} newRecipe.calories - Total calories in the recipe.
 * @param {number} newRecipe.servings - Number of servings.
 * @param {Array<Object>} newRecipe.ingredients - Array of ingredient objects (including name and quantity properties).
 * @param {Array<string>} newRecipe.instructions - Array of cooking instructions.
 * @param {number} newRecipe.protein - Total protein in grams.
 * @param {number} newRecipe.fats - Total fats in grams.
 * @param {number} newRecipe.carbs - Total carbohydrates in grams.
 * @param {number} [newRecipe.saturatedFat] - Saturated fat in grams.
 * @param {number} [newRecipe.sugar] - Sugar in grams.
 * @param {number} [newRecipe.fiber] - Fiber in grams.
 * @param {number} [newRecipe.sodium] - Sodium in milligrams.
 * @param {number} [newRecipe.cholesterol] - Cholesterol in milligrams.
 * @param {number} [newRecipe.iron] - Iron in milligrams.
 * @param {number} [newRecipe.zinc] - Zinc in milligrams.
 * @param {number} [newRecipe.calcium] - Calcium in milligrams.
 * @param {number} [newRecipe.magnesium] - Magnesium in milligrams.
 */
export const addCustomRecipeToRecipeBook = function (newRecipe) {
  const proteinPercentage = ((newRecipe.protein * 4) / newRecipe.calories) * 100;
  const fatsPercentage = ((newRecipe.fats * 9) / newRecipe.calories) * 100;
  const carbsPercentage = ((newRecipe.carbs * 4) / newRecipe.calories) * 100;

  const novelRecipe = new Recipe(
    newRecipe.title,
    defaultRecipeImage,
    generateUniqueId(),
    true,
    newRecipe.mealType !== "default" ? newRecipe.mealType : "Unavailable",
    newRecipe.dietaryRestrictions,
    newRecipe.cookingTime !== "" ? newRecipe.cookingTime : "Unavailable",
    newRecipe.cuisine !== "default" ? newRecipe.cuisine : "Unavailable",
    Number(newRecipe.calories),
    Number(newRecipe.servings),
    newRecipe.ingredients,
    newRecipe.instructions,
    //value is "-" if left empty by the user on the custom recipe form
    newRecipe.saturatedFat !== "" ? Number(newRecipe.saturatedFat) : "-",
    newRecipe.sugar !== "" ? Number(newRecipe.sugar) : "-",
    newRecipe.fiber !== "" ? Number(newRecipe.fiber) : "-",
    newRecipe.sodium !== "" ? Number(newRecipe.sodium) : "-",
    newRecipe.cholesterol !== "" ? Number(newRecipe.cholesterol) : "-",
    newRecipe.iron !== "" ? Number(newRecipe.iron) : "-",
    newRecipe.zinc !== "" ? Number(newRecipe.zinc) : "-",
    newRecipe.calcium !== "" ? Number(newRecipe.calcium) : "-",
    newRecipe.magnesium !== "" ? Number(newRecipe.magnesium) : "-",
    Number(newRecipe.protein),
    Number(newRecipe.fats),
    Number(newRecipe.carbs),
    proteinPercentage,
    fatsPercentage,
    carbsPercentage,
    (newRecipe.protein / RECOMMENDED_PROTEIN_DV) * 100,
    (newRecipe.fats / RECOMMENDED_FATS_DV) * 100,
    (newRecipe.carbs / RECOMMENDED_CARBS_DV) * 100,
    "N/A",
    "user"
  );

  addRecipeToRecipeBook(novelRecipe);
  saveRecipeBook();
};

//Adds a recipe object to the recipe book and saves the changes to localStorage.
export const addRecipeToRecipeBook = function (recipe) {
  state.recipeBook.push(recipe);
  saveRecipeBook();
};

/**
 * Adds a recipe to the recipe book by its ID, copying it from a specified source (ingredient search results or browse recipe search results).
 *
 * Parameters use the shared "source-currentDate-currentMeal" pattern.
 * For details, see the documentation at the top of this file.

 * @param {number} recipeId - ID of the recipe to toggle bookmark status for.
 * @param {Object} options - Used to locate a recipe in the model
 * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
 * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
 * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.

 */
export const addRecipeToRecipeBookById = function (recipeId, { source, currentDate = null, currentMeal = null }) {
  //Fetch the recipe from the appropriate place in the application state using ID and source
  const recipe = getRecipe(recipeId, { source, currentDate, currentMeal });
  //Copy the recipe, add it to the recipe book, and save the changes to local storage
  const recipeCopy = deepCopy(recipe);
  state.recipeBook.push(recipeCopy);
  saveRecipeBook();
};

//Removes a recipe from the recipe book by its ID.
export const removeRecipeFromBook = function (recipeId) {
  const index = state.recipeBook.findIndex((recipe) => recipe.id === recipeId);
  state.recipeBook.splice(index, 1);
  saveRecipeBook();
};

//Saves the current state of the recipe book to localStorage.
export const saveRecipeBook = function () {
  localStorage.setItem("recipeBook", JSON.stringify(state.recipeBook));
};
