# Retro-ROM View

A desktop application for browsing, organizing, and managing retro gaming ROM collections. Built with Electron, it provides a clean dark-themed interface designed to handle large collections spanning multiple folders and DAT files.

![License](https://img.shields.io/badge/license-MIT-blue) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

---

## Features

### Collection Management

- Load one or more ROM folders simultaneously — each is tracked and color-coded independently
- Drag-and-drop support for DAT/XML files directly onto the load screen
- Persistent sessions: folders, DATs, and settings are remembered between launches
- Enable or disable individual folders and DATs without removing them

### DAT / Metadata Support

- Supports both **MAME XML** (`<machine>`) and **Logiqx DAT** (`<game>`) formats
- Load multiple DATs at once for cross-collection compatibility analysis
- Enriches the game list with titles, years, manufacturers, parent/clone relationships
- Falls back to a prefix-based heuristic grouping when no DAT is loaded

### Filtering & Sorting

- Filter by: **All / Parents / Clones / Orphans / Missing / Duplicates / Multi-DAT**
- Filter by specific DAT or folder using pill buttons
- Full-text search across short names, titles, and manufacturers
- Sort by name, title, clone count, file size, or romset count — with reverse toggle
- Option to hide DAT/folder tags from the results list for a cleaner view

### Game Detail Panel

- Displays all physical files associated with a game (parent + clones)
- Role badges: parent, clone, duplicate, orphan, missing
- Per-file actions: mark for deletion, reveal in Explorer, open directly
- Star/favorite a specific file variant for quick launch
- Collapsible sections for present clones and missing clones

### ZIP Inspector

A dedicated side panel reads ZIP archives and compares their contents against the active DAT:

- Lists every file inside the ZIP with its size and CRC
- Highlights files with correct CRC ✓, bad CRC ✗, unexpected extras, or missing entries
- Summary badge counts at a glance

### Romset Compatibility Panel

- Shows which loaded DATs include the selected game
- Displays the full ROM manifest from the DAT (file names, sizes, CRCs, merge flags)
- Click any DAT row to switch the active reference for ZIP verification
- Collapsible ROM list with A→Z sort toggle

### Emulator Integration

- Configure any number of emulators with a visual command-line token builder
- Tokens: `{rom}` (short name) and `{rompath}` (directory) can be placed anywhere in the argument order
- Per-game emulator preference saved persistently
- Launch from: double-click on a list item, double-click a filename in the detail panel, or right-click context menu
- Gamepad navigation supported (D-pad / left stick, A button)
- Console drawer shows live stdout/stderr output from the launched process

### Duplicate Detection

- Detects duplicate ROM names across all loaded folders
- Dedicated "Duplicates" filter to review them
- Mark files for deletion individually, then export as a text list or send to the system trash in bulk

### Snap Panel

- Displays a screenshot for the selected game if a matching image exists in a local `snap/` folder
- Supports PNG, JPG, JPEG, and WebP
- Resizable panel, collapsed by default

### UI & Ergonomics

- Dark theme with amber/blue accent colors, JetBrains Mono + Syne fonts
- Resizable left list, ZIP panel, and romset panel (widths persisted)
- Collapsible panels and toolbar
- Zoom control (Ctrl +/−/0)
- All preferences auto-saved to `settings.json`

---

## Getting Started

**Requirements:** Node.js 18+

```bash
npm install
npm start
```

On Windows you can also double-click `START.vbs` to launch without a visible terminal window.

---

## DAT Sources

DAT files can be obtained from:

- [MAME](https://www.mamedev.org/) — official XML exports
- [No-Intro](https://www.no-intro.org/)
- [Redump](http://redump.org/)
- [pleasuredome](https://pleasuredome.github.io/pleasuredome/)

---

## License

MIT
