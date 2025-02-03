/**
 * @fileoverview Controller for managing the Browse Recipes Page, including the Browse Collection Modal and the Filter Recipes Modal.
 * Handles searching, rendering and filtering recipes based on user input.
 *
 * Dependencies:
 * - browseRecipesView: For handling UI interactions related to browsing recipes and filtering.
 * - filterRecipesModal: For managing the Filter Recipes Modal UI and interactions.
 * - browseCollectionModal: For managing the Browse Collection Modal interactions.
 * - resultsView: For rendering recipe result cards based on the search query.
 * - sharedController: Provides `controlNavBar` for handling the navbar interactions.
 * - controllerUtils: Contains utilities for loading recipes, and handling timeouts.
 * - modalUtils: Mnages open and close of both modals
 */

import * as model from "../model/index.js";

//Import view instances
import BrowseRecipesView from "../views/mainViews/browseRecipesView.js";
import FilterRecipesModal from "../views/modalWindowViews/filterRecipesModal.js";
import BrowseCollectionModal from "../views/modalWindowViews/browseCollectionModal.js";
import ResultsView from "../views/mainViews/resultsView.js";

//Import from shared controller
import { controlNavBar } from "./sharedController.js";

//Import utilities
import { timeout } from "./controllerUtils/highLevel/controllerUtils.js";
import { controlOpenBrowseCollectionModal, controlOpenFilterRecipesModal, controlCloseBrowseCollectionModal, controlCloseFilterRecipesModal } from "./controllerUtils/highLevel/modalUtils.js";
import { resetBrowseRecipes, countAppliedFilters, postBrowseCollectionSearchUI, postSearchNoFiltersSearchUI } from "./controllerUtils/featureSpecific/browseRecipesUtils.js";
import { controlAutocompleteSuggestions, controlHandleOutsideClick, validResultsExist, validateSearchInput, handleError } from "./controllerUtils/featureSpecific/searchableViewUtils.js";

/**
 * Searches for recipes based on the specified mode
 * - Initializes the search by resetting the UI and showing the loading spinner.
 * - Loads recipes from the model based on the search query and filters.
 * - Renders the search results and updates the UI after the search.
 *
 * 3 possible mode values:
 * - "searchNoFilters" : user inputs search in search bar and presses 'Enter' (no filters applied)
 * - "searchWithFilters" : user has made a search using the search bar and then uses the Filter Recipes Modal to filter the search
 * - "browseRecipeCollectionSearch": user is searching for recipes in the database and  selects filter values in the Browse Collection Modal to narrow down search.
 *
 * @param {string} mode - Defines the search mode: `searchNoFilters`, `searchWithFilters`, or `browseRecipeCollectionSearch`.
 */
const controlBrowseRecipes = async function (mode) {
  try {
    //Reset view and show loading spinner once a user makes a search
    initializeBrowseRecipesSearch(mode);

    const query = getRecipeSearchQuery(mode);
    if (query === null) return;

    //Collect the user's filter inputs and generate parameters for API call
    const filtersObject = getFiltersObject(mode);
    const searchParams = getSearchParams(mode, query, filtersObject);

    //Fetch recipe ids of results matching the user's search
    const results = await Promise.race([model.loadRecipes(...searchParams), timeout(3000)]);
    if (!validResultsExist(results, "browseRecipesView")) return;
    //Fetch recipe details for those ids
    const recipeDetails = await Promise.race([model.loadRecipeDetails(results, "browseRecipes"), timeout(5000)]);
    if (!validResultsExist(recipeDetails, "browseRecipesView")) return;
    //Render the search results
    ResultsView.renderRecipeCards(model.state.browseSearchResults, "browseRecipeSearch");
    //UI updates
    handlePostSearchUIUpdates(mode, filtersObject);
  } catch (error) {
    handleError(error, BrowseRecipesView, "renderSearchResultsError");
  } finally {
    BrowseRecipesView.hideLoadingSpinner();
  }
};

//HELPER FUNCTIONS FOR CONTROLBROWSERECIPES

/**
 * Initializes the search process, showing the loading spinner and resetting the view.
 *
 * @private
 */
const initializeBrowseRecipesSearch = function (mode) {
  BrowseRecipesView.showLoadingSpinner();
  resetBrowseRecipes(mode);
};

/**
 * Gets the search query from the search bar input, validating it based on the search mode.
 *
 * @param {string} mode - The mode of the search (e.g., `searchNoFilters` or `searchWithFilters`).
 * @returns {string|null} The validated search query, or `null` if invalid.
 * @private
 */
const getRecipeSearchQuery = function (mode) {
  // Validate the input query if the mode requires a search bar input
  if (mode !== "searchNoFilters" && mode !== "searchWithFilters") return undefined;

  const query = BrowseRecipesView.getSearchInput();
  //Vaidate query (length requirement, no special characters)
  const validationResult = validateSearchInput(query, false);

  if (!validationResult.valid) {
    BrowseRecipesView.renderSearchInputError(validationResult.message); // Display the error
    return null;
  }

  return query;
};

