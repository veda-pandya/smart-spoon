/**
 * @fileoverview Handles loading and validating recipe details from the API and generating recipe objects.
 *
 * The loadRecipes.js file handles loading the recipeIds that match the user's search (either ingredient search for browse recipes search).
 *
 * This file contains the functions to load the details for each of those recipeIds and create standardized Recipe objects to populate the application state
 *
 * Dependencies:
 * - `state`: The application's central state object.
 * - `Recipe` class: For creating standardized recipe objects.
 * - Constants from `config.js`:
 *   - API-related values (`API_BASE_URL`, `API_KEY`).
 *   - Nutrition daily values and pantry-related constants.
 * - Shared utilities (`normalizeIngredient`, `deepCopy`).
 */

//Import application state
import { state } from "./state.js";

//Import Recipe class
import Recipe from "./RecipeClass.js";

//Import utilities
import { normalizeIngredient, deepCopy, toTitleCase } from "../sharedUtils.js";

//Import variables from config file
import { API_BASE_URL, API_KEY, RECOMMENDED_PROTEIN_DV, RECOMMENDED_FATS_DV, RECOMMENDED_CARBS_DV, COMMON_PANTRY_ITEMS, INGREDIENT_SYNONYMS } from "../config.js";

//Import default recipe image
import defaultRecipeImage from "../../images/custom-recipe-image.avif";

//LOAD RECIPE DETAILS FROM API & GENERATE RECIPE OBJECTS

/**
 * Loads recipe details from the API for each recipe ID
 * Generates standardized recipe objects to populate the application state
 * Supports searches from both the ingredient search page & browse recipes page
 *
 * @param {string} ids - Comma-separated string of recipe IDs.
 * @param {string} mode - The type of search (`"ingredientSearch"` or `"browseRecipes"`).
 * @returns {Promise<Object|null>} A result object if no recipes are valid (`{ noResults: true }`) or `null` on success.
 * @throws {Error} If the API request fails.
 */
export const loadRecipeDetails = async function (ids, mode) {
  try {
    //Fetch the recipe details for all the recipe ids
    const response = await fetch(`${API_BASE_URL}/recipes/informationBulk?ids=${ids}&includeNutrition=true&apiKey=${API_KEY}`);

    //Throw a custom error if we get an API response code that indicates some sort of failure
    if (!response.ok) throw new Error(`Failed to fetch recipe details: ${response.status}`);

    const data = await response.json();

    //Filter out invalid recipes (based on the isValidRecipe function)
    const validRecipes = data.filter((recipe) => isValidRecipe(recipe));
    if (validRecipes.length === 0) return { noResults: true };

    //Create a standardized recipe object for each valid recipe using the Recipe class
    validRecipes.forEach(function (recipe, index) {
      //If recipe already exists in the recipe book, copy that object. If not create a new one.
      const recipeObj = getOrCreateRecipeObject(recipe, mode);

      //Populate the application state with the newly created Recipe object search results
      populateSearchResults(recipeObj, mode);
    });
  } catch (error) {
    console.error("Error in loadRecipeDetails:", error);
    throw error;
  }
};

/**
 * Validates if a recipe object from the API is complete and usable (contains all necessary info).
 *
 * @param {Object} recipe - The recipe object from the API.
 * @returns {boolean} `true` if the recipe is valid, otherwise `false`.
 * @private
 */
const isValidRecipe = function (recipe) {
  return (
    recipe.title.trim() && // A valid title exists
    Number.isFinite(recipe.id) && //A valid recipe Id exists
    Number.isFinite(recipe.servings) && //Number of servings exists and is a number
    recipe.analyzedInstructions?.[0]?.steps && //Some cooking instructions exist
    recipe.extendedIngredients && // Recipe includes a list of ingredients/quantities
    recipe.nutrition && // Nutrition info is available
    //The recipe contains valid values for protein, fat, and carbs (and percentage)
    Number.isFinite(recipe.nutrition.nutrients.find((obj) => obj.name === "Protein")?.amount) &&
    Number.isFinite(recipe.nutrition.nutrients.find((obj) => obj.name === "Fat")?.amount) &&
    Number.isFinite(recipe.nutrition.nutrients.find((obj) => obj.name === "Carbohydrates")?.amount) &&
    Number.isFinite(recipe.nutrition.caloricBreakdown.percentProtein) &&
    Number.isFinite(recipe.nutrition.caloricBreakdown.percentFat) &&
    Number.isFinite(recipe.nutrition.caloricBreakdown.percentCarbs)
  );
};

