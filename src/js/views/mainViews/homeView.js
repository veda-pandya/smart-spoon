/**
 * @fileoverview HomeView manages the UI interactions for the home page of the application.
 * It includes functionality for navigating testimonials, handling hero section actions,
 * and call-to-action (CTA) buttons.
 */

import BaseView from "./baseView.js";

class HomeView extends BaseView {
  /**
   * Creates an instance of HomeView.
   * @extends BaseView
   */
  constructor() {
    super(document.querySelector(".landing-page"));
    this.slider = this.parentEl.querySelector(".testimonials-section__slider");
    this.testimonials = this.parentEl.querySelectorAll(".testimonials-section__testimonial");
    this.dots = this.parentEl.querySelectorAll(".testimonials-section__slider-dot");
    this.nextButton = this.parentEl.querySelector(".testimonials-section__navigation-btn--next-arrow");
    this.prevButton = this.parentEl.querySelector(".testimonials-section__navigation-btn--previous-arrow");
  }

  /**
   * Updates the testimonial slider to display the current testimonial.
   * Highlights the active testimonial and the corresponding slider dot.
   */
  updateTestimonialSlider() {
    this.testimonials.forEach((testimonial, index) => {
      const currentIndex = this.#getCurrentTestimonialIndex();
      testimonial.classList.toggle("testimonials-section__testimonial--active", index === currentIndex);
      this.dots[index].classList.toggle("testimonials-section__slider-dot--active", index === currentIndex);
    });
  }

  /**
   * Retrieves the current index of the active testimonial.
   * @returns {number} The index of the current testimonial.
   * @private
   */
  #getCurrentTestimonialIndex() {
    return Number(this.slider.dataset.index);
  }

  /**
   * Sets the active testimonial index in the slider's dataset.
   * @param {number} index - The index to set as active.
   * @private
   */
  #setTestimonialIndex(index) {
    this.slider.setAttribute("data-index", index);
  }

  /**
   * Navigates to a new testimonial based on the given direction.
   * @param {number} direction - The navigation direction (1 for next, -1 for previous).
   * @private
   */
  #navigateTestimonial(direction) {
    const currentIndex = this.#getCurrentTestimonialIndex();
    const newIndex = (currentIndex + direction + this.testimonials.length) % this.testimonials.length;
    this.#setTestimonialIndex(newIndex);
    this.updateTestimonialSlider();
  }

  /**
   * Adds a click event listener to the "Find Recipes" button in the hero section.
   * @param {Function} handler - The callback to execute when the button is clicked (navigate to ingredientSearch page).
   */
  addHandlerFindRecipes(handler) {
    const heroSectionBtn = this.parentEl.querySelector(".hero-section__btn");
    heroSectionBtn.addEventListener("click", () => handler("ingredients"));
  }

  /**
   * Adds a click event listener to the "Explore Recipes" button in the explore section.
   * @param {Function} handler - The callback to execute when the button is clicked (navigate to browse recipes page).
   */
  addHandlerExploreRecipes(handler) {
    const exploreRecipesBtn = this.parentEl.querySelector(".explore-recipes-section__explore-btn");
    exploreRecipesBtn.addEventListener("click", () => handler("browse"));
  }

  /**
   * Adds a click event listener to the "Get Started" button in the 'Join Now' section.
   * @param {Function} handler - The callback to execute when the button is clicked (navigates to ingredientSearch page).
   */
  addHandlerJoinNow(handler) {
    const ctaBtn = this.parentEl.querySelector(".cta-section__btn");
    ctaBtn.addEventListener("click", () => handler("ingredients"));
  }

  /**
   * Adds event listeners for navigating testimonials:
   * - Next and previous buttons for navigating through testimonials.
   * - Slider dots for selecting specific testimonials.
   */
  addHandlersTestimonialSlider() {
    this.nextButton.addEventListener("click", () => this.#navigateTestimonial(1));

    this.prevButton.addEventListener("click", () => this.#navigateTestimonial(-1));

    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        this.#setTestimonialIndex(index);
        this.updateTestimonialSlider();
      });
    });
  }
}

export default new HomeView();
