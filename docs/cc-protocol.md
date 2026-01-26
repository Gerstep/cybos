# cc:// Protocol Documentation

The `cc://` protocol enables Obsidian to launch Claude Code sessions and commands via clickable links.

## URL Formats

### Resume Session
```
cc://resume/<session-id>
```
Opens Terminal and resumes an existing Claude Code session.

**Example:**
```markdown
[Resume this session](cc://resume/744ee4cf-512f-48da-92fe-c85afed5f196)
```

### Run Command
```
cc://cmd/<command-name>
```
Opens Terminal and runs a slash command in Claude Code.

**Example:**
```markdown
[Run GTD](cc://cmd/cyber-gtd)
[Morning Brief](cc://cmd/cyber-brief)
```

## How It Works

### Components

1. **CCOpener.app** (`~/Applications/CCOpener.app`)
   - macOS URL handler registered for `cc://` scheme
   - AppleScript applet that extracts the path from the URL
   - Passes the path to `cc-open` script

2. **cc-open script** (`~/bin/cc-open`)
   - Parses the URL path to determine mode (resume vs cmd)
   - For resume: finds session's project directory
   - Creates temporary launcher script
   - Opens configured terminal with the launcher

3. **Config file** (`~/.config/cc-open/config`)
   - Optional configuration for terminal preference
   - Default: Terminal.app

### URL Flow
```
Obsidian click → macOS URL handler → CCOpener.app → cc-open → Terminal → Claude Code
```

## Setup Instructions

### For New Machines

1. **Create CCOpener.app**
   - Open Automator
   - New Document → Application
   - Add "Run AppleScript" action
   - Paste this script:
   ```applescript
   on open location theURL
       set sessionPath to text 6 thru -1 of theURL
       do shell script "/Users/sg/bin/cc-open " & quoted form of sessionPath
   end open location
   ```
   - Save as `CCOpener.app` in `~/Applications/`

2. **Configure URL Scheme**
   - Open `~/Applications/CCOpener.app/Contents/Info.plist`
   - Add URL scheme configuration:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
       <dict>
           <key>CFBundleURLName</key>
           <string>Claude Code Session</string>
           <key>CFBundleURLSchemes</key>
           <array>
               <string>cc</string>
           </array>
       </dict>
   </array>
   ```

3. **Install cc-open script**
   - Copy `cc-open` to `~/bin/`
   - Make executable: `chmod +x ~/bin/cc-open`
   - Ensure `~/bin` is in PATH

4. **Register URL Handler**
   ```bash
   /System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -R ~/Applications/CCOpener.app
   ```

## Terminal Configuration

By default, cc-open uses macOS Terminal.app. To use a different terminal:

```bash
mkdir -p ~/.config/cc-open
echo 'TERMINAL=Ghostty' > ~/.config/cc-open/config
```

Supported terminals:
- `Terminal` - macOS Terminal.app (default)
- `Ghostty` - Ghostty terminal
- `iTerm` - iTerm2

Check current config:
```bash
cc-open
# Shows: Config: ~/.config/cc-open/config
#        TERMINAL=Ghostty
```

## Troubleshooting

### Links Don't Open
- Check if CCOpener.app is properly registered: `lsregister -dump | grep cc`
- Verify cc-open is executable and in PATH
- Check logs: `tail -f /tmp/cc-open.log`

### Wrong Working Directory
- For resume: session must exist in `~/.claude/projects/`
- For cmd: defaults to `/Users/sg/Work/cyberman`

### Terminal Opens But Claude Doesn't Start
- Ensure `claude` CLI is in PATH
- Check the launcher script in `/tmp/cc-launch-*`

## Debug Mode

Run cc-open directly to test:
```bash
# Test resume mode
cc-open resume/744ee4cf-512f-48da-92fe-c85afed5f196

# Test command mode
cc-open cmd/cyber-gtd

# Check working directory for a session
cc-open --info 744ee4cf-512f-48da-92fe-c85afed5f196
```

## Security Notes

- The protocol only runs predefined commands or resumes existing sessions
- No arbitrary code execution is possible
- Session IDs must exist in `~/.claude/projects/` to be resumable
