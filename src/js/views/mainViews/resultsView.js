/**
 * @fileoverview ResultsView manages the rendering and interaction of recipe cards
 * across various sections: Ingredient Search Page, Browse Recipes Page and Recipe Book Page
 * It also provides handlers for interacting with the recipe cards (actions like bookmarking, adding to the planner, and opening recipes).
 */

class ResultsView {
  /**
   * Creates an instance of ResultsView.
   * Manages containers for different sources (e.g., ingredient search, browse recipes).
   */
  constructor() {
    //Object containing views that contain recipe cards to their corresponding card container element
    this.resultsContainers = {
      ingredientSearch: document.querySelector(".ingredient-search__results-container"),
      browseRecipeSearch: document.querySelector(".recipe-search__results-container"),
      recipeBook: document.querySelector(".recipe-book__results-container"),
    };
  }

  /**
   * Renders recipe cards in the specified results container.
   * @param {Array<Object>} recipeArray - Array of recipe objects to render.
   * @param {string} source - Where the recipes should be rendered (can be "ingredientSearch", "browseRecipeSearch", or "recipeBook").
   */
  renderRecipeCards(recipeArray, source) {
    const resultsContainer = this.resultsContainers[source];
    const resultsMarkup = recipeArray.map((recipe) => this.#generateCardMarkup(recipe, source)).join("");

    resultsContainer.innerHTML = resultsMarkup;
  }

  /**
   * Updates the bookmark icon on the recipe card for a specific recipe across all containers.
   * @param {number} recipeId - The ID of the recipe to update.
   * @param {boolean} isBookmarked - the bookmark status that should be reflected on the card (true if bookamrked, false if not bookmarked).
   */
  updateBookmarkBtn(recipeId, isBookmarked) {
    const bookmarkIcons = document.querySelectorAll(`[data-id="${recipeId}"] .recipe-card__bookmark-icn`);

    bookmarkIcons.forEach((bookmarkIcon) => {
      if (isBookmarked) {
        bookmarkIcon.className = "bi bi-bookmark-fill recipe-card__bookmark-icn recipe-card__bookmark-icn--bookmarked";
      } else {
        bookmarkIcon.className = "bi bi-bookmark recipe-card__bookmark-icn";
      }
    });
  }

  /**
   * Updates the servings and calorie information on recipe cards when a servings adjustment is made on the Recipe Details Modal of the corresponding recipe
   * @param {Object} recipe - The recipe object containing updated details.
   * @param {string} source - In which container to update the recupe cards ("ingredientSearch", "browseRecipeSearch", or "recipeBook").
   */
  updateRecipeHighlights(recipe, source) {
    const recipeId = recipe.id;
    // Ensure that the appropriate containers exist for the given source
    const containerEl = this.resultsContainers[source];

    // Select all recipe cards with the corresponding recipe ID in the container
    const recipeCards = containerEl.querySelectorAll(`.recipe-card[data-id="${recipeId}"]`);

    // If there are no recipe cards, there's no need to update, so we return early
    if (recipeCards.length === 0) return;

    // Loop through all the recipe cards and update them
    recipeCards.forEach((recipeCard) => {
      const servingsEl = recipeCard.querySelector(".recipe-card__qty-servings");
      const caloriesEl = recipeCard.querySelector(".recipe-card__qty-calories");

      // Update the servings and calories
      servingsEl.textContent = `${recipe.servings} ${recipe.servings > 1 ? "servings" : "serving"}`;
      caloriesEl.textContent = recipe.calories !== "-" ? `${Math.round(recipe.calories)} calories` : `${recipe.calories}`;
    });
  }

  /**
   * Generates the markup for a single recipe card. Store the recipe Id and source in data attributes so when the card is clicked, it is knowns what recipe is clicked. Together the recipeId and source from the dataset attributes can later be used to locate the recipe within the model state
   *
   * @param {Object} recipe - The recipe object that contains the details to render the card.
   * @param {string} source - Source of the recipe card ("ingredientSearch", "browseRecipeSearch", or "recipeBook").
   * @returns {string} The HTML string for the recipe card.
   * @private
   */
  #generateCardMarkup(recipe, source) {
    return `
            <li class="recipe-card" data-id=${recipe.id} data-source=${source}>
                  <img class="recipe-card__img" src="${recipe.origin === "user" ? "images/custom-recipe-image.avif" : recipe.image}" alt="${recipe.origin === "user" ? "custom recipe icon" : recipe.title}" />;
                  <div class="recipe-card__text">
                    <div class="recipe-card__top-text">
                      <h3 class="recipe-card__title">
                        <button class="recipe-card__title-clickable">${recipe.title}</button>
                      </h3>

                      ${source === "ingredientSearch" ? `<p class="recipe-card__missing-ingredients">Missing ${recipe.numMissingIngredients} ingredients</p>` : ""}
      
                      <div class="recipe-card__dietary-restrictions-container">
                        ${this.#generateDietaryRestrictionsMarkup(recipe.dietaryRestrictions)}
                      </div>
                    </div>
    
                    
                    <div class="recipe-card__bottom-text">
                      <div class="recipe-card__highlights-container">
                        <div class="u-flex-gap-1rem recipe-card__recipe-highlight recipe-card__recipe-highlight--cook-time">
                          <i class="bi bi-clock" aria-hidden="true"></i>
                          <span>${recipe.prepTime} ${recipe.prepTime === "Unavailable" ? "" : "minutes"}</span>
                        </div>
                        <div class="u-flex-gap-1rem recipe-card__recipe-highlight recipe-card__recipe-highlight--cuisine">
                          <i class="fa fa-globe" aria-hidden="true"></i>
                          <span>${recipe.cuisine}</span>
                        </div>
                        <div class="u-flex-gap-1rem recipe-card__recipe-highlight recipe-card__recipe-highlight--num-calories">
                          <i class="bi bi-fire" aria-hidden="true"></i>
                          <span class="recipe-card__qty-calories">${recipe.calories !== "-" ? Math.round(recipe.calories) : recipe.calories} ${recipe.calories !== "-" ? "calories" : ""}</span>
                        </div>
                        <div class="u-flex-gap-1rem recipe-card__recipe-highlight recipe-card__recipe-highlight--servings">
                          <i class="fa fa-cutlery" aria-hidden="true"></i>
                          <span class="recipe-card__qty-servings">${recipe.servings} servings</span>
                        </div>
                      </div>
      
                      <div class="u-flex-space-between recipe-card__action-btns">
                        <button class="secondary-btn recipe-card__add-to-planner-btn">Add to Planner</button>
                        <div class="recipe-card__bookmark-icns">
                          ${recipe.origin === "user" ? '<i class="bi bi-person-fill recipe-card__user-icn"></i>' : ""}
                          <button class="u-icn-btn recipe-card__bookmark-btn" aria-label="Bookmark recipe">
                          <i class="${this.#generateBookmarkIcnMarkup(recipe.isBookmarked)}"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>`;
  }

