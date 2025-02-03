/**
 * @fileoverview Defines the Recipe class for representing a recipe with all its details.
 * This class is used to store and manage information about recipes throughout the application.
 */

export default class Recipe {
  /**
   * Creates an instance of the Recipe class.
   *
   * @param {string} title - The name of the recipe.
   * @param {string} image - URL of the recipe image.
   * @param {number} id - Unique identifier for the recipe.
   * @param {boolean} isBookmarked - Indicates if the recipe is bookmarked by the user.
   * @param {string} mealType - The type of meal (e.g., 'main course').
   * @param {string[]} dietaryRestrictions - List of dietary restrictions (e.g., 'vegan', 'gluten-free').
   * @param {number} prepTime - Preparation time in minutes.
   * @param {string} cuisine - The cuisine type of the recipe (e.g., 'Italian').
   * @param {number} calories - Total calories in the recipe.
   * @param {number} servings - Number of servings the recipe yields.
   * @param {Object[]} ingredients - Array of ingredient objects, each containing details like name and quantity.
   * @param {string[]} instructions - Array of step-by-step instructions for preparing the recipe.
   * @param {number} saturatedFat - Amount of saturated fat in grams.
   * @param {number} sugar - Amount of sugar in grams.
   * @param {number} fiber - Amount of fiber in grams.
   * @param {number} sodium - Amount of sodium in milligrams.
   * @param {number} cholesterol - Amount of cholesterol in milligrams.
   * @param {number} iron - Amount of iron in milligrams.
   * @param {number} zinc - Amount of zinc in milligrams.
   * @param {number} calcium - Amount of calcium in milligrams.
   * @param {number} magnesium - Amount of magnesium in milligrams.
   * @param {number} protein - Amount of protein in grams.
   * @param {number} fats - Amount of fats in grams.
   * @param {number} carbs - Amount of carbohydrates in grams.
   * @param {number} percentProtein - Percentage of calories from protein.
   * @param {number} percentFats - Percentage of calories from fats.
   * @param {number} percentCarbs - Percentage of calories from carbohydrates.
   * @param {number} percentDVProtein - Percent daily value of protein.
   * @param {number} percentDVFats - Percent daily value of fats.
   * @param {number} percentDVCarbs - Percent daily value of carbohydrates.
   * @param {number} numMissingIngredients - Number of ingredients the user is missing for this recipe.
   * @param {"app"|"user"} origin - The origin of the recipe. "app" if it comes from the app, "user" if it is a custom recipe added by the user.
   */
  constructor(
    title,
    image,
    id,
    isBookmarked,
    mealType,
    dietaryRestrictions,
    prepTime,
    cuisine,
    calories,
    servings,
    ingredients,
    instructions,
    saturatedFat,
    sugar,
    fiber,
    sodium,
    cholesterol,
    iron,
    zinc,
    calcium,
    magnesium,
    protein,
    fats,
    carbs,
    percentProtein,
    percentFats,
    percentCarbs,
    percentDVProtein,
    percentDVFats,
    percentDVCarbs,
    numMissingIngredients,
    origin
  ) {
    this.title = title;
    this.image = image;
    this.id = id;
    this.isBookmarked = isBookmarked;
    this.mealType = mealType;
    this.dietaryRestrictions = dietaryRestrictions;
    this.prepTime = prepTime;
    this.cuisine = cuisine;
    this.calories = calories;
    this.servings = servings;
    this.ingredients = ingredients;
    this.instructions = instructions;
    this.saturatedFat = saturatedFat;
    this.sugar = sugar;
    this.fiber = fiber;
    this.sodium = sodium;
    this.cholesterol = cholesterol;
    this.iron = iron;
    this.zinc = zinc;
    this.calcium = calcium;
    this.magnesium = magnesium;
    this.protein = protein;
    this.fats = fats;
    this.carbs = carbs;
    this.percentProtein = percentProtein;
    this.percentFats = percentFats;
    this.percentCarbs = percentCarbs;
    this.percentDVProtein = percentDVProtein;
    this.percentDVFats = percentDVFats;
    this.percentDVCarbs = percentDVCarbs;
    this.numMissingIngredients = numMissingIngredients;
    this.origin = origin;
  }
}
