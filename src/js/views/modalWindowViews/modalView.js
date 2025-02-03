/**
 * @fileoverview ModalView is a base class for managing modal windows.
 * It provides functionality for closing modals when the 'x' button is clicked, managing focus for *accessibility,and trapping focus within the modal while it's open (critical for keyboard accessibility).
 */
import BaseView from "../mainViews/baseView.js";

class ModalView extends BaseView {
  constructor(parentElement) {
    /**
     * Creates an instance of ModalView.
     * @param {HTMLElement} parentElement - The parent element of the modal.
     * @extends BaseView
     */
    super(parentElement);
    this.modalWindows = document.querySelectorAll(".modal-window"); // Selects all modal windows
    this.previouslyFocusedElement = null; // To store the element that had focus before the modal opened
    this.cleanupFocusTrap = null; // To store the cleanup function for focus trapping
  }

  /**
   * Checks if any modal window is currently open.
   * @returns {boolean} `true` if any modal is open, otherwise `false`.
   */
  isAnyModalOpen() {
    return [...this.modalWindows].some((modal) => !modal.classList.contains("u-hidden"));
  }

  /**
   * Retrieves all focusable elements within the modal.
   * @returns {HTMLElement[]} Array of focusable elements.
   */
  getFocusableElements() {
    return Array.from(this.parentEl.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.disabled && el.offsetParent !== null);
  }

  /**
   * Traps focus within the modal to ensure keyboard navigation stays inside.
   * Critical to making the app accessible (ensures users can navigate the app via keyboard only)
   */
  trapFocus() {
    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeydown = (event) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey && document.activeElement === firstElement) {
        // If Shift+Tab is pressed on the first focusable element, focus the last
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        // If Tab is pressed on the last focusable element, focus the first
        event.preventDefault();
        firstElement.focus();
      }
    };

    // Add event listener for focus trapping
    this.parentEl.addEventListener("keydown", handleKeydown);

    // Store the cleanup function
    this.cleanupFocusTrap = () => this.parentEl.removeEventListener("keydown", handleKeydown);
  }

  /**
   * Manages focus when the modal is opened.
   * - Focuses the first focusable element in the modal.
   * - Sets up focus trapping.
   */
  enableModalFocusManagement() {
    this.previouslyFocusedElement = document.activeElement;

    // Focus the first focusable element in the modal
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) focusableElements[0].focus();

    // Trap focus inside the modal
    this.trapFocus();
  }

  /**
   * Cleans up focus management when the modal is closed.
   * - Restores focus to the previously focused element (before modal was opened).
   * - Removes focus trapping.
   */
  disableModalFocusManagement() {
    // Restore focus to the previously focused element
    if (this.previouslyFocusedElement) this.previouslyFocusedElement.focus();

    // Cleanup focus trap
    if (this.cleanupFocusTrap) this.cleanupFocusTrap();
  }

  /**
   * Adds an event listener to the close modal button.
   * Closes the modal when the 'x' button is clicked in the top right corner of the modal
   * @param {Function} handler - The callback function to execute when the button is clicked (closes the modal).
   */
  addHandlerCloseModal(handler) {
    const closeModalBtn = this.parentEl.querySelector(".modal-window__close-modal-btn");
    closeModalBtn.addEventListener("click", handler);
  }
}

export default ModalView;
