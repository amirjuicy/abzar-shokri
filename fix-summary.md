# Layout Shift Fix Summary

## Problem
After clicking "افزودن به سبد خرید" (Add to cart), the minus/quantity/plus controls shifted slightly to the right instead of staying exactly where the original button was.

## Root Cause
A 20px width mismatch between the two cart control states:

- **Add to cart state** (`.dk-buybox__add-btn`): `max-width: 240px`
- **In cart state** (`.qty-selector--buybox`): `max-width: 220px`

In the RTL flex layout, when the 240px button was replaced by the 220px quantity selector, the space redistribution caused a rightward shift.

## Fix
Modified `abzar-shokri/assets/css/pages.css` line 1019:

```css
.qty-selector--buybox { width: 100%; max-width: 240px; }  /* changed from 220px */
```

Both states now have `max-width: 240px`, ensuring consistent positioning.

## Files Modified
- `abzar-shokri/assets/css/pages.css` - 1 line changed

## Verification
- Before/after max-width values are now identical (240px)
- No arbitrary offsets or transforms used
- RTL flex properties preserved
- Responsive layouts maintained
- Mobile buy bar (separate section) already uses `width: 100%` for both states, so no change needed there