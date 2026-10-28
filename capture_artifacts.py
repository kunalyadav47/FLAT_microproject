"""
Automated Artifact Capture & PDF Compiler for FLAT Microproject
Uses Headless Chromium to generate authentic high-resolution screenshots
and render the official academic PDF report.
"""

import subprocess
import os
import time

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PROJECT_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\flat-automata-visualizer"
SCREENSHOTS_DIR = os.path.join(PROJECT_DIR, "screenshots")
DOCS_DIR = os.path.join(PROJECT_DIR, "docs")

INDEX_HTML = os.path.join(PROJECT_DIR, "index.html")
REPORT_HTML = os.path.join(DOCS_DIR, "FLAT_Project_Report.html")
REPORT_PDF = os.path.join(DOCS_DIR, "FLAT_Project_Report.pdf")

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

print(">>> [1/2] Generating PDF Project Report...")
pdf_cmd = [
    CHROME_PATH,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={REPORT_PDF}",
    f"file:///{REPORT_HTML.replace('\\', '/')}"
]
res_pdf = subprocess.run(pdf_cmd, capture_output=True, text=True)
if os.path.exists(REPORT_PDF):
    print(f"  [OK] PDF generated: {REPORT_PDF} ({os.path.getsize(REPORT_PDF)} bytes)")
else:
    print(f"  [FAIL] Failed to generate PDF: {res_pdf.stderr}")

print("\n>>> [2/2] Capturing High-Resolution Application Screenshots...")

TABS = [
    ("flat_overview_syllabus.png", "tab-overview"),
    ("flat_module1_alphabets_regex.png", "tab-module1"),
    ("flat_module2a_automata_tracer.png", "tab-module2a"),
    ("flat_module2b_regex_nfa_dfa.png", "tab-module2b"),
    ("flat_module2c_dfa_minimization.png", "tab-module2c"),
    ("flat_module3a_cfg_derivation_trees.png", "tab-module3a"),
    ("flat_module3b_cfg_simplification_cnf.png", "tab-module3b"),
    ("flat_module3c_pda_stack_simulator.png", "tab-module3c"),
    ("flat_pumping_lemma_laboratory.png", "tab-pumping"),
    ("flat_test_suite_report.png", "tab-tests"),
]

for filename, tab_id in TABS:
    out_path = os.path.join(SCREENSHOTS_DIR, filename)
    target_url = f"file:///{INDEX_HTML.replace('\\', '/')}#{tab_id}"
    shot_cmd = [
        CHROME_PATH,
        "--headless",
        "--disable-gpu",
        "--window-size=1560,980",
        "--virtual-time-budget=1500",
        f"--screenshot={out_path}",
        target_url
    ]
    subprocess.run(shot_cmd, capture_output=True, text=True)
    if os.path.exists(out_path):
        print(f"  [OK] Captured: {filename} ({os.path.getsize(out_path)} bytes)")
    else:
        print(f"  [FAIL] Failed to capture: {filename}")

print("\nAll artifact captures completed successfully!")
