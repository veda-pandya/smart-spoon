/**
 * @fileoverview FilterRecipesModal represents the specific modal for filtering recipes once a user has made a search (accessed via 'Filter Recipes' button on Browse Recipes page, which appears only once a user has made a search).
 * It extends the FilterModalView and inherits all its functionality.
 */
import FilterModalView from "./filterModalView.js";

class FilterRecipesModal extends FilterModalView {
  /**
   * Creates an instance of FilterRecipesModal.
   * @extends FilterModalView
   */
  constructor() {
    super(document.querySelector(".filter-recipes-modal"));
  }
}

export default new FilterRecipesModal();