// Helper function to calculate the number of ingredients the user does not have from the recipe
const calculateMissingIngredients = function (ingredients) {
  return ingredients.filter((ing) => getIngredientAvailability(ing.name).availabilityState === "unavailable").length;
};

// Helper function to get or create a recipe object depending on if it exists in the recipe book
const getOrCreateRecipeObject = function (recipe, mode) {
  const existingRecipe = state.recipeBook.find((meal) => meal.id === recipe.id);

  if (existingRecipe) {
    const recipeObj = deepCopy(existingRecipe);

    // Recalculate ingredient availability
    recipeObj.ingredients.forEach((ing) => {
      ing.availability = getIngredientAvailability(ing.name);
    });

    // Update missing ingredients count if in ingredient search mode
    if (mode === "ingredientSearch") {
      recipeObj.numMissingIngredients = calculateMissingIngredients(recipeObj.ingredients);
    }

    return recipeObj;
  }

  return createRecipeObject(recipe, mode);
};

/**
 * Creates a normalized recipe object (using the Recipe class) from the object returned from the API
 * Creates standard recipe objects to populate search results in the application state
 *
 * @param {Object} recipe - The raw recipe object (search result) from the API.
 * @param {string} mode - The search mode (`"ingredientSearch"` or `"browseRecipes"`) the user used
 * @returns {Recipe} The normalized `Recipe` object.
 * @private
 */
const createRecipeObject = function (recipe, mode) {
  const isBookmarked = state.recipeBook.map((meal) => meal.id).includes(recipe.id);

  const ingredients = recipe.extendedIngredients.map((ing) => ({
    ingredientText: ing.original,
    quantity: Number(ing.measures.us.amount),
    unit: ing.measures.us.unitShort,
    name: ing.name, // Ingredient name (e.g., "garlic", "onions", etc.)
    category: ing.aisle,
    //Check if the user has the ingredient in their pantry
    availability: getIngredientAvailability(ing.name),
  }));

  const instructions = recipe.analyzedInstructions?.[0]?.steps?.map((step) => step.step) || [];

  const protein = getNutrientValue(recipe, "Protein");
  const fats = getNutrientValue(recipe, "Fat");
  const carbs = getNutrientValue(recipe, "Carbohydrates");

  const missingIngredientsCount = mode === "ingredientSearch" ? calculateMissingIngredients(ingredients) : "N/A";

  return new Recipe(
    toTitleCase(recipe.title),
    recipe.image || defaultRecipeImage,
    recipe.id,
    isBookmarked,
    recipe.dishTypes[0] || "Unavailable",
    recipe.diets,
    recipe.readyInMinutes || "Unavailable",
    recipe.cuisines[0] || "Unavailable",
    getNutrientValue(recipe, "Calories"),
    recipe.servings,
    ingredients,
    instructions,
    getNutrientValue(recipe, "Saturated Fat"),
    getNutrientValue(recipe, "Sugar"),
    getNutrientValue(recipe, "Fiber"),
    getNutrientValue(recipe, "Sodium"),
    getNutrientValue(recipe, "Cholesterol"),
    getNutrientValue(recipe, "Iron"),
    getNutrientValue(recipe, "Zinc"),
    getNutrientValue(recipe, "Calcium"),
    getNutrientValue(recipe, "Magnesium"),
    protein, //do not need a fallback value since we have verified value exists (isValidRecipe). same for below
    fats,
    carbs,
    recipe.nutrition.caloricBreakdown.percentProtein,
    recipe.nutrition.caloricBreakdown.percentFat,
    recipe.nutrition.caloricBreakdown.percentCarbs,
    (protein / RECOMMENDED_PROTEIN_DV) * 100,
    (fats / RECOMMENDED_FATS_DV) * 100,
    (carbs / RECOMMENDED_CARBS_DV) * 100,
    missingIngredientsCount,
    "app"
  );
};

