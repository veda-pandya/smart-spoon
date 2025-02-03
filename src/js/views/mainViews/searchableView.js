/**
 * @fileoverview SearchableView provides shared functionality for views with search capabilities (It is the parent class of IngredientSearchView and BrowseRecipesView).
 * It manages the search bar, autocomplete suggestions, loading spinner, and related user interactions.
 */

import BaseView from "./baseView.js";

class SearchableView extends BaseView {
  /**
   * Creates an instance of SearchableView.
   * @param {HTMLElement} parentEl - The parent element for the view.
   * @extends BaseView
   */
  constructor(parentEl) {
    super(parentEl);
    this.searchBar = this.parentEl.querySelector(".search-bar__input");
    this.loadingSpinner = this.parentEl.querySelector(".g-spinner");
    this.autoSuggestionsContainer = this.parentEl.querySelector(".search-bar__suggestions-list"); //autocomplete suggestions container
  }

  getSearchInput() {
    return this.searchBar.value;
  }

  /**
   * Resets the view by clearing search results, errors, and autocomplete suggestions.
   */
  resetView() {
    //clear any previous search result cards. clear the previous search results in state object
    this.clearSearchResults();
    //close autocomplete suggestions
    this.clearAutocompleteSuggestions();
    //clear any previous search result error
    this.renderSearchResultsError("");
    //clear any previous input errors
    this.renderSearchInputError("");
  }

  clearSearchField() {
    this.searchBar.value = "";
  }

  /**
   * Displays an error message above the search bar to signal invalid input.
   * @param {string} message - The error message to display.
   */
  renderSearchInputError(message) {
    const inputErrorEl = this.parentEl.querySelector(".error-message--search-input");
    inputErrorEl.textContent = message;
  }

  /**
   * Clears the recipe cards in the search results container.
   */
  clearSearchResults() {
    const resultsContainer = this.parentEl.querySelector(".g-search-results-container");
    resultsContainer.innerHTML = "";
  }

  /**
   * Displays an error message in the search results area, when the search itself returns ar error.
   * @param {string} message - The error message to display.
   */
  renderSearchResultsError(message) {
    const resultsErrorEl = this.parentEl.querySelector(".error-message--search-results");
    resultsErrorEl.innerHTML = message;
  }

  showLoadingSpinner() {
    this.loadingSpinner.classList.remove("u-hidden");
  }

  hideLoadingSpinner() {
    this.loadingSpinner.classList.add("u-hidden");
  }

  //SEARCH BAR AUTOCOMPLETE FUNCTIONALITY

