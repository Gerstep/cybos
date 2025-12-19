import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Configuration
# Default to global path, but allow override via env var for testing
DEFAULT_CACHE_PATH = Path.home() / "Library/Application Support/Granola/cache-v3.json"
CACHE_PATH = Path(os.environ.get("GRANOLA_CACHE_OVERRIDE", DEFAULT_CACHE_PATH))

# Output directory (relative to current working dir or absolute)
OUTPUT_BASE = Path("./context/calls")

def load_granola_data(path):
    """Load and parse Granola cache file, handling double-encoding."""
    print(f"📂 Loading Granola cache from: {path}")
    if not path.exists():
        print(f"❌ File not found: {path}")
        return None

    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Handle double-encoded JSON string in 'cache' key
        if 'cache' in data and isinstance(data['cache'], str):
            inner_data = json.loads(data['cache'])
            return inner_data.get('state', {})
        elif 'state' in data:
            return data['state']
        else:
            return data
            
    except Exception as e:
        print(f"❌ Error loading JSON: {e}")
        return None

def safe_filename(name):
    """Create filesystem-safe filename."""
    if not name: return "untitled"
    return "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip()[:100]

def format_date(iso_str):
    """Format ISO date string to YYYY-MM-DD."""
    if not iso_str: return "unknown_date"
    try:
        dt = datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d')
    except:
        return iso_str[:10]

def parse_tiptap_node(node, indent=0):
    """Recursively parse TipTap JSON node to Markdown."""
    if not isinstance(node, dict): return ""
    
    node_type = node.get('type', '')
    content = node.get('content', [])
    text_content = ""
    
    # Process child content first
    child_texts = []
    for child in content:
        child_texts.append(parse_tiptap_node(child, indent))
    
    # Handle specific node types
    if node_type == 'text':
        text = node.get('text', '')
        marks = node.get('marks', [])
        for mark in marks:
            m_type = mark.get('type')
            if m_type == 'bold': text = f"**{text}**"
            elif m_type == 'italic': text = f"*{text}*"
            elif m_type == 'code': text = f"`{text}`"
        return text
        
    elif node_type == 'paragraph':
        return "".join(child_texts)
        
    elif node_type == 'heading':
        level = node.get('attrs', {}).get('level', 1)
        return f"{'#' * level} {''.join(child_texts)}"
        
    elif node_type == 'bulletList':
        items = []
        for child in content:
            if child.get('type') == 'listItem':
                # Process list item content (usually paragraphs)
                li_content = []
                for li_child in child.get('content', []):
                    li_content.append(parse_tiptap_node(li_child, indent + 1))
                items.append(f"- {' '.join(li_content)}")
        return "\n".join(items)
        
    elif node_type == 'orderedList':
        items = []
        for i, child in enumerate(content, 1):
            if child.get('type') == 'listItem':
                li_content = []
                for li_child in child.get('content', []):
                    li_content.append(parse_tiptap_node(li_child, indent + 1))
                items.append(f"{i}. {' '.join(li_content)}")
        return "\n".join(items)
        
    elif node_type == 'codeBlock':
        return f"```\n{''.join(child_texts)}\n```"
        
    elif node_type == 'blockquote':
        return f"> {''.join(child_texts)}"
        
    elif node_type == 'horizontalRule':
        return "---"
        
    # Default: join children
    return "".join(child_texts)

def extract_notes(doc, panels):
    """Extract and combine manual notes and AI panels."""
    notes_parts = []
    
    # 1. Manual Notes
    manual_md = doc.get('notes_markdown') or doc.get('notes_plain')
    if not manual_md:
        notes_obj = doc.get('notes')
        if notes_obj:
            manual_md = parse_tiptap_node(notes_obj)
            
    if manual_md:
        notes_parts.append("# Manual Notes\n")
        notes_parts.append(manual_md)
        
    # 2. AI Panels - documentPanels is nested: { doc_id: { panel_id: panel } }
    doc_id = doc.get('id')
    doc_panels_obj = panels.get(doc_id, {}) if doc_id else {}
    doc_panels = list(doc_panels_obj.values()) if doc_panels_obj else []
    
    if doc_panels:
        notes_parts.append("\n# AI-Enhanced Notes\n")
        for panel in doc_panels:
            title = panel.get('title', 'Untitled Panel')
            content = panel.get('content', {})
            panel_md = parse_tiptap_node(content)
            if panel_md:
                notes_parts.append(f"## {title}\n")
                notes_parts.append(panel_md)
                notes_parts.append("\n")
                
    return "\n".join(notes_parts)

