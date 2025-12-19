# Migration Plan: fal → Nano Banana MCP

*Replace fal.ai image generation with Google Gemini's Nano Banana via MCP*

---

## Summary

**Current**: fal.ai (Flux Pro/Dev models) - configured but API key removed
**Target**: Nano Banana MCP using Google Gemini 2.5 Flash Image API

**Why Nano Banana?**
- Native Gemini integration (consistent with Google ecosystem)
- Image editing support (generate + edit + iterate)
- Free tier available with Gemini API key
- Well-maintained MCP server: `nano-banana-mcp` (59 stars, actively updated)

---

## Implementation Steps

### 1. MCP Configuration

**Add to `.mcp.json`:**
```json
"nano-banana": {
  "command": "npx",
  "args": ["nano-banana-mcp"],
  "env": {
    "GEMINI_API_KEY": "${GEMINI_API_KEY}"
  }
}
```

**Requires**: `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Tool Mapping

| fal Tool | Nano Banana Tool | Notes |
|----------|------------------|-------|
| `mcp__fal__generateImage` | `generate_image` | Primary generation |
| (none) | `edit_image` | NEW: Edit existing images |
| (none) | `continue_editing` | NEW: Iterate on last image |
| (none) | `get_last_image_info` | NEW: Check current state |

### 3. Files to Update

| File | Changes |
|------|---------|
| `.mcp.json` | Add nano-banana server config |
| `.env.example` | Add `GEMINI_API_KEY` |
| `.claude/commands/cyber-image.md` | Replace `mcp__fal__generateImage` → `generate_image` |
| `.claude/skills/Content/workflows/image.md` | Update tool calls, add edit capabilities |
| `docs/ARCHITECTURE.md` | Update MCP servers table, tool reference |
| `README.md` | Update API key requirements |

### 4. New Capabilities

Nano Banana adds features fal didn't have:

- **Edit existing images**: Modify saved images with text prompts
- **Iterative editing**: Continue refining last generated/edited image
- **Reference images**: Use style reference images for guidance
- **Cross-platform paths**: Automatic file management

### 5. Workflow Updates

**Current (fal)**:
```
generate_image → save → done
```

**New (Nano Banana)**:
```
generate_image → review → continue_editing (optional) → save
       ↑                         ↓
       └─────── iterate ─────────┘
```

### 6. Testing Checklist

- [ ] Nano Banana MCP server starts correctly
- [ ] `generate_image` produces output
- [ ] Images save to `/content/images/` correctly
- [ ] `edit_image` works on existing images
- [ ] `continue_editing` iterates on last image
- [ ] Error handling works (invalid prompts, API errors)
- [ ] Aesthetic quality matches Modern Cyberpunk style

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Gemini API rate limits | Free tier is generous; upgrade if needed |
| Quality differences vs Flux | Test aesthetic prompts before full migration |
| Model naming (gemini-2.5-flash-image) | MCP abstracts this away |

---

## Rollback Plan

If issues arise:
1. Remove nano-banana from `.mcp.json`
2. Re-add fal configuration with API key
3. Revert workflow files to fal tools

---

*Ready for implementation*
