/**
 * @fileoverview BaseView serves as the parent class for all view components in the MVC architecture (except for ResultsView).
 * It provides common methods to control the visibility of DOM elements.
 */

class BaseView {
  /**
   * Creates an instance of BaseView.
   * @param {HTMLElement} parentEl - The root DOM element associated with the view.
   */
  constructor(parentEl) {
    this.parentEl = parentEl;
  }

  //Shows the view (by removing "u-hidden" class from the parent element)
  show() {
    this.parentEl.classList.remove("u-hidden");
  }

  //Hides the view (by removing "u-hidden" class from the parent element)
  hide() {
    this.parentEl.classList.add("u-hidden");
  }

  /**
   * Checks if the view is currently visible.
   * @returns {boolean} `true` if the view is visible, otherwise `false`.
   */
  isVisible() {
    return !this.parentEl.classList.contains("u-hidden");
  }
}

export default BaseView;
