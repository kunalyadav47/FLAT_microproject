/**
 * Graph Renderer: High-performance SVG visualizer for Automata (DFA, NFA)
 * Supports layered/circular layout, curved transitions, self-loops,
 * double-circle accept states, initial state arrows, and live state highlighting.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GraphRenderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class AutomataGraphRenderer {
    constructor(svgElement, options = {}) {
      this.svg = typeof svgElement === 'string' ? document.getElementById(svgElement) : svgElement;
      this.options = Object.assign(
        {
          nodeRadius: 28,
          strokeColor: '#38bdf8',
          accentColor: '#10b981',
          activeColor: '#f59e0b',
          textColor: '#f8fafc',
          bgColor: '#0f172a'
        },
        options
      );
      this.nodePositions = new Map();
      this.currentActiveStates = new Set();
    }

    /**
     * Compute clean layout coordinates for states
     */
    computeLayout(states, width, height) {
      const positions = new Map();
      const n = states.length;
      const margin = 80;

      if (n === 1) {
        positions.set(states[0], { x: width / 2, y: height / 2 });
        return positions;
      }

      if (n <= 6) {
        // Horizontal / Row layout with slight wave or grid
        const spacing = (width - 2 * margin) / (n - 1 || 1);
        states.forEach((s, idx) => {
          const x = margin + idx * spacing;
          const y = height / 2 + (idx % 2 === 1 ? 30 : -30);
          positions.set(s, { x, y });
        });
      } else {
        // Circular / Elliptical layout
        const rx = (width - 2 * margin) / 2;
        const ry = (height - 2 * margin) / 2;
        const cx = width / 2;
        const cy = height / 2;

        states.forEach((s, idx) => {
          const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
          const x = cx + rx * Math.cos(angle);
          const y = cy + ry * Math.sin(angle);
          positions.set(s, { x, y });
        });
      }

      return positions;
    }

    /**
     * Aggregate transitions between same pair of nodes (e.g. '0, 1')
     */
    aggregateTransitions(transitions) {
      const edgeMap = new Map();
      for (const t of transitions) {
        const key = `${t.from}->${t.to}`;
        if (!edgeMap.has(key)) {
          edgeMap.set(key, { from: t.from, to: t.to, symbols: [] });
        }
        edgeMap.get(key).symbols.push(t.symbol);
      }
      return Array.from(edgeMap.values()).map(e => ({
        from: e.from,
        to: e.to,
        label: Array.from(new Set(e.symbols)).join(', ')
      }));
    }

    /**
     * Render the automaton into SVG
     */
    render(automaton, activeStates = []) {
      if (!this.svg) return;
      this.currentAutomaton = automaton;
      this.currentActiveStates = new Set(Array.isArray(activeStates) ? activeStates : [activeStates]);

      const width = this.svg.clientWidth || 700;
      const height = this.svg.clientHeight || 400;
      this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      this.nodePositions = this.computeLayout(automaton.states, width, height);
      const r = this.options.nodeRadius;
      const edges = this.aggregateTransitions(automaton.transitions);

      // SVG Definitions (Arrowheads and Glow filters)
      let svgContent = `
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
          </marker>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      `;

      // Render Edges
      for (const edge of edges) {
        const p1 = this.nodePositions.get(edge.from);
        const p2 = this.nodePositions.get(edge.to);
        if (!p1 || !p2) continue;

        if (edge.from === edge.to) {
          // Self-loop
          const loopR = 25;
          const lx = p1.x;
          const ly = p1.y - r;
          const pathD = `M ${lx - 12} ${ly} C ${lx - 35} ${ly - 45}, ${lx + 35} ${ly - 45}, ${lx + 12} ${ly}`;
          svgContent += `
            <g class="automata-edge self-loop">
              <path d="${pathD}" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
              <text x="${lx}" y="${ly - 35}" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">${edge.label}</text>
            </g>
          `;
        } else {
          // Curved or straight edge
          const revKey = `${edge.to}->${edge.from}`;
          const isBidirectional = edges.some(e => e.from === edge.to && e.to === edge.from);

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy) || 1;

          // Perpendicular offset for curve
          const curveOffset = isBidirectional ? 26 : 14;
          const mx = (p1.x + p2.x) / 2 + (-dy / dist) * curveOffset;
          const my = (p1.y + p2.y) / 2 + (dx / dist) * curveOffset;

          const pathD = `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;

          svgContent += `
            <g class="automata-edge">
              <path d="${pathD}" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
              <text x="${mx}" y="${my - 6}" fill="#f1f5f9" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle" background="#0f172a">${edge.label}</text>
            </g>
          `;
        }
      }

      // Render Initial State Arrow
      const startPos = this.nodePositions.get(automaton.startState);
      if (startPos) {
        const arrStartX = startPos.x - r - 35;
        const arrStartY = startPos.y;
        svgContent += `
          <g class="automata-start-arrow">
            <line x1="${arrStartX}" y1="${arrStartY}" x2="${startPos.x - r}" y2="${arrStartY}" stroke="#10b981" stroke-width="3" marker-end="url(#arrow-active)" />
            <text x="${arrStartX - 8}" y="${arrStartY + 4}" fill="#10b981" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="end">START</text>
          </g>
        `;
      }

      // Render Nodes (States)
      const acceptSet = new Set(automaton.acceptStates);

      for (const s of automaton.states) {
        const pos = this.nodePositions.get(s);
        if (!pos) continue;

        const isAccept = acceptSet.has(s);
        const isActive = this.currentActiveStates.has(s);

        const circleFill = isActive ? '#0369a1' : '#1e293b';
        const circleStroke = isActive ? '#38bdf8' : isAccept ? '#10b981' : '#475569';
        const strokeWidth = isActive ? 3.5 : 2;
        const filterAttr = isActive ? 'filter="url(#glow)"' : '';

        svgContent += `
          <g class="automata-node ${isActive ? 'active-node' : ''}" data-state="${s}">
            <!-- Main outer circle -->
            <circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${strokeWidth}" ${filterAttr} />
            
            ${
              isAccept
                ? `<!-- Accept state inner circle -->
                   <circle cx="${pos.x}" cy="${pos.y}" r="${r - 5}" fill="none" stroke="${circleStroke}" stroke-width="1.8" />`
                : ''
            }
            
            <!-- State label -->
            <text x="${pos.x}" y="${pos.y + 5}" fill="${this.options.textColor}" font-size="13" font-family="monospace" font-weight="bold" text-anchor="middle">
              ${s}
            </text>
          </g>
        `;
      }

      this.svg.innerHTML = svgContent;
    }

    /**
     * Dynamically update active states without full redraw
     */
    highlightStates(activeStates) {
      this.currentActiveStates = new Set(Array.isArray(activeStates) ? activeStates : [activeStates]);
      const acceptSet = new Set(this.currentAutomaton ? this.currentAutomaton.acceptStates : []);
      const nodes = this.svg.querySelectorAll('.automata-node');
      nodes.forEach(node => {
        const state = node.getAttribute('data-state');
        const isActive = this.currentActiveStates.has(state);
        const isAccept = acceptSet.has(state);
        const circle = node.querySelector('circle');
        if (circle) {
          if (isActive) {
            node.classList.add('active-node');
            circle.setAttribute('fill', '#0284c7');
            circle.setAttribute('stroke', '#38bdf8');
            circle.setAttribute('stroke-width', '3.5');
            circle.setAttribute('filter', 'url(#glow)');
          } else {
            node.classList.remove('active-node');
            circle.setAttribute('fill', '#1e293b');
            circle.setAttribute('stroke', isAccept ? '#10b981' : '#475569');
            circle.setAttribute('stroke-width', '2');
            circle.removeAttribute('filter');
          }
        }
      });
    }
  }

  return AutomataGraphRenderer;
});
