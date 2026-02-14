# Specification

## Summary
**Goal:** Let users enter a bill line item description either by selecting an existing catalogue (Item Master) item or by manually typing a custom description when the item is not in the database.

**Planned changes:**
- Update the Create Bill line-item UI to provide a clear choice between “select from catalogue” and “manual description” entry per line item.
- Preserve existing behavior when a catalogue item is selected (auto-fill base price and GST from Item Master).
- Support free-text descriptions when manual entry is chosen, without requiring an Item Master match.
- Ensure switching between catalogue selection and manual entry updates the stored `description` correctly and keeps total calculations working.
- Ensure Bill Preview, saved bill data, and generated PDF include the manually entered description exactly as entered via existing draft/save flows.

**User-visible outcome:** On the Create Bill page, users can add items by selecting from the catalogue or by typing a custom description, and the entered/selected description appears correctly in preview and the generated PDF.
