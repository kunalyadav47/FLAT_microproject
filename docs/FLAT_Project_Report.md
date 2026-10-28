# Formal Language & Automata Theory (FLAT) Microproject Report

**Subject:** Formal Language and Automata Theory (FLAT / TOC)  
**Academic Year:** 2026  
**Submission Window:** 26th October – 28th October 2026  

---

## 👤 Academic & Student Identity

- **Student Name:** Kunal Yadav
- **Registration / Roll Number:** 2411021060008
- **Squad:** 70
- **Course Title:** Formal Language and Automata Theory (FLAT)
- **Institution:** Kalvium Community / Engineering Microproject
- **Project Title:** Interactive Educational Visualizer & Algorithmic Simulator for Automata Theory (Modules 1, 2, and 3)
- **Deployed Application Link:** https://kunalyadav-flat-microproject.vercel.app *(configured for GitHub Pages / Vercel)*
- **GitHub Repository Link:** https://github.com/kunalyadav47/FLAT_microproject

---

## 📑 Executive Summary / Abstract

Formal Language and Automata Theory forms the mathematical and theoretical bedrock of Computer Science, governing lexical analysis, compiler design, formal specification, computability, and complexity. However, undergraduate students often struggle with the abstract nature of state transitions, powerset $\epsilon$-closure expansions, grammar ambiguity, and pushdown stack dynamics.

This microproject introduces an interactive, zero-dependency, web-based educational visualizer and algorithmic simulator implementing key syllabus topics across all three core modules:
1. **Module 1 (Formal Languages & Regular Expressions):** Alphabet power sets ($\Sigma^k$), string operations (reversal, prefixes, suffixes, substrings), language calculus (union, concatenation, Kleene closure), and regular expression parsing via Shunting-Yard.
2. **Module 2 (Finite Automata & Minimization):** Thompson's inductive construction ($\text{RegEx} \to \epsilon\text{-NFA}$), Powerset Subset construction ($\text{NFA} \to \text{DFA}$), interactive step-by-step string tracer with tape head pointers and dynamic SVG state highlights, and Myhill-Nerode Table-Filling State Minimization with interactive triangular distinguishability matrices.
3. **Module 3 (Context-Free Grammars & Pushdown Automata):** Grammar parsers, leftmost/rightmost sentential derivations, hierarchical SVG parse trees, mathematical proof of grammar ambiguity via side-by-side tree renders, grammar simplification ($\epsilon$-removal, unit-rule removal, useless symbol elimination), Chomsky Normal Form (CNF) synthesis, and Pushdown Automata (PDA) simulator with real-time animated vertical stack memory.
4. **Theoretical Laboratories:** Adversary games for the Pumping Lemma on Regular Languages ($L = \{a^n b^n\}$) and Context-Free Languages ($L = \{a^n b^n c^n\}$).

The entire system is implemented in pure modern web standards (HTML5, CSS3, ES6 JavaScript, SVG) without third-party frameworks, verified against 70 automated unit tests with a 100% pass rate.

---

## 1. Syllabus & Curriculum Mapping

The project directly maps to the official course curriculum:

| Module | Core Syllabus Topics | Implemented Engine Component |
| :--- | :--- | :--- |
| **Module 1** | Alphabets, Strings, Operations on Languages, Transition Graphs, Regular Expression Concepts | `LanguageUtils`, `RegexEngine` |
| **Module 2** | DFA, NFA, Equivalence of DFA and NFA, Thompson's Construction, Subset Construction, DFA Minimization (Hopcroft / Table-filling), Pumping Lemma for Regular Languages | `AutomataEngine`, `MinimizerEngine`, `PumpingLemmaEngine` |
| **Module 3** | CFG, Derivation Trees, Ambiguity, Simplification of CFG, Chomsky Normal Form (CNF), Pushdown Automata (PDA), Equivalence of PDA & CFG, Pumping Lemma for CFL | `CFGEngine`, `PDAEngine`, `PumpingLemmaEngine` |

---

## 2. Theoretical Background & Mathematical Foundations

### 2.1 Module 1: Formal Languages & Operations
- **Alphabet ($\Sigma$):** A finite, non-empty set of symbols.
- **String over $\Sigma$:** A finite sequence of symbols from $\Sigma$. Length $|w|$ denotes symbol count. Empty string is denoted by $\epsilon$, with $|\epsilon| = 0$.
- **Language ($L$):** A subset of $\Sigma^*$, the Kleene closure of $\Sigma$:
  $$L \subseteq \Sigma^* = \bigcup_{i=0}^{\infty} \Sigma^i$$
