/**
 * Automated Test Suite for Formal Language and Automata Theory Microproject
 * Covers Modules 1, 2, and 3:
 * - Regex & Thompson's Construction
 * - Epsilon-Closure & Subset Construction (NFA -> DFA)
 * - DFA/NFA Simulation & String Tracing
 * - DFA Minimization (Table-Filling / Myhill-Nerode)
 * - Context-Free Grammars, Derivations, Ambiguity, Simplification & CNF
 * - Pushdown Automata (PDA) with Stack Operations
 * - Pumping Lemma Adversary Models
 */

const RegexEngine = require('./js/engine/regex.js');
const AutomataEngine = require('./js/engine/automata.js');
const MinimizerEngine = require('./js/engine/minimizer.js');
const CFGEngine = require('./js/engine/cfg.js');
const PDAEngine = require('./js/engine/pda.js');
const PumpingLemmaEngine = require('./js/engine/pumping.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${testName} ${details ? '--> ' + details : ''}`);
  }
}

console.log('\n===============================================================');
console.log('  FLAT / TOC MICROPROJECT AUTOMATED VERIFICATION SUITE');
console.log('  Student: Kunal Yadav (2411021060008) | Squad 70');
console.log('===============================================================\n');

// -------------------------------------------------------------
// MODULE 1 TESTS: Alphabets, Strings, Regex Parsing
// -------------------------------------------------------------
console.log('>>> [MODULE 1] Formal Languages, Alphabets & Regular Expressions');

// 1.1 Language Utils: Prefixes, Suffixes, Reversal
const prefixes = AutomataEngine.LanguageUtils.getPrefixes('abc');
assert(
  JSON.stringify(prefixes) === JSON.stringify(['ε', 'a', 'ab', 'abc']),
  'LanguageUtils.getPrefixes correctly generates all prefixes of "abc"'
);

const suffixes = AutomataEngine.LanguageUtils.getSuffixes('abc');
assert(
  suffixes.includes('ε') && suffixes.includes('c') && suffixes.includes('bc') && suffixes.includes('abc'),
  'LanguageUtils.getSuffixes generates valid suffixes'
);

const rev = AutomataEngine.LanguageUtils.reverseString('automata');
assert(rev === 'atamotua', 'LanguageUtils.reverseString reverses string properly');

const sigma2 = AutomataEngine.LanguageUtils.generateSigmaK(['0', '1'], 2);
assert(
  sigma2.length === 4 && sigma2.includes('00') && sigma2.includes('01') && sigma2.includes('10') && sigma2.includes('11'),
  'LanguageUtils.generateSigmaK produces all 4 strings of Σ^2 over {0,1}'
);

const union = AutomataEngine.LanguageUtils.languageUnion(['a', 'ab'], ['b', 'ab']);
assert(
  union.length === 3 && union.includes('a') && union.includes('b') && union.includes('ab'),
  'LanguageUtils.languageUnion removes duplicates and computes L1 U L2'
);

// 1.2 Regex Infix to Postfix conversion
const formatted1 = RegexEngine.formatRegex('ab');
assert(formatted1 === 'a.b', 'formatRegex inserts concatenation operator for "ab"');

const postfix1 = RegexEngine.infixToPostfix('(a|b)*abb');
assert(postfix1 === 'ab|*a.b.b.', 'infixToPostfix formats "(a|b)*abb" to "ab|*a.b.b."');

const postfix2 = RegexEngine.infixToPostfix('a+b');
assert(postfix2 === 'a+b.', 'infixToPostfix formats positive closure "a+b"');


// -------------------------------------------------------------
// MODULE 2 TESTS: Finite Automata, Subset Construction & Minimization
// -------------------------------------------------------------
console.log('\n>>> [MODULE 2] Finite Automata, Subset Construction, Simulation & Minimization');

// 2.1 Thompson's Construction
const nfa = RegexEngine.regexToNFA('(a|b)*abb');
assert(nfa.type === 'NFA', 'Thompson NFA construction returns valid NFA object');
assert(nfa.alphabet.includes('a') && nfa.alphabet.includes('b'), 'NFA alphabet extracted accurately: {a, b}');
assert(nfa.states.length > 0 && nfa.transitions.length > 0, 'NFA has non-empty states and transition list');

// 2.1b Thompson ? operator & literal character 'e' verification
const nfaQ = RegexEngine.regexToNFA('a?b');
const simQ = new AutomataEngine.NFASimulator(nfaQ);
assert(simQ.trace('b').accepted === true, 'Thompson NFA correctly handles ? operator on "b"');
assert(simQ.trace('ab').accepted === true, 'Thompson NFA correctly handles ? operator on "ab"');
assert(simQ.trace('aab').accepted === false, 'Thompson NFA rejects non-matching "aab" for a?b');

