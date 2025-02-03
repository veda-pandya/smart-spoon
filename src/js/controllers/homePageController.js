/**
 * @fileoverview Controller for managing interactions on the home page.
 *
 * Responsibilities:
 * - Handles user interactions with buttons and sliders on the home page.
 * - Delegates navigation-related actions to the `controlNavBar` function.
 *
 * Dependencies:
 * - homeView: Provides the UI interactions for the home page.
 * - sharedController: Provides the `controlNavBar` function for navigation.
 */

//Import view instances
import HomeView from "../views/mainViews/homeView.js";

//Import from shared controller
import { controlNavBar } from "./sharedController.js";

//VIEW INITIALIZATION

/**
 * Initializes the home page by attaching event handlers for user interactions.
 *
 * Event handlers:
 * - `addHandlerFindRecipes`: Navigates to the ingredient search page when the "Find Recipes" button is clicked.
 * - `addHandlerExploreRecipes`: Navigates to the browse recipes page when the "Explore Recipes" button is clicked.
 * - `addHandlerJoinNow`: Navigates to the ingredient search page when the "Get Started" button is clicked.
 * - `addHandlersTestimonialSlider`: Enables interactivity for the testimonial slider.
 */
export const init = function () {
  HomeView.addHandlerFindRecipes(controlNavBar);
  HomeView.addHandlerExploreRecipes(controlNavBar);
  HomeView.addHandlerJoinNow(controlNavBar);
  HomeView.addHandlersTestimonialSlider();
};
