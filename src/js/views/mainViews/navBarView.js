/**
 * @fileoverview
 * This file contains the `NavBarView` class, which is responsible for managing the navigation bar functionality
 *
 * The class handles:
 * - Handling click events on the navbar links.
 * - Toggling the active class on navbar links.
 * - Managing the burger menu dropdown's open/close state.
 * - Managing accessibility features for dropdown items.
 */

import BaseView from "./baseView.js";

class NavBarView extends BaseView {
  constructor() {
    super(document.querySelector(".header"));

    this.navLinks = document.querySelectorAll(".header__navbar-link");
    this.burgerBtn = this.parentEl.querySelector(".header__menu-btn");
    this.burgerBtnIcn = this.parentEl.querySelector(".header__menu-btn-icn");
    this.navDropdown = this.parentEl.querySelector(".header__dropdown-menu");
    this.dropdownItems = this.navDropdown.querySelectorAll(".header__navbar-link--dropdown");
  }

  /**
   * Removes the active class from all navbar links and adds it to the clicked link.
   *
   * @param {string} clickedLinkCode - The `data-view` value of the clicked link.
   */
  toggleActiveClass(clickedLinkCode) {
    this.#removeActiveClasses();
    const newActiveLinks = this.parentEl.querySelectorAll(`[data-view="${clickedLinkCode}"]`);
    newActiveLinks.forEach((link) => link.classList.add("header__navbar-link--active"));
  }

  //Helper function to remove the active class from all navbar links
  #removeActiveClasses() {
    this.navLinks.forEach((navLink) => navLink.classList.remove("header__navbar-link--active"));
  }

  /**
   * Toggles the visibility of the dropdown menu when the burger button is clicked.
   * - If open, the dropdown is shown and dropdown items are made interactive (by removing `inert` and setting `tabindex` to "0").
   * - If closed, the dropdown is hidden and dropdown items are made non-interactive (by setting `inert` to "true" and `tabindex` to "-1").
   *
   * Also updates the burger button icon to indicate whether the menu is open or closed.
   * @private
   */
  #toggleDropdown() {
    const isOpen = this.navDropdown.classList.toggle("header__dropdown-menu--open");

    if (isOpen) {
      this.navDropdown.removeAttribute("inert");
      this.dropdownItems.forEach((item) => item.setAttribute("tabindex", "0"));
    } else {
      this.navDropdown.setAttribute("inert", "true");
      this.dropdownItems.forEach((item) => item.setAttribute("tabindex", "-1"));
    }

    this.burgerBtnIcn.className = isOpen ? "bi bi-x header__menu-btn-icn" : "fa fa-bars header__menu-btn-icn";
  }

  /**
   * Handles the outside click to close the dropdown burger menu.
   * If a click is detected outside of the burger menu or dropdown, it closes the menu and resets the accessibility attributes.
   *
   * @param {NodeList} dropdownItems - The list of dropdown menu items to reset.
   * @private
   */
  #handleOutsideClick(dropdownItems) {
    document.addEventListener("click", (e) => {
      const isClickInsideBurger = this.burgerBtn.contains(e.target) || this.navDropdown.contains(e.target);
      if (!isClickInsideBurger) {
        this.navDropdown.classList.remove("header__dropdown-menu--open");
        this.navDropdown.setAttribute("inert", "true");
        dropdownItems.forEach((item) => item.setAttribute("tabindex", "-1"));
        this.burgerBtnIcn.className = "fa fa-bars header__menu-btn-icn";
      }
    });
  }

  /**
   * Adds the event listener to handle the burger button toggle (open/close dropdown).
   * Also manages the outside click detection to close the dropdown when clicked outside.
   */
  addHandlerBurgerMenu() {
    this.burgerBtn.addEventListener("click", () => this.#toggleDropdown());
    this.#handleOutsideClick(this.dropdownItems);
  }

  /**
   * Adds the event listener to handle clicks on the navbar links.
   * When a link is clicked, it closes the burger menu (if open), resets the dropdown accessibility attributes,
   * and triggers the handler function with the clicked link's view code to navigate to the desired view.
   *
   * @param {Function} handler - The handler function to call with the clicked link's view code.
   */
  addHandlerNavbarLinks(handler) {
    this.parentEl.addEventListener("click", (e) => {
      const navLink = e.target.closest(".header__navbar-link");
      if (!navLink) return;

      // Close the burger menu when a link is clicked
      this.navDropdown.classList.remove("header__dropdown-menu--open");
      // Reset aria-hidden and tabindex on dropdown items
      this.navDropdown.setAttribute("inert", "true"); // Make dropdown non-interactive

      this.dropdownItems.forEach((item) => item.setAttribute("tabindex", "-1"));
      this.burgerBtnIcn.className = "fa fa-bars header__menu-btn-icn"; // Change back to hamburger icon

      const clickedLinkCode = navLink.dataset.view;
      handler(clickedLinkCode);
    });
  }
}

export default new NavBarView();
