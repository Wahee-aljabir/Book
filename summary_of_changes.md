# Summary of Changes

This document summarizes the key changes and improvements made to the project during our recent collaboration.

## Font Size Standardization and Mobile Layout Improvements (January 2025)

**Font Size Standardization:**
- Standardized all text elements to use 16pt font size for improved readability across all devices
- Updated `.story-text` font size from `1.2rem` to `16pt` for desktop and mobile portrait views
- Updated `.mobile-text-page .story-text` font size from `18pt` to `16pt` for mobile landscape views
- Adjusted line-height values for optimal text spacing (1.5 for general text, 1.55 for mobile landscape)

**Mobile Landscape Layout Fixes:**
- Resolved conflicting media queries that were overriding the intended mobile landscape layout
- Removed duplicate landscape media query that was causing single-column layout instead of two-column
- Ensured proper two-column layout in mobile landscape mode (50% image, 50% text)
- Optimized mobile landscape text display with improved max-width (90%) and max-height (85%)
- Fixed CSS caching issues by restarting development server to ensure changes are visible

**Technical Details:**
- Removed conflicting `@media (orientation: landscape) and (max-width: 1024px)` media query
- Maintained the correct `@media (orientation: landscape) and (max-width: 768px)` media query for proper mobile landscape behavior
- Ensured images continue to use `object-fit: contain` to prevent cropping in landscape view

## Mobile Landscape Layout Fix

Initially, the book's mobile landscape view in Chrome displayed image and text pages side-by-side, each occupying 50% of the viewport width. This was contrary to the desired behavior of having each page (image or text) occupy the full viewport width individually.

**Changes Implemented:**
- Modified `book.css` to set `.mobile-image-page` and `.mobile-text-page` to `100vw` width and `100vh` height, ensuring they display as separate, full-width pages.
- Adjusted positioning, padding, and overflow properties for these elements to prevent content clipping and ensure proper display.

**Further Adjustments for Split View:**
- Reverted the mobile landscape layout to a split view, where both `.mobile-image-page` and `.mobile-text-page` occupy `50vw` width each.
- Ensured images use `object-fit: contain` to prevent cropping within their `50vw` container.
- Configured text pages to allow vertical scrolling if content exceeds the `100vh` height and to keep content centered.
- Verified that PageFlip remains in two-page landscape mode for this split view.

## Changelog Generation and Version Update

Implemented a robust system for generating a project changelog and managing the project version.

**Changes Implemented:**
- Updated `package.json` to increment the project version from `1.0.0` to `1.1.0`.
- Added new npm scripts:
    - `changelog`: Generates `CHANGELOG.md` from Git commit history.
    - `changelog:pdf`: (Deprecated) Attempted to use `md-to-pdf` for PDF conversion.
    - `changelog:pdf:puppeteer`: Uses a custom Node.js script with Puppeteer for reliable PDF conversion.
- Created `scripts/generate-changelog.js`:
    - Reads Git commit history.
    - Groups commits by date.
    - Creates links to GitHub commits for easy reference.
    - Generates `CHANGELOG.md` in the project root.
- Created `scripts/changelog-to-pdf.js`:
    - Utilizes Puppeteer to convert the generated `CHANGELOG.md` into a styled `CHANGELOG.pdf`.

**Outcome:**
- `CHANGELOG.md` and `CHANGELOG.pdf` are now generated and available in the project root, providing a clear and up-to-date record of project changes.
- The project version is now `1.1.0`.

## Next Steps

- Further visual polish for the mobile landscape split view, if needed.
- Consideration of a Conventional Commits-style changelog for more structured release notes.