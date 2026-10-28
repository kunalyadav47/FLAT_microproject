/**
 * Context-Free Grammar (CFG) Engine:
 * Parsing, Derivation (LMD & RMD), Parse Tree Generation,
 * Ambiguity Detection, Grammar Simplification (ε, Unit, Useless),
 * and Chomsky Normal Form (CNF) Conversion.
 * Compatible with Browser and Node.js.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CFGEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const EPSILON = 'ε';

  /**
   * Parse multiline text CFG into internal grammar structure
   * Syntax example:
   * S -> a S b | ab | ε
   */
  function parseGrammar(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const nonTerminals = new Set();
    const terminals = new Set();
    const productions = [];
    let startSymbol = null;

    for (const line of lines) {
      const parts = line.split(/->|::=/);
      if (parts.length !== 2) continue;

      const lhs = parts[0].trim();
      nonTerminals.add(lhs);
      if (!startSymbol) startSymbol = lhs;

      const rhsList = parts[1].split('|').map(r => r.trim());

      for (const rhs of rhsList) {
        // Tokenize rhs: split into symbols or individual characters
        // If space separated, use tokens; otherwise split characters, treating 'id' as unit if present
        let tokens = [];
        if (rhs.includes(' ')) {
          tokens = rhs.split(/\s+/).filter(Boolean);
        } else {
          // split but recognize 'id'
          let i = 0;
          while (i < rhs.length) {
            if (rhs.slice(i, i + 2) === 'id') {
              tokens.push('id');
              i += 2;
            } else {
              tokens.push(rhs[i]);
              i++;
            }
          }
        }

        if (tokens.length === 1 && (tokens[0] === EPSILON || tokens[0] === 'e' || tokens[0] === '')) {
          tokens = [EPSILON];
        }

        productions.push({
          lhs: lhs,
          rhs: tokens,
          raw: `${lhs} -> ${tokens.join(' ')}`
        });
      }
    }

    // Determine terminals: any token that is not in nonTerminals and not epsilon
    for (const p of productions) {
      for (const tok of p.rhs) {
        if (tok !== EPSILON && !nonTerminals.has(tok)) {
          terminals.add(tok);
        }
      }
    }

    return {
      nonTerminals: Array.from(nonTerminals),
      terminals: Array.from(terminals),
      startSymbol: startSymbol || 'S',
      productions: productions
    };
  }

  /**
   * Generate Leftmost Derivation (LMD) and Parse Tree for a given string
   * Uses BFS bounded search over leftmost derivations.
   */
  function deriveString(grammar, targetStr, maxDepth = 12) {
    const targetTokens = targetStr === '' || targetStr === EPSILON
      ? []
      : targetStr.includes(' ')
        ? targetStr.split(/\s+/).filter(Boolean)
        : targetStr.split('');

    const startNode = {
      id: 0,
      label: grammar.startSymbol,
      children: []
    };

    let nodeCounter = 1;

    // Queue entry: { sentential: array of symbols, treeNodes: array of corresponding node objects, rootNode: root, history: array }
    const queue = [
      {
        sentential: [grammar.startSymbol],
        nodes: [startNode],
        root: startNode,
        history: [{ rule: 'START', form: grammar.startSymbol }]
      }
    ];

    const visited = new Set();
    const targetJoin = targetTokens.join('');

    while (queue.length > 0) {
      const current = queue.shift();
      const currentJoin = current.sentential.filter(s => s !== EPSILON).join('');

      // If matches target and has no non-terminals remaining
      const hasNT = current.sentential.some(s => grammar.nonTerminals.includes(s));
      if (!hasNT && currentJoin === targetJoin) {
        return {
          success: true,
          derivation: current.history,
          tree: current.root,
          target: targetStr
        };
      }

      if (current.history.length >= maxDepth) continue;

      // Find FIRST non-terminal (Leftmost Derivation)
      const ntIndex = current.sentential.findIndex(s => grammar.nonTerminals.includes(s));
      if (ntIndex === -1) continue; // Only terminals left but didn't match target

      const nt = current.sentential[ntIndex];
      const matchingProds = grammar.productions.filter(p => p.lhs === nt);

      for (const p of matchingProds) {
        // Deep clone tree structure
        const cloneNodeMap = new Map();
        function deepClone(node) {
          const c = { id: node.id, label: node.label, children: [] };
          cloneNodeMap.set(node, c);
          c.children = node.children.map(ch => deepClone(ch));
          return c;
        }
        const clonedRoot = deepClone(current.root);
        const clonedTargetNode = cloneNodeMap.get(current.nodes[ntIndex]);

        // Expand target node with production rhs
        const childNodes = [];
        for (const sym of p.rhs) {
          const childNode = {
            id: nodeCounter++,
            label: sym,
            children: []
          };
          clonedTargetNode.children.push(childNode);
          if (sym !== EPSILON) {
            childNodes.push(childNode);
          }
        }

        // New sentential form
        const newSentential = [
          ...current.sentential.slice(0, ntIndex),
          ...(p.rhs.length === 1 && p.rhs[0] === EPSILON ? [] : p.rhs),
          ...current.sentential.slice(ntIndex + 1)
        ];

        const newNodes = [
          ...current.nodes.slice(0, ntIndex),
          ...childNodes,
          ...current.nodes.slice(ntIndex + 1)
        ];

        const formStr = newSentential.join(' ');
        const stateKey = `${formStr}#${current.history.length}`;

        if (!visited.has(stateKey)) {
          visited.add(stateKey);
          queue.push({
            sentential: newSentential,
            nodes: newNodes,
            root: clonedRoot,
            history: [
              ...current.history,
              {
                rule: p.raw,
                form: formStr || EPSILON,
                appliedNT: nt,
                rhs: p.rhs.join(' ')
              }
            ]
          });
        }
      }
    }

    return {
      success: false,
      message: `Could not derive string "${targetStr}" within search depth ${maxDepth}`,
      target: targetStr
    };
  }

  /**
   * Ambiguity Visualizer: Finds multiple distinct derivations & parse trees for a string
   */
  function checkAmbiguity(grammar, targetStr, maxSearch = 8) {
    // Generate distinct derivations using DFS with rule permutation
    const targetTokens = targetStr.split('');
    const targetJoin = targetTokens.join('');
    const successfulTrees = [];

    let globalNodeId = 10;

    function search(sentential, history, currentNodeIds, rootNode, depth) {
      if (successfulTrees.length >= 2 || depth > maxSearch) return;

      const hasNT = sentential.some(s => grammar.nonTerminals.includes(s));
      const currentJoin = sentential.filter(s => s !== EPSILON).join('');

      if (!hasNT) {
        if (currentJoin === targetJoin) {
          // Check if this tree is structurally distinct from existing ones
          const serialized = JSON.stringify(rootNode, (key, value) => (key === 'id' ? undefined : value));
          if (!successfulTrees.some(t => t.serialized === serialized)) {
            successfulTrees.push({
              derivation: [...history],
              tree: rootNode,
              serialized: serialized
            });
          }
        }
        return;
      }

      // Expand leftmost non-terminal
      for (let i = 0; i < sentential.length; i++) {
        const sym = sentential[i];
        if (grammar.nonTerminals.includes(sym)) {
          const prods = grammar.productions.filter(p => p.lhs === sym);
          for (const p of prods) {
            // Deep clone tree and index by ID
            const idMap = new Map();
            function clone(n) {
              const c = { id: n.id, label: n.label, children: [] };
              idMap.set(n.id, c);
              c.children = n.children.map(clone);
              return c;
            }
            const newRoot = clone(rootNode);
            const parentNode = idMap.get(currentNodeIds[i]);
            if (!parentNode) continue;

            const newChildNodes = [];
            const newChildIds = [];
            for (const r of p.rhs) {
              const chId = globalNodeId++;
              const ch = { id: chId, label: r, children: [] };
              parentNode.children.push(ch);
              if (r !== EPSILON) {
                newChildNodes.push(ch);
                newChildIds.push(chId);
              }
            }

            const nextSentential = [
              ...sentential.slice(0, i),
              ...(p.rhs.length === 1 && p.rhs[0] === EPSILON ? [] : p.rhs),
              ...sentential.slice(i + 1)
            ];

            const nextNodeIds = [
              ...currentNodeIds.slice(0, i),
              ...newChildIds,
              ...currentNodeIds.slice(i + 1)
            ];

            search(
              nextSentential,
              [...history, { rule: p.raw, form: nextSentential.join(' ') || EPSILON }],
              nextNodeIds,
              newRoot,
              depth + 1
            );

            if (successfulTrees.length >= 2) return;
          }
          break; // leftmost non-terminal expanded
        }
      }
    }

    const initialRoot = { id: 1, label: grammar.startSymbol, children: [] };
    search([grammar.startSymbol], [{ rule: 'START', form: grammar.startSymbol }], [1], initialRoot, 0);

    return {
      isAmbiguous: successfulTrees.length > 1,
      treesCount: successfulTrees.length,
      trees: successfulTrees,
      string: targetStr
    };
  }

  /**
   * Grammar Simplification:
   * 1. Removal of ε-productions
   * 2. Removal of Unit productions
   * 3. Removal of Useless symbols (non-generating and unreachable)
   */
  function simplifyGrammar(grammar) {
    const steps = [];

    // Step 1: Nullable / ε-removal
    const nullable = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      for (const p of grammar.productions) {
        if (p.rhs.length === 1 && p.rhs[0] === EPSILON) {
          if (!nullable.has(p.lhs)) {
            nullable.add(p.lhs);
            changed = true;
          }
        } else if (p.rhs.every(sym => nullable.has(sym))) {
          if (!nullable.has(p.lhs)) {
            nullable.add(p.lhs);
            changed = true;
          }
        }
      }
    }

    // Generate non-epsilon combinations
    const step1Prods = [];
    const seen1 = new Set();

    function addProd1(lhs, rhs) {
      if (rhs.length === 0) return;
      const key = `${lhs} -> ${rhs.join(' ')}`;
      if (!seen1.has(key)) {
        seen1.add(key);
        step1Prods.push({ lhs, rhs, raw: key });
      }
    }

    for (const p of grammar.productions) {
      if (p.rhs.length === 1 && p.rhs[0] === EPSILON) continue;

      // Combinations of keeping or omitting nullable symbols
      const nullableIndices = [];
      p.rhs.forEach((sym, idx) => {
        if (nullable.has(sym)) nullableIndices.push(idx);
      });

      const totalSubsets = 1 << nullableIndices.length;
      for (let mask = 0; mask < totalSubsets; mask++) {
        const omitIndices = new Set();
        for (let b = 0; b < nullableIndices.length; b++) {
          if ((mask & (1 << b)) !== 0) {
            omitIndices.add(nullableIndices[b]);
          }
        }

        const candidate = p.rhs.filter((_, idx) => !omitIndices.has(idx));
        addProd1(p.lhs, candidate);
      }
    }

    steps.push({
      step: '1. Removal of Nullable / ε-productions',
      nullableSymbols: Array.from(nullable),
      productions: step1Prods.map(p => p.raw)
    });

    // Step 2: Unit Production Removal (A -> B)
    const unitPairs = new Map(); // A -> Set of reachable variables
    grammar.nonTerminals.forEach(nt => unitPairs.set(nt, new Set([nt])));

    changed = true;
    while (changed) {
      changed = false;
      for (const p of step1Prods) {
        if (p.rhs.length === 1 && grammar.nonTerminals.includes(p.rhs[0])) {
          const from = p.lhs;
          const to = p.rhs[0];
          const reachFrom = unitPairs.get(from);
          const reachTo = unitPairs.get(to);
          for (const item of reachTo) {
            if (!reachFrom.has(item)) {
              reachFrom.add(item);
              changed = true;
            }
          }
        }
      }
    }

    const step2Prods = [];
    const seen2 = new Set();

    for (const [A, reachableSet] of unitPairs.entries()) {
      for (const B of reachableSet) {
        for (const p of step1Prods) {
          if (p.lhs === B && !(p.rhs.length === 1 && grammar.nonTerminals.includes(p.rhs[0]))) {
            const key = `${A} -> ${p.rhs.join(' ')}`;
            if (!seen2.has(key)) {
              seen2.add(key);
              step2Prods.push({ lhs: A, rhs: p.rhs, raw: key });
            }
          }
        }
      }
    }

    steps.push({
      step: '2. Removal of Unit Productions (A -> B)',
      productions: step2Prods.map(p => p.raw)
    });

    // Step 3: Removal of Useless Symbols (Non-generating and Unreachable)
    // 3a. Generating symbols
    const generating = new Set();
    changed = true;
    while (changed) {
      changed = false;
      for (const p of step2Prods) {
        if (p.rhs.every(sym => !grammar.nonTerminals.includes(sym) || generating.has(sym))) {
          if (!generating.has(p.lhs)) {
            generating.add(p.lhs);
            changed = true;
          }
        }
      }
    }

    const step3aProds = step2Prods.filter(
      p => generating.has(p.lhs) && p.rhs.every(s => !grammar.nonTerminals.includes(s) || generating.has(s))
    );

    // 3b. Reachable symbols from start
    const reachable = new Set([grammar.startSymbol]);
    changed = true;
    while (changed) {
      changed = false;
      for (const p of step3aProds) {
        if (reachable.has(p.lhs)) {
          for (const sym of p.rhs) {
            if (!reachable.has(sym)) {
              reachable.add(sym);
              changed = true;
            }
          }
        }
      }
    }

    const finalSimplifiedProds = step3aProds.filter(
      p => reachable.has(p.lhs) && p.rhs.every(s => reachable.has(s))
    );

    steps.push({
      step: '3. Removal of Useless Symbols (Non-generating & Unreachable)',
      generating: Array.from(generating),
      reachable: Array.from(reachable),
      productions: finalSimplifiedProds.map(p => p.raw)
    });

    return {
      simplifiedGrammar: {
        startSymbol: grammar.startSymbol,
        nonTerminals: Array.from(new Set(finalSimplifiedProds.map(p => p.lhs))),
        productions: finalSimplifiedProds
      },
      steps: steps
    };
  }

  /**
   * Convert simplified grammar to Chomsky Normal Form (CNF)
   * All rules must be of the form A -> BC or A -> a
   */
  function convertToCNF(simplifiedGrammar) {
    const prods = simplifiedGrammar.productions;
    const cnfProds = [];
    const helperTerminalMap = new Map(); // 'a' -> 'T_a'
    let helperCounter = 1;

    // Collect non-terminal variables from LHS
    const nonTerminals = new Set(
      simplifiedGrammar.nonTerminals || prods.map(p => p.lhs)
    );

    function isTerminal(sym) {
      return !nonTerminals.has(sym) && sym !== EPSILON;
    }

    function getHelperForTerminal(t) {
      if (!helperTerminalMap.has(t)) {
        const safeSym = /^[a-zA-Z0-9]$/.test(t) ? t : `sym${helperTerminalMap.size + 1}`;
        const hName = `T_${safeSym}`;
        helperTerminalMap.set(t, hName);
        cnfProds.push({ lhs: hName, rhs: [t], raw: `${hName} -> ${t}` });
      }
      return helperTerminalMap.get(t);
    }

    for (const p of prods) {
      if (p.rhs.length === 1) {
        // Already A -> a
        cnfProds.push(p);
      } else {
        // Replace terminals with helper variables if rhs.length >= 2
        let currentRHS = p.rhs.map(sym => {
          if (isTerminal(sym)) {
            return getHelperForTerminal(sym);
          }
          return sym;
        });

        // Cascade if length > 2
        let currentLHS = p.lhs;
        while (currentRHS.length > 2) {
          const cascadeVar = `C_${helperCounter++}`;
          cnfProds.push({
            lhs: currentLHS,
            rhs: [currentRHS[0], cascadeVar],
            raw: `${currentLHS} -> ${currentRHS[0]} ${cascadeVar}`
          });
          currentLHS = cascadeVar;
          currentRHS = currentRHS.slice(1);
        }

        // Final binary rule
        cnfProds.push({
          lhs: currentLHS,
          rhs: currentRHS,
          raw: `${currentLHS} -> ${currentRHS.join(' ')}`
        });
      }
    }

    return {
      type: 'CNF',
      startSymbol: simplifiedGrammar.startSymbol,
      productions: cnfProds
    };
  }

  return {
    EPSILON,
    parseGrammar,
    deriveString,
    checkAmbiguity,
    simplifyGrammar,
    convertToCNF
  };
});
