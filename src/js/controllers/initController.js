/**
 * @fileoverview Main entry point for the application.
 * Initializes the app, sets up the state, and attaches event listeners across all controllers.
 *
 * Responsibilities:
 * - Initializes app state, including the recipe book and meal planner from local storage.
 * - Sets up the `init` functions for all controllers to manage specific features.
 * - Serves as the central hub to ensure all components are loaded and ready for user interaction.
 *
 * Dependencies:
 * - Controllers:
 *   - `navBarController`: Manages the navigation bar.
 *   - `homePageController`: Handles interactions on the home page.
 *   - `ingredientSearchController`: Manages ingredient-based recipe search.
 *   - `browseRecipesController`: Handles the Browse Recipes Page and modals.
 *   - `recipeBookController`: Manages the RecipeBookView and custom recipes.
 *   - `searchResultsController`: Handles UI updates for recipe search result cards.
 *   - `recipeDetailsController`: Manages the Recipe Details modal.
 *   - `addMealController`: Handles the Add Recipe Modal and Add Meal To Slot Modal.
 *   - `mealPlanController`: Manages the MealPlanView.
 * - `model`: Provides the application state and utilities for managing recipes and meal plans.
 */

//Import all controller files
import * as navBarController from "./navBarController.js";
import * as homePageController from "./homePageController.js";
import * as ingredientSearchController from "./ingredientSearchController.js";
import * as browseRecipesController from "./browseRecipesController.js";
import * as recipeBookController from "./recipeBookController.js";
import * as searchResultsController from "./searchResultsController.js";
import * as recipeDetailsController from "./recipeDetailsController.js";
import * as addMealController from "./addMealController.js";
import * as mealPlanController from "./mealPlanController.js";

//Import model
import * as model from "../model/index.js";

//INIT FUNCTION

/**
 * Initializes the application.
 *
 * Steps:
 * 1. **Initialize App State**:
 *    - Loads the recipe book from local storage into the app state.
 *    - Loads the meal planner data from local storage into the app state.
 *
 * 2. **Attach Event Listeners**:
 *    - Calls the `init` function of each controller to set up event handlers for all interactive elements.
 *
 * Notes:
 * - Uncomment `model.clearRecipeBook()` or `model.clearMealPlan()` during development to reset app state.
 */
const init = function () {
  // PART 1 OF INIT: INITIALIZE APP
  //model.clearRecipeBook(); // Uncomment during development to clear the recipe book
  //model.clearMealPlan(); // Uncomment during development to clear the meal plan

  // Initialize recipe book
  model.initializeRecipeBook();

  //Initialize the meal planner
  model.initializeMealPlan();

  //PART 2 OF INIT: ADD EVENT LISTENERS TO ALL BUTTONS AND INTERACTIVE ELEMENTS
  navBarController.init();
  homePageController.init();
  ingredientSearchController.init();
  browseRecipesController.init();
  recipeBookController.init();
  searchResultsController.init();
  recipeDetailsController.init();
  addMealController.init();
  mealPlanController.init();
};

//Beginning of program execution
init();