  /**
   * Handles keydown events on the search input, focusing on the first autocomplete suggestion if "ArrowDown" is pressed.
   * @param {KeyboardEvent} event - The keydown event object.
   */
  #handleInputKeydown(event) {
    if (event.key === "ArrowDown") {
      const firstSuggestion = this.parentEl.querySelector(".search-bar__autocomplete-suggestion");
      if (firstSuggestion) {
        event.preventDefault();
        firstSuggestion.focus();
      }
    }
  }

  /**
   * Renders autocomplete suggestions in the UI and attaches event listeners for interaction.
   * @param {Array<string>} suggestionsList - An array of suggestion strings to display.
   */
  renderAutocompleteSuggestions(suggestionsList) {
    //generate HTML for autocomplete suggestions and show the suggestions
    this.autoSuggestionsContainer.innerHTML = suggestionsList.map((suggestion) => `<li class="search-bar__autocomplete-suggestion" tabindex="0">${suggestion}</li>`).join("");

    this.autoSuggestionsContainer.classList.remove("u-hidden");

    // Check if listeners have already been added (tracked by a data attribute)
    if (!this.autoSuggestionsContainer.dataset.listenersAdded) {
      //handles a click on a suggestion
      this.autoSuggestionsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("search-bar__autocomplete-suggestion")) {
          this.#handleSuggestionClick(e);
        }
      });

      //handles any keypress on a suggestion (allows for selecting an option via the 'Enter' key or navigating between options via the up and down arrows)
      this.autoSuggestionsContainer.addEventListener("keydown", (e) => {
        if (e.target.classList.contains("search-bar__autocomplete-suggestion")) {
          this.#handleSuggestionKeydown(e);
        }
      });

      // Mark listeners as added by updating data attribute
      this.autoSuggestionsContainer.dataset.listenersAdded = "true";
    }
  }

  /**
   * Clears and hides autocomplete suggestions from the UI.
   */
  clearAutocompleteSuggestions() {
    this.autoSuggestionsContainer.innerHTML = "";
    this.autoSuggestionsContainer.classList.add("u-hidden");
  }

  /**
   * Handles a click on an autocomplete suggestion, updating the search bar value with the clicked suggestion.
   * @param {MouseEvent} event - The click event object.
   */
  #handleSuggestionClick(event) {
    const selectedSuggestion = event.target.textContent;
    this.searchBar.value = selectedSuggestion;
    this.searchBar.focus();
    this.clearAutocompleteSuggestions(); // Optionally clear suggestions after selection
  }

  /**
   * Handles keydown events on autocomplete suggestions, enabling navigation and selection.
   * @param {KeyboardEvent} event - The keydown event object.
   */
  #handleSuggestionKeydown(event) {
    const suggestionItems = Array.from(this.parentEl.querySelectorAll(".search-bar__autocomplete-suggestion"));
    const currentIndex = suggestionItems.indexOf(event.target);

    switch (event.key) {
      //Go to next suggestion if the user clicks the down arrow
      case "ArrowDown":
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % suggestionItems.length;
        suggestionItems[nextIndex].focus();
        break;
      //Go to previous suggestion if the user clicks the down arrow
      case "ArrowUp":
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + suggestionItems.length) % suggestionItems.length;
        suggestionItems[prevIndex].focus();
        break;
      //Select the autocomplete suggestion if the user clicks 'Enter'
      case "Enter":
        event.preventDefault();
        this.#handleSuggestionClick(event);
        break;

      default:
        break;
    }
  }

  //add the event handlers to make autocomplete work
  /**
   * Adds an event listener for handling autocomplete suggestions based on user input.
   * Listens for a change in input in the search bar and triggers the callback which retrives autocomplete suggestions from the Spoonacular API based on the partial input
   *
   *Used debouncing to avoid too many API calls in a short time frame
   * @param {Function} handler - The callback function to execute with the input value.
   */
  addHandlerAutocompleteSuggestions(handler) {
    let debounceTimeout; // Variable to store the timeout reference

    this.searchBar.addEventListener("input", () => {
      const partialInput = this.getSearchInput();
      const viewName = this.parentEl.classList.contains("ingredient-search") ? "ingredientSearchView" : "browseRecipesView";

      // Clear the previous timeout if the user types again before the timeout completes
      clearTimeout(debounceTimeout);

      // If the input is empty, clear the autocomplete suggestions and return
      if (!partialInput.trim()) {
        this.clearAutocompleteSuggestions(); // Function to clear the suggestions from the UI
        return;
      }

      // Set a new timeout to trigger the handler after a delay (e.g., 200ms)
      debounceTimeout = setTimeout(() => {
        handler(viewName, partialInput);
      }, 200);
    });
  }

  /**
   * Adds a keydown event listener for navigating autocomplete suggestions during app initialization.
   */
  addHandlerInputKeydown() {
    this.searchBar.addEventListener("keydown", (e) => this.#handleInputKeydown(e));
  }

  /**
   * Adds an event listener for detecting clicks outside the autocomplete suggestions container.
   * @param {Function} handler - The callback function to execute when a click outside is detected (the callback closes the autocomplete suggestions, as a user would expect)
   */
  addHandlerOutsideClick(handler) {
    this.parentEl.addEventListener("click", (e) => {
      const viewName = this.parentEl.classList.contains("ingredient-search") ? "ingredientSearchView" : "browseRecipesView";
      if (!this.autoSuggestionsContainer.contains(e.target)) handler(viewName);
    });
  }
}

export default SearchableView;
