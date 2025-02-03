/**
 * @fileoverview Manages the autocomplete functionality for ingredient and recipe searches.
 * Includes methods to:
 * -fetch autocomplete suggestions from the Spoonacular API.
 * -Check whether an ingredient input by the user in the IngredientSearchView is valid (recognized by the Spoonacular API)
 *
 * Dependencies:
 * - API_BASE_URL: Base URL for the Spoonacular API.
 * - API_KEY: API key for authenticating requests to the Spoonacular API.
 */

//Import variables from config file
import { API_BASE_URL, API_KEY } from "../config.js";

/**
 * Extracts and formats autocomplete suggestions (e.g., ingredient names or recipe titles) based on a partial input.
 *
 * @param {string} partialSearch - The user's partial search input.
 * @param {"ingredient"|"recipe"} mode - The type of suggestions to extract. Use "ingredient" for ingredient names, "recipe" for recipe titles.
 * @returns {Promise<string[]>} A promise that resolves to an array of suggestion strings.
 * @throws Will log an error and return an empty array if the API call fails.
 */
export const extractAutocompleteSuggestions = async function (partialSearch, mode) {
  try {
    const suggestions = await fetchAutocompleteSuggestions(partialSearch, mode);
    const suggestionKey = mode === "ingredient" ? "name" : "title";
    return suggestions.map((suggestion) => suggestion[suggestionKey]);
  } catch (error) {
    console.error("Error extracting autocomplete suggestions:", error);
    return []; // Return an empty array on failure
  }
};

/**
 * Fetches autocomplete suggestions from the Spoonacular API based on the search query and mode.
 *
 * @param {string} search - The user's search query (partial or complete).
 * @param {"ingredient"|"recipe"} mode - The type of suggestions to fetch. Use "ingredient" for ingredient searches in the IngredeintSearchView, "recipe" for recipe searches in BrowseRecipesView.
 * @returns {Promise<Object[]>} A promise that resolves to an array of suggestion objects from the API.
 * @throws Will throw an error if the API request fails or returns a non-OK response.
 * @private
 */
const fetchAutocompleteSuggestions = async function (search, mode) {
  try {
    const endpoint = mode === "ingredient" ? "food/ingredients" : "recipes";
    const url = `${API_BASE_URL}/${endpoint}/autocomplete?query=${search}&number=5&apiKey=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    throw error;
  }
};

/**
 * Validates whether the provided ingredient exists in Spoonacular's database.
 *
 * @param {string} ingredient - The ingredient to validate.
 * @returns {Promise<boolean>} A promise that resolves to true if the ingredient is valid, false otherwise.
 * @throws Will log an error and return false if the API call fails.
 */
export const validateSearchQuery = async function (ingredient) {
  try {
    const suggestions = await fetchAutocompleteSuggestions(ingredient, "ingredient");
    return suggestions.length > 0; //Returns true if valid ingredient
  } catch (error) {
    console.error("Error validating search query:", error);
    return false; // Treat ingredient as invalid if the API fails
  }
};
