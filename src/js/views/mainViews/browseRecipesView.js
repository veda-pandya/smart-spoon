/**
 * @fileoverview BrowseRecipesView is a child of SearchableView. It manages the UI and interactions
 * for browsing and filtering recipes on the Browse Recipes page.
 */
import SearchableView from "./searchableView.js";

class BrowseRecipesView extends SearchableView {
  /**
   * Creates an instance of browseRecipesView.
   * @extends SearchableView
   */
  constructor() {
    super(document.querySelector(".recipe-search"));
    this.filterBtn = this.parentEl.querySelector(".recipe-search__filter-btn");
  }

  showFilterBtn() {
    this.filterBtn.classList.remove("u-hidden");
  }

  hideFilterBtn() {
    this.filterBtn.classList.add("u-hidden");
  }

  /**
   * Renders a message showing the number of filters applied.
   * @param {number} numAppliedFilters - The number of filters currently applied.
   */
  renderAppliedFiltersMessage(numAppliedFilters) {
    this.parentEl.querySelector(".recipe-search__applied-filter-info").textContent = `${numAppliedFilters} ${numAppliedFilters === 1 ? "filter" : "filters"} applied.`;
  }

  clearAppliedFilterMessage() {
    this.parentEl.querySelector(".recipe-search__applied-filter-info").textContent = "";
  }

  /**
   * Adds an event listener to the search bar for handling Enter keypress events.
   * @param {Function} handler - The callback to execute when the Enter key is pressed.
   * The handler is called with `"searchNoFilters"` as its argument (triggers a plain search bar search without any filters).
   */
  addHandlerSearchBar(handler) {
    const searchBar = this.parentEl.querySelector(".search-bar__input--recipe-search-page");
    searchBar.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handler("searchNoFilters");

        //// Clear autocomplete suggestions after 1 second from when the user presses 'Enter' to avoid debounce-related issues.
        setTimeout(() => {
          super.clearAutocompleteSuggestions(); // Function to clear suggestions
        }, 1000); // Adjust the time as needed (2000ms = 2 seconds)
      }
    });
  }

  /**
   * Adds an event listener to the 'Filter Search Results' button.
   * @param {Function} handler - The callback to execute when the filter button is clicked (will open the Filter Recipes modal)
   */
  addHandlerFilterBtn(handler) {
    this.filterBtn.addEventListener("click", () => {
      handler("filterRecipes");
    });
  }

  /**
   * Adds an event listener to the 'Browse Recipe Collection' button.
   * @param {Function} handler - The callback to execute when the browse button is clicked (will open the Browse Collection Modal).
   */
  addHandlerBrowseBtn(handler) {
    const browseBtn = this.parentEl.querySelector(".recipe-search__browse-btn");
    browseBtn.addEventListener("click", () => {
      handler("browseRecipeCollection");
    });
  }

  /**
   * Adds an event listener to the 'Meal Planner' button for navigating to the meal planner.
   * @param {Function} handler - The callback to execute when the meal planner button is clicked.
   */
  addHandlerPlannerBtn(handler) {
    const mealPlanBtn = this.parentEl.querySelector(".recipe-search__meal-plan-btn");
    mealPlanBtn.addEventListener("click", () => {
      handler("planner");
    });
  }
}

export default new BrowseRecipesView();
