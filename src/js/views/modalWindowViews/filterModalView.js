/**
 * @fileoverview FilterModalView manages filter-related functionality for modals,
 * including generating filter objects, resetting filters, and handling filter submission.
 * It extends ModalView and serves as a parent class for specific filter modals like
 * browse recipe collection modal and filter modal.
 */

import ModalView from "./ModalView.js";

class FilterModalView extends ModalView {
  /**
   * Generates a filters object based on the user's selected dropdown values in the modal.
   * The filters object contains the user's selections.
   * If the user left the default option in a dropdown, record undefined in the filters object
   * The filters object is used to make a browse recipes search from either the Filter Recipes Modal or Browse Collection Modal
   * @returns {Object} An object containing filter criteria.
   */
  generateFiltersObject() {
    //Maps the HTML dropdown dataset values to the corresponding properties in filtersObject
    const dropdownMappings = {
      "cuisine-filter": "cuisine",
      "dietary-restriction-filter": "dietaryRestrictions",
      "macro-restriction-filter": "macroRestrictions",
      "meal-type-filter": "course",
      "cooking-time-filter": "prepTime",
    };

    // Initialize the filters object with all properties set to undefined
    const filtersObject = {
      cuisine: undefined,
      dietaryRestrictions: undefined,
      macroRestrictions: undefined,
      course: undefined,
      prepTime: undefined,
    };

    // Select all visible dropdowns
    const dropdowns = this.parentEl.querySelectorAll(".dropdown");

    // Populate the filters object with the values input into the filter dropdowns on the modal by the user
    dropdowns.forEach((dropdown) => {
      const key = dropdownMappings[dropdown.dataset.description]; // Get corresponding key for this dropdown
      if (key) {
        //Get value from dropdown and store in filters object. If it is the default dropdown value, set the property in the filters object to undefined
        const value = dropdown.value === "default" ? undefined : dropdown.value;
        filtersObject[key] = value;
      }
    });

    return filtersObject;
  }

  /**
   * Resets all dropdown filters in the modal to their default values.
   */
  resetFilters() {
    const dropdowns = this.parentEl.querySelectorAll(".dropdown");
    dropdowns.forEach((dropdown) => (dropdown.value = "default"));
  }

  /**
   * Adds an event listener to the 'Reset Filters' button in the modal for clearing all filters.
   */
  addHandlerResetFilters() {
    this.parentEl.querySelector(".g-reset-btn").addEventListener("click", () => {
      this.resetFilters();
    });
  }

  /**
   * Adds an event listener to the submit button on the modal.
   * @param {Function} handler - Callback function to handle the filter submission.
   *
   *  A browse recipes search will be triggered when:
   *  - The 'Apply Filters' button on the Filter Recipes Modal is pressed
   *  - The 'Browse Recipes' button on the Browse Collection Modal is pressed
   *  The mode tracks which of the above 2 buttons was pressed and the mode is passed to the handler
   *  The handler then triggers a search
   */
  addHandlerSubmitFilters(handler) {
    this.parentEl.querySelector(".modal-window__submit-btn").addEventListener("click", (e) => {
      // Prevent the default form submission behavior
      e.preventDefault();
      //Determine which modal the call is coming from and hence what type of search needs to be made
      const mode = e.target.textContent === "Apply Filters" ? "searchWithFilters" : "browseRecipeCollectionSearch";
      handler(mode);
    });
  }
}

export default FilterModalView;
