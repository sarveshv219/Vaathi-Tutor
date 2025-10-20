"""
=================================================================
COMPREHENSIVE FIX FOR ASK TAB - CITATIONS & IMAGE CAPTIONS
=================================================================

PROBLEM 1: Citations showing even when NOT used in answer
----------------------------------------------------------
OLD BEHAVIOR:
  - Vector search found relevant slides
  - Showed citations for ALL retrieved slides
  - Result: "Figure 2 not mentioned" but "Jump to Slide 2" still shown

FIX: Parse LLM's actual [Slide X] references
  File: backend/routers/qa.py
  - Extract citations from LLM answer using regex: \[Slide\s+(\d+)\]
  - Only show slides that LLM actually cited
  - Validate slide numbers are in valid range [1, total_pages]
  
RESULT: ✓ Only shows slides actually used in the answer


PROBLEM 2: Images/Figures not being described
----------------------------------------------
OLD BEHAVIOR:
  - BLIP captions too generic (max 30 tokens)
  - CAPTIONS section buried in context
  - LLM not paying attention to image descriptions

MULTI-PART FIX:

1. Improved Caption Generation (ai_core/caption.py):
   - Increased from 30 → 50 max tokens
   - Added conditional captioning with "chart or diagram" prompt
   - Uses longer, more descriptive caption
   - Prefixes with "Figure: " for clarity
   - Added error logging

2. Better Context Format (ai_core/cleaning.py):
   OLD: RAW:\n{text}\n\nOCR:\n{ocr}\n\nCAPTIONS:\n{caps}
   NEW: TEXT:\n{text}\n\nFIGURES/IMAGES:\n- {caption1}\n- {caption2}
   
   Changes:
   - Renamed CAPTIONS → FIGURES/IMAGES (more descriptive)
   - Added bullet points for each figure
   - Moved figures section BEFORE OCR (more prominent)
   - Only include OCR if different from raw text

3. Enhanced Prompt (ai_core/prompts.py):
   - Explicit instruction: "Pay special attention to FIGURES/IMAGES sections"
   - Tells LLM these describe "charts, diagrams, and figures"
   - Emphasizes: "Only cite slides that you actually used"
   - Tells LLM to reference specific figure details

RESULT: ✓ Better figure descriptions + LLM uses them in answers


HOW IT WORKS NOW:
=================

PDF Upload Flow:
1. PyMuPDF extracts images from each page
2. BLIP generates 2 captions per image:
   a) Unconditional: "a graph showing..."
   b) Conditional: "a chart or diagram showing..."
3. Longer caption selected and prefixed: "Figure: ..."
4. Context formatted as:
   TEXT:
   {slide text}
   
   FIGURES/IMAGES:
   - Figure: a bar chart showing training accuracy over epochs
   - Figure: a line graph depicting mode collapse patterns
   
   OCR:
   {only if needed and different}

Question Answering Flow:
1. Vector search finds relevant slides
2. Contexts (with FIGURES/IMAGES) sent to LLM
3. LLM generates answer using knowledge + slide context
4. Backend parses [Slide X] references from answer
5. Only those cited slides shown to user

TESTING:
========
1. Re-upload your PDF (will re-extract with better captions)
2. Ask: "what does figure 2 in this slide represent"
3. Expected:
   ✓ Specific answer based on actual figure caption
   ✓ Citation only if LLM used that slide's info
   ✓ No citation if LLM says "not mentioned"
   ✓ Better figure descriptions from improved BLIP

IMPORTANT: Must re-upload PDF for new caption extraction!
"""

print(__doc__)
