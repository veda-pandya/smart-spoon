/**
 * @fileoverview IngredientSearchView manages the UI interactions for the ingredient search page.
 * It handles displaying pantry items, common ingredients, and scrolling to suggested recipes.
 * It also manages event listeners for user actions like searching, adding, or removing ingredients.
 */
import SearchableView from "./SearchableView.js";

class IngredientSearchView extends SearchableView {
  /**
   * Creates an instance of IngredientSearchView.
   * @extends SearchableView
   */
  constructor() {
    super(document.querySelector(".ingredient-search"));
    this.pantry = this.parentEl.querySelector(".ingredient-search__pantry");
    this.commonIngredients = this.parentEl.querySelectorAll(".ingredient-search__common-ingredient");
  }

  getCommonIngredients() {
    return this.commonIngredients;
  }

  /**
   * Renders a pantry ingredient in the UI.
   * @param {string} ingredient - The ingredient to add to the pantry.
   */
  renderPantryIngredient(ingredient) {
    const markup = `
      <li class="ingredient-search__pantry-ingredient-container">
        <button class="u-icn-btn ingredient-search__remove-ingredient-btn" aria-label="Remove ingredient">&times;</button>
        <p class="ingredient-search__pantry-ingredient">${ingredient}</p>
      </li>`;

    this.pantry.insertAdjacentHTML("beforeend", markup);
  }

  /**
   * Removes a specific ingredient from the pantry in the UI.
   * @param {string} ingredient - The ingredient to remove.
   */
  removePantryIngredient(ingredient) {
    const pantryItems = [...this.parentEl.querySelectorAll(".ingredient-search__pantry-ingredient-container")];
    const pantryItem = pantryItems.find((item) => item.querySelector(".ingredient-search__pantry-ingredient").textContent === ingredient);

    if (pantryItem) pantryItem.remove();
  }

  /**
   * Marks the common ingredient on the UI as selected or unselected
   * @param {HTMLElement} ingredient - The ingredient element to toggle.
   */
  toggleCommonIngredient(ingredient) {
    ingredient.classList.toggle("ingredient-search__common-ingredient--active");
  }

  /**
   * Smoothly scrolls to the suggested recipes section, adjusting for the navbar height.
   */
  scrollToResultsSection() {
    const resultsSection = document.querySelector(".ingredient-search__suggested-recipes-section");
    const navbar = document.querySelector(".header");

    const navbarHeight = navbar.offsetHeight;
    const resultsPosition = resultsSection.getBoundingClientRect().top + window.scrollY; // Position relative to document

    window.scrollTo({
      top: resultsPosition - navbarHeight, // Adjust for navbar height
      behavior: "smooth", // Smooth scrolling
    });
  }

  /**
   * Finds a matching common ingredient element by name.
   * @param {string} itemName - The name of the ingredient to find.
   * @returns {HTMLElement|undefined} The matching ingredient element, if found.
   * @private
   */
  #findMatchingCommonIngredient(itemName) {
    return [...this.commonIngredients].find((commonIngredient) => commonIngredient.textContent === itemName);
  }

  /**
   * When a user removes an ingredient from the pantry, if it is a common ingredient, mark the common ingredient as deselected as well
   * @param {string} itemToRemove - The name of the ingredient to deactivate.
   * @private
   */
  #removeIngredientFromCommonList(itemToRemove) {
    const matchingCommonIngredient = this.#findMatchingCommonIngredient(itemToRemove);
    if (matchingCommonIngredient) this.toggleCommonIngredient(matchingCommonIngredient);
  }

  /**
   * Adds an event listener for searching ingredients in the search bar.
   * @param {Function} handler - The callback to execute when the Enter key is pressed (ingredient will be added to pantry).
   */
  addHandlerSearchIngredient(handler) {
    const inputField = this.parentEl.querySelector(".search-bar__input--ingredients-page");
    inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const ingredient = this.getSearchInput();

        handler(ingredient, "search");

        // Clear autocomplete suggestions slightly after the user presses 'Enter' to account for debounce issues.
        setTimeout(() => {
          super.clearAutocompleteSuggestions();
        }, 1000);
      }
    });
  }

  /**
   * Adds an event listener for removing ingredients from the pantry (when the user clicks the "x" button on an ingredient element in the pantry).
   * @param {Function} handler - The callback to execute with the ingredient name to remove.
   */
  addHandlerRemoveIngredient(handler) {
    this.pantry.addEventListener("click", (e) => {
      const clickedXButton = e.target.closest(".ingredient-search__remove-ingredient-btn");
      if (!clickedXButton) return; // Ensure the click is on a valid element

      const pantryIngredient = clickedXButton.closest(".ingredient-search__pantry-ingredient-container");
      const itemToRemove = pantryIngredient.querySelector(".ingredient-search__pantry-ingredient").textContent;

      this.#removeIngredientFromCommonList(itemToRemove);
      handler(itemToRemove);
    });
  }

  /**
   * Adds an event listener for toggling common ingredient states.
   * @param {Function} activateHandler - Callback for activating an ingredient (adds the common ingredient to the pantry).
   * @param {Function} deactivateHandler - Callback for deactivating an ingredient (removes the common ingredient from the pantry).
   */
  addHandlerCommonIngredient(activateHandler, deactivateHandler) {
    const commonIngredientsContainer = this.parentEl.querySelector(".ingredient-search__common-ingredients-container");
    commonIngredientsContainer.addEventListener("click", (e) => {
      const clickedIngredient = e.target.closest(".ingredient-search__common-ingredient");
      if (!clickedIngredient) return; // Ensure the click is on a valid element

      this.toggleCommonIngredient(clickedIngredient);

      if (clickedIngredient.classList.contains("ingredient-search__common-ingredient--active")) {
        activateHandler(clickedIngredient.textContent, "commonIngredient");
      } else {
        deactivateHandler(clickedIngredient.textContent);
      }
    });
  }

  /**
   * Adds an event listener to the "View Recipe Suggestions" button.
   * @param {Function} handler - The callback to execute when the button is clicked. (triggers a search)
   */
  addHandlerViewIngredientRecipes(handler) {
    const viewResultsBtn = this.parentEl.querySelector(".ingredient-search__view-results-btn");
    viewResultsBtn.addEventListener("click", handler);
  }
}

export default new IngredientSearchView();