const nfaE = RegexEngine.regexToNFA('c(a|e)t');
const simE = new AutomataEngine.NFASimulator(nfaE);
assert(nfaE.alphabet.includes('e'), 'Alphabet preserves literal character "e"');
assert(simE.trace('cet').accepted === true, 'NFA accepts string "cet" with literal vowel e');
assert(simE.trace('cat').accepted === true, 'NFA accepts string "cat"');
assert(simE.trace('ct').accepted === false, 'NFA rejects "ct" (character e is not treated as epsilon)');

// 2.2 NFA Simulation
const nfaSim = new AutomataEngine.NFASimulator(nfa);
const nfaTrace1 = nfaSim.trace('abb');
assert(nfaTrace1.accepted === true, 'NFA accepts string "abb"');

const nfaTrace2 = nfaSim.trace('aabb');
assert(nfaTrace2.accepted === true, 'NFA accepts string "aabb"');

const nfaTrace3 = nfaSim.trace('babb');
assert(nfaTrace3.accepted === true, 'NFA accepts string "babb"');

const nfaTrace4 = nfaSim.trace('ab');
assert(nfaTrace4.accepted === false, 'NFA rejects non-matching string "ab"');

const nfaTrace5 = nfaSim.trace('abba');
assert(nfaTrace5.accepted === false, 'NFA rejects non-matching string "abba"');

// 2.3 Subset Construction (NFA to DFA)
const dfa = AutomataEngine.nfaToDFA(nfa);
assert(dfa.type === 'DFA', 'Subset construction produces DFA');
assert(dfa.startState !== undefined, 'DFA has designated start state');
assert(dfa.acceptStates.length > 0, 'DFA has non-empty accept states list');

// 2.4 DFA Simulation
const dfaSim = new AutomataEngine.DFASimulator(dfa);
const dfaTrace1 = dfaSim.trace('abb');
assert(dfaTrace1.accepted === true, 'Converted DFA accepts string "abb"');

const dfaTrace2 = dfaSim.trace('aabb');
assert(dfaTrace2.accepted === true, 'Converted DFA accepts string "aabb"');

const dfaTrace3 = dfaSim.trace('babb');
assert(dfaTrace3.accepted === true, 'Converted DFA accepts string "babb"');

const dfaTrace4 = dfaSim.trace('ab');
assert(dfaTrace4.accepted === false, 'Converted DFA rejects string "ab"');

const dfaTrace5 = dfaSim.trace('abba');
assert(dfaTrace5.accepted === false, 'Converted DFA rejects string "abba"');

// 2.5 DFA Minimization (Table-Filling / Myhill-Nerode)
// Define a known redundant DFA:
// States: A, B, C, D, E, F
// F is unreachable state
// C and D are equivalent
const testRawDFA = {
  type: 'DFA',
  states: ['A', 'B', 'C', 'D', 'E', 'F'],
  alphabet: ['0', '1'],
  startState: 'A',
  acceptStates: ['E'],
  transitions: [
    { from: 'A', to: 'B', symbol: '0' },
    { from: 'A', to: 'C', symbol: '1' },
    { from: 'B', to: 'A', symbol: '0' },
    { from: 'B', to: 'D', symbol: '1' },
    { from: 'C', to: 'E', symbol: '0' },
    { from: 'C', to: 'F', symbol: '1' }, // Note: F will be reachable if C->F, but let's make F isolated
    { from: 'D', to: 'E', symbol: '0' },
    { from: 'D', to: 'F', symbol: '1' },
    { from: 'E', to: 'E', symbol: '0' },
    { from: 'E', to: 'E', symbol: '1' },
    { from: 'F', to: 'F', symbol: '0' },
    { from: 'F', to: 'F', symbol: '1' }
  ]
};

// Test with clean unreachable state isolated
const testRawDFA2 = {
  type: 'DFA',
  states: ['A', 'B', 'C', 'D', 'E', 'Z_unreachable'],
  alphabet: ['0', '1'],
  startState: 'A',
  acceptStates: ['E'],
  transitions: [
    { from: 'A', to: 'B', symbol: '0' },
    { from: 'A', to: 'C', symbol: '1' },
    { from: 'B', to: 'A', symbol: '0' },
    { from: 'B', to: 'D', symbol: '1' },
    { from: 'C', to: 'E', symbol: '0' },
    { from: 'C', to: 'E', symbol: '1' },
    { from: 'D', to: 'E', symbol: '0' },
    { from: 'D', to: 'E', symbol: '1' },
    { from: 'E', to: 'E', symbol: '0' },
    { from: 'E', to: 'E', symbol: '1' },
    { from: 'Z_unreachable', to: 'E', symbol: '0' }
  ]
};

