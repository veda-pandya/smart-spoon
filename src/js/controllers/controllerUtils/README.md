# Controller Utilities Folder

This folder contains utility files that are used across different controllers. There are two subfolders:

1. **`highLevel/`**: Contains general-purpose utility functions that can be used by any part of the controller layer (e.g., `controllerUtils.js`, `modalUtils.js`) , including in featureSpecific utility files.
2. **`featureSpecific/`**: Contains utilities related to specific features of the app (e.g., `browseRecipesUtils.js`, `bookmarkUtils.js`).

These files provide shared logic that helps in keeping controllers clean and modular, promoting reusability, scalability and maintainability.
