# Test Strategy
- Unit: AI tool + schema validators (Zod) with golden JSON.
- Integration: intake → brief → plan → tasks E2E.
- UI: Playwright flows (Studio intake, Project Board drag/drop).
- Perf: LCP < 2.5s; queries ≤ 3 per view (batched).
