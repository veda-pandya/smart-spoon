# Model Utilities Folder

This folder contains utility files that are used across the model files. There are two subfolders:

1. **`highLevel/`**: Contains general-purpose utility functions that can be used by any part of the model layer (e.g., `modelUtils.js`) , including in featureSpecific utility files.

2. **`featureSpecific/`**: Contains utilities related to specific features of the app (e.g., bookmarksUtils.js to handle bookmarking across the app, servingsUtils.js to handle serving updates to recipes across the app).

These files provide shared logic that helps in keeping the model layer clean and modular, promoting reusability, scalability and maintainability.
