/**
 * @fileoverview Controller for handling the ingredient search functionality in the app/ support
 * the Ingredient Search View/Page.
 * Manages adding, deleting, and validating input ingredients, as well as displaying search results based on ingredients in the user's pantry.
 *
 * Dependencies:
 * - ingredientSearchView: For UI interactions related to ingredient search.
 * - resultsView: For displaying search results in the form of recipe cards.
 * - model: For managing the state of the pantry and interacting with the recipe data.
 * - Various utility functions for handling ingredient validation, pantry checks, and autocomplete suggestions.
 */

import * as model from "../model/index.js";

//Import view instances
import IngredientSearchView from "../views/mainViews/ingredientSearchView.js";
import ResultsView from "../views/mainViews/resultsView.js";

//Import utilities
import { timeout } from "./controllerUtils/highLevel/controllerUtils.js";
import { resetIngredientInputState, isPantryFull, isDuplicateIngredient, isValidInput, validateIngredientWithAPI, renderInvalidIngredientError, toggleMatchingCommonIngredient, initializeIngredientSearch } from "./controllerUtils/featureSpecific/ingredientSearchUtils.js";
import { controlAutocompleteSuggestions, controlHandleOutsideClick, validResultsExist, handleError } from "./controllerUtils/featureSpecific/searchableViewUtils.js";
import { normalizeIngredient } from "../sharedUtils.js";

//SEARCHING FOR RECIPES BASED ON INGREDIENTS

/**
 * Handles searching for recipes based on ingredients in the user's pantry.
 * - Initializes the ingredient search (resets view and renders loading spinner)
 * - Loads recipes based on pantry ingredients.
 * - Displays the recipe results and handles errors.
 */
const controlIngredientSearch = async function () {
  try {
    //Reset view, scroll to results section and render loading spinner once a search is made
    initializeIngredientSearch();

    const pantryIngredients = model.state.pantry.join(",");

    //Fetch ids of results. Request times out if it takes longer than 3 seconds.
    const results = await Promise.race([model.loadRecipes(pantryIngredients), timeout(3000)]);
    if (!validResultsExist(results, "ingredientSearchView")) return;

    //Fetch full recipe details for recipe ids. Request times out if it takes longer than 5seconds.
    const recipeDetails = await Promise.race([model.loadRecipeDetails(results, "ingredientSearch"), timeout(5000)]);
    if (!validResultsExist(recipeDetails, "ingredientSearchView")) return;

    //Render the recipe search results to the UI
    ResultsView.renderRecipeCards(model.state.ingredientSearchResults, "ingredientSearch");
  } catch (error) {
    handleError(error, IngredientSearchView, "renderSearchResultsError");
  } finally {
    IngredientSearchView.hideLoadingSpinner();
  }
};

//INGREDIENT INPUT

/**
 * Deletes an ingredient from the pantry.
 * - Removes the ingredient from both the model and the UI.
 *
 * @param {string} ingredient - The ingredient to delete from the pantry.
 */
const controlDeleteIngredient = function (ingredient) {
  model.removeIngredientFromPantry(ingredient);
  IngredientSearchView.removePantryIngredient(ingredient);
};

/**
 * Handles adding an ingredient to the pantry.
 * - Checks if the pantry is full or the ingredient already exists in the pantry.
 * - Validates the ingredient input (meets length requirements, no special characters etc.)
 * - Runs an API validation for ingredients added via the search bar (Spoonacular API must be able to recognize the ingredient before it is added).
 * - Adds the valid ingredient to the pantry.
 *
 * The user can add an ingredient to the pantry via the search bar or by clicking a 'common ingredient' on the UI
 *
 * @param {string} ingredient - The ingredient to add.
 * @param {string} mode - The mode of adding ingredient: "commonIngredient" or "search".
 */
const controlAddIngredient = async function (ingredient, mode) {
  try {
    resetIngredientInputState();
    const normalizedIngredient = normalizeIngredient(ingredient);

    //Basic checks for pantry space and duplicate ingredient
    if (isPantryFull() || isDuplicateIngredient(normalizedIngredient)) return;

    //Check for non-valid characters and length requirements
    if (!isValidInput(ingredient)) return;

    // Run the autocomplete function on the ingredient to see if Spoonacular recognizes the ingredient
    if (mode === "search") {
      const isValidIngredient = await Promise.race([validateIngredientWithAPI(normalizedIngredient), timeout(3000)]);

      if (!isValidIngredient) {
        renderInvalidIngredientError();
        return;
      }
    }

    //If user is inputting a valid ingredient (all above checks pass), add ingredient to pantry
    addIngredientToPantry(normalizedIngredient, mode);
  } catch (error) {
    handleError(error, IngredientSearchView, "renderSearchInputError");
  }
};

/**
 * Adds an ingredient to the pantry and updates the UI.
 * - Clears the search field and checks for matching common ingredients.
 * -If the inputted ingredient is in the common ingredients, mark the common ingredient as "selected" on the UI
 * - Updates the UI with the newly added ingredient.
 *
 * @param {string} ingredient - The ingredient to add.
 * @param {string} mode - The mode of adding ingredient: "commonIngredient" or "search".
 *
 * @private
 */
const addIngredientToPantry = function (ingredient, mode) {
  if (mode === "search") {
    // Check for matching common ingredient and clear the search bar
    toggleMatchingCommonIngredient(ingredient);
    IngredientSearchView.clearSearchField();
  }
  model.addIngredientToPantry(ingredient);
  IngredientSearchView.renderPantryIngredient(ingredient);
};

//VIEW INITIALIZATION

/**
 * Initializes the Ingredient Search View by attaching event handlers for user interactions.
 *
 * Event handlers:
 * - `controlAutocompleteSuggestions`: Handles autocomplete suggestions when the user types in the search bar.
 * - `controlHandleOutsideClick`: Clears suggestions when the user clicks outside the autocomplete suggestions.
 * - `controlAddIngredient`: Adds the ingredient to the pantry when the user types an ingredient and presses the 'Enter' key OR selects a common ingredient on the UI.
 * - `controlDeleteIngredient`: Deletes an ingredient from the pantry when a user clicks the 'x' on a pantry item or deselects a common ingredient.
 * - `controlIngredientSearch`: Triggers a recipe search based on pantry ingredients when the 'View Recipe Suggestions' button is clicked.
 */
export const init = function () {
  IngredientSearchView.addHandlerInputKeydown();
  IngredientSearchView.addHandlerAutocompleteSuggestions(controlAutocompleteSuggestions);
  IngredientSearchView.addHandlerOutsideClick(controlHandleOutsideClick);
  IngredientSearchView.addHandlerSearchIngredient(controlAddIngredient);
  IngredientSearchView.addHandlerCommonIngredient(controlAddIngredient, controlDeleteIngredient);
  IngredientSearchView.addHandlerRemoveIngredient(controlDeleteIngredient);
  IngredientSearchView.addHandlerViewIngredientRecipes(controlIngredientSearch);
};
