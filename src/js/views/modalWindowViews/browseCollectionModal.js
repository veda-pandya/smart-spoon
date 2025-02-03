/**
 * @fileoverview BrowseCollectionModal represents the modal for browsing the entire recipe collection (the modal allows user to apply filters to narrow the search).
 * (accessed via 'Browse Recipe Collection' button on Browse Recipes page).
 * Note: A search made via the Browse Recipe Collection Modal is completely independent of the search bar on the Browse Recipes Page
 * It extends the FilterModalView and inherits all its functionality.
 */
import FilterModalView from "./filterModalView.js";

class BrowseCollectionModal extends FilterModalView {
  constructor() {
    super(document.querySelector(".browse-collection-modal"));
  }
}

export default new BrowseCollectionModal();
