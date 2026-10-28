/**
 * DFA State Minimization Engine:
 * Implements Reachability Pruning, Table-Filling Algorithm (Myhill-Nerode Theorem),
 * and Equivalence Partitioning / Quotient DFA Construction.
 * Compatible with Browser and Node.js.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MinimizerEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Eliminate states that cannot be reached from the start state
   */
  function removeUnreachableStates(dfa) {
    const reachable = new Set([dfa.startState]);
    const queue = [dfa.startState];

    // Build quick transition map
    const adj = new Map();
    for (const t of dfa.transitions) {
      if (!adj.has(t.from)) adj.set(t.from, []);
      adj.get(t.from).push(t);
    }

    while (queue.length > 0) {
      const curr = queue.shift();
      const outgoing = adj.get(curr) || [];
      for (const t of outgoing) {
        if (!reachable.has(t.to)) {
          reachable.add(t.to);
          queue.push(t.to);
        }
      }
    }

    const filteredStates = dfa.states.filter(s => reachable.has(s));
    const filteredTransitions = dfa.transitions.filter(t => reachable.has(t.from) && reachable.has(t.to));
    const filteredAccept = dfa.acceptStates.filter(s => reachable.has(s));

    return {
      type: 'DFA',
      states: filteredStates,
      alphabet: [...dfa.alphabet],
      startState: dfa.startState,
      acceptStates: filteredAccept,
      transitions: filteredTransitions,
      unreachableStates: dfa.states.filter(s => !reachable.has(s))
    };
  }

  /**
   * Minimize DFA using Table-Filling / Myhill-Nerode Distinguishability Method
   */
  function minimizeDFA(rawDfa) {
    // 1. Remove unreachable states first
    const dfa = removeUnreachableStates(rawDfa);
    let states = [...dfa.states].sort();
    const alphabet = [...dfa.alphabet].sort();
    const acceptSet = new Set(dfa.acceptStates);

    // Transition lookup helper
    const transMap = new Map();
    for (const t of dfa.transitions) {
      transMap.set(`${t.from}#${t.symbol}`, t.to);
    }
    function delta(s, a) {
      return transMap.get(`${s}#${a}`) || null;
    }

    // 1b. Check if DFA is partial (has missing transitions on alphabet symbols).
    // In formal automata theory, Myhill-Nerode Table-Filling requires a total transition function.
    // If partial, add canonical sink/dead state (TRAP) and complete transitions.
    let hasMissing = false;
    for (const s of states) {
      for (const sym of alphabet) {
        if (!delta(s, sym)) {
          hasMissing = true;
          break;
        }
      }
      if (hasMissing) break;
    }

    let trapStateName = null;
    if (hasMissing) {
      trapStateName = 'TRAP';
      let trapCounter = 0;
      while (states.includes(trapStateName)) {
        trapStateName = `TRAP_${trapCounter++}`;
      }
      states.push(trapStateName);
      states.sort();

      // Self-loops on all alphabet symbols for the trap state
      for (const sym of alphabet) {
        transMap.set(`${trapStateName}#${sym}`, trapStateName);
      }

      // Route all missing transitions to trap
      for (const s of states) {
        for (const sym of alphabet) {
          if (!transMap.has(`${s}#${sym}`)) {
            transMap.set(`${s}#${sym}`, trapStateName);
          }
        }
      }
    }

    // Helper for canonical pair key
    function pairKey(p, q) {
      return p < q ? `${p}#${q}` : `${q}#${p}`;
    }

    // Initialize Table: all pairs (p, q) with p < q
    const table = new Map(); // key -> { marked: bool, round: number, reason: string, p, q }
    const pairsList = [];

    for (let i = 0; i < states.length; i++) {
      for (let j = 0; j < i; j++) {
        const p = states[j];
        const q = states[i];
        const key = pairKey(p, q);
        const record = {
          p: p,
          q: q,
          marked: false,
          round: 0,
          reason: ''
        };
        table.set(key, record);
        pairsList.push(record);
      }
    }

    const roundsLog = [];

    // Base Step: Mark pairs where one is accept and one is non-accept
    let initialMarkedCount = 0;
    for (const record of pairsList) {
      const pAccept = acceptSet.has(record.p);
      const qAccept = acceptSet.has(record.q);

      if (pAccept !== qAccept) {
        record.marked = true;
        record.round = 1;
        record.reason = `${pAccept ? record.p : record.q} is Final, but ${!pAccept ? record.p : record.q} is Non-Final`;
        initialMarkedCount++;
      }
    }

    roundsLog.push({
      round: 1,
      name: 'Base Initialization (Final vs Non-Final)',
      markedThisRound: initialMarkedCount,
      description: 'Marked all pairs (p, q) where exactly one state is an accepting state.'
    });

    // Inductive Step: Fixed-point iteration
    let currentRound = 2;
    let changed = true;

    while (changed) {
      changed = false;
      let newlyMarked = 0;

      for (const record of pairsList) {
        if (record.marked) continue;

        for (const sym of alphabet) {
          const nextP = delta(record.p, sym);
          const nextQ = delta(record.q, sym);

          // If transitions go to different states
          if (nextP && nextQ && nextP !== nextQ) {
            const nextKey = pairKey(nextP, nextQ);
            const targetPair = table.get(nextKey);

            if (targetPair && targetPair.marked) {
              record.marked = true;
              record.round = currentRound;
              record.reason = `On '${sym}', δ(${record.p})=${nextP} and δ(${record.q})=${nextQ}, which are already distinguishable`;
              changed = true;
              newlyMarked++;
              break;
            }
          }
        }
      }

      if (changed) {
        roundsLog.push({
          round: currentRound,
          name: `Iteration ${currentRound - 1}`,
          markedThisRound: newlyMarked,
          description: `Marked ${newlyMarked} additional distinguishable pairs by checking symbol transitions.`
        });
        currentRound++;
      }
    }

    // Group equivalent states (unmarked pairs) using Disjoint Set Union
    const parent = new Map();
    states.forEach(s => parent.set(s, s));

    function find(s) {
      if (parent.get(s) !== s) {
        parent.set(s, find(parent.get(s)));
      }
      return parent.get(s);
    }

    function union(a, b) {
      const rootA = find(a);
      const rootB = find(b);
      if (rootA !== rootB) {
        parent.set(rootB, rootA);
      }
    }

    for (const record of pairsList) {
      if (!record.marked) {
        union(record.p, record.q);
      }
    }

    // Build equivalence classes
    const classesMap = new Map();
    for (const s of states) {
      const root = find(s);
      if (!classesMap.has(root)) classesMap.set(root, []);
      classesMap.get(root).push(s);
    }

    const equivalenceClasses = Array.from(classesMap.values()).map(grp => grp.sort());

    // Map each old state to its quotient state name
    const stateToQuotient = new Map();
    const quotientStates = [];
    const quotientAcceptStates = [];
    let quotientStart = null;

    equivalenceClasses.forEach((group, idx) => {
      const quotientName = group.length === 1 ? group[0] : `[${group.join(',')}]`;
      quotientStates.push(quotientName);

      const isAccept = group.some(s => acceptSet.has(s));
      if (isAccept) quotientAcceptStates.push(quotientName);

      if (group.includes(dfa.startState)) {
        quotientStart = quotientName;
      }

      group.forEach(s => stateToQuotient.set(s, quotientName));
    });

    // Generate minimal transitions
    const minimalTransitionsMap = new Map();
    for (const [key, target] of transMap.entries()) {
      const [fromState, symbol] = key.split('#');
      const fromQ = stateToQuotient.get(fromState);
      const toQ = stateToQuotient.get(target);
      if (fromQ && toQ) {
        const transKey = `${fromQ}#${symbol}#${toQ}`;
        if (!minimalTransitionsMap.has(transKey)) {
          minimalTransitionsMap.set(transKey, {
            from: fromQ,
            to: toQ,
            symbol: symbol
          });
        }
      }
    }

    const minimalTransitions = Array.from(minimalTransitionsMap.values());

    return {
      originalStateCount: rawDfa.states.length,
      unreachableStates: dfa.unreachableStates,
      reachableStateCount: states.length,
      minimalStateCount: quotientStates.length,
      evaluatedStates: states,
      trapStateAdded: Boolean(trapStateName),
      pairsTable: pairsList,
      roundsLog: roundsLog,
      equivalenceClasses: equivalenceClasses,
      minimalDFA: {
        type: 'DFA (Minimal)',
        states: quotientStates,
        alphabet: alphabet,
        startState: quotientStart,
        acceptStates: quotientAcceptStates,
        transitions: minimalTransitions
      }
    };
  }

  return {
    removeUnreachableStates,
    minimizeDFA
  };
});
