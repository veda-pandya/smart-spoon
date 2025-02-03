/**
 * @fileoverview This file manages the Recipe Details Modal view in the application.
 * It handles rendering recipe information, updating UI elements, and user interactions
 * such as bookmarking, adding to the meal planner, and adjusting servings.
 *
 * Options Object `{source, currentDate, currentMeal}` Parameters:
 * - `source`: Identifies where the recipe was clicked from. Possible values are:
 *    - `'ingredientSearch'`: Recipe was clicked from the ingredient search results.
 *    - `'browseRecipeSearch'`: Recipe was clicked from the browse recipes search results.
 *    - `'recipeBook'`: Recipe was clicked from the recipe book.
 *    - `'mealPlan'`: Recipe was clicked from the meal planner.
 * - `currentDate`: Only relevant when the source is `'mealPlan'`. It specifies the date
 *    under which the recipe exists in the meal plan (e.g., 'Mon Jan 20 2025').
 * - `currentMeal`: Only relevant when the source is `'mealPlan'`. It specifies the meal slot
 *    where the recipe exists (e.g., `'lunch'` or `'dinner'`).
 *    When the source is not `'mealPlan'`, both `currentDate` and `currentMeal` are `null`.
 *
 * The `source` (and `currentDate`/`currentMeal` when applicable) parameters are needed
 * to locate/retrieve the recipe in the model.
 *
 */

import ModalView from "./modalView.js";

//Import utilities
import { getIngredientMarkup, formatNutrientLabel, numToNearestFraction } from "../viewUtils/featureSpecific/recipeDetailsModalUtils.js";

//Import constants from config file
import { CHART_COLORS, PIE_CHART_TOOLTIP_MESSAGES } from "../../config.js";

class RecipeDetailsModal extends ModalView {
  constructor() {
    super(document.querySelector(".recipe-modal"));
    this.recipeHeading = this.parentEl.querySelector(".recipe-modal__heading");
    this.addToPlannerBtn = this.parentEl.querySelector(".recipe-modal__add-to-planner-btn");
    // Initialize nutrientChart as null
    this.nutrientChart = null;
  }

  /**
   * Handles rendering the Recipe Details Modal : .
   * - Store recipe location info (options object data) in data attributes so that the recipe can be accessed in the model, should any changes be made via user interactions (change in bookmark status, servings update etc.)
   * - Render the various sections of the modal
   *
   * Parameters use the shared "source-currentDate-currentMeal" pattern.
   * For details, see the documentation at the top of this file.
   *
   * @param {object} recipe - The recipe for which the Recipe Details Modal is being rendered.
   * @param {Object} options - Used to locate a recipe in the model (stored in data attributes for future reference in the setModalAttributes function)
   * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
   * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
   * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.
   */

  renderRecipeContent(recipe, showIngredientAvailability, { source, currentDate = null, currentMeal = null }) {
    this.#setModalAttributes(recipe, { source, currentDate, currentMeal });

    this.recipeHeading.textContent = recipe.title;

    this.#updateRecipeImage(recipe);
    this.#updateDietaryRestrictions(recipe);
    this.#updateBookmark(recipe);
    this.#updateHighlights(recipe);
    this.#updateAddToPlannerButton(source);
    this.#updateServings(recipe);
    this.#updateIngredientMessage(showIngredientAvailability);
    this.#updateIngredientsList(recipe, showIngredientAvailability);
    this.#updateInstructions(recipe);
    this.#updateNutritionInfo(recipe);
    this.#updateMacroBarGraph(recipe);
    this.#updateNutrientChart(Math.round(recipe.percentCarbs), Math.round(recipe.percentProtein), Math.round(recipe.percentFats));
  }

