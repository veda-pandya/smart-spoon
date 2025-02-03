/**
 * @fileoverview OverlayView manages the modal overlay UI, providing a base for showing and hiding the overlay (when modal windows are opened and closed).
 
 */
import BaseView from "./BaseView.js";

class OverlayView extends BaseView {
  /**
   * Creates an instance of OverlayView.
   * @extends BaseView
   */
  constructor() {
    super(document.querySelector(".g-modal-overlay"));
  }
}

export default new OverlayView();
