import os

def verify_changes():
    app_jsx_path = "/app/src/App.jsx"

    with open(app_jsx_path, 'r') as f:
        content = f.read()

    assert "import React, { Suspense, lazy } from 'react';" in content, "Missing Suspense and lazy imports"
    assert "const Member = lazy(() => import('./components/hrms/Member.jsx'));" in content, "Missing lazy import for Member"
    assert "const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));" in content, "Missing lazy import for MemberProfile"
    assert "const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));" in content, "Missing lazy import for Attendence"
    assert "const Salary = lazy(() => import('./components/hrms/Salary.jsx'));" in content, "Missing lazy import for Salary"
    assert "<Suspense fallback={<div>Loading...</div>}>" in content, "Missing Suspense wrapper"

    print("All frontend verification assertions passed!")

if __name__ == "__main__":
    verify_changes()