- **Operations:**
  - Reversal: $(a_1 a_2 \dots a_n)^R = a_n \dots a_2 a_1$
  - Language Concatenation: $L_1 L_2 = \{ w_1 w_2 \mid w_1 \in L_1, w_2 \in L_2 \}$
  - Kleene Star: $L^* = \bigcup_{k=0}^{\infty} L^k$ where $L^0 = \{\epsilon\}$

### 2.2 Module 2: Finite Automata & Equivalence
- **DFA 5-Tuple:** $M = (Q, \Sigma, \delta, q_0, F)$ where $\delta: Q \times \Sigma \to Q$ is deterministic and total.
- **NFA 5-Tuple:** $M = (Q, \Sigma, \delta, q_0, F)$ where $\delta: Q \times (\Sigma \cup \{\epsilon\}) \to \mathcal{P}(Q)$.
- **Thompson's Construction:** An inductive syntax-directed algorithm mapping postfix regular expressions into $\epsilon$-NFAs using compositional sub-gadgets:
  - Base: $s_0 \xrightarrow{a} s_1$
  - Union ($R_1 \mid R_2$): Introduces initial branching and final converging $\epsilon$-transitions.
  - Concatenation ($R_1 \cdot R_2$): Chains $F(R_1) \xrightarrow{\epsilon} q_0(R_2)$.
  - Kleene Star ($R^*$): Introduces bypass and loopback $\epsilon$-edges.
- **Subset Construction (Powerset Algorithm):**
  - $\epsilon\text{-closure}(T) = \{ q \in Q \mid \exists \text{ path from } p \in T \text{ to } q \text{ labeled } \epsilon \}$
  - $\delta_D(S, a) = \epsilon\text{-closure}(\bigcup_{q \in S} \delta_N(q, a))$
  - $F_D = \{ S \subseteq Q_N \mid S \cap F_N \neq \emptyset \}$
- **Myhill-Nerode Table-Filling Minimization:**
  - Two states $p, q$ are distinguishable ($p \not\equiv q$) if $\exists w \in \Sigma^*$ such that $\hat{\delta}(p, w) \in F \iff \hat{\delta}(q, w) \notin F$.
  - Fixed-point iteration over the triangular matrix $\mathcal{M}(p, q)$ marks pairs until convergence. Unmarked pairs form equivalence classes $[q_i]$ generating the minimal quotient DFA.

### 2.3 Module 3: Context-Free Grammars & Pushdown Automata
- **CFG 4-Tuple:** $G = (V, \Sigma, R, S)$ where $R \subseteq V \times (V \cup \Sigma)^*$.
- **Parse Trees & Ambiguity:** A grammar $G$ is ambiguous if $\exists w \in L(G)$ having two or more distinct leftmost derivations (or distinct parse trees).
- **CFG Simplification Pipeline:**
  1. Elimination of $\epsilon$-productions ($A \to \epsilon$) by finding nullable variables and generating combinatorial replacement rules.
  2. Elimination of Unit productions ($A \to B$) by computing unit pairs and flattening.
  3. Elimination of Useless symbols by computing generating variables followed by reachable variables.
  4. Conversion to Chomsky Normal Form (CNF) where all rules are $A \to BC$ or $A \to a$.
- **Pushdown Automata (PDA) 7-Tuple:**
  $$M = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$$
  where $\delta: Q \times (\Sigma \cup \{\epsilon\}) \times \Gamma \to \mathcal{P}(Q \times \Gamma^*)$.
  The stack allows the automaton to recognize non-regular languages such as $L = \{a^n b^n \mid n \ge 1\}$ by storing count tallies and verifying symmetric balance.

---

## 3. System Architecture & Engineering

```
flat-automata-visualizer/
├── index.html                    # Single-page multi-tab visualizer studio
├── styles.css                    # Dark glassmorphic design system
├── js/
│   ├── app.js                    # UI coordinator, event handling & animations
│   ├── engine/
│   │   ├── regex.js              # Shunting-Yard parser & Thompson's NFA generator
│   │   ├── automata.js           # DFA/NFA simulators, ε-closure & Subset construction
│   │   ├── minimizer.js          # Reachability pruning & Table-Filling minimizer
│   │   ├── cfg.js                # CFG derivations, ambiguity check, simplification & CNF
│   │   ├── pda.js                # Pushdown Automata execution & preset models
│   │   └── pumping.js            # Regular & CFL Pumping Lemma adversary engines
│   └── ui/
│       ├── graph_renderer.js     # SVG automata graph renderer with active state glow
│       ├── tree_renderer.js      # Hierarchical SVG parse tree renderer
│       └── stack_renderer.js     # Animated vertical stack visualizer
├── run_tests.js                  # Standalone automated CLI test suite (56 tests)
├── README.md                     # Documentation & setup instructions
├── TESTING.md                    # Formal QA matrix
└── docs/
    ├── FLAT_Project_Report.md    # Academic project report (this document)
    ├── FLAT_Project_Report.html  # Formatted, printable HTML academic report
    └── FLAT_Project_Report.pdf   # Pre-rendered PDF academic report
```