/**
 * Retrieves the filters object based on the search mode.
 * The filters object contains the user's selected filters
 *
 * @param {string} mode - The search mode (e.g., `searchWithFilters`, `browseRecipeCollectionSearch`).
 * @returns {Object} The filters object based on the mode.
 * @private
 */
const getFiltersObject = function (mode) {
  if (mode === "searchWithFilters") return FilterRecipesModal.generateFiltersObject();
  if (mode === "browseRecipeCollectionSearch") return BrowseCollectionModal.generateFiltersObject();
  return {};
};

/**
 * Returns an array of search parameters for the model loadRecipes function based on the mode, query, and filters.
 *
 * @param {string} mode - The search mode.
 * @param {string} query - The search query.
 * @param {Object} filtersObject - The filters to apply to the search.
 * @returns {Array} The search parameters array.
 * @private
 */
const getSearchParams = function (mode, query, filtersObject) {
  const param1 = null;
  const param2 = mode === "searchNoFilters" || mode === "searchWithFilters" ? query : null;
  const param3 = mode === "searchNoFilters" ? {} : filtersObject;
  return [param1, param2, param3];
};

/**
 * Handles the UI updates after the search results are returned.
 * - Displays applied filters and updates the UI based on the mode.
 *
 * @param {string} mode - The mode of the search.
 * @param {Object} filtersObject - The filters applied to the search.
 * @private
 */
const handlePostSearchUIUpdates = function (mode, filtersObject) {
  if (mode === "searchWithFilters" || mode === "browseRecipeCollectionSearch") {
    const numFiltersApplied = countAppliedFilters(filtersObject);
    //Render the "X filters applied" message
    if (numFiltersApplied !== 0) BrowseRecipesView.renderAppliedFiltersMessage(numFiltersApplied);
  }
  //Search mode specific UI updates
  if (mode === "searchNoFilters") postSearchNoFiltersSearchUI();
  if (mode === "browseRecipeCollectionSearch") postBrowseCollectionSearchUI();
};

//VIEW INITIALIZATION

/**
 * Initializes the Browse Recipes View/Page by setting up all view initializations and event handlers.
 *
 * Event handlers:
 * - `controlAutocompleteSuggestions`: Fetches search bar autocomplete suggestions.
 * - `controlHandleOutsideClick`: Closes autocomplete suggestions on outside click .
 * - `controlBrowseRecipes`: Triggers a browse recipes search ("searchNoFilters") when the user types a search and presses 'Enter'
 * - `controlOpenBrowseCollectionModal`: Opens the Browse Collection Modal when the 'Browse Recipe Collection' button is clicked.
 * - `controlOpenFilterRecipesModal`: Opens the Filter Recipes Modal when the 'Filter Recipes' button is clicked.
 * - `controlNavBar`: Navigates to the meal plan when the 'Meal Planner' button is clicked.
 *
 * @private
 */
const initializeBrowseRecipesView = function () {
  BrowseRecipesView.addHandlerInputKeydown();
  BrowseRecipesView.addHandlerOutsideClick(controlHandleOutsideClick);
  BrowseRecipesView.addHandlerAutocompleteSuggestions(controlAutocompleteSuggestions);
  BrowseRecipesView.addHandlerSearchBar(controlBrowseRecipes);
  BrowseRecipesView.addHandlerBrowseBtn(controlOpenBrowseCollectionModal);
  BrowseRecipesView.addHandlerFilterBtn(controlOpenFilterRecipesModal);
  BrowseRecipesView.addHandlerPlannerBtn(controlNavBar);
};

/**
 * Initializes the Filter Recipes Modal by setting up all view initializations and event handlers.
 *
 * Event handlers:
 * - `controlCloseFilterRecipesModal`: Closes the modal when the 'x' in the top right is clicked
 * - `controlBrowseRecipes`: Triggers a browse recipe search ("searchWithFilters") when the user refines their search query by applying filters in the Filter Recipes Modal and pressing the submit button
 *
 * @private
 */
const initializeFilterRecipesModal = function () {
  FilterRecipesModal.addHandlerCloseModal(controlCloseFilterRecipesModal);
  FilterRecipesModal.addHandlerResetFilters();
  FilterRecipesModal.addHandlerSubmitFilters(controlBrowseRecipes);
};

/**
 * Initializes the Browse Collection Modal by setting up all view initializations and event handlers.
 *
 * Event handlers:
 * - `controlCloseBrowseCollectionModal`: Closes the modal when the 'x' in the top right is clicked
 * - `controlBrowseRecipes`: Triggers a browse recipe search ("browseRecipeCollectionSearch") when the user selects filters in the Browse Recipe Collection modal and presses the submit button.
 *
 * @private
 */
const initializeBrowseCollectionModal = function () {
  BrowseCollectionModal.addHandlerCloseModal(controlCloseBrowseCollectionModal);
  BrowseCollectionModal.addHandlerResetFilters();
  BrowseCollectionModal.addHandlerSubmitFilters(controlBrowseRecipes);
};

/**
 * Initializes the Browse Recipes Page, Filter Recipes Modal and Browse Collection Modal by calling the init functions for each
 */
export const init = function () {
  initializeBrowseRecipesView();
  initializeFilterRecipesModal();
  initializeBrowseCollectionModal();
};
