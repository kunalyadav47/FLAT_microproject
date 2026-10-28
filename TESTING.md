# Formal Language & Automata Theory (FLAT) — Verification & Testing Record

**Student Name:** Kunal Yadav  
**Roll / Registration Number:** 2411021060008  
**Squad:** 70  
**Course:** Formal Language and Automata Theory (FLAT / TOC)  
**Academic Submission Date:** October 2026  

---

## 🧪 Testing Methodology & Scope

To ensure absolute algorithmic correctness, mathematical validity, and zero runtime crashes, the FLAT visualizer was tested across all 3 syllabus modules using a comprehensive automated test runner (`run_tests.js`) and in-browser interactive testing.

The test suite covers:
- **String & Linguistic Primitives:** Empty string ($\epsilon$), reversal identity, prefix/suffix set correctness, $\Sigma^k$ combinatorial scaling.
- **Regular Expression Parsing:** Infix concatenation insertion, parenthesis grouping, operator precedence, Shunting-Yard postfix conversion.
- **Finite Automata & Equivalence:** Thompson's construction $\epsilon$-closure handling, NFA parallel branching, powerset subset construction determinism, DFA string tracing, and boundary rejections.
- **DFA Minimization:** Detection and elimination of unreachable states, triangular table-filling distinguishability matrix updates, equivalence partitioning, quotient DFA transition consistency.
- **Context-Free Grammars & PDA:** Grammar tokenizer, leftmost derivations, parse tree depth limits, dual-tree ambiguity detection, three-stage CFG simplification ($\epsilon$, unit, useless), CNF rule validation, and pushdown stack operations.
- **Pumping Lemma Adversary Models:** Quantitative exponent variation ($i = 0$ pumping down, $i \ge 2$ pumping up).

---

## 📋 Comprehensive Automated Test Matrix (56 Tests)

