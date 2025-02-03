/**
 * @fileoverview RecipeBookView manages the UI interactions for the Recipe Book Page.
 * It handles rendering and clearing recipes, managing visibility of the "no recipes" message,
 * and the addition of custom recipes.
 */

import BaseView from "./BaseView.js";

class RecipeBookView extends BaseView {
  /**
   * Creates an instance of RecipeBookView.
   * @extends BaseView
   */
  constructor() {
    super(document.querySelector(".recipe-book"));
    this.recipeBookContainer = this.parentEl.querySelector(".recipe-book__results-container");
    this.addCustomRecipeBtn = this.parentEl.querySelector(".recipe-book__custom-recipe-btn");
    this.noRecipesMessage = this.parentEl.querySelector(".recipe-book__no-recipes-message");
  }

  /**
   * Clears all recipe cards from the recipe book container.
   */
  clearRecipeBook() {
    this.recipeBookContainer.innerHTML = "";
  }

  //Shows the "No Recipes" message element
  showNoRecipesMessage() {
    this.noRecipesMessage.classList.remove("u-hidden");
  }

  //Hides the "No Recipes" message element.
  hideNoRecipesMessage() {
    this.noRecipesMessage.classList.add("u-hidden");
  }

  /**
   * Adds an event listener to the "Add Custom Recipe" button.
   * @param {Function} handler - The callback function to execute when the button is clicked (opens the Custom Recipe Modal).
   */
  addHandlerAddCustomRecipe(handler) {
    this.addCustomRecipeBtn.addEventListener("click", handler);
  }
}

export default new RecipeBookView();
