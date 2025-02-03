# View Folder

This folder contains all the view-related files in the MVC architecture. It is structured into three subfolders:

- **`mainViews/`**: Contains all the primary view classes that render main sections of the application.
- **`modalWindowViews/`**: Contains view classes specifically for modal windows.
- **`viewUtils/`**: Contains utility functions related to the view layer.

## **View Class Hierarchy**

The views follow a hierarchical structure, with `BaseView` serving as the parent class for most views except `ResultsView`, which is standalone.

### **1. BaseView (Parent to Most Views)**

- **SearchableView**
  - IngredientSearchView
  - BrowseRecipesView
- **HomeView**
- **MealPlanView**
- **NavBarView**
- **RecipeBookView**
- **OverlayView**
- **ModalView**
  - AddMealModalView
    - AddMealToSlotModal
    - AddRecipeModal
  - FilterModalView
    - FilterRecipesModal
    - BrowseCollectionModal
  - CustomRecipeModal
  - RecipeDetailsModal

### **2. ResultsView (Standalone, Not a Child of BaseView)**

This structure ensures modularity, reusability, and maintainability within the view layer. Each class is responsible for rendering specific UI components while following the MVC pattern.