def infer_speakers(doc_metadata):
    """Infer self and other speaker names from metadata."""
    self_name = "You"
    other_name = "Speaker"
    
    if doc_metadata:
        people = doc_metadata.get('people') or {}
        creator = people.get('creator', {}).get('name')
        attendees = people.get('attendees', [])
        
        if creator:
            self_name = creator
            
        others = []
        for att in attendees:
            details = att.get('details', {}).get('person', {})
            name = details.get('name', {}).get('fullName') or att.get('email')
            if name and name != self_name:
                others.append(name)
        
        if len(others) == 1:
            other_name = others[0]
        elif len(others) > 1:
            other_name = " / ".join(others)
            
    return self_name, other_name

def extract_transcript_text(transcript_data, self_name, other_name):
    """Convert transcript segments to formatted text."""
    if not isinstance(transcript_data, list) or not transcript_data:
        return None
        
    lines = []
    for segment in transcript_data:
        if not isinstance(segment, dict): continue
        
        text = segment.get('text', segment.get('content', ''))
        if not text: continue
        
        speaker = segment.get('speaker')
        source = segment.get('source')
        
        display_name = "Unknown"
        if speaker:
            display_name = speaker
        elif source == 'microphone':
            display_name = self_name
        elif source == 'system':
            display_name = other_name
            
        lines.append(f"[{display_name}] {text}")
        
    return "\n\n".join(lines)

def main():
    state = load_granola_data(CACHE_PATH)
    if not state: return

    documents = state.get('documents', {})
    transcripts = state.get('transcripts', {})
    panels = state.get('documentPanels', {})
    
    print(f"🔍 Found {len(documents)} documents and {len(transcripts)} transcript entries.")
    
    # Create output base
    OUTPUT_BASE.mkdir(parents=True, exist_ok=True)
    
    processed_count = 0
    
    # Iterate through transcripts to find valid ones
    for t_id, t_data in transcripts.items():
        if not isinstance(t_data, list) or len(t_data) == 0:
            continue
            
        # Find associated document
        doc = documents.get(t_id)
        if not doc:
            # Try finding via document_id in first segment
            if isinstance(t_data[0], dict):
                internal_doc_id = t_data[0].get('document_id')
                if internal_doc_id:
                    doc = documents.get(internal_doc_id)
        
        # Basic metadata
        if doc:
            title = doc.get('title', 'Untitled')
            created_at = doc.get('created_at')
            doc_id = doc.get('id', t_id)
        else:
            title = "Unknown Meeting"
            # Try timestamp from transcript
            ts = t_data[0].get('start_timestamp')
            created_at = ts if ts else datetime.now().isoformat()
            doc_id = t_id
            
        date_str = format_date(created_at)
        safe_title = safe_filename(title)
        dir_name = f"{date_str}_{safe_title}"
        call_dir = OUTPUT_BASE / dir_name
        
        # Check if already exists
        if call_dir.exists():
            print(f"⏭️  Skipping existing: {dir_name}")
            continue
            
        print(f"✨ Processing: {title} ({date_str})")
        call_dir.mkdir(parents=True, exist_ok=True)
        
        # 1. Metadata
        self_name, other_name = infer_speakers(doc)
        people = doc.get('people') if doc else {}
        if not people: people = {}
        
        metadata = {
            "id": doc_id,
            "title": title,
            "date": created_at,
            "attendees": people.get('attendees', []),
            "inferred_speakers": {
                "self": self_name,
                "other": other_name
            }
        }
        with open(call_dir / "metadata.json", 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
            
        # 2. Transcript
        transcript_text = extract_transcript_text(t_data, self_name, other_name)
        if transcript_text:
            with open(call_dir / "transcript.txt", 'w', encoding='utf-8') as f:
                f.write(transcript_text)
                
        # 3. Notes (AI + Manual)
        if doc:
            notes_text = extract_notes(doc, panels)
            if notes_text:
                with open(call_dir / "notes.md", 'w', encoding='utf-8') as f:
                    f.write(notes_text)
                    
        processed_count += 1
        
    print(f"\n✅ Completed! Processed {processed_count} new calls into {OUTPUT_BASE}")

if __name__ == "__main__":
    main()