  //Updates the bookmark icon based on the bookmark status
  updateBookmarkBtn(isBookmarked) {
    const bookmarkIcon = this.parentEl.querySelector(".recipe-modal__bookmark-btn i");

    if (isBookmarked) {
      bookmarkIcon.className = "bi bi-bookmark-fill recipe-card__bookmark-icn recipe-card__bookmark-icn--bookmarked";
    } else {
      bookmarkIcon.className = "bi bi-bookmark recipe-card__bookmark-icn";
    }
  }

  //Returns the number of servings input by the user
  getNumServings() {
    return this.parentEl.querySelector(".recipe-modal__num-servings").textContent;
  }

  //Updates ingredient quantities after a servings update
  adjustIngredientQuantities(servingRatio) {
    const quantities = this.parentEl.querySelectorAll(".recipe-modal__ingredient-qty");
    quantities.forEach((quantityElement) => {
      const originalQuantity = parseFloat(quantityElement.getAttribute("data-original-quantity"));
      const updatedQuantity = originalQuantity * servingRatio;

      quantityElement.innerHTML = numToNearestFraction(updatedQuantity);
    });
  }

  /**.
   * Store recipe location info (options object data) in data attributes so that the recipe can be accessed in the model, should any changes be made via user interactions (change in bookmark status, servings update etc.)
   * If the user chooses to add the recipe to the meal plan, the info stored in the data attributes can be used to access the recipe in the model and copy it into the meal plan
   *
   * Parameters use the shared "source-currentDate-currentMeal" pattern.
   * For details, see the documentation at the top of this file.
   *
   * @param {object} recipe - The recipe for which the Recipe Details Modal is being rendered.
   * @param {Object} options - Used to locate a recipe in the model
   * @param {string} options.source - Source of the recipe (e.g., 'mealPlan').
   * @param {string|null} [options.currentDate=null] - Date the recipe is under in the meal plan.
   * @param {string|null} [options.currentMeal=null] - Meal slot the recipe is under in the meal plan.
   */
  #setModalAttributes(recipe, { source, currentDate, currentMeal }) {
    // Clear any previous recipe location data when the Recipe Details Modal is not opened from the meal plan
    if (source !== "mealPlan") {
      this.parentEl.removeAttribute("data-plannerdate");
      this.parentEl.removeAttribute("data-plannermeal");
    }

    //If the call to open the Recipe Details Modal comes from the meal planner, store which day and meal the recipe is currently scheduled in. These can be used later to locate the recipe in the model to make servings adjustments
    if (source === "mealPlan" && currentDate && currentMeal) {
      this.parentEl.setAttribute("data-plannerdate", currentDate);
      this.parentEl.setAttribute("data-plannermeal", currentMeal);
    }

