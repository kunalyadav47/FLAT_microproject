/**
 * Stack Renderer: High-contrast DOM/SVG Stack Visualizer for Pushdown Automata (PDA)
 * Displays top-of-stack pointers, stack frame heights, push/pop action feedback.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StackRenderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class StackRenderer {
    constructor(containerElement) {
      this.container = typeof containerElement === 'string'
        ? document.getElementById(containerElement)
        : containerElement;
    }

    /**
     * Render the stack items array (stack[0] is bottom, stack[length-1] is top)
     */
    render(stack = [], lastAction = null) {
      if (!this.container) return;

      if (!stack || stack.length === 0) {
        this.container.innerHTML = `
          <div class="stack-empty-notice">
            <span class="empty-badge">EMPTY STACK</span>
            <p>Stack depth: 0 items</p>
          </div>
        `;
        return;
      }

      let html = '<div class="pda-stack-bracket">';
      const topIdx = stack.length - 1;

      // Render from top down to bottom
      for (let i = topIdx; i >= 0; i--) {
        const symbol = stack[i];
        const isTop = i === topIdx;
        const isBottom = i === 0;

        let frameClass = 'stack-frame';
        if (isTop) frameClass += ' top-frame';
        if (symbol === 'Z0') frameClass += ' start-symbol-frame';

        html += `
          <div class="${frameClass}" data-idx="${i}">
            <div class="frame-pointer">
              ${isTop ? '<span class="top-indicator">TOP &#9654;</span>' : ''}
              <span class="frame-index">[${i}]</span>
            </div>
            <div class="frame-symbol">${symbol}</div>
            <div class="frame-meta">${isBottom ? 'Base' : isTop ? 'Head' : ''}</div>
          </div>
        `;
      }

      html += `
        <div class="stack-base-plate">
          <span>STACK BOTTOM (Closed)</span>
        </div>
      </div>`;

      this.container.innerHTML = html;
    }
  }

  return StackRenderer;
});
