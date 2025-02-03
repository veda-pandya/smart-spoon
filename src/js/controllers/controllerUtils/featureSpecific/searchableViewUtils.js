/**
 * @fileoverview Utility functions shared by ingredientSearchController and browseRecipesController (and any view with a search input that may be added in the future).
 *
 * These functions handle common functionalities like autocomplete suggestions, input validation,
 * and error handling for search-based views (IngredientSearchView and BrowseRecipesView).
 *
 * Dependencies:
 * - model: For extracting suggestions and validating results.
 * - view instances: For rendering UI updates for the respective search views.
 * - controllerUtils: High-level utilities like timeout handling for async functions.
 */

import * as model from "../../../model/index.js";

//Import view instances
import IngredientSearchView from "../../../views/mainViews/ingredientSearchView.js";
import BrowseRecipesView from "../../../views/mainViews/browseRecipesView.js";

//Import utilities
import { timeout } from "../highLevel/controllerUtils.js";

//Import constants from config file
import { API_TIMEOUT_MESSAGE } from "../../../config.js";

//AUTOCOMPLETE SUGGESTIONS FUNCTIONALITY

/**
 * Handles autocomplete suggestions for a given search view.
 * - Fetches suggestions from the model based on the partial input in the search bar
 * - Renders suggestions in the appropriate view instance.
 *
 * @param {string} view - The name of the view requesting suggestions (e.g., "ingredientSearchView").
 * @param {string} partialSearch - The partial input string to search for suggestions.
 */
export const controlAutocompleteSuggestions = async function (view, partialSearch) {
  //view can be "ingredientSearchView" or "browseRecipesView"
  const searchType = view === "ingredientSearchView" ? "ingredient" : "recipe";
  try {
    // Fetch suggestions (times out if it takes more than 2000ms)
    const suggestionsList = await Promise.race([model.extractAutocompleteSuggestions(partialSearch, searchType), timeout(2000)]);
    if (!suggestionsList.length) return; // Early exit if no suggestions

    //Render suggestions to the appropriate view
    const viewInstance = getViewInstance(view);
    renderSuggestions(viewInstance, suggestionsList);
  } catch (error) {
    // Log non-timeout errors for debugging
    if (error.message !== "Request timed out") {
      console.error("Error in controlAutocompleteSuggestions:", error);
    }
  }
};

/**
 * Renders autocomplete suggestions in the provided view instance.
 *
 * @param {Object} viewInstance - The view instance responsible for displaying suggestions.
 * @param {Array<string>} suggestions - The list of suggestions to render.
 * @private
 */
const renderSuggestions = function (viewInstance, suggestions) {
  //view instance can be ingredientSearchView or browseRecipesView
  viewInstance.clearAutocompleteSuggestions();
  viewInstance.renderAutocompleteSuggestions(suggestions);
};

/**
 * Clears autocomplete suggestions when a user clicks outside the autocomplete suggestions box.
 *
 * @param {string} view - The name of the view to clear suggestions for (e.g., "ingredientSearchView").
 */
export const controlHandleOutsideClick = function (view) {
  const viewInstance = getViewInstance(view);
  viewInstance.clearAutocompleteSuggestions();
};

//SEARCH BAR INPUT VALIDATION

/**
 * Validates the user input in the search bar for both ingredient and recipe searches.
 * - Ensures input is non-empty, not too long, and contains only valid characters.
 *
 * @param {string} input - The user's search input.
 * @param {boolean} [isIngredientSearch=true] - Whether the validation is for an ingredient search.
 * @returns {Object} An object with `valid` (boolean) and `message` (string) if invalid.
 */
export const validateSearchInput = function (input, isIngredientSearch = true) {
  //Ensure input is non-empty and trimmed
  if (input.trim() === "") {
    return { valid: false, message: "Please enter a valid input." };
  }
  //Check maximum length
  const maxLength = isIngredientSearch ? 50 : 80;
  if (input.trim().length > maxLength) {
    return { valid: false, message: `Input is too long. Max ${maxLength} characters.` };
  }

  // Ensure only letters and spaces are used (no special characters except for hyphens)
  const invalidCharacters = /[^a-zA-Z\s\-,:]/;
  if (invalidCharacters.test(input.trim())) {
    return { valid: false, message: "Please use letters and spaces only." };
  }

  //If all checks pass, return valid
  return { valid: true };
};

//API ERROR HANDLING

/**
 *Handles and logs errors encountered during API calls (ingredient searches or browsing recipe searches).

 * It supports a custom message for timeout errors and a general fallback message 
 * for other types of errors. The error message is passed to the specified method on the provided view 
 * instance for rendering.

 * @param {Error} error - The error object containing details of the error.
 * @param {Object} view  - The view instance where the error message will be displayed.
 * @param {string} methodName - The name of the method on the view to invoke with the error message.
 */
export const handleError = function (error, view, methodName) {
  console.error("Error:", error);
  const errorMessage = error.message === "Request timed out" ? API_TIMEOUT_MESSAGE : "Something went wrong. Please try again.";
  view[methodName](errorMessage);
};

//HELPER FUNCTIONS

/**
 * Validates whether the results from the search exist and renders an error if none are found.
 *
 * @param {Object} results - The search results object returned from the API.
 * @param {string} view - The name of the view to render errors for (e.g., "browseRecipesView").
 * @returns {boolean} True if valid results exist, false otherwise.
 */
export const validResultsExist = function (results, view) {
  if (results?.noResults) {
    const viewInstance = getViewInstance(view);
    viewInstance.renderSearchResultsError("There are no recipe results for your query. Please try a different search.");
    return false;
  }
  return true;
};

/**
 * Maps a view name to its corresponding view instance.
 *
 * @param {string} view - The name of the view (e.g., "ingredientSearchView").
 * @returns {Object} The view instance associated with the provided name.
 * @private
 */
const getViewInstance = function (view) {
  const viewMap = {
    ingredientSearchView: IngredientSearchView,
    browseRecipesView: BrowseRecipesView,
  };

  return viewMap[view];
};
