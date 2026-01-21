# Image Generation Workflow

## Pipeline Overview

```
Request → Infer Style → [INFO: Concept Engineering] → Build Prompt → Generate → Critique → [Regenerate?] → Save
```

## Step 1: Infer Style

From request keywords:
- `info, diagram, process, flow, comparison, steps` → **Info style**
- `transformation, sacred, dissolution, empire, monument` → **Mural style**
- `future, corporate, liminal, atmospheric, contemplative` → **Cyberpunk style**

Override with explicit style: "mural style image of..."

## Step 2: Concept Engineering (Info Style Only)

**For info style, load and follow `context/img-styles/info-concept-guide.md`**

This step is CRITICAL for info style. Skip for artistic styles (mural, cyberpunk).

### 2a. Identify concept type
Comparison | Transformation | Scale | Process | Hierarchy | Spectrum

### 2b. Extract core insight
Ask: "What's the ONE thing someone should understand?"
The insight is the visual difference, not labels.

### 2c. Find visual mechanism
What property carries meaning? (density, shape, size, position, etc.)

### 2d. Write concept brief
```
INSIGHT: [one sentence]
TYPE: [concept type]
VISUAL MECHANISM: [what property shows it]
LEFT/BEFORE: [description]
RIGHT/AFTER: [description]
FOCAL POINT: [what glows]
ELEMENT COUNT: [2-4 target]
```

### 2e. Self-critique concept
- Can I remove an element? → Remove it
- Is this SHOWING or LABELING? → Shapes > text
- Am I being literal? → Avoid letter M for M-shaped, etc.
- Would a 5-year-old see the difference? → Contrast must be obvious

If concept is weak → refine before generating.

## Step 3: Load Style Definition

From `context/img-styles/`:
- `_shared.md` - common rules, prompt template
- `{style}.md` - specific palette, elements, keywords
- `info-concept-guide.md` - concept engineering (info only)

## Step 4: Build Prompt

Use template from `_shared.md`:

```
[STYLE] aesthetic, [ASPECT RATIO] aspect ratio.

VISUALIZATION: [core metaphor or diagram structure]

ELEMENTS: [key visual components]

ENVIRONMENT: [setting - artistic styles only]

MOOD: [2-3 words]

STYLE APPLICATION:
- [Color palette]
- [Lighting]
- [Texture/atmosphere]

AVOID: [style-specific avoids]
```

For info style, the VISUALIZATION section should directly reflect the concept brief.

## Step 5: Generate

Call `mcp__nano-banana__generate_image` with:
- Built prompt
- Appropriate aspect ratio (1:1 or 4:3 for info, 16:9 for artistic)
- model_tier: "pro"
- negative_prompt: include style-specific avoids

## Step 6: Post-Generation Critique

View the generated image and ask:

1. **Squint test** - Core structure visible when blurred?
2. **Text check** - Minor labels OK, paragraphs = fail
3. **Background check** - Dark enough? (not light/beige)
4. **Contrast check** - Is the difference obvious?
5. **Usability check** - Would this work in a presentation?

### Critique Result:
- **Pass (3+ yes)**: Proceed to save
- **Fail (2+ no)**: Regenerate once with refined prompt

## Step 7: Regeneration (If Needed)

If critique failed:
1. Identify specific failure (text, background, contrast, etc.)
2. Strengthen that aspect in prompt
3. Regenerate once
4. Accept result (no infinite loops)

## Step 8: Save

1. Move image to: `~/CybosVault/private/content/images/MMDD-<slug>-YY.png`
2. Log to: `~/CybosVault/private/.cybos/logs/MMDD-YY.md`

No metadata files.

---

## Quick Reference: Info vs Artistic

| Aspect | Info Style | Artistic (Mural/Cyberpunk) |
|--------|------------|---------------------------|
| Goal | Understanding | Feeling |
| Concept step | Required | Skip |
| Elements | 2-5 max | More flexibility |
| Background | Dark umber | Style-specific |
| Focal point | Glowing insight | Atmospheric |
| Text | Avoid, minor OK | Never |

---

## Style Files

- `context/img-styles/_shared.md` - Common rules
- `context/img-styles/info.md` - Info style palette & rules
- `context/img-styles/info-concept-guide.md` - Concept engineering
- `context/img-styles/mural.md` - Mural style
- `context/img-styles/cyberpunk.md` - Cyberpunk style