const minResult = MinimizerEngine.minimizeDFA(testRawDFA2);
assert(
  minResult.unreachableStates.includes('Z_unreachable'),
  'Minimizer successfully detects and removes unreachable state "Z_unreachable"'
);
assert(
  minResult.minimalStateCount < minResult.originalStateCount,
  'Minimizer reduces total states (C and D merged, Z_unreachable eliminated)'
);
assert(
  minResult.pairsTable.length > 0,
  'Table-Filling distinguishability matrix populated with pair records'
);

// 2.6 Partial DFA Minimization & Sink/Trap Completion
const nfaAB = RegexEngine.regexToNFA('ab');
const dfaAB = AutomataEngine.nfaToDFA(nfaAB);
const minAB = MinimizerEngine.minimizeDFA(dfaAB);
const minSimAB = new AutomataEngine.DFASimulator(minAB.minimalDFA);
assert(minSimAB.trace('ab').accepted === true, 'Minimized partial DFA accepts "ab"');
assert(minSimAB.trace('b').accepted === false, 'Minimized partial DFA correctly rejects "b" (D0 and D1 not falsely merged)');
assert(minAB.trapStateAdded === true, 'Partial DFA completed with canonical TRAP state');


// -------------------------------------------------------------
// MODULE 3 TESTS: CFG, Ambiguity, Simplification, CNF & PDA
// -------------------------------------------------------------
console.log('\n>>> [MODULE 3] Context-Free Grammars, Derivations, Ambiguity, CNF & PDA');

// 3.1 CFG Parsing
const grammarText = `
S -> a S b | ε
`;
const cfg1 = CFGEngine.parseGrammar(grammarText);
assert(cfg1.nonTerminals.includes('S'), 'CFG parser extracts Non-Terminal S');
assert(cfg1.terminals.includes('a') && cfg1.terminals.includes('b'), 'CFG parser extracts terminals {a, b}');

// 3.2 CFG Derivation & Parse Tree
const deriv1 = CFGEngine.deriveString(cfg1, 'aabb');
assert(deriv1.success === true, 'Derives string "aabb" from S -> a S b | ε');
assert(deriv1.tree !== null && deriv1.tree.children.length > 0, 'Generates valid hierarchical parse tree');

const deriv2 = CFGEngine.deriveString(cfg1, 'aaabbb');
assert(deriv2.success === true, 'Derives string "aaabbb"');

const derivReject = CFGEngine.deriveString(cfg1, 'aab');
assert(derivReject.success === false, 'Correctly fails to derive non-language string "aab"');

// 3.3 Ambiguity Visualizer
const ambigGrammar = CFGEngine.parseGrammar(`
E -> E + E | E * E | a
`);
const ambigResult = CFGEngine.checkAmbiguity(ambigGrammar, 'a+a*a');
assert(ambigResult.isAmbiguous === true, 'Identifies ambiguous grammar E -> E+E | E*E | a on "a+a*a"');
assert(ambigResult.treesCount >= 2, 'Uncovers at least 2 distinct parse trees for the same string');

// 3.4 Grammar Simplification (ε, Unit, Useless removal)
const simplifyInput = CFGEngine.parseGrammar(`
S -> A B | a
A -> ε
B -> b
C -> c
`);
const simpResult = CFGEngine.simplifyGrammar(simplifyInput);
assert(simpResult.steps.length === 3, 'Executes all 3 simplification stages (ε, Unit, Useless)');
assert(
  !simpResult.simplifiedGrammar.productions.some(p => p.lhs === 'C'),
  'Useless unreachable symbol C is removed'
);

// 3.5 Chomsky Normal Form (CNF)
const cnfResult = CFGEngine.convertToCNF(simpResult.simplifiedGrammar);
assert(cnfResult.type === 'CNF', 'CNF conversion succeeds');
const allCNFValid = cnfResult.productions.every(p => {
  return (p.rhs.length === 1 && !/^[A-Z]/.test(p.rhs[0])) || (p.rhs.length === 2);
});
assert(allCNFValid, 'All rules adhere to CNF format: A -> BC or A -> a');

// 3.5b CNF with non-alphanumeric operators (e.g. '-')
const cfgMinus = CFGEngine.parseGrammar('E -> E - E | id');
const simpMinus = CFGEngine.simplifyGrammar(cfgMinus);
const cnfMinus = CFGEngine.convertToCNF(simpMinus.simplifiedGrammar);
const minusValid = cnfMinus.productions.every(p => {
  const isSingleTerm = p.rhs.length === 1 && (p.rhs[0] === 'id' || p.rhs[0] === '-');
  const isBinaryVars = p.rhs.length === 2 && /^[A-Z]/.test(p.rhs[0]) && /^[A-Z]/.test(p.rhs[1]);
  return isSingleTerm || isBinaryVars;
});
assert(minusValid, 'CNF converter handles non-alphanumeric operators like "-" into strict binary variables');

