/**
 * Tree Renderer: Hierarchical SVG Visualizer for Context-Free Grammar Parse Trees
 * Calculates node tree widths, levels, and renders clean Bezier / straight branch connections.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TreeRenderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class ParseTreeRenderer {
    constructor(svgElement, options = {}) {
      this.svg = typeof svgElement === 'string' ? document.getElementById(svgElement) : svgElement;
      this.options = Object.assign(
        {
          nodeRadius: 18,
          levelHeight: 65,
          siblingSpacing: 42,
          ntColor: '#38bdf8',
          termColor: '#10b981',
          epsColor: '#f59e0b',
          lineColor: '#64748b'
        },
        options
      );
    }

    /**
     * Compute subtree widths and coordinates
     */
    assignCoordinates(node, depth = 0, nextX = { val: 40 }) {
      if (!node.children || node.children.length === 0) {
        node.x = nextX.val;
        nextX.val += this.options.siblingSpacing;
        node.y = 50 + depth * this.options.levelHeight;
        return;
      }

      for (const child of node.children) {
        this.assignCoordinates(child, depth + 1, nextX);
      }

      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      node.x = (firstChild.x + lastChild.x) / 2;
      node.y = 50 + depth * this.options.levelHeight;
    }

    getMaxBounds(node) {
      let maxX = node.x;
      let maxY = node.y;

      if (node.children) {
        for (const ch of node.children) {
          const b = this.getMaxBounds(ch);
          maxX = Math.max(maxX, b.maxX);
          maxY = Math.max(maxY, b.maxY);
        }
      }
      return { maxX, maxY };
    }

    /**
     * Render parse tree into SVG
     */
    render(rootNode) {
      if (!this.svg || !rootNode) return;

      const nextX = { val: 40 };
      this.assignCoordinates(rootNode, 0, nextX);

      const bounds = this.getMaxBounds(rootNode);
      const width = Math.max(bounds.maxX + 60, this.svg.clientWidth || 500);
      const height = Math.max(bounds.maxY + 60, this.svg.clientHeight || 350);

      this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      let edgesSvg = '';
      let nodesSvg = '';
      const r = this.options.nodeRadius;

      function traverse(node) {
        if (node.children && node.children.length > 0) {
          for (const ch of node.children) {
            edgesSvg += `<line x1="${node.x}" y1="${node.y + r}" x2="${ch.x}" y2="${ch.y - r}" stroke="#475569" stroke-width="2" />`;
            traverse(ch);
          }
        }

        const isTerminal = !node.children || node.children.length === 0;
        const isEpsilon = node.label === 'ε' || node.label === 'e';
        const fill = isEpsilon ? '#78350f' : isTerminal ? '#064e3b' : '#0c4a6e';
        const stroke = isEpsilon ? '#f59e0b' : isTerminal ? '#10b981' : '#38bdf8';

        nodesSvg += `
          <g class="tree-node" transform="translate(${node.x}, ${node.y})">
            <circle cx="0" cy="0" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" />
            <text x="0" y="5" fill="#f8fafc" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">
              ${node.label}
            </text>
          </g>
        `;
      }

      traverse(rootNode);

      this.svg.innerHTML = `
        <defs>
          <filter id="treeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        ${edgesSvg}
        ${nodesSvg}
      `;
    }
  }

  return ParseTreeRenderer;
});
