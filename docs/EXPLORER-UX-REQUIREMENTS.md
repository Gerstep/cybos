# Context Explorer - UX Requirements

> **Purpose**: Detailed UX specification for implementing the Explorer page
> **Design Reference**: Must match existing Brief page design system exactly

---

## 1. Page Structure

### 1.1 URL and Navigation

The Explorer is accessed via URL query parameter: `http://localhost:3847/?page=explorer`

The default page remains Brief. When no `page` parameter is present, show Brief.

A navigation toggle appears in the header area, allowing users to switch between Brief and Explorer without leaving the application. The toggle should be visible on both pages.

### 1.2 Page Header

The Explorer page header contains:

1. **Page indicator badge**: Similar to Brief's "Live Briefing" badge, but says "Context Explorer" with a different accent (suggest purple or blue instead of emerald to differentiate)

2. **Filter dropdown**: A dropdown selector on the right side of the header that filters all content on the page. Options are:
   - All items (default)
   - Promises only
   - Action items only
   - Decisions only
   - Metrics only

3. **Time range indicator**: A small badge showing "Last 14 days" to communicate the data scope

4. **Navigation toggle**: Pill-shaped toggle with two options: "Brief" and "Explorer". The active option has white background with shadow, inactive is gray text.

### 1.3 Page Title

The main title should follow the Brief pattern with a serif font. Suggest: "Context Explorer" or simply "Explorer" with the current date range shown below in gray.

---

## 2. Dashboard Panels

The page consists of four main panels displayed vertically. Each panel has a section header following the Brief design pattern.

### 2.1 Panel Order

1. Active Deals (first, most prominent)
2. Recent People
3. My Commitments
4. Metrics Overview

### 2.2 Section Headers

Each panel has a header with:
- Icon (optional, small, gray)
- Title in uppercase, small, bold, wide letter-spacing, gray
- Count badge showing number of items in that section
- Horizontal line extending to the right edge

---

## 3. Active Deals Panel

### 3.1 Purpose

Shows deals with recent activity in the last 14 days. Deals are auto-detected from extracted items (deal mentions, metrics, decisions) and fuzzy-grouped to combine spelling variants.

### 3.2 Deal Card - Collapsed State

Each deal appears as a card containing:

**Row 1 (header row):**
- Deal name (bold, prominent)
- Last activity date on the right side (small, gray, formatted as "Jan 13")

**Row 2 (summary row):**
- Count of metrics (e.g., "3 metrics")
- Count of mentions (e.g., "2 mentions")
- Count of decisions (e.g., "1 decision")
- These are separated by bullet points or pipes

**Row 3 (preview row):**
- The most recent metric or key piece of information as a one-line preview
- Truncated if too long, with ellipsis

**Visual treatment:**
- Cards have subtle border (gray-100)
- On hover: border darkens, subtle shadow appears
- Cursor indicates clickability
- If deal has a folder in `/deals/`, show a small indicator (optional)

### 3.3 Deal Card - Expanded State

When user clicks a deal card, it expands inline (not a modal, not a separate page). The expansion is animated smoothly.

The expanded content shows:

**Metrics section:**
- Subheader: "Metrics" with count
- List of all metric items using the standard Item Card format (see Section 6)

**Mentions section:**
- Subheader: "Mentions" with count
- List of all deal_mention items showing who mentioned this deal and when

**Decisions section:**
- Subheader: "Decisions" with count
- List of all decision items related to this deal

**Introduction attribution (if known):**
- At the bottom: "Introduced by: Name" if the system knows who introduced the deal

**Collapse behavior:**
- Clicking the card header again collapses it
- Only one deal can be expanded at a time, OR multiple can be expanded (your choice - multiple is more flexible)

### 3.4 Fuzzy Grouping Display

When a deal has multiple spelling variants (e.g., "Naptha" and "Naphta"), the card should:
- Show the most common or most recent variant as the primary name
- Optionally show "Also known as: Naphta" in small gray text

---

## 4. Recent People Panel

### 4.1 Purpose

Shows people (entities of type "person") who have been involved in recent interactions, sorted by last activity date. This panel helps with relationship management and pre-call preparation.

### 4.2 Entity Card - Collapsed State

Each person appears as a card containing:

**Row 1 (header row):**
- Person's name (bold)
- Interaction count on the right (e.g., "4 interactions")

**Row 2 (contact info row):**
- Email address if known
- Telegram handle if known (prefixed with @)
- Separated by bullet points

**Row 3 (summary row):**
- Count of open items (promises + action items involving this person)
- Last interaction type and date (e.g., "call Jan 13")

**Visual indicators:**
- If person is a "candidate" (unverified entity), show a subtle indicator
- Same hover treatment as deal cards

### 4.3 Entity Card - Expanded State

When clicked, the card expands to show all items related to this person, organized into sections:

**Section: "I promised them"**
- Items of type "promise" where I (the user) am the owner and this person is the target
- These are commitments I made TO this person
- Shows each item using standard Item Card format

**Section: "They promised me"**
- Items of type "promise" where this person is the owner and I am the target
- These are commitments this person made TO me
- Important for tracking what I'm waiting on

**Section: "Action items"**
- Items of type "action_item" where this person is owner OR target
- Tasks involving this person

**Section: "Decisions"**
- Items of type "decision" where this person was a participant
- Decisions made together

**Section: "Metrics they mentioned"**
- Items of type "metric" from interactions with this person
- Useful for remembering what numbers they shared

Each section only appears if it has items. Empty sections are hidden.

---

## 5. My Commitments Panel

### 5.1 Purpose

A focused view of all pending promises and action items where I (the user) am the owner. These are things I need to DO. This panel does NOT include items where I am the target (those appear under "They promised me" in the People panel).

### 5.2 Display

This panel shows a flat list of Item Cards (see Section 6) without grouping. Items are sorted by date, most recent first.

Each item shows:
- Type badge (PROMISE or ACTION)
- Content
- Target person if applicable
- Provenance quote
- Source information

### 5.3 Filtering

When the global filter is set to "Promises only" or "Action items only", this panel filters accordingly. Other filter options (Decisions, Metrics) hide this panel entirely since it only contains promises and action items.

---

## 6. Metrics Overview Panel

### 6.1 Purpose

Shows all extracted metrics from the last 14 days, grouped by company. Useful for quickly reviewing business numbers and traction data.

### 6.2 Display

Metrics are grouped under company headers. Each company is a collapsible section.

**Company header:**
- Company name (bold)
- Count of metrics
- Clickable to expand/collapse

**Metrics under each company:**
- List of Item Cards in compact mode
- Shows the metric content, source quote, and source info

### 6.3 Ungrouped Metrics

Some metrics may not have a clear company association. These appear under an "Other" or "Ungrouped" section at the bottom.

---

## 7. Item Card Component

### 7.1 Purpose

The Item Card is the fundamental unit for displaying any extracted item. It's used throughout the Explorer in all panels.

### 7.2 Standard Layout

**Line 1 (type and content):**
- Type badge on the left (see 7.3 for badge styles)
- Content text (the main extracted information)
- Trust level badge on the right (see 7.4 for badge styles)

