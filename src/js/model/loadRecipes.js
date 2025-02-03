/**
 * @fileoverview Handles recipe loading from the API.
 * Includes functions to construct API URLs and fetch recipe search results based on the user's inputs (search input and filters if applicable)
 *
 * This file loads search results for a search made from either the ingredient search page or the browse recipes page. The API will return a string of recipe ids of recipes that match the user's search criteria
 *
 * The generateRecipeResults.js file handles fetching recipe details based on the ids and generating standarized recipe objects that are loaded into the application state.
 *
 * Dependencies:
 * - Constants from `config.js`: `API_BASE_URL`, `API_KEY`, `MAX_CALORIES`, `MIN_PROTEIN`
 */

//Import constants from config file
import { API_BASE_URL, API_KEY, MAX_CALORIES, MIN_PROTEIN } from "../config.js";

//LOAD RECIPES FROM API

/**
 * Fetches recipe Ids from the API based on user inputs (ingredients, search queries, or filters).
 * Supports searches from both the ingredient search page & browse recipes page
 *
 * @param {string|null} ingredientsList - A comma-separated list of ingredients in the user's pantry. Only applicable for a search made from the ingredient search page.
 * @param {string|null} search - A search bar query to find recipes (only applicable for a search made from the browse recipes page)
 * @param {Object|null} filtersObject - An object containing filter options (e.g., cuisine, dietary restrictions). Only applicable for a browse recipes search where user can filter recipes
 * @returns {Promise<string|Object>} A comma-separated string of unique recipe IDs (search results), or an object indicating no results.
 * @throws {Error} If the API request fails.
 */
export const loadRecipes = async function (ingredientsList, search, filtersObject) {
  try {
    //Construct API url based on user inputs to fetch search results
    const url = constructLoadRecipesUrl(ingredientsList, search, filtersObject);

    const response = await fetch(url);

    //Throw a custom error if we get an API response code that indicates some sort of failure
    if (!response.ok) throw new Error(`Failed to fetch recipes: ${response.status}`);

    const data = await response.json();

    // If the API comes back with no recipe results , return from function and stop execution.
    if (data.length === 0 || (data.results && data.results.length === 0)) {
      return { noResults: true };
    }

    //Ensure no duplicate recipe Ids exist in the search results. Extract the unique ids
    const ids = extractUniqueRecipeIds(data, ingredientsList);
    return ids;
  } catch (error) {
    console.error("Error in loadRecipes", error);
    throw error;
  }
};

/**
 * Constructs the API URL for fetching recipes based on ingredients, search queries, or filters.
 * Supports URL construction for both ingredient searches  & browse recipe searches
 *
 *
 * @param {string|null} ingredientsList - A comma-separated list of ingredients in the user's pantry. Only applicable for ingredient searches.
 * @param {string|null} search - The search bar query input by the user (only applicable for browse recipe searches)
 * @param {Object|null} filtersObject - An object containing the user's filter inputs (Only applicable for a browse recipes search where user can filter recipes). If a user left the default option in the filter dropdown the value will be undefined for the property in the filtersObject:
 *   @param {string} [filtersObject.cuisine] - The type of cuisine (e.g., "Italian").
 *   @param {string} [filtersObject.dietaryRestrictions] - Dietary restrictions (e.g., "vegan").
 *   @param {string} [filtersObject.macroRestrictions] - Macronutrient restrictions (e.g., `MAX_CALORIES` or 'MIN_PROTEIN').
 *   @param {string} [filtersObject.course] - The meal type (e.g., "main course").
 *   @param {number} [filtersObject.prepTime] - The maximum preparation time in minutes.
 * @returns {string} The constructed API URL based on the user's inputs.
 *
 * @private
 */
const constructLoadRecipesUrl = function (ingredientsList, search, filtersObject) {
  //Destructure user filter inputs from filtersObject
  const { cuisine, dietaryRestrictions, macroRestrictions, course, prepTime } = filtersObject || {};

  let apiUrl = "";

  if (ingredientsList) {
    // Encode the ingredients list (properly formats multi-word ingredients)
    const encodedIngredients = encodeURIComponent(ingredientsList);
    //Generate the API url for an ingredient search (search and filtersObject are irrelevant)
    apiUrl = `${API_BASE_URL}/recipes/findByIngredients?ingredients=${encodedIngredients}&number=15&apiKey=${API_KEY}`;
  } else if (search || filtersObject) {
    //Generate the API url for a browse recipes search (ingredientsList is irrelavent)
    apiUrl = `${API_BASE_URL}/recipes/complexSearch?apiKey=${API_KEY}&number=15`;

    //Dynamically construct url based on which user inputs are provided (not set to undefined (default))
    if (search) apiUrl += `&query=${encodeURIComponent(search)}`;
    if (cuisine) apiUrl += `&cuisine=${encodeURIComponent(cuisine)}`;
    if (dietaryRestrictions) apiUrl += `&diet=${encodeURIComponent(dietaryRestrictions)}`;
    if (macroRestrictions === MAX_CALORIES) apiUrl += `&maxCalories=${macroRestrictions}`;
    if (macroRestrictions === MIN_PROTEIN) apiUrl += `&minProtein=${macroRestrictions}`;
    if (course) apiUrl += `&type=${encodeURIComponent(course)}`;
    if (prepTime) apiUrl += `&maxReadyTime=${prepTime}`;
  } else {
    apiUrl = `${API_BASE_URL}/recipes/complexSearch?number=15&sort=random&apiKey=${API_KEY}`;
  }

  return apiUrl;
};

/**
 * Extracts unique recipe IDs from the API search result data.
 *
 * @param {Object} data - The API response data.
 * @param {string|null} ingredientsList - A comma-separated list of ingredients (used to determine if it is an ingredient search (ingredientsList is not undefined) or browse recipes search).
 * @returns {string} A comma-separated string of unique recipe IDs.
 * @private
 */
const extractUniqueRecipeIds = function (data, ingredientsList) {
  //Use a set to ensure all search results (recipe Ids returned from API) are unique (no duplicates)
  const ids = new Set();

  if (ingredientsList) {
    data.forEach((recipe) => ids.add(recipe.id));
  } else {
    data.results.forEach((recipe) => ids.add(recipe.id));
  }

  // Convert the Set to a comma-separated string of final search result Ids
  return [...ids].join(",");
};
