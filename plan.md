1. **Analyze performance in `src/components/hrms/HelpdeskManagement.jsx`**
   - The file recalculates `tickets.filter(t => t.user_id === currentUser?.id).length` and `tickets.filter(t => t.category_code === 'GRIEVANCE' || t.is_confidential).length` inline in the JSX during every render.
   - For a large number of tickets, this O(n) array traversal creates a performance bottleneck during React render cycles.

2. **Implement Optimization in `src/components/hrms/HelpdeskManagement.jsx`**
   - Create a bash script that will insert the following memoized variables right before the `filteredTickets` definition:
   ```javascript
  // ⚡ Bolt Performance Optimization: Memoize tab counts to prevent O(N) array traversals on every render
  const myTicketsCount = useMemo(() => {
    return tickets.filter(t => t.user_id === currentUser?.id).length;
  }, [tickets, currentUser?.id]);

  const grievanceTicketsCount = useMemo(() => {
    return tickets.filter(t => t.category_code === 'GRIEVANCE' || t.is_confidential).length;
  }, [tickets]);
   ```
   - The bash script will also replace the inline `.filter(...).length` calls in the JSX with `myTicketsCount` and `grievanceTicketsCount`.

3. **Verify the modification**
   - Run `grep -n "myTicketsCount" src/components/hrms/HelpdeskManagement.jsx` and `grep -n "grievanceTicketsCount" src/components/hrms/HelpdeskManagement.jsx` to ensure changes are successfully applied.

4. **Verify environment**
   - Ensure `pnpm i` has been run.

5. **Run pnpm build**
   - Execute `pnpm build` to verify that the app still builds successfully.

6. **Run pnpm test**
   - Execute `pnpm test` (even if it naturally fails in this env, run it to fulfill requirements).

7. **Run pnpm lint**
   - Execute `pnpm lint` to ensure no new syntax errors were introduced.

8. **Request code review**
   - Call `request_code_review` to check the changes.

9. **Complete pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

10. **Submit PR**
    - Call the submit tool with title `⚡ Bolt: [performance improvement]`