**Line 2 (ownership - optional):**
- "Owner: [Name]" if there's an owner
- Arrow indicator "→"
- "Target: [Name]" if there's a target
- This line is hidden if context makes it redundant (e.g., when viewing within an entity's expanded card)

**Line 3 (provenance quote):**
- The source quote in italics, gray, with quotation marks
- This is the exact text from the transcript/message that supports this item
- If quote is very long, truncate with ellipsis (show full on hover or click)

**Line 4 (source attribution):**
- Icon indicating source type (phone for call, mail for email, message for telegram)
- Source type text ("call", "email", "telegram")
- Bullet separator
- Date (formatted as "Jan 12")
- Bullet separator
- Interaction identifier or summary

### 7.3 Type Badges

Each item type has a distinct badge style:

- **ACTION**: Rose/red background (bg-rose-50), rose text, rose border. Represents tasks that need doing.
- **PROMISE**: Blue background (bg-blue-50), blue text, blue border. Represents commitments made.
- **DECISION**: Purple background (bg-purple-50), purple text, purple border. Represents conclusions reached.
- **METRIC**: Emerald/green background (bg-emerald-50), emerald text, emerald border. Represents business numbers.
- **QUESTION**: Amber/yellow background (bg-amber-50), amber text, amber border. Represents open questions.

Badge text is uppercase, very small font size, bold, with letter-spacing.

### 7.4 Trust Level Badges

Trust level indicates confidence in the extraction:

- **high**: Green text, subtle green background. Shown as "{high}" or just a green dot.
- **medium**: Gray text, no background or very subtle gray. Shown as "{medium}" or just a gray dot.
- **low**: Orange text, subtle orange background. Shown as "{low}" or just an orange dot.

### 7.5 Compact Mode

When space is limited (e.g., in Metrics panel), the Item Card can render in compact mode:
- Omit ownership line
- Truncate quote to one line
- Smaller overall padding

---

## 8. Interactions and Behavior

### 8.1 Expand/Collapse

- Clicking a deal or entity card toggles its expanded state
- Expansion is animated with a smooth height transition (suggest 200-300ms duration)
- Multiple items can be expanded simultaneously
- Expanded state is not persisted across page loads

### 8.2 Filter Behavior

When the filter dropdown changes:
- All panels immediately filter their content
- Panels with no matching items collapse to show "No items match filter"
- The filter applies to item types, not to deals/entities

For example, if filter is "Metrics only":
- Active Deals panel shows only deals that have metrics, and only displays their metrics
- Recent People panel shows only people with metrics, and only displays their metrics
- My Commitments panel is hidden (no metrics there)
- Metrics Overview panel shows normally

### 8.3 Empty States

Each panel should have an empty state message when no data is available:
- "No active deals in the last 14 days"
- "No recent interactions found"
- "No pending commitments"
- "No metrics recorded"

### 8.4 Loading State

When data is loading, show a centered spinner with "Loading explorer..." text, matching the Brief loading state.

### 8.5 Error State

If the API fails, show an error message with a retry button, matching the Brief error pattern.

---

## 9. Visual Design Requirements

### 9.1 Design System Consistency

The Explorer must use the exact same design tokens as the Brief page:

- **Font families**: Same serif for headings, same sans-serif for body
- **Colors**: Same gray scale, same accent colors (emerald for success, rose for urgent, etc.)
- **Spacing**: Same padding and margin scales
- **Border radius**: Same rounded corners (rounded-2xl for cards, rounded-lg for badges)
- **Shadows**: Same shadow scales for hover states
- **Transitions**: Same transition timing and easing

### 9.2 Differentiation from Brief

While using the same design system, Explorer should feel slightly different:

- Consider using a different accent color for the page indicator badge (purple instead of emerald)
- The layout is more card-heavy and expandable, whereas Brief is more linear
- Explorer is denser with information since it's for exploration, not daily briefing

### 9.3 Responsive Behavior

- On mobile, cards should stack vertically and take full width
- Expanded content should not overflow the viewport
- Filter dropdown should be accessible on mobile (consider full-width on small screens)

---

## 10. Data Requirements

### 10.1 Time Range

All data is scoped to the last 14 days. This is fixed for v1 (no user control).

### 10.2 Limits

- Maximum 20 deals displayed
- Maximum 50 entities displayed
- Maximum 100 items in My Commitments
- Items within expanded cards are unlimited (show all)

### 10.3 Sorting

- Deals: sorted by last activity date, most recent first
- Entities: sorted by last activity date, most recent first
- Items within panels: sorted by date, most recent first
- Metrics within company groups: sorted by date, most recent first

### 10.4 Required Fields

Every Item Card must display:
- Type (required)
- Content (required)
- Source quote (required - this is critical for trust)
- Source type and date (required)

Optional fields that display when available:
- Owner name
- Target name
- Trust level

---

## 11. Accessibility

### 11.1 Keyboard Navigation

- Tab should navigate between cards
- Enter/Space should expand/collapse cards
- Filter dropdown should be keyboard accessible

### 11.2 Screen Reader Support

- Cards should have appropriate ARIA labels
- Expanded/collapsed state should be announced
- Badge meanings should be conveyed (not just color)

---

## 12. Performance

### 12.1 Loading Strategy

- Single API call loads all data upfront
- No lazy loading for v1 (data is bounded by 14-day window)
- Expansion/collapse is purely client-side, no additional API calls

### 12.2 Rendering

- Use React's built-in optimization (avoid unnecessary re-renders)
- Consider virtualization if entity list becomes very long (future enhancement)
