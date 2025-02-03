/**
 * @fileoverview Utility functions supporting the IngredientSearchView and related operations.
 * These functions handle input validation, pantry management, and API interactions for ingredient search.
 *
 * Dependencies:
 * - `ingredientSearchView`: For rendering errors, clearing suggestions, and updating the UI.
 * - `model`: For accessing and modifying the application's state (e.g., pantry management).
 */

import * as model from "../../../model/index.js";

//Import view instances
import IngredientSearchView from "../../../views/mainViews/ingredientSearchView.js";

//Import utilities
import { validateSearchInput } from "./searchableViewUtils.js";

export const resetIngredientInputState = function () {
  //Clear any previous error messages and close autosuggestions
  IngredientSearchView.renderSearchInputError("");
  IngredientSearchView.clearAutocompleteSuggestions();
};

export const isPantryFull = function () {
  //Dont allow user to add more ingredients if the pantry already has 25 ingredients.
  if (model.isPantryFull()) {
    IngredientSearchView.renderSearchInputError("Your pantry is full. Try removing some items.");
    return true;
  }
  return false;
};

//Checks if the ingredient a user is trying to input already exists in the user's pantry
export const isDuplicateIngredient = function (ingredient) {
  if (model.isIngredientInPantry(ingredient)) {
    IngredientSearchView.renderSearchInputError("This ingredient is already in your pantry. Please enter a new ingredient.");
    return true;
  }
  return false;
};

//Check if the ingredient is valid (adheres to length and special character requirements)
export const isValidInput = function (input) {
  const validationResult = validateSearchInput(input);
  if (!validationResult.valid) {
    IngredientSearchView.renderSearchInputError(validationResult.message);
    return false;
  }
  return true;
};

//Checks if the ingredient input by the user is valid (recognized by the API)
export const validateIngredientWithAPI = async function (ingredient) {
  try {
    return await model.validateSearchQuery(ingredient);
  } catch (error) {
    console.error("Error validating ingredient with API:", error);
    throw error;
  }
};

//If ingredient is invalid, throws an input error
export const renderInvalidIngredientError = function (isValidIngredient) {
  if (!isValidIngredient) {
    IngredientSearchView.renderSearchInputError("Not a valid ingredient. Please try another ingredient.");
  }
};

//If the user's ingredient input is a common ingredient, mark the common ingredient on the UI as "selected"
export const toggleMatchingCommonIngredient = function (ingredient) {
  const commonIngredientsList = IngredientSearchView.getCommonIngredients();
  const matchingCommonIngredient = [...commonIngredientsList].find((commonIngredient) => commonIngredient.textContent === ingredient);
  if (matchingCommonIngredient) IngredientSearchView.toggleCommonIngredient(matchingCommonIngredient);
};

// Initialize the ingredient search process once a search is made
export const initializeIngredientSearch = function () {
  // Smooth scroll to the results section and show spinner.
  IngredientSearchView.scrollToResultsSection();
  IngredientSearchView.showLoadingSpinner();
  //Reset the view
  IngredientSearchView.resetView();
  //Empty an previous ingredient search results
  model.state.ingredientSearchResults = [];
};
