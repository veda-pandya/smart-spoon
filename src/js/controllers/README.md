# **Controllers Folder**

This folder contains all the controller files, which serve as the **intermediary** between the model and the view in the MVC architecture. Controllers handle user interactions, process input, and update the model and view accordingly.

## **Structure**

- **`controllerUtils/`** – Contains utility functions used across multiple controllers to keep the code modular and maintainable.
- **Main Controllers** – Each controller focuses on a specific feature of the application.

## **Controller Files**

- **`addMealController.js`** – Handles adding meals to the meal planner from various avenues.
- **`browseRecipesController.js`** – Manages browsing and filtering recipes.
- **`homePageController.js`** – Controls the rendering and interactions on the home page.
- **`ingredientSearchController.js`** – Manages searching for recipes based on available ingredients.
- **`initController.js`** – The **entry point** of the application. Initializes controllers and sets up event listeners.
- **`mealPlanController.js`** – Handles interactions with the meal planner, including adding, removing, and modifying planned meals.
- **`navBarController.js`** – Manages navigation bar interactions and updates.
- **`recipeBookController.js`** – Handles bookmarking, saving, and managing favorite recipes. Handles custom recipe addition into the recipe book.
- **`recipeDetailsController.js`** – Controls interactions within the Recipe Details Modal, including serving updates, bookmarking, and adding to meal plan.
- **`searchResultsController.js`** – Manages displaying search results from various search types.
- **`sharedController.js`** – Contains shared logic that is used across multiple controllers.

This structure ensures **separation of concerns**, making the codebase **scalable, modular, and maintainable**. Each controller is responsible for processing user actions, managing state changes, and ensuring smooth communication between the model and view layers.