  //supporting function for generating the recip card markup (list of dietary restrictions that are listed on the card)
  #generateDietaryRestrictionsMarkup(restrictions) {
    return restrictions.map((restriction) => `<p class="recipe-card__dietary-restriction recipe-card__dietary-restriction--${restriction.split(" ")[0].toLowerCase()}">${restriction}</p>`).join("");
  }

  //supporting function for generating the recip card markup (correct bookmark icon based on the recipe's bookmark status in the recipe object)
  #generateBookmarkIcnMarkup(isBookmarked) {
    return isBookmarked ? "bi bi-bookmark-fill recipe-card__bookmark-icn recipe-card__bookmark-icn--bookmarked" : "bi bi-bookmark recipe-card__bookmark-icn";
  }

  /**
   * Adds event listeners to recipe cards for handling various actions.
   * @param {Function} handlerOpenRecipe - Callback for opening the Recipe Details Modal when a recipe card is clicked.
   * @param {Function} handlerAddToPlanner - Callback for opening the Add Recipe Modal when the "Add to Planner" button on the recipe card is clicked.
   * @param {Function} handlerBookmark - Callback for bookmarking a recipe when the bookmark button on a recipe card is clicked.
   */
  addRecipeCardHandlers(handlerOpenRecipe, handlerAddToPlanner, handlerBookmark) {
    Object.values(this.resultsContainers).forEach((container) => {
      //Add event listener to each results container and use event delegation
      container.addEventListener("click", (e) => {
        //check if user clicked somewhere on a recipe card
        const recipeCard = e.target.closest(".recipe-card");
        if (!recipeCard) return; // Ignore clicks outside recipe cards

        //Store the recipe ID and source (what container it was clicked from (e.g., "ingredientSearch", "browseRecipeSearch", or "recipeBook")
        const recipeId = Number(recipeCard.dataset.id);
        const source = recipeCard.dataset.source;

        //Render ingredient availibility in the Recipe Details Modal if it was an ingredient search
        const showIngredientAvailability = source === "ingredientSearch" ? true : false;

        //If the click was on the Add to Planner button
        if (e.target.closest(".recipe-card__add-to-planner-btn")) {
          handlerAddToPlanner(recipeId, { source });
          return;
        }

        //If the click was on the bookmark button
        if (e.target.closest(".recipe-card__bookmark-btn")) {
          handlerBookmark(recipeId, { source });
          return;
        }

        //Otherwise it was a general click on the recipe card. The Recipe Details Modal for that recipe will open
        handlerOpenRecipe(recipeId, showIngredientAvailability, { source });
      });
    });
  }
}

export default new ResultsView();