// 3.6 Pushdown Automata (PDA) Simulation
const pdaConfigAnBn = PDAEngine.Presets.an_bn;
const pdaSim = new PDAEngine.PDASimulator(pdaConfigAnBn);

const pdaRes1 = pdaSim.trace('ab');
assert(pdaRes1.accepted === true, 'PDA accepts string "ab" for a^n b^n');

const pdaRes2 = pdaSim.trace('aabb');
assert(pdaRes2.accepted === true, 'PDA accepts string "aabb" for a^n b^n');

const pdaRes3 = pdaSim.trace('aaabbb');
assert(pdaRes3.accepted === true, 'PDA accepts string "aaabbb" for a^n b^n');

const pdaRes4 = pdaSim.trace('aab');
assert(pdaRes4.accepted === false, 'PDA rejects unequal string "aab"');

const pdaRes5 = pdaSim.trace('abb');
assert(pdaRes5.accepted === false, 'PDA rejects unequal string "abb"');

// 3.7 Palindrome PDA
const pdaPalin = new PDAEngine.PDASimulator(PDAEngine.Presets.wcwR);
assert(pdaPalin.trace('aca').accepted === true, 'Palindrome PDA accepts "aca"');
assert(pdaPalin.trace('abcba').accepted === true, 'Palindrome PDA accepts "abcba"');
assert(pdaPalin.trace('abbcbba').accepted === true, 'Palindrome PDA accepts "abbcbba"');
assert(pdaPalin.trace('abcb').accepted === false, 'Palindrome PDA rejects asymmetric "abcb"');

// 3.8 Balanced Parentheses PDA
const pdaParens = new PDAEngine.PDASimulator(PDAEngine.Presets.balanced_parens);
assert(pdaParens.trace('()').accepted === true, 'Parens PDA accepts "()"');
assert(pdaParens.trace('(())').accepted === true, 'Parens PDA accepts "(())"');
assert(pdaParens.trace('()()').accepted === true, 'Parens PDA accepts "()()"');
assert(pdaParens.trace('((())').accepted === false, 'Parens PDA rejects "((())"');
assert(pdaParens.trace(')(').accepted === false, 'Parens PDA rejects ")("');

// -------------------------------------------------------------
// THEORY LABS: Pumping Lemma Games
// -------------------------------------------------------------
console.log('\n>>> [THEORY] Pumping Lemma Adversary Models');

const regPump = PumpingLemmaEngine.RegularCases.an_bn.pump(4, 2, 0);
assert(regPump.inLanguage === false, 'Pumping down (i=0) on a^4 b^4 yields string outside language');

const regPumpUp = PumpingLemmaEngine.RegularCases.an_bn.pump(4, 2, 2);
assert(regPumpUp.inLanguage === false, 'Pumping up (i=2) on a^4 b^4 yields string outside language');

const cflPump = PumpingLemmaEngine.CFLCases.an_bn_cn.pump(3, 'ab', 2);
assert(cflPump.inLanguage === false, 'Pumping a^3 b^3 c^3 yields unequal letter counts, proving CFL violation');

// Pumping Lemma boundary & exponent i=1 verification
const safeZero = PumpingLemmaEngine.RegularCases.an_bn.pump(0, 1, 2);
assert(safeZero.pumpedStr.length > 0, 'Pumping lemma handles boundary p=0 gracefully without RangeError');

const cflZero = PumpingLemmaEngine.CFLCases.an_bn_cn.pump(1, 'aa', 2);
assert(cflZero.pumpedStr.length > 0, 'CFL pumping handles p=1 on "aa" option without negative count error');

const expOne = PumpingLemmaEngine.RegularCases.an_bn.pump(4, 2, 1);
assert(expOne.inLanguage === true && expOne.explanation.includes('i=1'), 'Pumping lemma with i=1 correctly identifies original string membership');

// -------------------------------------------------------------
// SUMMARY RECORD
// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`TOTAL TESTS EXECUTED: ${totalTests}`);
console.log(`PASSED: \x1b[32m${passedTests}\x1b[0m`);
console.log(`FAILED: ${failedTests > 0 ? `\x1b[31m${failedTests}\x1b[0m` : '\x1b[32m0\x1b[0m'}`);
console.log('===============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All verification checks PASSED successfully!\n');
}