    this.recipeHeading.setAttribute("data-id", recipe.id);
    this.recipeHeading.setAttribute("data-source", source);
  }

  //Updates the image on the modal
  #updateRecipeImage(recipe) {
    const imageEl = this.parentEl.querySelector(".recipe-modal__img");
    imageEl.src = recipe.image;
    imageEl.alt = recipe.title;
  }

  //Updates the dietary restrictions section based on recipe object
  #updateDietaryRestrictions(recipe) {
    const dietaryRestrictionsEl = this.parentEl.querySelector(".recipe-modal__dietary-preferences");

    const dietaryRestrictionsMarkup = recipe.dietaryRestrictions.length ? recipe.dietaryRestrictions.map((diet) => `<span class="recipe-modal__dietary-preference">${diet}</span>`).join("") : "No Dietary Restrictions";

    dietaryRestrictionsEl.innerHTML = dietaryRestrictionsMarkup;
  }

  //Update the bookmark icon based on recipe object data (isBookmarked property)
  #updateBookmark(recipe) {
    const bookmarkBtn = this.parentEl.querySelector(".recipe-modal__bookmark-btn");

    const bookmarkIcnMarkup = recipe.isBookmarked ? "bi bi-bookmark-fill recipe-card__bookmark-icn recipe-card__bookmark-icn--bookmarked" : "bi bi-bookmark recipe-card__bookmark-icn";

    bookmarkBtn.innerHTML = `<i class="${bookmarkIcnMarkup}"></i>`;
  }

  //Updates the recipe highlights (calories, prep time, cuisine, meal type)
  #updateHighlights(recipe) {
    const highlights = document.querySelectorAll(".recipe-modal__highlight");
    const caloriesEl = this.parentEl.querySelector(".recipe-modal__calories");

    highlights.forEach((highlight) => {
      const highlightText = highlight.dataset.highlight
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());

      const value = recipe[highlight.dataset.highlight];
      const unit = highlight.dataset.highlight === "prepTime" && value !== "Unavailable" ? "mins" : "";
      highlight.innerHTML = `<span class="recipe-modal__highlight-label">${highlightText}: </span>${value} ${unit}`;
    });

    caloriesEl.textContent = recipe.calories !== "-" ? `${Math.round(recipe.calories)} calories` : recipe.calories;
  }

  //Show the Add To Planner button only when the recipe is not opened from the meal plan
  #updateAddToPlannerButton(source) {
    this.addToPlannerBtn.classList.toggle("u-hidden", source === "mealPlan");
  }

  //Populate the number of servings
  #updateServings(recipe) {
    const numServingsText = `${recipe.servings} ${recipe.servings === 1 ? "serving" : "servings"}`;
    const elementsToUpdate = [this.parentEl.querySelector(".recipe-modal__num-servings"), this.parentEl.querySelector(".recipe-modal__number-servings")];

    elementsToUpdate.forEach((el) => {
      el.textContent = numServingsText;
    });
  }

  //Show the common household items message if the modal is opened from an ingredient search
  #updateIngredientMessage(showIngredientAvailability) {
    const ingredientMessageEl = this.parentEl.querySelector(".recipe-modal__ingredient-message");

    ingredientMessageEl.textContent = showIngredientAvailability ? "Common household pantry items like salt, water, and flour are assumed to be available." : "";
  }

  //Render recipe ingredients on modal
  #updateIngredientsList(recipe, showIngredientAvailability) {
    const ingredientsContainerEl = this.parentEl.querySelector(".recipe-modal__ingredients-container");
    const ingredientsList = recipe.ingredients.map((ingredient) => getIngredientMarkup(ingredient, showIngredientAvailability)).join("");
    ingredientsContainerEl.innerHTML = ingredientsList;
  }

  //Render recipe instructions on modal
  #updateInstructions(recipe) {
    const instructionsContainerEl = this.parentEl.querySelector(".recipe-modal__instructions-container");

    const instructionsMarkup = recipe.instructions
      .map(
        (instruction) =>
          `<li class="recipe-modal__instruction">${
            instruction
              .replace(/(\.)([A-Z])/g, ". $2") // Ensures space between sentences
              .replace(/(^|\.\s*)([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`) // Capitalizes first letter of each sentence
          }</li>`
      )
      .join("");

    instructionsContainerEl.innerHTML = instructionsMarkup;
  }

  //Update nutrition tidbits
  #updateNutritionInfo(recipe) {
    const nutrientListItems = this.parentEl.querySelectorAll(".recipe-modal__nutrition-tidbit");

    nutrientListItems.forEach((listItem) => {
      const nutrient = listItem.dataset.nutrient;
      const mgNutrientValues = ["sodium", "cholesterol", "iron", "zinc", "calcium", "magnesium"];
      const unit = Number.isFinite(recipe[nutrient]) ? (mgNutrientValues.includes(nutrient) ? "mg" : "g") : "";
      const value = recipe[nutrient] !== "-" ? Math.round(recipe[nutrient]) : recipe[nutrient];

      listItem.innerHTML = `<span class="recipe-modal__nutrient-label">${formatNutrientLabel(nutrient)}:</span> ${value}${unit}`;
    });
  }

  //Update the macro bar graph
  #updateMacroBarGraph(recipe) {
    const barGraphBars = this.parentEl.querySelectorAll(".recipe-modal__macro-bar");

    barGraphBars.forEach((bar) => {
      const macro = bar.dataset.macro;
      const macroValue = Math.round(recipe[macro]);
      const percentDV = Math.round(recipe[`percentDV${macro.charAt(0).toUpperCase() + macro.slice(1)}`]);
      bar.querySelector(".recipe-modal__macro-value").textContent = `${macroValue}g`;
      bar.querySelector(".recipe-modal__bar").style.width = `${percentDV}%`;
      bar.querySelector(".recipe-modal__macro-percentage").textContent = `${percentDV}%`;
    });
  }

  // Function to create or update the macro pie chart
  #updateNutrientChart(carbs, protein, fat) {
    const chartEl = this.parentEl.querySelector("#nutrientChart");
    const ctx = chartEl.getContext("2d");

    // If chart already exists, update the data
    if (this.nutrientChart) {
      // Ensure nutrientChart has valid datasets
      if (this.nutrientChart.data && this.nutrientChart.data.datasets) {
        this.nutrientChart.data.datasets[0].data = [carbs, protein, fat];
        this.nutrientChart.data.labels = [`Carbs (${carbs}%)`, `Protein (${protein}%)`, `Fat (${fat}%)`];
        this.nutrientChart.update();
      }
    } else {
      // Create the chart for the first time
      this.nutrientChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: [`Carbs (${carbs}%)`, `Protein (${protein}%)`, `Fat (${fat}%)`],
          datasets: [
            {
              data: [carbs, protein, fat],
              backgroundColor: Object.values(CHART_COLORS),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
              labels: {
                boxWidth: 14,
                padding: 10,
                color: "#333",
                font: {
                  size: 14,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => PIE_CHART_TOOLTIP_MESSAGES[tooltipItem.dataIndex] || "No data available",
              },
            },
          },
        },
      });
    }
  }

  //Add event listener to the bookmark icon (handler function toggles bookmark status)
  addHandlerBookmarkBtn(handler) {
    this.parentEl.addEventListener("click", (e) => {
      const bookmarkBtn = e.target.closest(".recipe-modal__bookmark-btn");
      if (!bookmarkBtn) return; // Exit if no button was clicked

      const recipeId = Number(this.recipeHeading.dataset.id);
      const source = this.recipeHeading.dataset.source;

      const { plannerdate: currentDate = null, plannermeal: currentMeal = null } = this.parentEl.dataset;

      // Build the options object dynamically
      const options = { source }; // `source` is mandatory
      if (source === "mealPlan" && currentDate && currentMeal) {
        options.currentDate = currentDate;
        options.currentMeal = currentMeal;
      }

      handler(recipeId, options);
    });
  }

  //Add event listener to the 'Add To Planner' button in the modal (handler function opens Add Recipe Modal)
  addHandlerAddToPlanner(handler) {
    this.addToPlannerBtn.addEventListener("click", () => {
      const recipeId = Number(this.recipeHeading.dataset.id);
      const source = this.recipeHeading.dataset.source;
      handler(recipeId, { source });
    });
  }

  //Adds event listeners to servings buttons (plus and minus). Handler function adjusts and re-renders servings accordingly
  addHandlerUpdateServings(handler) {
    const numServingsContainer = this.parentEl.querySelector(".recipe-modal__num-servings-container");

    numServingsContainer.addEventListener("click", (e) => {
      const clickedBtn = e.target.closest(".recipe-modal__servings-btn");
      if (!clickedBtn) return; // Exit if no button was clicked

      const recipeId = Number(this.recipeHeading.dataset.id);
      const source = this.recipeHeading.dataset.source;
      const operation = clickedBtn.classList.contains("recipe-modal__servings-btn--minus") ? "decreaseServings" : "increaseServings";

      const { plannerdate: currentDate = null, plannermeal: currentMeal = null } = this.parentEl.dataset;

      handler(recipeId, operation, { source, currentDate, currentMeal });
    });
  }
}

export default new RecipeDetailsModal();
