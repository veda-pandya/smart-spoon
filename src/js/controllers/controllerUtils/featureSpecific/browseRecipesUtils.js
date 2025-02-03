/**
 * @fileoverview Utility functions for the Browse Recipes Page (inlcuding the BrowseRecipesView, FilterRecipesModal and BrowseCollectionModal.
 *
 * These functions support loading, resetting, and managing the state of the Browse Recipes view,
 * including rendering random recipes and handling modals.
 *
 * Dependencies:
 * - model: Manages application state and fetches data.
 * - browseRecipesView: Handles UI updates for the Browse Recipes tab.
 * - resultsView: Renders recipe cards based on search or random loading.
 * - controllerUtils and modalUtils: Provide helper functions for timeouts and modal management.
 */

import * as model from "../../../model/index.js";

//Import view instances
import BrowseRecipesView from "../../../views/mainViews/browseRecipesView.js";
import FilterRecipesModal from "../../../views/modalWindowViews/filterRecipesModal.js";
import BrowseCollectionModal from "../../../views/modalWindowViews/browseCollectionModal.js";
import ResultsView from "../../../views/mainViews/resultsView.js";

//Import utilities
import { timeout } from "../highLevel/controllerUtils.js";
import { controlCloseBrowseCollectionModal, controlCloseFilterRecipesModal } from "../highLevel/modalUtils.js";

//Import variables from config file
import { API_TIMEOUT_MESSAGE } from "../../../config.js";

/**
 * Loads and renders random recipe cards in the BrowseRecipesView.
 * - Called when the Browse Recipes tab is first clicked, before any search is made.
 * - Fetches random recipes, retrieves their details, and renders them as cards.
 * - Handles loading spinners and error messages for better UX.
 */
export const loadRandomRecipes = async function () {
  try {
    BrowseRecipesView.showLoadingSpinner(); // Show loading spinner during fetch
    resetBrowseRecipes(); // Clear previous results and state

    // Fetch random recipe IDs and their details with timeouts for if request takes too long
    const recipeIds = await Promise.race([model.loadRecipes(), timeout(3000)]);
    const recipeDetails = await Promise.race([model.loadRecipeDetails(recipeIds, "browseRecipes"), timeout(5000)]);

    if (recipeDetails?.noResults) {
      BrowseRecipesView.renderSearchResultsError("Please try searching for a recipe.");
      return;
    }

    // Render the fetched recipe cards in the Results View
    ResultsView.renderRecipeCards(model.state.browseSearchResults, "browseRecipeSearch");
  } catch (error) {
    console.error("Error in controlLoadRandomRecipes:", error);
    BrowseRecipesView.renderSearchResultsError(error.message === "Request timed out" ? API_TIMEOUT_MESSAGE : "Unable to load popular recipes.");
  } finally {
    BrowseRecipesView.hideLoadingSpinner(); // Hide loading spinner after operation
  }
};

/**
 * Resets the Browse Recipes view to its initial state.
 *
 * @param {string} - mode to determine which modal to close:
 *  - 'browseRecipeCollectionSearch': Closes the Browse Collection Modal.
 *  - Any other value ("searchNoFilters" or "searchWithFilters"): Closes the Filter Recipes Modal.
 */
export const resetBrowseRecipes = function (mode) {
  model.state.browseSearchResults = []; // Reset search results in the model
  BrowseRecipesView.resetView();
  BrowseRecipesView.clearAutocompleteSuggestions();

  BrowseRecipesView.clearAppliedFilterMessage(); //clear any previous filters message

  // Close the appropriate modal based on the mode (whichever modal triggered the search)
  if (mode === "browseRecipeCollectionSearch") {
    controlCloseBrowseCollectionModal();
  } else {
    controlCloseFilterRecipesModal();
  }
};

//return the number of filters applied based on the number of non-default (not undefined) values in the filters object
export const countAppliedFilters = function (filtersObject) {
  return Object.values(filtersObject).filter((value) => value !== undefined).length;
};

// UI updates after a  "browseRecipeCollectionSearch" via the controlBrowseRecipes function
export const postBrowseCollectionSearchUI = function () {
  BrowseRecipesView.clearSearchField();
  FilterRecipesModal.resetFilters();
  BrowseRecipesView.hideFilterBtn();
};

// UI updates after a  "searchNoFilters" via the controlBrowseRecipes function
export const postSearchNoFiltersSearchUI = function () {
  BrowseRecipesView.showFilterBtn();
  resetFilters();
};

//Resets filters in both the Filter Recipes Modal and Browse Collection Modal
export const resetFilters = function () {
  FilterRecipesModal.resetFilters();
  BrowseCollectionModal.resetFilters();
};
