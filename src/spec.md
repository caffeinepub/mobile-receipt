# Specification

## Summary
**Goal:** Keep the application name consistently displayed as exactly “Mobile Receipt” across all pages and layouts.

**Planned changes:**
- Add a single exported frontend constant for the app name set to exactly “Mobile Receipt”.
- Replace any hard-coded app-name strings in page headings, navigation brand text, footer text, logo alt text, and document/tab title with the centralized constant.
- Ensure the HTML document title remains “Mobile Receipt” after navigating between routes.

**User-visible outcome:** The app name appears as “Mobile Receipt” everywhere it is shown (UI brand text and browser tab title), consistently across all pages.
