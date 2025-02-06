# SmartSpoon

## Live Demo

[Click here to view the live demo of Smart Spoon](https://smart-spoon.netlify.app/#)

## Project Overview

Smart Spoon is a meal planning and recipe management app designed to help busy individuals stay healthy and organized. Inspired by the challenge of cooking for one—where you often end up with extra ingredients that go unused—Smart Spoon helps you make the most of what you already have by suggesting recipes that use up those leftovers. Whether you want to choose ingredients you already have or explore new recipes based on your dietary preferences, meal types, or cuisine, the app offers personalized suggestions. It also tracks your nutrition goals and reduces food waste, all while promoting sustainable cooking practices and a healthy lifestyle. With an intuitive interface, Smart Spoon makes meal prep easier, healthier, and more efficient for anyone juggling a busy schedule.

## Key Features

- **Custom UI Design**: Visually appealing and user-friendly interface, including a custom logo for a cohesive and professional brand identity.

- **Comprehensive Recipe Search & Filters**: Browse a large recipe database with advanced filtering by dietary restrictions, nutrition preferences, cuisine, meal type, and cooking time.

- **Ingredient-Based Recipe Search**: Input available ingredients to receive tailored recipe suggestions, with detailed ingredient availability and substitution information.

- **Adjustable Servings**: Dynamically adjust servings, updating ingredient quantities and nutritional information for accurate portions and calorie counts.

- **Custom Recipe Book**: Save favorite or custom recipes to a personalized recipe book, stored in local storage for data persistence.

- **Meal Planning**: Plan meals up to four weeks in advance, track daily calories and macros, and easily add, remove, or move meals within the planner.

- **Custom Meal Entries**: Log non-recipe meals (e.g., "ate out" or "leftovers") for flexible nutritional tracking.

- **Autocomplete Functionality**: Speed up recipe and ingredient searches with intuitive autocomplete suggestions.

## Technologies Used

- HTML, CSS, JavaScript
- **Libraries**: flatpickr (date selection), pluralize (pluralization)
- **APIs**: Spoonacular (recipe and nutrition data)
- Parcel (bundling and packaging), Babel (JavaScript transpiling)
- Netlify (hosting)

## Development Practices

- **MVC Architecture** (Model-View-Controller) for organizing code and ensuring separation of concerns
- **Fully Responsive Design**: Optimized for desktop, tablet, and mobile, adapting seamlessly to different screen sizes
- **Accessibility**: Built with accessibility in mind, adhering to WCAG guidelines. Keyboard navigation, ARIA attributes, and screen reader support to ensure inclusivity.
- **BEM (Block Element Modifier)** for organizing CSS into reusable, maintainable components
- **Local Storage** for data persistence across sessions

## Setup

### 1. Clone the Repository

Clone this repository to your local machine using the following command:

`git clone https://github.com/veda-pandya/smart-spoon.git`

### 2. Install Dependencies

Navigate to the project directory and install dependencies:

```
cd smart-spoon
npm install
```

### 3. Set Up API Key

To run this app, you'll need your own API key for the Spoonacular API. Follow these steps:

1. Go to [https://spoonacular.com/food-api] and sign up for an API key.
2. Create a `.env` file in the root of your project with the following contents:

   ```txt
   API_KEY=your-api-key-here
   ```

### 4. Run

This project uses Parcel for bundling and Babel for transpiling modern JavaScript code into a compatible version for all browsers.

To run the project locally in development mode, use Parcel to start a local server:

`npm start`

## Planned Features

- **Virtual Cooking Assistant**: Implement a hands-free assistant that helps users through cooking steps by providing voice commands and responding to user queries.

- **Drag & Drop Feature**: Enable drag and drop functionality on the meal calendar

## Acknowledgments

- **Spoonacular API**: For providing the recipe and nutrition data that powers this app’s core functionality.
