/**
 * @fileoverview Controller for managing the ResultsView, which displays recipe search result cards.
 *
 * Dependencies:
 * - resultsView: For handling UI interactions and updates related to recipe result cards.
 * - sharedController: Provides the `controlBookmarks` function for managing recipe bookmarks.
 * - modalUtils: Provides modal management functions for opening recipe modals and adding recipes to the planner.
 */

//Import  view instance
import ResultsView from "../views/mainViews/resultsView.js";

//Import from shared controller
import { controlBookmarks } from "./sharedController.js";

//Import utilities
import { controlOpenRecipeDetailsModal, controlOpenAddRecipeModal } from "./controllerUtils/highLevel/modalUtils.js";

//VIEW INITIALIZATION

/**
 * Initializes the ResultsView by attaching event handlers for user interactions with recipe cards.
 *
 * Event handlers:
 * - `controlOpenRecipeDetailsModal`: Opens the Recipe Details Modal when a recipe card is clicked.
 * - `controlOpenAddRecipeModal`: Opens the Add Recipe Modal when the "Add to planner" button is clicked on the recipe card
 * - `controlBookmarks`: Toggles the bookmark status for a recipe when bookamrk icon is clicked on the recipe card
 */
export const init = function () {
  ResultsView.addRecipeCardHandlers(controlOpenRecipeDetailsModal, controlOpenAddRecipeModal, controlBookmarks);
};
