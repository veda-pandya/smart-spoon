# **Model Folder**

This folder contains all the model files responsible for managing **data, business logic, and application state** in the MVC architecture. The model layer is tasked with processing data, maintaining consistency, and providing data to the controller layer.

## **Structure**

- **`modelUtils/`** – Contains utility functions to manage cross-app features, such as servings tracking and bookmarking. Contains other general-purpose functions used across the model layer.
- **Main Model Files** – These files handle different aspects of the application state and business logic.

## **Model Files**

- **`initializeApp.js`** – Initializes the application, setting up the app's state and starting necessary processes.
- **`state.js`** – Contains the application's central state, managing the overall data used throughout the app.
- **`RecipeClass.js`** – A class used to create structured recipe objects that are used across the app to ensure consistency in recipe data.
- **`ingredientSearch.js`** – Manages ingredient input into the pantry and associated validation.
- **`loadRecipes.js`** – Handles loading recipes that match the user's search query from an API.
- **`generateRecipeResults.js`** – Processes, validates and and formats recipe data into standardized recipe objects. Populates the application state.
- **`recipeBook.js`** – Manages the user's recipe book. Handles saving, removing, and managing saved recipes as well as the addition of custom recipes.
- **`mealPlanner.js`** – Handles managing the meal planning system, allowing users to add, move, remove, and view planned meals.
- **`autocomplete.js`** – Provides autocomplete functionality for ingredients and recipes, helping users quickly find what they're looking for.
- **`developerOnly.js`** – Contains tools or logic that are only used during development or testing.
- **`index.js`** – Central export file for all model-related modules.

This structure keeps the model layer **modular** and **scalable**, allowing for easy management of different parts of the application's business logic and data state. Each model file focuses on a specific aspect of the application, promoting **reusability** and **maintainability** across the app.