---

## 4. Algorithmic Implementation Details

### 4.1 Thompson's NFA Construction
```javascript
// Example: Concatenation fragment composition
const b = stack.pop();
const a = stack.pop();
const transitions = [...a.transitions, ...b.transitions];
transitions.push({ from: a.accept, to: b.start, symbol: 'ε' });
stack.push({ start: a.start, accept: b.accept, transitions });
```

### 4.2 Subset Construction (Powerset ε-Closure)
```javascript
const queue = [startKey];
while (queue.length > 0) {
  const currentKey = queue.shift();
  const currentDFA = dfaStatesMap.get(currentKey);
  for (const sym of alphabet) {
    const moved = move(currentDFA.nfaStates, sym, nfa.transitions);
    const closure = epsilonClosure(moved, nfa.transitions);
    if (closure.length === 0) continue;
    // Register new DFA states and transition links
  }
}
```

### 4.3 Table-Filling Distinguishability Matrix
```javascript
// Base step: Final vs Non-Final
if (acceptSet.has(p) !== acceptSet.has(q)) {
  pair.marked = true;
  pair.reason = 'One state is final, other is non-final';
}
// Inductive fixed-point:
for (const sym of alphabet) {
  const nextP = delta(p, sym);
  const nextQ = delta(q, sym);
  if (isDistinguishable(nextP, nextQ)) {
    mark(p, q, `Distinguishable on '${sym}'`);
  }
}
```

---

## 5. Automated Verification Matrix

The project includes 70 rigorous automated test cases executed via Node.js:

| Test Category | Tested Invariant | Result |
| :--- | :--- | :--- |
| **Module 1** | Prefix, Suffix, Reversal & Sigma^k generation | **PASS (5/5)** |
| **Module 1** | Language Union, Concat, Kleene star calculus | **PASS (3/3)** |
| **Module 1** | Regex explicit concatenation & postfix formatting | **PASS (3/3)** |
| **Module 2** | Thompson's NFA generation from regex | **PASS (3/3)** |
| **Module 2** | Thompson `?` operator & literal character `'e'` preservation | **PASS (7/7)** |
| **Module 2** | NFA parallel branching simulation & ε-paths | **PASS (5/5)** |
| **Module 2** | Subset construction (NFA to DFA) | **PASS (3/3)** |
| **Module 2** | DFA deterministic simulation & boundary rejections | **PASS (5/5)** |
| **Module 2** | Reachability pruning & Table-Filling minimization | **PASS (4/4)** |
| **Module 2** | Partial DFA minimization & canonical TRAP state completion | **PASS (3/3)** |
| **Module 3** | CFG parsing, non-terminals & terminals resolution | **PASS (2/2)** |
| **Module 3** | Leftmost derivation & SVG parse tree construction | **PASS (4/4)** |
| **Module 3** | Grammar Ambiguity detection (dual parse trees) | **PASS (2/2)** |
| **Module 3** | Grammar Simplification (ε, Unit, Useless elimination) | **PASS (3/3)** |
| **Module 3** | Chomsky Normal Form (CNF) rule verification & operator decomposition | **PASS (3/3)** |
| **Module 3** | PDA simulation ($a^n b^n$, palindromes $wcw^R$, parens) | **PASS (13/13)** |
| **Theory** | Pumping Lemma regular & CFL adversary proofs, boundary safety & identity check | **PASS (6/6)** |
| **Total** | **All 70 Automated Tests** | **70 / 70 PASS (100%)** |

---

## 6. Conclusion & Pedagogical Impact

The FLAT Interactive Educational Studio bridges the gap between formal mathematical abstraction and intuitive visual understanding. By enabling students to trace automata executions step-by-step, inspect tabular subset conversions, explore Myhill-Nerode distinguishability matrices, visualize grammatical ambiguity, and observe vertical stack pushes and pops in real time, the application provides an indispensable pedagogical tool for Computer Science education.

---

## 7. References

1. Hopcroft, J. E., Motwani, R., & Ullman, J. D. (2006). *Introduction to Automata Theory, Languages, and Computation* (3rd ed.). Pearson / Addison-Wesley.
2. Sipser, M. (2013). *Introduction to the Theory of Computation* (3rd ed.). Cengage Learning.
3. Linz, P. (2016). *An Introduction to Formal Languages and Automata* (6th ed.). Jones & Bartlett Learning.
4. Aho, A. V., Lam, M. S., Sethi, R., & Ullman, J. D. (2006). *Compilers: Principles, Techniques, and Tools* (2nd ed.). Addison-Wesley.
