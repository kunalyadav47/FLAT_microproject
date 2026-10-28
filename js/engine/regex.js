/**
 * Regular Expression Parser & Thompson's Construction Engine
 * Supports: union (|), concatenation (.), Kleene star (*), Plus (+), grouping (()), epsilon (ε)
 * Compatible with both Browser and Node.js environments.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RegexEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const EPSILON = 'ε';

  /**
   * Insert explicit concatenation operator '.' into regex
   * Examples: 'ab' -> 'a.b', 'a*b' -> 'a*.b', '(a|b)c' -> '(a|b).c'
   */
  function formatRegex(regex) {
    const clean = regex.replace(/\s+/g, '');
    let res = '';
    const operators = new Set(['|', '?', '+', '*', '^']);
    const binaryOps = new Set(['|']);

    for (let i = 0; i < clean.length; i++) {
      const c1 = clean[i];
      res += c1;

      if (i + 1 < clean.length) {
        const c2 = clean[i + 1];

        // Do not add '.' after open paren or after binary op
        if (c1 === '(' || binaryOps.has(c1)) continue;
        // Do not add '.' before closing paren or after/before unary ops
        if (c2 === ')' || c2 === '*' || c2 === '+' || c2 === '?' || binaryOps.has(c2)) continue;

        res += '.';
      }
    }
    return res;
  }

  /**
   * Shunting-yard algorithm to convert infix regex to postfix notation
   */
  function infixToPostfix(infix) {
    const formatted = formatRegex(infix);
    const precedence = {
      '|': 1,
      '.': 2,
      '?': 3,
      '*': 3,
      '+': 3
    };

    let postfix = '';
    const stack = [];

    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];

      if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          postfix += stack.pop();
        }
        if (stack.length === 0) {
          throw new Error('Mismatched parentheses in regular expression: ' + infix);
        }
        stack.pop(); // discard '('
      } else if (precedence[char] !== undefined) {
        while (
          stack.length > 0 &&
          stack[stack.length - 1] !== '(' &&
          precedence[stack[stack.length - 1]] >= precedence[char]
        ) {
          postfix += stack.pop();
        }
        stack.push(char);
      } else {
        // Operand (symbol or epsilon)
        postfix += char;
      }
    }

    while (stack.length > 0) {
      const top = stack.pop();
      if (top === '(') {
        throw new Error('Mismatched parentheses in regular expression: ' + infix);
      }
      postfix += top;
    }

    return postfix;
  }

  /**
   * Helper state generator for NFA
   */
  class StateGenerator {
    constructor(prefix = 'q') {
      this.counter = 0;
      this.prefix = prefix;
    }
    next() {
      return `${this.prefix}${this.counter++}`;
    }
    reset() {
      this.counter = 0;
    }
  }

  /**
   * Thompson's Construction: Postfix RegEx -> ε-NFA
   */
  function regexToNFA(regexStr) {
    const postfix = infixToPostfix(regexStr);
    const stateGen = new StateGenerator();
    const alphabet = new Set();
    const stack = [];

    function createFragment(start, accept, transitions) {
      return { start, accept, transitions };
    }

    for (let i = 0; i < postfix.length; i++) {
      const token = postfix[i];

      if (token === '.') {
        // Concatenation: A . B
        if (stack.length < 2) throw new Error('Invalid regex syntax for concatenation');
        const b = stack.pop();
        const a = stack.pop();

        const transitions = [...a.transitions, ...b.transitions];
        // Connect a.accept to b.start via epsilon transition
        transitions.push({
          from: a.accept,
          to: b.start,
          symbol: EPSILON
        });

        stack.push(createFragment(a.start, b.accept, transitions));
      } else if (token === '|') {
        // Alternation / Union: A | B
        if (stack.length < 2) throw new Error('Invalid regex syntax for union');
        const b = stack.pop();
        const a = stack.pop();

        const s = stateGen.next();
        const f = stateGen.next();

        const transitions = [
          ...a.transitions,
          ...b.transitions,
          { from: s, to: a.start, symbol: EPSILON },
          { from: s, to: b.start, symbol: EPSILON },
          { from: a.accept, to: f, symbol: EPSILON },
          { from: b.accept, to: f, symbol: EPSILON }
        ];

        stack.push(createFragment(s, f, transitions));
      } else if (token === '*') {
        // Kleene Star: A*
        if (stack.length < 1) throw new Error('Invalid regex syntax for Kleene star');
        const a = stack.pop();

        const s = stateGen.next();
        const f = stateGen.next();

        const transitions = [
          ...a.transitions,
          { from: s, to: a.start, symbol: EPSILON },
          { from: s, to: f, symbol: EPSILON },
          { from: a.accept, to: a.start, symbol: EPSILON },
          { from: a.accept, to: f, symbol: EPSILON }
        ];

        stack.push(createFragment(s, f, transitions));
      } else if (token === '+') {
        // Positive Closure: A+ = A.A*
        if (stack.length < 1) throw new Error('Invalid regex syntax for plus operator');
        const a = stack.pop();

        const s = stateGen.next();
        const f = stateGen.next();

        const transitions = [
          ...a.transitions,
          { from: s, to: a.start, symbol: EPSILON },
          { from: a.accept, to: a.start, symbol: EPSILON },
          { from: a.accept, to: f, symbol: EPSILON }
        ];

        stack.push(createFragment(s, f, transitions));
      } else if (token === '?') {
        // Optional / Zero-or-one: A? = A | ε
        if (stack.length < 1) throw new Error('Invalid regex syntax for question mark operator');
        const a = stack.pop();

        const s = stateGen.next();
        const f = stateGen.next();

        const transitions = [
          ...a.transitions,
          { from: s, to: a.start, symbol: EPSILON },
          { from: a.accept, to: f, symbol: EPSILON },
          { from: s, to: f, symbol: EPSILON }
        ];

        stack.push(createFragment(s, f, transitions));
      } else {
        // Literal Symbol or Epsilon
        const s = stateGen.next();
        const f = stateGen.next();
        const sym = token === EPSILON || token === '\\e' || token === 'eps' ? EPSILON : token;

        if (sym !== EPSILON) {
          alphabet.add(sym);
        }

        const transitions = [
          { from: s, to: f, symbol: sym }
        ];

        stack.push(createFragment(s, f, transitions));
      }
    }

    if (stack.length !== 1) {
      throw new Error('Malformed regular expression: ' + regexStr);
    }

    const nfaFragment = stack.pop();

    // Collect all unique states
    const statesSet = new Set();
    statesSet.add(nfaFragment.start);
    statesSet.add(nfaFragment.accept);
    nfaFragment.transitions.forEach(t => {
      statesSet.add(t.from);
      statesSet.add(t.to);
    });

    const states = Array.from(statesSet).sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ''), 10);
      const nb = parseInt(b.replace(/\D/g, ''), 10);
      return na - nb;
    });

    return {
      type: 'NFA',
      regex: regexStr,
      postfix: postfix,
      states: states,
      alphabet: Array.from(alphabet).sort(),
      startState: nfaFragment.start,
      acceptStates: [nfaFragment.accept],
      transitions: nfaFragment.transitions
    };
  }

  return {
    EPSILON,
    formatRegex,
    infixToPostfix,
    regexToNFA
  };
});
