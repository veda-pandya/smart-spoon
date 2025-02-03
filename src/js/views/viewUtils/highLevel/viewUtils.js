/**
 * @fileoverview Utility functions for the view layer, facilitating reusable and consistent operations
 * across various view files.
 */

/**
 * Retrieves the value of a form input field.
 * @param {string} selector - CSS selector for the input field.
 * @returns {string} The input value.
 * @private
 */
export const getInputValue = function (selector, parentEl) {
  return parentEl.querySelector(selector).value;
};
