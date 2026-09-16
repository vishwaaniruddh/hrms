import os
import re

def check_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    issues = []

    # Check for icon-only buttons missing aria-label
    # A button with just an icon (em, i, svg) and no text, and no aria-label
    # simplistic regex: <button[^>]*>[\s\n]*<em[^>]*>.*?</em>[\s\n]*</button>

    # Check inputs missing aria-label or id (if no label)
    # Check links missing aria-label if icon-only

    # Let's use simple string finding for specific bad patterns

    lines = content.split('\n')
    for i, line in enumerate(lines):
        # find buttons with btn-icon but no aria-label
        if 'btn-icon' in line and '<a ' in line and 'aria-label' not in line:
            issues.append(f"Line {i+1}: Link with btn-icon missing aria-label: {line.strip()}")
        elif 'btn-icon' in line and '<button ' in line and 'aria-label' not in line:
            issues.append(f"Line {i+1}: Button with btn-icon missing aria-label: {line.strip()}")

    return issues

for root, _, files in os.walk('src/components/hrms'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            issues = check_file(filepath)
            if issues:
                print(f"--- {filepath} ---")
                for issue in issues:
                    print(issue)
