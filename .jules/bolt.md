## 2024-05-14 - Repeated API calls in `Member.jsx` and other HRMS components

**Learning:** `Member.jsx` fetches `getStats` after `fetchMembers`, on mount, and after various operations. If the user quickly types into the search box, the debounced fetch happens, which itself updates members, but `fetchStats` shouldn't necessarily be tied to it except `fetchStats` is called after CRUD ops. However, `useEffect` dependencies trigger both when they only need one.

Wait, looking at `Member.jsx`:
```javascript
  useEffect(() => {
    fetchMembers();
    fetchStats();
  }, [fetchMembers]);
```
`fetchMembers` is a `useCallback` that depends on `[page, search, filterDesignation, statusTab]`.
So every time the user types in the search bar, changes page, filter, or status, `fetchMembers` is updated.
This causes the `useEffect` to re-run, fetching members AND fetching stats.
But `fetchStats` does NOT need to be re-fetched on page change, search, or filter changes, because the total overall stats (Total Headcount, Active, Inactive, System Roles) are unaffected by the table's filter/pagination. Fetching stats on every search keypress or pagination change is a waste of a network request and can slow down the UI and back-end.

**Action:** Separate the fetching of stats from the fetching of members in the `useEffect`. `fetchStats` should only run on mount and after CRUD operations (which already manually call it). The `useEffect` for `fetchMembers` should only call `fetchMembers`.