| Test ID | Module | Component | Test Name / Scenario | Input | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-M1-01` | M1 | LanguageUtils | Prefix generation | `"abc"` | `['ε', 'a', 'ab', 'abc']` | **PASS** |
| `TC-M1-02` | M1 | LanguageUtils | Suffix generation | `"abc"` | `['ε', 'c', 'bc', 'abc']` | **PASS** |
| `TC-M1-03` | M1 | LanguageUtils | String reversal | `"automata"` | `"atamotua"` | **PASS** |
| `TC-M1-04` | M1 | LanguageUtils | $\Sigma^k$ Generation ($k=2$) | $\Sigma = \{0, 1\}$ | `['00', '01', '10', '11']` | **PASS** |
| `TC-M1-05` | M1 | LanguageUtils | Language Union | $L_1=\{a, ab\}, L_2=\{b, ab\}$ | $\{a, b, ab\}$ (no duplicates) | **PASS** |
| `TC-M1-06` | M1 | RegexEngine | Explicit Concatenation | `"ab"` | `"a.b"` | **PASS** |
| `TC-M1-07` | M1 | RegexEngine | Postfix Conversion | `"(a|b)*abb"` | `"ab|*a.b.b."` | **PASS** |
| `TC-M1-08` | M1 | RegexEngine | Positive Closure Postfix | `"a+b"` | `"a+b."` | **PASS** |
| `TC-M2-01` | M2 | Thompson NFA | NFA Synthesis | `"(a|b)*abb"` | Valid NFA, start/accept designated | **PASS** |
| `TC-M2-02` | M2 | Thompson NFA | Alphabet Extraction | `"(a|b)*abb"` | Alphabet contains `['a', 'b']` | **PASS** |
| `TC-M2-03` | M2 | Thompson NFA | Non-empty states & transitions | `"(a|b)*abb"` | $>0$ states, $>0$ transitions | **PASS** |
| `TC-M2-03a` | M2 | Thompson NFA | `?` (Optional) Operator on `"b"` | `"a?b"` | Accepted (0 occurrences of a) | **PASS** |
| `TC-M2-03b` | M2 | Thompson NFA | `?` (Optional) Operator on `"ab"` | `"a?b"` | Accepted (1 occurrence of a) | **PASS** |
| `TC-M2-03c` | M2 | Thompson NFA | `?` (Optional) Operator on `"aab"` | `"a?b"` | Rejected (>1 occurrence of a) | **PASS** |
| `TC-M2-03d` | M2 | Thompson NFA | Literal `'e'` Alphabet Preservation | `"c(a|e)t"` | Alphabet preserves `'e'` | **PASS** |
| `TC-M2-03e` | M2 | Thompson NFA | Literal `'e'` Word Acceptance | `"cet"` on `"c(a|e)t"` | Accepted | **PASS** |
| `TC-M2-03f` | M2 | Thompson NFA | Word Acceptance on Alternate Symbol | `"cat"` on `"c(a|e)t"` | Accepted | **PASS** |
| `TC-M2-03g` | M2 | Thompson NFA | Rejection of Missing Vowel | `"ct"` on `"c(a|e)t"` | Rejected (letter e not treated as ε) | **PASS** |
| `TC-M2-04` | M2 | NFASimulator | NFA String Acceptance 1 | `"abb"` | Accepted | **PASS** |
| `TC-M2-05` | M2 | NFASimulator | NFA String Acceptance 2 | `"aabb"` | Accepted | **PASS** |
| `TC-M2-06` | M2 | NFASimulator | NFA String Acceptance 3 | `"babb"` | Accepted | **PASS** |
| `TC-M2-07` | M2 | NFASimulator | NFA String Rejection 1 | `"ab"` | Rejected | **PASS** |
| `TC-M2-08` | M2 | NFASimulator | NFA String Rejection 2 | `"abba"` | Rejected | **PASS** |
| `TC-M2-09` | M2 | Subset Construction | Subset DFA Generation | NFA for `(a|b)*abb` | Deterministic DFA object | **PASS** |
| `TC-M2-10` | M2 | Subset Construction | Start state designation | NFA for `(a|b)*abb` | $D_0$ assigned from $\epsilon$-closure | **PASS** |
| `TC-M2-11` | M2 | Subset Construction | Accept state marking | NFA for `(a|b)*abb` | Any subset containing NFA accept | **PASS** |
| `TC-M2-12` | M2 | DFASimulator | DFA String Acceptance 1 | `"abb"` | Accepted | **PASS** |
| `TC-M2-13` | M2 | DFASimulator | DFA String Acceptance 2 | `"aabb"` | Accepted | **PASS** |
| `TC-M2-14` | M2 | DFASimulator | DFA String Acceptance 3 | `"babb"` | Accepted | **PASS** |
| `TC-M2-15` | M2 | DFASimulator | DFA String Rejection 1 | `"ab"` | Rejected | **PASS** |
| `TC-M2-16` | M2 | DFASimulator | DFA String Rejection 2 | `"abba"` | Rejected | **PASS** |
| `TC-M2-17` | M2 | MinimizerEngine | Unreachable state pruning | DFA with state $Z_{\text{unreachable}}$ | $Z_{\text{unreachable}}$ removed | **PASS** |
| `TC-M2-18` | M2 | MinimizerEngine | State reduction | 6-state redundant DFA | Minimal state count $< 6$ | **PASS** |
| `TC-M2-19` | M2 | MinimizerEngine | Distinguishability Table | 6-state redundant DFA | Pairs list populated with reasons | **PASS** |
| `TC-M2-20` | M2 | MinimizerEngine | Partial DFA Acceptance | Minimized DFA for `"ab"` on `"ab"` | Accepted | **PASS** |
| `TC-M2-21` | M2 | MinimizerEngine | Partial DFA Rejection (No False Merge) | Minimized DFA for `"ab"` on `"b"` | Rejected ($D0$ and $D1$ distinguished) | **PASS** |
| `TC-M2-22` | M2 | MinimizerEngine | Canonical Sink Trap Completion | Partial DFA with missing edges | `trapStateAdded: true` | **PASS** |
| `TC-M3-01` | M3 | CFGEngine | Non-terminal parsing | $S \to aSb \mid \epsilon$ | Non-terminals: `['S']` | **PASS** |
| `TC-M3-02` | M3 | CFGEngine | Terminal parsing | $S \to aSb \mid \epsilon$ | Terminals: `['a', 'b']` | **PASS** |
| `TC-M3-03` | M3 | CFGEngine | Derivation 1 | `"aabb"` on $S \to aSb \mid \epsilon$ | Leftmost derivation success | **PASS** |
| `TC-M3-04` | M3 | CFGEngine | Parse Tree Generation | `"aabb"` on $S \to aSb \mid \epsilon$ | Hierarchical node tree generated | **PASS** |
| `TC-M3-05` | M3 | CFGEngine | Derivation 2 | `"aaabbb"` | Success | **PASS** |
| `TC-M3-06` | M3 | CFGEngine | Derivation Rejection | `"aab"` | Failure (not in language) | **PASS** |
| `TC-M3-07` | M3 | CFGEngine | Ambiguity Detection | $E \to E+E \mid E*E \mid a$ on `"a+a*a"` | Marked Ambiguous (`true`) | **PASS** |
| `TC-M3-08` | M3 | CFGEngine | Dual Tree Generation | $E \to E+E \mid E*E \mid a$ on `"a+a*a"` | $\ge 2$ distinct syntax trees | **PASS** |
| `TC-M3-09` | M3 | CFGEngine | Simplification Stages | Grammar with $\epsilon$, unit, useless | All 3 transformation stages run | **PASS** |
| `TC-M3-10` | M3 | CFGEngine | Useless Symbol Removal | Grammar with isolated $C \to c$ | $C$ removed from final grammar | **PASS** |
| `TC-M3-11` | M3 | CFGEngine | CNF Conversion | Simplified Grammar | Returns type `'CNF'` | **PASS** |
| `TC-M3-12` | M3 | CFGEngine | CNF Rule Validity | Converted productions | All rules $A \to BC$ or $A \to a$ | **PASS** |
| `TC-M3-12b` | M3 | CFGEngine | Non-Alphanumeric Terminal CNF | $E \to E - E \mid id$ | Intermediate helper $T_{\text{sym1}} \to -$ cascaded to binary vars | **PASS** |
| `TC-M3-13` | M3 | PDASimulator | $a^n b^n$ Acceptance 1 | `"ab"` | Accepted | **PASS** |
| `TC-M3-14` | M3 | PDASimulator | $a^n b^n$ Acceptance 2 | `"aabb"` | Accepted | **PASS** |
| `TC-M3-15` | M3 | PDASimulator | $a^n b^n$ Acceptance 3 | `"aaabbb"` | Accepted | **PASS** |
| `TC-M3-16` | M3 | PDASimulator | $a^n b^n$ Rejection 1 | `"aab"` | Rejected | **PASS** |
| `TC-M3-17` | M3 | PDASimulator | $a^n b^n$ Rejection 2 | `"abb"` | Rejected | **PASS** |
| `TC-M3-18` | M3 | PDASimulator | Palindrome Acceptance 1 | `"aca"` | Accepted | **PASS** |
| `TC-M3-19` | M3 | PDASimulator | Palindrome Acceptance 2 | `"abcba"` | Accepted | **PASS** |
| `TC-M3-20` | M3 | PDASimulator | Palindrome Acceptance 3 | `"abbcbba"` | Accepted | **PASS** |
| `TC-M3-21` | M3 | PDASimulator | Palindrome Rejection | `"abcb"` | Rejected | **PASS** |
| `TC-M3-22` | M3 | PDASimulator | Balanced Parens 1 | `"()"` | Accepted | **PASS** |
| `TC-M3-23` | M3 | PDASimulator | Balanced Parens 2 | `"(())"` | Accepted | **PASS** |
| `TC-M3-24` | M3 | PDASimulator | Balanced Parens 3 | `"()()"` | Accepted | **PASS** |
| `TC-M3-25` | M3 | PDASimulator | Parens Rejection 1 | `"((()"` | Rejected | **PASS** |
| `TC-M3-26` | M3 | PDASimulator | Parens Rejection 2 | `")("` | Rejected | **PASS** |
| `TC-TH-01` | TH | PumpingLemma | Regular Pumping Down | $a^4 b^4, i=0$ | Not in $L$ (proved non-regular) | **PASS** |
| `TC-TH-02` | TH | PumpingLemma | Regular Pumping Up | $a^4 b^4, i=2$ | Not in $L$ (proved non-regular) | **PASS** |
| `TC-TH-03` | TH | PumpingLemma | CFL Pumping Up | $a^3 b^3 c^3, i=2$ | Not in $L$ (proved non-CFL) | **PASS** |
| `TC-TH-04` | TH | PumpingLemma | Boundary Safety ($p=0$) | $p=0$ on $a^n b^n$ | Clamped to $p \ge 1$, no RangeError | **PASS** |
| `TC-TH-05` | TH | PumpingLemma | Boundary Safety ($p=1$, `aa`) | $p=1, option='aa'$ | Clamped to $p \ge 2$, no negative count error | **PASS** |
| `TC-TH-06` | TH | PumpingLemma | Exponent $i=1$ Identity Check | $p=4, y=2, i=1$ | Returns $w \in L$ with accurate identity explanation | **PASS** |

**Summary Result:** 70 Tests Executed | **70 PASSED (100%)** | 0 FAILED.

---

## 🏃 How to Run the Test Suite

```powershell
# Navigate to project folder
cd C:\Users\hp\.gemini\antigravity\scratch\flat-automata-visualizer

# Execute standalone CLI tests
node run_tests.js
```
