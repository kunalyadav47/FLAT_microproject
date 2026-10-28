/**
 * Pushdown Automata (PDA) Simulator Engine:
 * Simulates 7-tuple M = (Q, Σ, Γ, δ, q0, Z0, F)
 * Supports animated stack state tracking, ε-transitions,
 * acceptance by Final State or Empty Stack.
 * Compatible with Browser and Node.js.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PDAEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const EPSILON = 'ε';

  class PDASimulator {
    /**
     * @param {Object} pdaConfig
     * {
     *   states: ['q0', 'q1', 'q2'],
     *   inputAlphabet: ['a', 'b'],
     *   stackAlphabet: ['Z0', 'A', 'B'],
     *   startState: 'q0',
     *   startStackSymbol: 'Z0',
     *   acceptStates: ['q2'],
     *   acceptBy: 'FINAL_STATE' | 'EMPTY_STACK' | 'BOTH',
     *   transitions: [
     *     { from: 'q0', input: 'a', pop: 'Z0', to: 'q0', push: ['A', 'Z0'] },
     *     ...
     *   ]
     * }
     */
    constructor(pdaConfig) {
      this.config = pdaConfig;
      this.states = pdaConfig.states;
      this.startState = pdaConfig.startState || 'q0';
      this.startStackSymbol = pdaConfig.startStackSymbol || 'Z0';
      this.acceptStates = new Set(pdaConfig.acceptStates || []);
      this.acceptBy = pdaConfig.acceptBy || 'FINAL_STATE';
      this.transitions = pdaConfig.transitions || [];
    }

    /**
     * Finds matching transitions given current state, input character (or epsilon), and top of stack
     */
    findTransitions(state, char, topStack) {
      return this.transitions.filter(t => {
        const stateMatch = t.from === state;
        const inputMatch = t.input === char || (t.input === EPSILON || t.input === '' || t.input === 'e');
        const stackMatch = t.pop === topStack || t.pop === EPSILON;
        return stateMatch && inputMatch && stackMatch;
      });
    }

    /**
     * Step-by-step trace of string execution through the PDA (Deterministic / priority greedy)
     */
    trace(inputString, maxSteps = 100) {
      const steps = [];
      let currentState = this.startState;
      let stack = [this.startStackSymbol]; // stack[0] is bottom, stack[stack.length - 1] is top
      let inputPos = 0;

      steps.push({
        step: 0,
        state: currentState,
        inputPos: 0,
        remainingInput: inputString,
        charConsumed: null,
        stack: [...stack],
        topOfStack: stack[stack.length - 1] || 'EMPTY',
        action: `Initialized PDA with start state ${currentState} and stack top ${stack[stack.length - 1]}`,
        status: 'INITIAL'
      });

      let stepCount = 0;

      while (stepCount < maxSteps) {
        stepCount++;
        const currentChar = inputPos < inputString.length ? inputString[inputPos] : null;
        const topOfStack = stack.length > 0 ? stack[stack.length - 1] : null;

        // Try consuming input symbol first, then try epsilon transition
        let candidate = null;

        if (currentChar !== null) {
          // Look for direct symbol transition
          candidate = this.transitions.find(
            t => t.from === currentState && t.input === currentChar && (t.pop === topOfStack || t.pop === EPSILON)
          );
        }

        // If no direct character transition, look for epsilon transition
        if (!candidate) {
          candidate = this.transitions.find(
            t =>
              t.from === currentState &&
              (t.input === EPSILON || t.input === '' || t.input === 'e') &&
              (t.pop === topOfStack || t.pop === EPSILON)
          );
        }

        if (!candidate) {
          // No valid transition exists
          break;
        }

        // Execute transition
        const isEpsilon = candidate.input === EPSILON || candidate.input === '' || candidate.input === 'e';
        const consumedChar = isEpsilon ? 'ε' : candidate.input;

        if (!isEpsilon) {
          inputPos++;
        }

        // Pop from stack if specified
        let poppedSymbol = null;
        if (candidate.pop !== EPSILON && candidate.pop !== '') {
          poppedSymbol = stack.pop();
        }

        // Push onto stack: push array is [topMost, nextDown, ...]
        const pushSymbols = Array.isArray(candidate.push)
          ? candidate.push
          : candidate.push === EPSILON || candidate.push === ''
            ? []
            : [candidate.push];

        // Push in reverse so that pushSymbols[0] sits at stack top
        for (let i = pushSymbols.length - 1; i >= 0; i--) {
          if (pushSymbols[i] !== EPSILON && pushSymbols[i] !== '') {
            stack.push(pushSymbols[i]);
          }
        }

        currentState = candidate.to;

        const actionText = `δ(${candidate.from}, ${consumedChar}, ${candidate.pop}) → (${candidate.to}, [${pushSymbols.join('') || 'ε'}])`;

        steps.push({
          step: stepCount,
          state: currentState,
          inputPos: inputPos,
          remainingInput: inputString.slice(inputPos),
          charConsumed: consumedChar,
          popped: poppedSymbol,
          pushed: pushSymbols,
          stack: [...stack],
          topOfStack: stack.length > 0 ? stack[stack.length - 1] : 'EMPTY',
          action: actionText,
          status: 'RUNNING'
        });

        // Check if we exhausted input and can accept
        if (inputPos === inputString.length) {
          const isFinal = this.acceptStates.has(currentState);
          const isEmpty = stack.length === 0;

          if (this.acceptBy === 'FINAL_STATE' && isFinal) break;
          if (this.acceptBy === 'EMPTY_STACK' && isEmpty) break;
          if (this.acceptBy === 'BOTH' && (isFinal || isEmpty)) break;

          // If there is an epsilon transition from here that leads to accept state or empty stack, check one more step
          const hasMoreEps = this.transitions.some(
            t =>
              t.from === currentState &&
              (t.input === EPSILON || t.input === '') &&
              (t.pop === stack[stack.length - 1] || t.pop === EPSILON)
          );
          if (!hasMoreEps) break;
        }
      }

      const inputExhausted = inputPos === inputString.length;
      const endsInAcceptState = this.acceptStates.has(currentState);
      const endsWithEmptyStack = stack.length === 0;

      let isAccepted = false;
      let reason = '';

      if (this.acceptBy === 'FINAL_STATE') {
        isAccepted = inputExhausted && endsInAcceptState;
        reason = isAccepted
          ? `Input fully consumed and ended in accept state '${currentState}'`
          : `Input not accepted by final state (exhausted: ${inputExhausted}, end state: '${currentState}')`;
      } else if (this.acceptBy === 'EMPTY_STACK') {
        isAccepted = inputExhausted && endsWithEmptyStack;
        reason = isAccepted
          ? `Input fully consumed and stack is empty`
          : `Stack was not emptied upon input completion (stack height: ${stack.length})`;
      } else {
        isAccepted = inputExhausted && (endsInAcceptState || endsWithEmptyStack);
        reason = isAccepted ? `Accepted by final state or empty stack` : `Not accepted`;
      }

      steps[steps.length - 1].status = isAccepted ? 'ACCEPTED' : 'REJECTED';
      steps[steps.length - 1].reason = reason;

      return {
        accepted: isAccepted,
        endState: currentState,
        remainingInput: inputString.slice(inputPos),
        finalStack: stack,
        steps: steps,
        reason: reason
      };
    }
  }

  /**
   * Standard Presets for Educational Exploration
   */
  const Presets = {
    // 1. L = { a^n b^n | n >= 1 }
    an_bn: {
      id: 'an_bn',
      name: 'L = { aⁿ bⁿ | n ≥ 1 }',
      description: 'Pushes symbol A onto stack for every "a", and pops A for every "b". Accepts if stack returns to Z0 in accept state.',
      states: ['q0', 'q1', 'q2'],
      inputAlphabet: ['a', 'b'],
      stackAlphabet: ['Z0', 'A'],
      startState: 'q0',
      startStackSymbol: 'Z0',
      acceptStates: ['q2'],
      acceptBy: 'FINAL_STATE',
      testStrings: ['ab', 'aabb', 'aaabbb', 'aab', 'abb', ''],
      transitions: [
        { from: 'q0', input: 'a', pop: 'Z0', to: 'q0', push: ['A', 'Z0'] },
        { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: ['A', 'A'] },
        { from: 'q0', input: 'b', pop: 'A', to: 'q1', push: [] },
        { from: 'q1', input: 'b', pop: 'A', to: 'q1', push: [] },
        { from: 'q1', input: 'ε', pop: 'Z0', to: 'q2', push: ['Z0'] }
      ]
    },

    // 2. Palindromes with center marker: L = { w c w^R | w in {a, b}* }
    wcwR: {
      id: 'wcwR',
      name: 'L = { w c wᴿ | w ∈ {a, b}* }',
      description: 'Pushes characters onto stack until center marker "c" is read, then matches and pops remaining string.',
      states: ['q0', 'q1', 'q2'],
      inputAlphabet: ['a', 'b', 'c'],
      stackAlphabet: ['Z0', 'A', 'B'],
      startState: 'q0',
      startStackSymbol: 'Z0',
      acceptStates: ['q2'],
      acceptBy: 'FINAL_STATE',
      testStrings: ['aca', 'abcba', 'abbcbba', 'aacaa', 'abcb', 'c'],
      transitions: [
        { from: 'q0', input: 'a', pop: 'Z0', to: 'q0', push: ['A', 'Z0'] },
        { from: 'q0', input: 'b', pop: 'Z0', to: 'q0', push: ['B', 'Z0'] },
        { from: 'q0', input: 'a', pop: 'A', to: 'q0', push: ['A', 'A'] },
        { from: 'q0', input: 'a', pop: 'B', to: 'q0', push: ['A', 'B'] },
        { from: 'q0', input: 'b', pop: 'A', to: 'q0', push: ['B', 'A'] },
        { from: 'q0', input: 'b', pop: 'B', to: 'q0', push: ['B', 'B'] },
        // Read center marker 'c'
        { from: 'q0', input: 'c', pop: 'Z0', to: 'q1', push: ['Z0'] },
        { from: 'q0', input: 'c', pop: 'A', to: 'q1', push: ['A'] },
        { from: 'q0', input: 'c', pop: 'B', to: 'q1', push: ['B'] },
        // Matching reverse part
        { from: 'q1', input: 'a', pop: 'A', to: 'q1', push: [] },
        { from: 'q1', input: 'b', pop: 'B', to: 'q1', push: [] },
        { from: 'q1', input: 'ε', pop: 'Z0', to: 'q2', push: ['Z0'] }
      ]
    },

    // 3. Balanced Parentheses (Dyck language)
    balanced_parens: {
      id: 'balanced_parens',
      name: 'Balanced Parentheses: L = { w | properly nested () }',
      description: 'Pushes ( symbol onto stack, pops for every matching ). Accepts if stack returns to Z0 at end.',
      states: ['q0', 'q1'],
      inputAlphabet: ['(', ')'],
      stackAlphabet: ['Z0', '('],
      startState: 'q0',
      startStackSymbol: 'Z0',
      acceptStates: ['q1'],
      acceptBy: 'FINAL_STATE',
      testStrings: ['()', '(())', '()()', '((()))', '(()', '())', ')(', ''],
      transitions: [
        { from: 'q0', input: '(', pop: 'Z0', to: 'q0', push: ['(', 'Z0'] },
        { from: 'q0', input: '(', pop: '(', to: 'q0', push: ['(', '('] },
        { from: 'q0', input: ')', pop: '(', to: 'q0', push: [] },
        { from: 'q0', input: 'ε', pop: 'Z0', to: 'q1', push: ['Z0'] }
      ]
    }
  };

  return {
    EPSILON,
    PDASimulator,
    Presets
  };
});
