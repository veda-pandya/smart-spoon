/**
 * @fileoverview Controller for managing the navigation bar interactions.
 *
 * Responsibilities:
 * - Handles user interactions with the navigation bar, such as clicking links or toggling the burger menu.
 *
 * Dependencies:
 * - navBarView: Provides the UI interactions for the navigation bar.
 * - sharedController: Provides the `controlNavBar` function for handling view switching based on link clicks.
 */

//Import view instances
import NavBarView from "../views/mainViews/navBarView.js";

//Import from shared controller
import { controlNavBar } from "./sharedController.js";

//VIEW INITIALIZATION

/**
 * Initializes the navigation bar by attaching event handlers for user interactions.
 *
 * Event handlers:
 * - Toggles the burger menu when the burger button is clicked (on smaller screens).
 * - Calls `controlNavBar` to switch views when a navigation link is clicked.
 */
export const init = function () {
  NavBarView.addHandlerBurgerMenu();
  NavBarView.addHandlerNavbarLinks(controlNavBar);
};