/**
 * Adds a recipe object to the appropriate search results array in the application state.
 * If it is an ingredient search, all search result recipe objects will be added to state.ingredientSearchResults
 * If it is a search from the browse recipes page search result recipe objects will be added to state.browseSearchResults
 *
 * @param {Recipe} recipeObj - The recipe object to add.
 * @param {string} mode - The search mode (`"ingredientSearch"` or `"browseRecipes"`).
 * @private
 */
const populateSearchResults = function (recipeObj, mode) {
  const resultsArray = mode === "ingredientSearch" ? state.ingredientSearchResults : state.browseSearchResults;
  resultsArray.push(recipeObj);

  // If it's an ingredient search, sort the results by numMissingIngredients (ascending order)
  if (mode === "ingredientSearch") {
    resultsArray.sort((a, b) => a.numMissingIngredients - b.numMissingIngredients);
  }
};

//HELPER FUNCTIONS

/**
 * Retrieves the value of a specific nutrient from a recipe object.
 *
 * @param {Object} recipe - The recipe object.
 * @param {string} nutrientName - The name of the nutrient (e.g., "Protein").
 * @returns {number|string} The nutrient value or `"-"` if unavailable/ not a number.
 * @private
 */
export const getNutrientValue = function (recipe, nutrientName) {
  const nutrient = recipe.nutrition?.nutrients.find((obj) => obj.name === nutrientName);
  const amount = nutrient?.amount;
  return Number.isFinite(amount) ? amount : "-";
};

/**
 * Checks whether an ingredient needed for a recipe is available in the user's pantry (or is a common household ingredient that is assumed to be available).
 *
 * @param {string} apiIngredientName - The ingredient name from the API.
 * @returns {Object} An object describing the ingredient's availability.
 * @private
 */
const getIngredientAvailability = function (apiIngredientName) {
  const normalizedApiIngredient = normalizeIngredient(apiIngredientName);

  const householdItem = checkHouseholdItem(normalizedApiIngredient);
  if (householdItem) return householdItem; //Check for normal pantry items and always mark them as available

  const exactMatch = checkExactMatch(normalizedApiIngredient);
  if (exactMatch) return exactMatch; //Check for exact match in pantry (mark as available)

  const partialMatch = checkPartialMatch(normalizedApiIngredient);
  if (partialMatch) return partialMatch; //Check for partial match in the pantry (mark as potential match)

  const synonymMatch = checkSynonymMatch(normalizedApiIngredient);
  if (synonymMatch) return synonymMatch; //Check for synonym match (mark as potential match)

  return { availabilityState: "unavailable", matchedIngredient: null }; // No match found, ingredient is unavailable
};

//Check if the ingredient matches an ingredient in the common pantry items list. If so mark ingrdient as available
const checkHouseholdItem = function (ingredient) {
  const householdItem = COMMON_PANTRY_ITEMS.find((commonItem) => ingredient === commonItem);
  return householdItem ? { availabilityState: "householdItem", matchingPantryIngredient: householdItem } : null;
};

//Check if the ingredient needed matches an ingredient in the user's pantry exactly
const checkExactMatch = function (ingredient) {
  const match = state.pantry.some((pantryItem) => pantryItem === ingredient);
  return match ? { availabilityState: "definitelyAvailable", matchingPantryIngredient: ingredient } : null;
};

//Check if the ingredient needed partially matches an ingredient in the user's pantry
const checkPartialMatch = function (ingredient) {
  const pantryMatch = state.pantry.find((pantryItem) => pantryItem.includes(ingredient));
  const ingredientMatch = state.pantry.find((pantryItem) => ingredient.includes(pantryItem));
  const match = pantryMatch || ingredientMatch;
  return match ? { availabilityState: "potentiallyAvailable", matchingPantryIngredient: match } : null;
};

//Checks for common synonyms of the ingredient required to see if a user may have something similar
const checkSynonymMatch = function (ingredient) {
  for (const [key, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
    const match = synonyms.find((synonym) => ingredient.includes(synonym));
    return match ? { availabilityState: "potentiallyAvailable", matchingPantryIngredient: key } : null;
  }
};
