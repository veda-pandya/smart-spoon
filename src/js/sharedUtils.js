/**
 * @fileoverview General-purpose utility functions used across the entire application,
 * including the model, view, and controller layers. These functions provide shared functionality
 * to support date manipulation, string normalization, unique ID generation, and more.
 *
 * Dependencies:
 * - `pluralize`: A library for pluralization and singularization of words, used to normalize ingredient inputs.
 */

//Import Libraries
import pluralize from "pluralize";

//Takes a date string("Mon Dec 16 2024") and formats into a format like Dec 16, 2024 to display on week slider
export const formatDateStringForSlider = function (dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
};

//Takes a date string("Mon Dec 16 2024") and formats into a format like Dec 16 or Nov 7 to display on calendar weekday panels
export const formatWeekDateForCalendar = function (dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(date);
};

//Takes a date of the format from the HTML date input (on add to calendar modal) and turns it into a date string ("Mon Dec 16 2024")
export const decodeDateFromInput = function (dateInput) {
  const [year, month, day] = dateInput.split("-");
  const dateValue = new Date(year, month - 1, day).toDateString();
  return dateValue;
};

//Normalize (trim and make lower case) ingredient inputs for consistency
export const normalizeIngredient = function (ingredient) {
  return pluralize.singular(ingredient.trim().toLowerCase());
};

//Creates a sorted array of date strings (in ascending order) from the keys of an object.
export const createSortedDateStrArr = function (object) {
  return Object.keys(object).sort((a, b) => new Date(a) - new Date(b));
};

//Generates a unique ID for recipes that do not come from the API (custom recipes, custom meal entries)
export const generateUniqueId = function () {
  const timestamp = Date.now(); // Current timestamp in milliseconds
  const randomPart = Math.floor(Math.random() * 1e6); // Random number between 0 and 999999
  return parseInt(`${timestamp}${randomPart}`, 10); // Combine and convert to a number
};

//Creates a deep copy of an object or string
export const deepCopy = function (item) {
  return JSON.parse(JSON.stringify(item));
};

//Capitalizes all letters in a title except the excluded words
export const toTitleCase = function (str) {
  const excludeWords = ["and", "with"];

  return str
    .toLowerCase()
    .replace(/\b\w+/g, (word) => (excludeWords.includes(word) ? word : word.replace(/^\w/, (c) => c.toUpperCase())))
    .replace(/-([a-z])/g, (match, letter) => `-${letter.toUpperCase()}`);
};
