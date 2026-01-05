# Debug Hypotheses: Horizontal lines appearing on time gutter (hour labels)

## Problem
Horizontal border lines are appearing on the time gutter (hour labels section) when they should only appear in the time-content area.

## Hypotheses

### Hypothesis A: CSS Specificity Issue
**Theory**: The selector `.rbc-time-view .rbc-timeslot-group` (line 310) has higher specificity than `.rbc-time-view .rbc-time-content .rbc-timeslot-group` (line 309), causing borders to appear on all timeslot-groups including gutter.

**Evidence needed**: Check if the general selector is overriding the specific one.

### Hypothesis B: Order of CSS Rules
**Theory**: The general selector `.rbc-time-view .rbc-timeslot-group` appears AFTER the specific one in the CSS file, overriding it despite specificity.

**Evidence needed**: Verify CSS rule order and cascade.

### Hypothesis C: Missing Specificity
**Theory**: The `!important` flag on the general selector (line 310-311) overrides the specific selector even though it has more classes.

**Evidence needed**: Check if both rules have `!important` and which takes precedence.

### Hypothesis D: Browser DevTools Inspection
**Theory**: Need to inspect the actual rendered HTML structure to see which CSS rules are being applied.

**Evidence needed**: User should inspect the element in browser DevTools.

### Hypothesis E: Other CSS File Override
**Theory**: Another CSS file (like `my-calendar-styles.css`) might be overriding these rules with conflicting selectors.

**Evidence needed**: Check all CSS files for conflicting rules.
