# FLAT Automata Theory Interactive Studio

**Formal Language and Automata Theory (FLAT / TOC) Microproject**  
*Comprehensive educational visualizer, algorithmic simulator, and laboratory covering Modules 1, 2, and 3.*

---

## 👤 Academic & Student Identity

- **Student Name:** Kunal Yadav
- **Registration / Roll Number:** 2411021060008
- **Squad:** 70
- **Course Subject:** Formal Language and Automata Theory (FLAT)
- **Academic Session:** October 2026
- **GitHub Repository Link:** [https://github.com/kunalyadav47/FLAT_microproject](https://github.com/kunalyadav47/FLAT_microproject)
- **Deployed Application Link:** [https://kunalyadav-flat-microproject.vercel.app](https://kunalyadav-flat-microproject.vercel.app) *(also deployable to GitHub Pages)*

---

## 📖 Project Overview

This microproject is an interactive, production-grade, zero-dependency educational simulator designed for computer science students and instructors studying Formal Language and Automata Theory. Built from foundational principles using pure HTML5, CSS3, ES6 JavaScript, and SVG, it provides visual execution and rigorous mathematical proofs for all 3 syllabus modules.

### 🌟 Key Modules & Features

### 🌐 Module 1: Formal Languages, Alphabets, Operations & Regular Expressions
- **Alphabet & String Workbench:** Generates power sets $\Sigma^k$, Kleene star samples $\Sigma^*$, prefixes, suffixes, substrings, and string reversals ($w^R$).
- **Language Operations:** Interactive calculus for Language Union ($L_1 \cup L_2$), Concatenation ($L_1 L_2$), and Kleene Star ($L^*$).
- **RegEx Engine:** Automatic explicit concatenation insertion (`a.b`), operator precedence handling (`*` > `.` > `|`), and Shunting-Yard conversion to Postfix Polish Notation.

### ⚙️ Module 2: Finite Automata, Equivalence & Minimization
- **Thompson's Construction:** Inductive compilation of regular expressions into $\epsilon$-NFA state machines with visual SVG graph rendering.
- **Subset Construction (Powerset Algorithm):** Derives deterministic finite automata (DFA) from $\epsilon$-NFAs using $\epsilon$-closure search, outputting a complete step-by-step state discovery table.
- **Interactive Automaton Simulator & String Tracer:**
  - Presets: Strings ending in $ab$, Even 0s and Odd 1s, Numbers divisible by 3, C-style identifiers, and campus dustbin validator.
  - Step-by-step playback (Play, Pause, Step Forward, Reset, variable speed slider).
  - Dynamic SVG active-state glowing pulse and input tape head indicator.
- **Myhill-Nerode Table-Filling State Minimization:**
  - Prunes unreachable states via BFS traversal.
  - Generates an interactive triangular distinguishability matrix ($n(n-1)/2$ cells) with hoverable explanations of distinguishability reasons.
  - Computes quotient equivalence partitions and renders the minimal DFA.

### 🥞 Module 3: Context-Free Grammars, CNF & Pushdown Automata
- **Context-Free Grammar (CFG) Explorer:** Leftmost derivation sentential forms generator and hierarchical SVG Parse Tree visualizer.
- **Ambiguity Visualizer:** Proves syntactic ambiguity by rendering dual structurally distinct parse trees side-by-side for ambiguous arithmetic expressions.
- **CFG Simplification Pipeline:** Three-phase elimination of $\epsilon$-productions, unit productions ($A \to B$), and useless symbols.
- **Chomsky Normal Form (CNF):** Cascades long productions and replaces terminals to enforce $A \to BC$ or $A \to a$.
- **Pushdown Automata (PDA) Simulator:**
  - Models the 7-tuple $M = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ recognizing non-regular languages ($a^n b^n$, palindromes $wcw^R$, balanced parentheses).
  - Real-time animated vertical stack memory showing element push/pop actions, current depth, and $Z_0$ base plate.

### ⚖️ Theoretical Laboratories: Pumping Lemma Games
- **Regular Languages Pumping Lemma:** Adversary game demonstrating non-regularity of $L = \{a^n b^n\}$ via quantitative exponent pumping ($i = 0$ pumping down, $i \ge 2$ pumping up).
- **Context-Free Languages Pumping Lemma:** Interactive proof that $L = \{a^n b^n c^n\}$ is not context-free.

---

## 📂 Project Architecture

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
├── run_tests.js                  # Standalone automated CLI test suite (70 tests)
├── README.md                     # Project documentation (this file)
├── TESTING.md                    # Formal verification matrix
├── screenshots/                  # High-resolution screenshots of all visualizer tabs
└── docs/
    ├── FLAT_Project_Report.md    # Formal academic research report
    ├── FLAT_Project_Report.html  # Printable HTML academic report
    └── FLAT_Project_Report.pdf   # Pre-rendered PDF report
```

---

## 🚀 How to Run Locally

Because the application is written entirely with standard web technologies, **no build step, compilation, or package manager installation is required**.

### Option 1: Direct Browser Launch
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari):
```powershell
start index.html
```

### Option 2: Local Python Server
```powershell
# In project root
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

---

## 🧪 Automated Testing

The project includes 56 automated unit and integration tests covering all algorithms and edge cases:
```powershell
# Run the test suite
node run_tests.js
```
Expected output:
```
===============================================================
TOTAL TESTS EXECUTED: 56
PASSED: 56
FAILED: 0
===============================================================
All verification checks PASSED successfully!
```
Tests can also be executed live within the web application on the **"Test Suite & Report"** tab.

---

## 📦 ZIP Submission Package

Following the mandatory naming convention:
`StudentName_SubjectName_MicroProject.zip` ➔ **`KunalYadav_FLAT_MicroProject.zip`**

Contains:
- Complete application source code (`index.html`, `styles.css`, `js/`)
- Test scripts and test documentation (`run_tests.js`, `TESTING.md`)
- Complete academic microproject reports (`docs/FLAT_Project_Report.md`, `.html`, `.pdf`)
- Visual screenshots (`screenshots/`)
- Project `README.md`
