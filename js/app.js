/**
 * Main Application Coordinator for FLAT Interactive Studio
 * Integrates all modules, UI event listeners, animation timers,
 * SVG visualizers, and interactive laboratories.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Global Engine References
  const RegexEngine = window.RegexEngine;
  const AutomataEngine = window.AutomataEngine;
  const MinimizerEngine = window.MinimizerEngine;
  const CFGEngine = window.CFGEngine;
  const PDAEngine = window.PDAEngine;
  const PumpingLemmaEngine = window.PumpingLemmaEngine;
  const AutomataGraphRenderer = window.GraphRenderer;
  const ParseTreeRenderer = window.TreeRenderer;
  const StackRenderer = window.StackRenderer;

  // -------------------------------------------------------------
  // TAB NAVIGATION
  // -------------------------------------------------------------
  window.switchTab = function (tabId) {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    panes.forEach(p => {
      if (p.id === tabId) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  };

  const navTabBtns = document.querySelectorAll('.nav-tab-btn');
  navTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      if (targetId) {
        window.switchTab(targetId);
        window.location.hash = targetId;
      }
    });
  });

  // Check URL hash on load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(initialHash)) {
    window.switchTab(initialHash);
  }

  // -------------------------------------------------------------
  // MODULE 1: ALPHABETS & LANGUAGES WORKBENCH
  // -------------------------------------------------------------
  const m1AlphabetInput = document.getElementById('m1-alphabet');
  const m1KInput = document.getElementById('m1-k');
  const m1BtnGenSigma = document.getElementById('m1-btn-gensigma');
  const m1SigmaResult = document.getElementById('m1-sigma-result');

  m1BtnGenSigma?.addEventListener('click', () => {
    const raw = m1AlphabetInput.value.split(',').map(s => s.trim()).filter(Boolean);
    const k = parseInt(m1KInput.value, 10) || 0;
    const res = AutomataEngine.LanguageUtils.generateSigmaK(raw, k);
    m1SigmaResult.textContent = `{ ${res.join(', ')} } (Total: ${res.length} strings)`;
  });

  const m1TestWord = document.getElementById('m1-test-word');
  const m1BtnAnalyze = document.getElementById('m1-btn-analyzestring');
  const m1Reversal = document.getElementById('m1-reversal');
  const m1Prefixes = document.getElementById('m1-prefixes');
  const m1Suffixes = document.getElementById('m1-suffixes');

  m1BtnAnalyze?.addEventListener('click', () => {
    const word = m1TestWord.value.trim();
    m1Reversal.textContent = AutomataEngine.LanguageUtils.reverseString(word);
    m1Prefixes.textContent = `{ ${AutomataEngine.LanguageUtils.getPrefixes(word).join(', ')} }`;
    m1Suffixes.textContent = `{ ${AutomataEngine.LanguageUtils.getSuffixes(word).join(', ')} }`;
  });

  const m1L1 = document.getElementById('m1-lang-l1');
  const m1L2 = document.getElementById('m1-lang-l2');
  const m1LangRes = document.getElementById('m1-lang-result');

  document.getElementById('m1-btn-union')?.addEventListener('click', () => {
    const l1 = m1L1.value.split(',').map(s => s.trim()).filter(Boolean);
    const l2 = m1L2.value.split(',').map(s => s.trim()).filter(Boolean);
    const u = AutomataEngine.LanguageUtils.languageUnion(l1, l2);
    m1LangRes.textContent = `L₁ ∪ L₂ = { ${u.join(', ')} }`;
  });

  document.getElementById('m1-btn-concat')?.addEventListener('click', () => {
    const l1 = m1L1.value.split(',').map(s => s.trim()).filter(Boolean);
    const l2 = m1L2.value.split(',').map(s => s.trim()).filter(Boolean);
    const c = AutomataEngine.LanguageUtils.languageConcat(l1, l2);
    m1LangRes.textContent = `L₁L₂ = { ${c.join(', ')} }`;
  });

  document.getElementById('m1-btn-kleene')?.addEventListener('click', () => {
    const l1 = m1L1.value.split(',').map(s => s.trim()).filter(Boolean);
    const k = AutomataEngine.LanguageUtils.languageKleene(l1, 3);
    m1LangRes.textContent = `L₁* (powers ≤ 3) = { ${k.join(', ')} ... }`;
  });

  document.getElementById('m1-btn-parse-regex')?.addEventListener('click', () => {
    const reg = document.getElementById('m1-regex-input').value.trim();
    try {
      const explicit = RegexEngine.formatRegex(reg);
      const postfix = RegexEngine.infixToPostfix(reg);
      document.getElementById('m1-explicit-regex').textContent = explicit;
      document.getElementById('m1-postfix-regex').textContent = postfix;
    } catch (e) {
      alert('Regex Error: ' + e.message);
    }
  });


  // -------------------------------------------------------------
  // MODULE 2A: AUTOMATON SIMULATOR & STEP TRACER
  // -------------------------------------------------------------
  const M2A_PRESETS = {
    ends_ab: {
      type: 'DFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: 'a' },
        { from: 'q0', to: 'q0', symbol: 'b' },
        { from: 'q1', to: 'q1', symbol: 'a' },
        { from: 'q1', to: 'q2', symbol: 'b' },
        { from: 'q2', to: 'q1', symbol: 'a' },
        { from: 'q2', to: 'q0', symbol: 'b' }
      ],
      defaultInput: 'abb'
    },
    even0_odd1: {
      type: 'DFA',
      states: ['q_ee', 'q_eo', 'q_oe', 'q_oo'],
      alphabet: ['0', '1'],
      startState: 'q_ee',
      acceptStates: ['q_eo'],
      transitions: [
        { from: 'q_ee', to: 'q_oe', symbol: '0' },
        { from: 'q_ee', to: 'q_eo', symbol: '1' },
        { from: 'q_eo', to: 'q_oo', symbol: '0' },
        { from: 'q_eo', to: 'q_ee', symbol: '1' },
        { from: 'q_oe', to: 'q_ee', symbol: '0' },
        { from: 'q_oe', to: 'q_oo', symbol: '1' },
        { from: 'q_oo', to: 'q_eo', symbol: '0' },
        { from: 'q_oo', to: 'q_oe', symbol: '1' }
      ],
      defaultInput: '001'
    },
    div_by_3: {
      type: 'DFA',
      states: ['r0', 'r1', 'r2'],
      alphabet: ['0', '1'],
      startState: 'r0',
      acceptStates: ['r0'],
      transitions: [
        { from: 'r0', to: 'r0', symbol: '0' },
        { from: 'r0', to: 'r1', symbol: '1' },
        { from: 'r1', to: 'r2', symbol: '0' },
        { from: 'r1', to: 'r0', symbol: '1' },
        { from: 'r2', to: 'r1', symbol: '0' },
        { from: 'r2', to: 'r2', symbol: '1' }
      ],
      defaultInput: '110' // 6 in binary
    },
    c_identifier: {
      type: 'DFA',
      states: ['start', 'valid_id', 'invalid_trap'],
      alphabet: ['letter', 'digit', 'other'],
      startState: 'start',
      acceptStates: ['valid_id'],
      transitions: [
        { from: 'start', to: 'valid_id', symbol: 'letter' },
        { from: 'start', to: 'invalid_trap', symbol: 'digit' },
        { from: 'start', to: 'invalid_trap', symbol: 'other' },
        { from: 'valid_id', to: 'valid_id', symbol: 'letter' },
        { from: 'valid_id', to: 'valid_id', symbol: 'digit' },
        { from: 'valid_id', to: 'invalid_trap', symbol: 'other' },
        { from: 'invalid_trap', to: 'invalid_trap', symbol: 'letter' },
        { from: 'invalid_trap', to: 'invalid_trap', symbol: 'digit' },
        { from: 'invalid_trap', to: 'invalid_trap', symbol: 'other' }
      ],
      defaultInput: 'x1'
    },
    dustbin_id: {
      type: 'DFA',
      states: ['q0', 'q1', 'q2', 'q3', 'trap'],
      alphabet: ['B', 'd', 'other'],
      startState: 'q0',
      acceptStates: ['q3'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: 'B' },
        { from: 'q0', to: 'trap', symbol: 'd' },
        { from: 'q0', to: 'trap', symbol: 'other' },
        { from: 'q1', to: 'q2', symbol: 'd' },
        { from: 'q1', to: 'trap', symbol: 'B' },
        { from: 'q1', to: 'trap', symbol: 'other' },
        { from: 'q2', to: 'q3', symbol: 'd' },
        { from: 'q2', to: 'trap', symbol: 'B' },
        { from: 'q2', to: 'trap', symbol: 'other' },
        { from: 'q3', to: 'trap', symbol: 'B' },
        { from: 'q3', to: 'trap', symbol: 'd' },
        { from: 'q3', to: 'trap', symbol: 'other' },
        { from: 'trap', to: 'trap', symbol: 'B' },
        { from: 'trap', to: 'trap', symbol: 'd' },
        { from: 'trap', to: 'trap', symbol: 'other' }
      ],
      defaultInput: 'B01'
    },
    nfa_branching: {
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: [
        { from: 'q0', to: 'q0', symbol: 'a' },
        { from: 'q0', to: 'q1', symbol: 'a' }, // Non-deterministic branch on 'a'
        { from: 'q0', to: 'q0', symbol: 'b' },
        { from: 'q1', to: 'q2', symbol: 'b' }
      ],
      defaultInput: 'aab'
    }
  };

  let m2aCurrentAutomaton = M2A_PRESETS.ends_ab;
  let m2aTraceSteps = [];
  let m2aCurrentStepIdx = 0;
  let m2aPlayTimer = null;
  const m2aRenderer = new AutomataGraphRenderer('m2a-svg-canvas');

  function initM2A(presetKey) {
    m2aCurrentAutomaton = M2A_PRESETS[presetKey] || M2A_PRESETS.ends_ab;
    document.getElementById('m2a-input-string').value = m2aCurrentAutomaton.defaultInput;
    document.getElementById('m2a-automaton-meta').textContent =
      `Type: ${m2aCurrentAutomaton.type} | States: ${m2aCurrentAutomaton.states.length} | Alphabet: {${m2aCurrentAutomaton.alphabet.join(', ')}} | Start: ${m2aCurrentAutomaton.startState} | Accept: {${m2aCurrentAutomaton.acceptStates.join(', ')}}`;

    m2aRenderer.render(m2aCurrentAutomaton, [m2aCurrentAutomaton.startState]);
    resetM2ASimulation();
  }

  function resetM2ASimulation() {
    if (m2aPlayTimer) {
      clearInterval(m2aPlayTimer);
      m2aPlayTimer = null;
    }
    const inputStr = document.getElementById('m2a-input-string').value.trim();

    // Map input string characters if C-identifier or dustbin ID
    let mappedInput = inputStr;
    if (m2aCurrentAutomaton === M2A_PRESETS.c_identifier) {
      // Map chars to letter / digit / other
      mappedInput = inputStr.split('').map(c => (/^[a-zA-Z_]$/.test(c) ? 'letter' : /^[0-9]$/.test(c) ? 'digit' : 'other'));
    } else if (m2aCurrentAutomaton === M2A_PRESETS.dustbin_id) {
      mappedInput = inputStr.split('').map(c => (c === 'B' ? 'B' : /^[0-9]$/.test(c) ? 'd' : 'other'));
    }

    if (m2aCurrentAutomaton.type === 'DFA') {
      const sim = new AutomataEngine.DFASimulator(m2aCurrentAutomaton);
      const res = sim.trace(mappedInput);
      m2aTraceSteps = res.steps;
    } else {
      const sim = new AutomataEngine.NFASimulator(m2aCurrentAutomaton);
      const res = sim.trace(mappedInput);
      m2aTraceSteps = res.steps;
    }

    m2aCurrentStepIdx = 0;
    renderM2AStep(0, inputStr);
  }

  function renderM2AStep(idx, originalInput) {
    if (idx < 0 || idx >= m2aTraceSteps.length) return;
    const step = m2aTraceSteps[idx];

    // Highlighting
    const activeStates = step.states || [step.state];
    m2aRenderer.highlightStates(activeStates);
    document.getElementById('m2a-active-state-display').textContent = `Active: ${activeStates.join(', ')}`;

    // Status Badge
    const badge = document.getElementById('m2a-status-badge');
    badge.className = 'badge-status ' + (step.status === 'ACCEPTED' ? 'badge-accepted' : step.status === 'REJECTED' ? 'badge-rejected' : 'badge-running');
    badge.textContent = step.status;

    // Tape rendering
    const tapeContainer = document.getElementById('m2a-tape-container');
    let tapeHtml = '';
    for (let i = 0; i < originalInput.length; i++) {
      const isConsumed = i < idx;
      const isCurrent = i === idx;
      tapeHtml += `
        <div class="tape-cell ${isConsumed ? 'consumed' : ''} ${isCurrent ? 'current-head' : ''}">
          ${isCurrent ? '<span class="tape-head-pointer">&#9660;</span>' : ''}
          ${originalInput[i]}
        </div>
      `;
    }
    tapeContainer.innerHTML = tapeHtml;

    // Trace Table
    const tbody = document.querySelector('#m2a-trace-table tbody');
    let rowsHtml = '';
    m2aTraceSteps.forEach((s, sIdx) => {
      const isCurRow = sIdx === idx;
      const statesText = s.states ? `{${s.states.join(', ')}}` : s.state;
      rowsHtml += `
        <tr class="${isCurRow ? 'highlight-row' : ''}">
          <td>${s.step}</td>
          <td>${statesText}</td>
          <td>${s.consumed || '—'}</td>
          <td>${s.remainingInput || 'ε'}</td>
          <td>${s.note || s.action || 'Initialized'}</td>
        </tr>
      `;
    });
    tbody.innerHTML = rowsHtml;
  }

  document.getElementById('m2a-preset-select')?.addEventListener('change', (e) => {
    initM2A(e.target.value);
  });

  document.getElementById('m2a-btn-step-fwd')?.addEventListener('click', () => {
    if (m2aCurrentStepIdx < m2aTraceSteps.length - 1) {
      m2aCurrentStepIdx++;
      renderM2AStep(m2aCurrentStepIdx, document.getElementById('m2a-input-string').value.trim());
    }
  });

  document.getElementById('m2a-btn-play')?.addEventListener('click', () => {
    if (m2aPlayTimer) return;
    const speed = parseInt(document.getElementById('m2a-speed').value, 10) || 700;
    m2aPlayTimer = setInterval(() => {
      if (m2aCurrentStepIdx < m2aTraceSteps.length - 1) {
        m2aCurrentStepIdx++;
        renderM2AStep(m2aCurrentStepIdx, document.getElementById('m2a-input-string').value.trim());
      } else {
        clearInterval(m2aPlayTimer);
        m2aPlayTimer = null;
      }
    }, speed);
  });

  document.getElementById('m2a-btn-pause')?.addEventListener('click', () => {
    if (m2aPlayTimer) {
      clearInterval(m2aPlayTimer);
      m2aPlayTimer = null;
    }
  });

  document.getElementById('m2a-btn-reset')?.addEventListener('click', resetM2ASimulation);

  // Initialize M2A default
  initM2A('ends_ab');


  // -------------------------------------------------------------
  // MODULE 2B: REGEX TO NFA TO DFA
  // -------------------------------------------------------------
  const m2bNfaRenderer = new AutomataGraphRenderer('m2b-nfa-svg');
  const m2bDfaRenderer = new AutomataGraphRenderer('m2b-dfa-svg');
  let currentGeneratedDFA = null;

  function buildM2B() {
    const regexStr = document.getElementById('m2b-regex-input').value.trim();
    const testStr = document.getElementById('m2b-test-string').value.trim();

    try {
      // 1. Thompson NFA
      const nfa = RegexEngine.regexToNFA(regexStr);
      document.getElementById('m2b-nfa-stats').textContent = `States: ${nfa.states.length} | Alphabet: {${nfa.alphabet.join(', ')}}`;
      m2bNfaRenderer.render(nfa, [nfa.startState]);

      // 2. Subset DFA
      const dfa = AutomataEngine.nfaToDFA(nfa);
      currentGeneratedDFA = dfa;
      document.getElementById('m2b-dfa-stats').textContent = `States: ${dfa.states.length} | Alphabet: {${dfa.alphabet.join(', ')}}`;
      m2bDfaRenderer.render(dfa, [dfa.startState]);

      // 3. Test Strings on both
      const nfaSim = new AutomataEngine.NFASimulator(nfa);
      const nfaRes = nfaSim.trace(testStr);
      const nfaBadge = document.getElementById('m2b-nfa-test-result');
      nfaBadge.className = 'badge-status ' + (nfaRes.accepted ? 'badge-accepted' : 'badge-rejected');
      nfaBadge.textContent = `NFA: ${nfaRes.accepted ? 'ACCEPTED' : 'REJECTED'}`;

      const dfaSim = new AutomataEngine.DFASimulator(dfa);
      const dfaRes = dfaSim.trace(testStr);
      const dfaBadge = document.getElementById('m2b-dfa-test-result');
      dfaBadge.className = 'badge-status ' + (dfaRes.accepted ? 'badge-accepted' : 'badge-rejected');
      dfaBadge.textContent = `DFA: ${dfaRes.accepted ? 'ACCEPTED' : 'REJECTED'}`;

      // 4. Fill Derivation Table
      const tbody = document.querySelector('#m2b-subset-table tbody');
      let tableHtml = '';
      dfa.derivationSteps.forEach(step => {
        tableHtml += `
          <tr>
            <td><strong>${step.fromDFA}</strong></td>
            <td>{${step.fromNFASet.join(', ')}}</td>
            <td><code>${step.symbol}</code></td>
            <td>{${step.moveNFASet.join(', ') || '∅'}}</td>
            <td><strong>${step.toDFA}</strong> = {${step.closureNFASet.join(', ')}}</td>
            <td>${step.isNewState ? '<span class="tag-pill" style="color:#38bdf8;">New State</span>' : 'Existing'}</td>
          </tr>
        `;
      });
      tbody.innerHTML = tableHtml;

    } catch (e) {
      alert('RegEx Parsing Error: ' + e.message);
    }
  }

  document.getElementById('m2b-btn-build')?.addEventListener('click', buildM2B);
  // Auto build on load
  setTimeout(buildM2B, 200);


  // -------------------------------------------------------------
  // MODULE 2C: DFA MINIMIZATION VISUALIZER
  // -------------------------------------------------------------
  const M2C_PRESETS = {
    redundant_6state: {
      type: 'DFA',
      states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q1', 'q2', 'q4'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q0', to: 'q2', symbol: '1' },
        { from: 'q1', to: 'q3', symbol: '0' },
        { from: 'q1', to: 'q4', symbol: '1' },
        { from: 'q2', to: 'q4', symbol: '0' },
        { from: 'q2', to: 'q3', symbol: '1' },
        { from: 'q3', to: 'q5', symbol: '0' },
        { from: 'q3', to: 'q5', symbol: '1' },
        { from: 'q4', to: 'q5', symbol: '0' },
        { from: 'q4', to: 'q5', symbol: '1' },
        { from: 'q5', to: 'q5', symbol: '0' },
        { from: 'q5', to: 'q5', symbol: '1' }
      ]
    },
    redundant_8state: {
      type: 'DFA',
      states: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      alphabet: ['0', '1'],
      startState: 'A',
      acceptStates: ['C', 'G'],
      transitions: [
        { from: 'A', to: 'B', symbol: '0' },
        { from: 'A', to: 'F', symbol: '1' },
        { from: 'B', to: 'G', symbol: '0' },
        { from: 'B', to: 'C', symbol: '1' },
        { from: 'C', to: 'A', symbol: '0' },
        { from: 'C', to: 'C', symbol: '1' },
        { from: 'D', to: 'C', symbol: '0' },
        { from: 'D', to: 'G', symbol: '1' },
        { from: 'E', to: 'H', symbol: '0' },
        { from: 'E', to: 'F', symbol: '1' },
        { from: 'F', to: 'C', symbol: '0' },
        { from: 'F', to: 'G', symbol: '1' },
        { from: 'G', to: 'G', symbol: '0' },
        { from: 'G', to: 'E', symbol: '1' },
        { from: 'H', to: 'G', symbol: '0' },
        { from: 'H', to: 'C', symbol: '1' }
      ]
    }
  };

  const m2cMinDfaRenderer = new AutomataGraphRenderer('m2c-min-dfa-svg');

  function runM2CMinimizer() {
    const opt = document.getElementById('m2c-preset-select').value;
    let targetDFA = M2C_PRESETS[opt];

    if (opt === 'from_module2b' && currentGeneratedDFA) {
      targetDFA = currentGeneratedDFA;
    } else if (opt === 'from_module2b' && !currentGeneratedDFA) {
      alert('Please build DFA in Module 2B first.');
      targetDFA = M2C_PRESETS.redundant_6state;
    }

    const minResult = MinimizerEngine.minimizeDFA(targetDFA);

    document.getElementById('m2c-orig-count').textContent = minResult.originalStateCount;
    document.getElementById('m2c-unreach-count').textContent = minResult.unreachableStates.length > 0
      ? `{ ${minResult.unreachableStates.join(', ')} }`
      : 'None (All states reachable)';
    document.getElementById('m2c-min-count').textContent = minResult.minimalStateCount;
    document.getElementById('m2c-equiv-classes').textContent = minResult.equivalenceClasses.map(c => `[${c.join(', ')}]`).join(', ');

    // Render Matrix Table
    const states = minResult.evaluatedStates || (minResult.minimalDFA.alphabet ? [...targetDFA.states].filter(s => !minResult.unreachableStates.includes(s)).sort() : []);
    const container = document.getElementById('m2c-matrix-container');

    let matrixHtml = '<table class="matrix-table"><tr><th></th>';
    // Column headers: states from index 0 to length - 2
    for (let c = 0; c < states.length - 1; c++) {
      matrixHtml += `<th>${states[c]}</th>`;
    }
    matrixHtml += '</tr>';

    const pairsMap = new Map();
    minResult.pairsTable.forEach(p => {
      const key = p.p < p.q ? `${p.p}#${p.q}` : `${p.q}#${p.p}`;
      pairsMap.set(key, p);
    });

    // Row headers: states from index 1 to length - 1
    for (let r = 1; r < states.length; r++) {
      const rowState = states[r];
      matrixHtml += `<tr><th>${rowState}</th>`;

      for (let c = 0; c < states.length - 1; c++) {
        const colState = states[c];
        if (c < r) {
          const key = colState < rowState ? `${colState}#${rowState}` : `${rowState}#${colState}`;
          const pair = pairsMap.get(key);
          const isMarked = pair && pair.marked;
          const markSym = isMarked ? '✕' : '✔';
          const cellClass = isMarked ? 'matrix-cell-marked' : 'matrix-cell-unmarked';
          const reason = pair ? pair.reason || 'Equivalent / Indistinguishable' : '';

          matrixHtml += `
            <td class="${cellClass}" data-reason="${reason}" data-p="${colState}" data-q="${rowState}">
              ${markSym}
            </td>
          `;
        } else {
          matrixHtml += '<td class="matrix-cell-empty"></td>';
        }
      }
      matrixHtml += '</tr>';
    }
    matrixHtml += '</table>';
    container.innerHTML = matrixHtml;

    // Attach tooltips
    const tooltip = document.getElementById('m2c-matrix-tooltip');
    container.querySelectorAll('.matrix-cell-marked, .matrix-cell-unmarked').forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        const p = cell.getAttribute('data-p');
        const q = cell.getAttribute('data-q');
        const reason = cell.getAttribute('data-reason');
        tooltip.textContent = `Pair (${p}, ${q}): ${reason}`;
      });
    });

    // Render Minimal DFA
    m2cMinDfaRenderer.render(minResult.minimalDFA, [minResult.minimalDFA.startState]);
  }

  document.getElementById('m2c-btn-run-minimizer')?.addEventListener('click', runM2CMinimizer);
  setTimeout(runM2CMinimizer, 300);


  // -------------------------------------------------------------
  // MODULE 3A: CFG DERIVATIONS & AMBIGUITY
  // -------------------------------------------------------------
  const M3A_PRESETS = {
    balanced_parens: {
      grammar: 'S -> ( S ) | S S | ε',
      target: '()'
    },
    palindromes: {
      grammar: 'S -> a S a | b S b | ε',
      target: 'abba'
    },
    equal_ab: {
      grammar: 'S -> a S b | b S a | ε',
      target: 'ab'
    },
    ambiguous_expr: {
      grammar: 'E -> E + E | E * E | a',
      target: 'a+a*a'
    }
  };

  const m3aTreeRenderer = new ParseTreeRenderer('m3a-tree-svg');
  const m3aAmbigTree1 = new ParseTreeRenderer('m3a-ambig-tree1');
  const m3aAmbigTree2 = new ParseTreeRenderer('m3a-ambig-tree2');

  function deriveCFG() {
    document.getElementById('m3a-ambiguity-container').style.display = 'none';
    const text = document.getElementById('m3a-grammar-editor').value;
    const targetStr = document.getElementById('m3a-target-str').value.trim();

    try {
      const grammar = CFGEngine.parseGrammar(text);
      const res = CFGEngine.deriveString(grammar, targetStr);

      const statusEl = document.getElementById('m3a-tree-status');
      const listEl = document.getElementById('m3a-derivation-list');

      if (res.success) {
        statusEl.textContent = `Derivation Success (${res.derivation.length} steps)`;
        statusEl.style.color = '#10b981';
        m3aTreeRenderer.render(res.tree);

        let listHtml = '';
        res.derivation.forEach((step, idx) => {
          listHtml += `
            <div class="derivation-step-line">
              <span>Step ${idx}: <strong>${step.form}</strong></span>
              <span class="step-arrow">${step.rule || ''}</span>
            </div>
          `;
        });
        listEl.innerHTML = listHtml;
      } else {
        statusEl.textContent = 'String not derivable';
        statusEl.style.color = '#f43f5e';
        listEl.innerHTML = `<p style="color: #f43f5e;">${res.message}</p>`;
      }
    } catch (e) {
      alert('CFG Error: ' + e.message);
    }
  }

  function checkAmbig() {
    const text = document.getElementById('m3a-grammar-editor').value;
    const targetStr = document.getElementById('m3a-target-str').value.trim();

    try {
      const grammar = CFGEngine.parseGrammar(text);
      const ambig = CFGEngine.checkAmbiguity(grammar, targetStr);

      const ambigContainer = document.getElementById('m3a-ambiguity-container');
      ambigContainer.style.display = 'block';

      if (ambig.isAmbiguous && ambig.trees.length >= 2) {
        m3aAmbigTree1.render(ambig.trees[0].tree);
        m3aAmbigTree2.render(ambig.trees[1].tree);
      } else {
        alert('Could not locate distinct parse trees within depth limit for string: ' + targetStr);
      }
    } catch (e) {
      alert('Ambiguity Error: ' + e.message);
    }
  }

  document.getElementById('m3a-preset-select')?.addEventListener('change', (e) => {
    const p = M3A_PRESETS[e.target.value];
    if (p) {
      document.getElementById('m3a-grammar-editor').value = p.grammar;
      document.getElementById('m3a-target-str').value = p.target;
      deriveCFG();
    }
  });

  document.getElementById('m3a-btn-derive')?.addEventListener('click', deriveCFG);
  document.getElementById('m3a-btn-check-ambig')?.addEventListener('click', checkAmbig);
  setTimeout(deriveCFG, 400);


  // -------------------------------------------------------------
  // MODULE 3B: CFG SIMPLIFICATION & CNF
  // -------------------------------------------------------------
  function runSimplification() {
    const text = document.getElementById('m3b-input-grammar').value;
    try {
      const grammar = CFGEngine.parseGrammar(text);
      const simp = CFGEngine.simplifyGrammar(grammar);
      const cnf = CFGEngine.convertToCNF(simp.simplifiedGrammar);

      const container = document.getElementById('m3b-stages-container');
      let html = '';
      simp.steps.forEach(st => {
        html += `
          <div style="background: #090e1a; padding: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color);">
            <h4 style="font-size: 0.88rem; color: var(--accent-cyan); margin-bottom: 0.4rem;">${st.step}</h4>
            <pre style="margin: 0; font-family: var(--font-mono); font-size: 0.82rem; color: #f8fafc;">${st.productions.join('\n')}</pre>
          </div>
        `;
      });
      container.innerHTML = html;

      // CNF Output
      const cnfOutput = document.getElementById('m3b-cnf-output');
      cnfOutput.innerHTML = cnf.productions.map(p => `<div><code>${p.raw}</code></div>`).join('');
    } catch (e) {
      alert('Simplification Error: ' + e.message);
    }
  }

  document.getElementById('m3b-btn-simplify')?.addEventListener('click', runSimplification);
  setTimeout(runSimplification, 500);


  // -------------------------------------------------------------
  // MODULE 3C: PDA SIMULATOR & ANIMATED STACK
  // -------------------------------------------------------------
  const stackRenderer = new StackRenderer('m3c-stack-display');
  let currentPDASim = null;
  let pdaTraceSteps = [];
  let pdaStepIdx = 0;
  let pdaPlayTimer = null;

  function initPDA(presetKey) {
    const preset = PDAEngine.Presets[presetKey] || PDAEngine.Presets.an_bn;
    currentPDASim = new PDAEngine.PDASimulator(preset);
    document.getElementById('m3c-input-string').value = preset.testStrings[1] || preset.testStrings[0];
    document.getElementById('m3c-description-text').textContent = preset.description;
    resetPDA();
  }

  function resetPDA() {
    if (pdaPlayTimer) {
      clearInterval(pdaPlayTimer);
      pdaPlayTimer = null;
    }
    const inputStr = document.getElementById('m3c-input-string').value.trim();
    const res = currentPDASim.trace(inputStr);
    pdaTraceSteps = res.steps;
    pdaStepIdx = 0;
    renderPDAStep(0);
  }

  function renderPDAStep(idx) {
    if (idx < 0 || idx >= pdaTraceSteps.length) return;
    const step = pdaTraceSteps[idx];

    // Render Stack
    stackRenderer.render(step.stack);
    document.getElementById('m3c-stack-height').textContent = `Height: ${step.stack.length}`;

    // Action text
    document.getElementById('m3c-current-action').textContent = step.action || '';

    // Status Badge
    const badge = document.getElementById('m3c-status-badge');
    badge.className = 'badge-status ' + (step.status === 'ACCEPTED' ? 'badge-accepted' : step.status === 'REJECTED' ? 'badge-rejected' : 'badge-running');
    badge.textContent = step.status;

    // Trace Table
    const tbody = document.querySelector('#m3c-trace-table tbody');
    let rowsHtml = '';
    pdaTraceSteps.forEach((s, sIdx) => {
      const isCur = sIdx === idx;
      rowsHtml += `
        <tr class="${isCur ? 'highlight-row' : ''}">
          <td>${s.step}</td>
          <td>${s.state}</td>
          <td>${s.charConsumed || 'ε'}</td>
          <td>${s.popped || 'ε'}</td>
          <td>${Array.isArray(s.pushed) ? s.pushed.join('') || 'ε' : s.pushed || 'ε'}</td>
          <td>${s.action}</td>
        </tr>
      `;
    });
    tbody.innerHTML = rowsHtml;
  }

  document.getElementById('m3c-preset-select')?.addEventListener('change', (e) => {
    initPDA(e.target.value);
  });

  document.getElementById('m3c-btn-step')?.addEventListener('click', () => {
    if (pdaStepIdx < pdaTraceSteps.length - 1) {
      pdaStepIdx++;
      renderPDAStep(pdaStepIdx);
    }
  });

  document.getElementById('m3c-btn-play')?.addEventListener('click', () => {
    if (pdaPlayTimer) return;
    pdaPlayTimer = setInterval(() => {
      if (pdaStepIdx < pdaTraceSteps.length - 1) {
        pdaStepIdx++;
        renderPDAStep(pdaStepIdx);
      } else {
        clearInterval(pdaPlayTimer);
        pdaPlayTimer = null;
      }
    }, 800);
  });

  document.getElementById('m3c-btn-reset')?.addEventListener('click', resetPDA);
  initPDA('an_bn');


  // -------------------------------------------------------------
  // PUMPING LEMMA LABORATORIES
  // -------------------------------------------------------------
  function updateRegPumping() {
    const p = parseInt(document.getElementById('pl-reg-p').value, 10) || 4;
    const yLen = parseInt(document.getElementById('pl-reg-y-len').value, 10) || 2;
    const i = parseInt(document.getElementById('pl-reg-i').value, 10);
    document.getElementById('pl-reg-i-val').textContent = `i = ${i} ${i === 0 ? '(Pumping Down)' : i > 1 ? '(Pumping Up)' : '(Original)'}`;

    const res = PumpingLemmaEngine.RegularCases.an_bn.pump(p, yLen, i);
    const box = document.getElementById('pl-reg-result');
    box.innerHTML = `
      <p><strong>Decomposition w = xyz:</strong> x="${res.x}", y="${res.y}", z="${res.z}"</p>
      <p><strong>Pumped string xyⁱz:</strong> <span style="color: ${res.inLanguage ? '#10b981' : '#f43f5e'}; font-weight: bold;">"${res.pumpedStr}"</span></p>
      <p><strong>Language Check:</strong> ${res.inLanguage ? 'IN L (Valid)' : 'NOT IN L (Violation!)'}</p>
      <p style="color: var(--text-muted); margin-top: 0.5rem;">${res.explanation}</p>
    `;
  }

  document.getElementById('pl-reg-p')?.addEventListener('input', updateRegPumping);
  document.getElementById('pl-reg-y-len')?.addEventListener('input', updateRegPumping);
  document.getElementById('pl-reg-i')?.addEventListener('input', updateRegPumping);
  updateRegPumping();

  function updateCFLPumping() {
    const p = parseInt(document.getElementById('pl-cfl-p').value, 10) || 3;
    const opt = document.getElementById('pl-cfl-opt').value;
    const i = parseInt(document.getElementById('pl-cfl-i').value, 10);
    document.getElementById('pl-cfl-i-val').textContent = `i = ${i} ${i === 0 ? '(Pumping Down)' : '(Pumping Up)'}`;

    const res = PumpingLemmaEngine.CFLCases.an_bn_cn.pump(p, opt, i);
    const box = document.getElementById('pl-cfl-result');
    box.innerHTML = `
      <p><strong>Decomposition w = uvxyz:</strong> u="${res.u}", v="${res.v}", x="${res.x}", y="${res.y}", z="${res.z}"</p>
      <p><strong>Pumped string uvⁱxyⁱz:</strong> <span style="color: ${res.inLanguage ? '#10b981' : '#f43f5e'}; font-weight: bold;">"${res.pumpedStr}"</span></p>
      <p><strong>CFL Check:</strong> ${res.inLanguage ? 'IN L' : 'NOT IN L (Violation!)'}</p>
      <p style="color: var(--text-muted); margin-top: 0.5rem;">${res.explanation}</p>
    `;
  }

  document.getElementById('pl-cfl-p')?.addEventListener('input', updateCFLPumping);
  document.getElementById('pl-cfl-opt')?.addEventListener('change', updateCFLPumping);
  document.getElementById('pl-cfl-i')?.addEventListener('input', updateCFLPumping);
  updateCFLPumping();


  // -------------------------------------------------------------
  // IN-BROWSER TEST SUITE RUNNER
  // -------------------------------------------------------------
  document.getElementById('btn-run-browser-tests')?.addEventListener('click', () => {
    const container = document.getElementById('browser-tests-container');
    let log = '';
    let pass = 0, fail = 0;

    function t(cond, name) {
      if (cond) {
        pass++;
        log += `<div style="color: #10b981; margin-bottom: 2px;">✔ PASS: ${name}</div>`;
      } else {
        fail++;
        log += `<div style="color: #f43f5e; margin-bottom: 2px;">✖ FAIL: ${name}</div>`;
      }
    }

    // Module 1 tests
    t(AutomataEngine.LanguageUtils.getPrefixes('abc').length === 4, 'Prefix generation');
    t(AutomataEngine.LanguageUtils.reverseString('flat') === 'talf', 'String reversal');
    t(RegexEngine.formatRegex('ab') === 'a.b', 'Regex concatenation insertion');
    t(RegexEngine.infixToPostfix('(a|b)*abb') === 'ab|*a.b.b.', 'Regex postfix conversion');

    // Module 2 tests
    const n = RegexEngine.regexToNFA('(a|b)*abb');
    t(n.states.length > 0, 'Thompson NFA construction');
    const nQ = RegexEngine.regexToNFA('a?b');
    const simQ = new AutomataEngine.NFASimulator(nQ);
    t(simQ.trace('b').accepted && simQ.trace('ab').accepted && !simQ.trace('aab').accepted, 'Thompson ? operator (a?b)');
    const nE = RegexEngine.regexToNFA('c(a|e)t');
    const simE = new AutomataEngine.NFASimulator(nE);
    t(simE.trace('cet').accepted && !simE.trace('ct').accepted, 'Literal character e preservation in regex & NFA');
    const d = AutomataEngine.nfaToDFA(n);
    t(d.states.length > 0, 'Subset construction (NFA to DFA)');
    const simD = new AutomataEngine.DFASimulator(d);
    t(simD.trace('abb').accepted === true, 'DFA simulation accepts "abb"');
    t(simD.trace('ab').accepted === false, 'DFA simulation rejects "ab"');

    // Partial DFA minimization
    const dfaAB = AutomataEngine.nfaToDFA(RegexEngine.regexToNFA('ab'));
    const minAB = MinimizerEngine.minimizeDFA(dfaAB);
    const simMinAB = new AutomataEngine.DFASimulator(minAB.minimalDFA);
    t(simMinAB.trace('ab').accepted && !simMinAB.trace('b').accepted && minAB.trapStateAdded, 'Partial DFA minimization completes sink trap state');

    // Module 3 tests
    const g = CFGEngine.parseGrammar('S -> a S b | ε');
    t(CFGEngine.deriveString(g, 'aabb').success === true, 'CFG derivation for "aabb"');
    t(CFGEngine.deriveString(g, 'aab').success === false, 'CFG rejection for "aab"');
    const gMinus = CFGEngine.parseGrammar('E -> E - E | id');
    const simpM = CFGEngine.simplifyGrammar(gMinus);
    const cnfM = CFGEngine.convertToCNF(simpM.simplifiedGrammar);
    t(cnfM.productions.every(p => (p.rhs.length === 1 && (p.rhs[0] === 'id' || p.rhs[0] === '-')) || (p.rhs.length === 2 && /^[A-Z]/.test(p.rhs[0]) && /^[A-Z]/.test(p.rhs[1]))), 'CNF handles non-alphanumeric operators ("-")');

    // PDA tests
    const pSim = new PDAEngine.PDASimulator(PDAEngine.Presets.an_bn);
    t(pSim.trace('aabb').accepted === true, 'PDA accepts "aabb" for a^n b^n');
    t(pSim.trace('aab').accepted === false, 'PDA rejects "aab" for a^n b^n');

    // Pumping Lemma tests
    const pReg0 = PumpingLemmaEngine.RegularCases.an_bn.pump(0, 1, 2);
    t(pReg0.pumpedStr.length > 0 && !pReg0.inLanguage, 'Pumping Lemma boundary p=0 protection');

    log = `<div style="padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 4px; font-weight: bold;">Executed In-Browser Tests: ${pass + fail} | Passed: ${pass} | Failed: ${fail}</div>` + log;
    container.innerHTML = log;
  });

});
