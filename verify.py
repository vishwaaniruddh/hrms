import re

with open('/app/src/components/hrms/Member.jsx', 'r') as f:
    content = f.read()

# Assert aria-label search-toggle is added
assert 'aria-label="Toggle search"' in content
assert 'aria-label="Settings"' in content
assert 'aria-label="More options"' in content
assert 'aria-label="Member options"' in content
assert 'aria-label="Submit search"' in content
assert 'aria-label="Close search"' in content

print("Fallback verification complete.")
