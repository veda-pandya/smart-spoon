/**
 * @fileoverview This file contains utility functions to support the rendering of the Recipe Details Modal
 *
 */

/**
 * Generates HTML markup for a single ingredient.
 *
 * @param {Object} ingredient - The ingredient object containing details.
 * @param {boolean} showIngredientAvailability - Whether to display availability icons (check, x, etc.).
 * @returns {string} HTML markup for the ingredient.
 */
export const getIngredientMarkup = function (ingredient, showIngredientAvailability) {
  const icnMarkup = getIngredientIconMarkup(ingredient, showIngredientAvailability);
  return `
    <li class="u-flex-gap-1rem recipe-modal__ingredient-container">
      <p class="recipe-modal__ingredient">
        <span class="recipe-modal__ingredient-qty" data-original-quantity="${ingredient.quantity}">${numToNearestFraction(ingredient.quantity)}</span>
        ${ingredient.unit} ${ingredient.name}
      </p>
      ${icnMarkup}
    </li>`;
};

/**
 * Generates HTML markup for an ingredient availability icon.
 *
 * Purpose:
 * - Visually communicates whether an ingredient is available, unavailable, or
 *   partially available based on pantry data.
 *
 * @param {Object} ingredient - The ingredient object containing availability data.
 * @param {boolean} showIngredientAvailability - Whether to display the icon.
 * @returns {string} HTML markup for the availability icon.
 * @private
 */
const getIngredientIconMarkup = function (ingredient, showIngredientAvailability) {
  if (!showIngredientAvailability) return "";

  const availabilityState = ingredient.availability.availabilityState;

  const iconInfo = {
    definitelyAvailable: {
      class: "bi-check-lg recipe-modal__check-icn",
      ariaLabel: "You have this ingredient",
      tooltip: "You have this ingredient!",
    },
    householdItem: {
      class: "bi-house recipe-modal__question-icn",
      ariaLabel: "This is a basic pantry staple that most households generally have on hand.",
      tooltip: "This is a common household staple. It is assumed you have it on hand.",
    },
    potentiallyAvailable: {
      class: "bi-question-lg recipe-modal__question-icn",
      ariaLabel: "You have a similar ingredient that you could potentially use",
      tooltip: `You have ${ingredient.availability.matchingPantryIngredient}, which could work for ${ingredient.name}`,
    },
    unavailable: {
      class: "bi-x-lg recipe-modal__cross-icn",
      ariaLabel: "You do not have this ingredient",
      tooltip: "You do not have this ingredient",
    },
  };

  return `
    <i class="recipe-modal__icn bi ${iconInfo[availabilityState].class}" aria-label="${iconInfo[availabilityState].ariaLabel}">
      <span class="recipe-modal__tooltip-text">${iconInfo[availabilityState].tooltip}</span>
    </i>
  `;
};

//Formats a camelCase nutrient name into a readable label
export const formatNutrientLabel = function (nutrient) {
  //Regex /([a-z])([A-Z])/g: This regular expression finds places where a lowercase letter ([a-z]) is followed by an uppercase letter ([A-Z]), which is typically the case for camel case.
  return (
    nutrient
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .charAt(0)
      .toUpperCase() + nutrient.slice(1)
  );
};

/**
 * Converts a decimal or whole number into the nearest common fraction.
 *
 * Purpose:
 * - Ensures user-friendly fractional values that align with common cooking measurements.
 * - Prevents the display of unconventional fractions (e.g., 22/25) by rounding to common denominators.
 * - Supports mixed numbers for values greater than or equal to 1.
 *
 * Common Denominators:
 * - Whole, halves, thirds, fourths, eighths, sixteenths.
 *
 * Returns:
 * - A string or HTML that represents the fraction, suitable for rendering in the UI.
 *
 * Example Outputs:
 * - `2.5` → `2 <span class="g-numerator">1</span><span class="g-slash">/</span><span class="g-denominator">2</span>`
 * - `0.333` → `<span class="g-numerator">1</span><span class="g-slash">/</span><span class="g-denominator">3</span>`
 * - `1.875` → `1 <span class="g-numerator">7</span><span class="g-slash">/</span><span class="g-denominator">8</span>`
 *
 * @param {number} num - The number to convert to a fraction.
 * @returns {string} The number formatted as the nearest common fraction or mixed number.
 */
export const numToNearestFraction = function (num) {
  // List of supported denominators for common cooking fractions
  const fractions = [1, 2, 3, 4, 8, 16];

  // If the number is a whole number, return it as a plain string
  if (Number.isInteger(num)) {
    return `${num}`;
  }

  // Variables to track the best fraction and the smallest difference
  let bestFraction = null;
  let minDifference = Infinity;

  // Iterate through possible denominators to find the closest fraction
  for (const denominator of fractions) {
    // Calculate the fraction value and its difference from the input number
    const fraction = Math.round(num * denominator) / denominator;
    const difference = Math.abs(num - fraction);

    // Update the best fraction if this one is closer to the input
    if (difference < minDifference) {
      minDifference = difference;
      bestFraction = { numerator: Math.round(num * denominator), denominator };
    }
  }

  // If the best fraction is a whole number, return it as a plain string
  if (bestFraction.numerator % bestFraction.denominator === 0) {
    return `${bestFraction.numerator / bestFraction.denominator}`;
  }

  // Handle mixed numbers (e.g., 1 1/2)
  if (bestFraction.numerator >= bestFraction.denominator) {
    // Calculate the whole number and the fractional part
    const wholeNumber = Math.floor(bestFraction.numerator / bestFraction.denominator);
    const fractionPart = bestFraction.numerator % bestFraction.denominator;

    // Return the mixed number as a formatted string
    return `${wholeNumber} <span class="g-numerator">${fractionPart}</span><span class="g-slash">/</span><span class="g-denominator">${bestFraction.denominator}</span>`;
  }

  // Handle proper fractions (e.g., 1/2, 3/8)
  return `<span class="g-numerator">${bestFraction.numerator}</span><span class="g-slash">/</span><span class="g-denominator">${bestFraction.denominator}</span>`;
};
