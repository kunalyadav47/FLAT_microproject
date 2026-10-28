/**
 * Automata Engine: DFA/NFA representation, Epsilon-Closure,
 * Subset Construction (NFA to DFA), and Interactive Step-by-Step Simulation.
 * Compatible with Browser and Node.js.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AutomataEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const EPSILON = 'ε';

  /**
   * Compute Epsilon-Closure of a set of states in an NFA
   * Returns a sorted Array of unique state names.
   */
  function epsilonClosure(states, transitions) {
    const stack = Array.isArray(states) ? [...states] : [states];
    const closure = new Set(stack);

    while (stack.length > 0) {
      const curr = stack.pop();
      for (const t of transitions) {
        if (t.from === curr && (t.symbol === EPSILON || t.symbol === '' || t.symbol === '\\e' || t.symbol === 'eps')) {
          if (!closure.has(t.to)) {
            closure.add(t.to);
            stack.push(t.to);
          }
        }
      }
    }
    return Array.from(closure).sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return na - nb || a.localeCompare(b);
    });
  }

  /**
   * Move operation: from a set of states on a given input symbol
   */
  function move(states, symbol, transitions) {
    const targetSet = new Set();
    const sourceSet = new Set(Array.isArray(states) ? states : [states]);

    for (const t of transitions) {
      if (sourceSet.has(t.from) && t.symbol === symbol) {
        targetSet.add(t.to);
      }
    }
    return Array.from(targetSet).sort();
  }

  /**
   * Convert set of NFA states to unique canonical string key
   */
  function stateSetKey(states) {
    return Array.from(new Set(states)).sort().join(',');
  }

  /**
   * Subset Construction (Powerset construction): NFA -> DFA
   * Produces DFA object with full step-by-step table derivation.
   */
  function nfaToDFA(nfa) {
    const alphabet = nfa.alphabet.filter(s => s !== EPSILON && s !== '' && s !== '\\e' && s !== 'eps');
    const startClosure = epsilonClosure([nfa.startState], nfa.transitions);
    const startKey = stateSetKey(startClosure);

    const dfaStatesMap = new Map(); // key -> DFA state name ('q0', 'q1' or 'D0', etc.)
    const dfaStatesList = [];
    const dfaTransitions = [];
    const derivationSteps = [];

    let stateCounter = 0;
    const initialName = `D${stateCounter++}`;
    dfaStatesMap.set(startKey, {
      name: initialName,
      nfaStates: startClosure
    });
    dfaStatesList.push(initialName);

    const queue = [startKey];

    while (queue.length > 0) {
      const currentKey = queue.shift();
      const currentDFA = dfaStatesMap.get(currentKey);

      for (const sym of alphabet) {
        const moved = move(currentDFA.nfaStates, sym, nfa.transitions);
        const closure = epsilonClosure(moved, nfa.transitions);

        if (closure.length === 0) {
          // Dead / Trap state can be handled implicitly or explicitly
          continue;
        }

        const nextKey = stateSetKey(closure);
        let targetDFA = dfaStatesMap.get(nextKey);

        let isNew = false;
        if (!targetDFA) {
          isNew = true;
          const nextName = `D${stateCounter++}`;
          targetDFA = {
            name: nextName,
            nfaStates: closure
          };
          dfaStatesMap.set(nextKey, targetDFA);
          dfaStatesList.push(nextName);
          queue.push(nextKey);
        }

        dfaTransitions.push({
          from: currentDFA.name,
          to: targetDFA.name,
          symbol: sym
        });

        derivationSteps.push({
          fromDFA: currentDFA.name,
          fromNFASet: [...currentDFA.nfaStates],
          symbol: sym,
          moveNFASet: moved,
          closureNFASet: closure,
          toDFA: targetDFA.name,
          isNewState: isNew
        });
      }
    }

    // Determine accept states: any DFA state containing an NFA accept state
    const nfaAcceptSet = new Set(nfa.acceptStates);
    const dfaAcceptStates = [];

    for (const [key, dfaState] of dfaStatesMap.entries()) {
      const isAccept = dfaState.nfaStates.some(s => nfaAcceptSet.has(s));
      if (isAccept) {
        dfaAcceptStates.push(dfaState.name);
      }
    }

    // Prepare state mappings for user inspection
    const stateMapping = {};
    for (const dfaState of dfaStatesMap.values()) {
      stateMapping[dfaState.name] = dfaState.nfaStates;
    }

    return {
      type: 'DFA',
      states: dfaStatesList,
      alphabet: alphabet,
      startState: initialName,
      acceptStates: dfaAcceptStates.sort(),
      transitions: dfaTransitions,
      stateMapping: stateMapping,
      derivationSteps: derivationSteps
    };
  }

  /**
   * Deterministic Finite Automaton (DFA) Simulator
   */
  class DFASimulator {
    constructor(dfa) {
      this.dfa = dfa;
      this.transitionTable = new Map();
      this.buildTable();
    }

    buildTable() {
      this.transitionTable.clear();
      for (const t of this.dfa.transitions) {
        const key = `${t.from}#${t.symbol}`;
        this.transitionTable.set(key, t.to);
      }
    }

    getNextState(currentState, symbol) {
      const key = `${currentState}#${symbol}`;
      return this.transitionTable.get(key) || null;
    }

    /**
     * Trace an input string step by step through the DFA
     */
    trace(inputString) {
      const steps = [];
      let currentState = this.dfa.startState;
      const acceptSet = new Set(this.dfa.acceptStates);

      steps.push({
        step: 0,
        state: currentState,
        remainingInput: inputString,
        consumed: '',
        nextChar: inputString.length > 0 ? inputString[0] : null,
        status: 'INITIAL',
        note: `Start at initial state ${currentState}`
      });

      for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        const nextState = this.getNextState(currentState, char);

        if (!nextState) {
          steps.push({
            step: i + 1,
            state: 'TRAP/REJECT',
            remainingInput: inputString.slice(i + 1),
            consumed: inputString.slice(0, i + 1),
            nextChar: i + 1 < inputString.length ? inputString[i + 1] : null,
            status: 'REJECTED',
            note: `No valid transition from state '${currentState}' on symbol '${char}'. Input rejected!`
          });
          return {
            accepted: false,
            endState: 'TRAP/REJECT',
            steps: steps,
            reason: `Missing transition for '${char}' from state '${currentState}'`
          };
        }

        currentState = nextState;
        steps.push({
          step: i + 1,
          state: currentState,
          remainingInput: inputString.slice(i + 1),
          consumed: inputString.slice(0, i + 1),
          nextChar: i + 1 < inputString.length ? inputString[i + 1] : null,
          status: 'RUNNING',
          note: `δ(${steps[steps.length - 1].state}, '${char}') → ${currentState}`
        });
      }

      const isAccepted = acceptSet.has(currentState);
      steps[steps.length - 1].status = isAccepted ? 'ACCEPTED' : 'REJECTED';
      steps[steps.length - 1].note += isAccepted
        ? ` (Final state '${currentState}' is an ACCEPT state. String ACCEPTED)`
        : ` (Final state '${currentState}' is NOT an accept state. String REJECTED)`;

      return {
        accepted: isAccepted,
        endState: currentState,
        steps: steps,
        reason: isAccepted
          ? `Ended in accept state '${currentState}'`
          : `Ended in non-accept state '${currentState}'`
      };
    }
  }

  /**
   * Non-deterministic Finite Automaton (NFA) Simulator
   * Tracks all parallel branching configurations and epsilon transitions.
   */
  class NFASimulator {
    constructor(nfa) {
      this.nfa = nfa;
    }

    trace(inputString) {
      const steps = [];
      let currentStates = epsilonClosure([this.nfa.startState], this.nfa.transitions);
      const acceptSet = new Set(this.nfa.acceptStates);

      steps.push({
        step: 0,
        states: [...currentStates],
        remainingInput: inputString,
        consumed: '',
        nextChar: inputString.length > 0 ? inputString[0] : null,
        status: 'INITIAL',
        note: `Initial states via ε-closure: {${currentStates.join(', ')}}`
      });

      for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        const moved = move(currentStates, char, this.nfa.transitions);
        const closure = epsilonClosure(moved, this.nfa.transitions);

        if (closure.length === 0) {
          steps.push({
            step: i + 1,
            states: [],
            remainingInput: inputString.slice(i + 1),
            consumed: inputString.slice(0, i + 1),
            nextChar: i + 1 < inputString.length ? inputString[i + 1] : null,
            status: 'REJECTED',
            note: `All execution paths terminated on symbol '${char}'. String REJECTED.`
          });
          return {
            accepted: false,
            endStates: [],
            steps: steps,
            reason: `All branches died on symbol '${char}'`
          };
        }

        currentStates = closure;
        steps.push({
          step: i + 1,
          states: [...currentStates],
          remainingInput: inputString.slice(i + 1),
          consumed: inputString.slice(0, i + 1),
          nextChar: i + 1 < inputString.length ? inputString[i + 1] : null,
          status: 'RUNNING',
          note: `Read '${char}' → moved to {${moved.join(', ')}} → ε-closure: {${closure.join(', ')}}`
        });
      }

      const hasAccept = currentStates.some(s => acceptSet.has(s));
      steps[steps.length - 1].status = hasAccept ? 'ACCEPTED' : 'REJECTED';
      steps[steps.length - 1].note += hasAccept
        ? ` (Contains accept state! String ACCEPTED)`
        : ` (None of the active states are accept states. String REJECTED)`;

      return {
        accepted: hasAccept,
        endStates: currentStates,
        steps: steps,
        reason: hasAccept
          ? `At least one branch reached accept state: {${currentStates.filter(s => acceptSet.has(s)).join(', ')}}`
          : `No branch reached an accept state`
      };
    }
  }

  /**
   * Module 1 Formal Language Utilities:
   * String operations (reversal, prefixes, suffixes, substrings)
   * Alphabet combinations and Language operations (Union, Concatenation, Kleene Star)
   */
  const LanguageUtils = {
    getPrefixes(str) {
      const res = ['ε'];
      for (let i = 1; i <= str.length; i++) res.push(str.slice(0, i));
      return res;
    },
    getSuffixes(str) {
      const res = ['ε'];
      for (let i = str.length - 1; i >= 0; i--) res.push(str.slice(i));
      return res;
    },
    getSubstrings(str) {
      const set = new Set(['ε']);
      for (let i = 0; i < str.length; i++) {
        for (let j = i + 1; j <= str.length; j++) {
          set.add(str.slice(i, j));
        }
      }
      return Array.from(set);
    },
    reverseString(str) {
      return str.split('').reverse().join('');
    },
    generateSigmaK(alphabet, k) {
      if (k === 0) return ['ε'];
      let results = [''];
      for (let i = 0; i < k; i++) {
        const next = [];
        for (const r of results) {
          for (const a of alphabet) {
            next.push(r + a);
          }
        }
        results = next;
      }
      return results;
    },
    languageUnion(L1, L2) {
      return Array.from(new Set([...L1, ...L2])).sort();
    },
    languageConcat(L1, L2) {
      const set = new Set();
      for (const w1 of L1) {
        for (const w2 of L2) {
          const s1 = w1 === 'ε' ? '' : w1;
          const s2 = w2 === 'ε' ? '' : w2;
          const combined = s1 + s2;
          set.add(combined === '' ? 'ε' : combined);
        }
      }
      return Array.from(set).sort();
    },
    languageKleene(L, maxPower = 3) {
      let current = ['ε'];
      const unionSet = new Set(['ε']);
      for (let p = 1; p <= maxPower; p++) {
        current = LanguageUtils.languageConcat(current, L);
        for (const w of current) unionSet.add(w);
      }
      return Array.from(unionSet).sort();
    }
  };

  return {
    EPSILON,
    epsilonClosure,
    move,
    nfaToDFA,
    DFASimulator,
    NFASimulator,
    LanguageUtils
  };
});
