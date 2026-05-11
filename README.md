# 🕹️ Retro-ROM View

> **A desktop app for browsing, organizing, and launching your retro gaming ROM collections.**
> Built with Electron — dark-themed, fast, and designed for collectors who mean business.

![License](https://img.shields.io/badge/license-MIT-blue) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

---

## ✨ What it does

Load your ROM folders, drop in a MAME DAT file, and instantly get a structured view of your entire collection — what you have, what's missing, what's a duplicate, and how complete each game is down to the individual ROM files inside the ZIP.

---

## 🗂️ Collection Management

- 📁 Load **multiple ROM folders** at once — each is color-coded and tracked independently
- 🖱️ **Drag & drop** DAT/XML files directly onto the load screen
- 💾 **Persistent sessions** — folders, DATs and settings are remembered between launches
- ✅ Enable or disable individual folders and DATs without removing them

## 🗄️ DAT / Game Database Support

- 📄 Supports **MAME XML** (`<machine>`) and **Logiqx DAT** (`<game>`) formats
- 🔀 Load **multiple DATs simultaneously** for cross-collection compatibility checks
- 🏷️ Enriches the game list with **titles, years, manufacturers**, parent/clone relationships
- 🔍 Falls back to prefix-based heuristic grouping when no DAT is loaded

## 🔎 Filtering & Sorting

| Filter | Description |
|---|---|
| 👪 **Parents** | Root games only |
| 🔁 **Clones** | Regional variants & revisions |
| 👻 **Orphans** | Files not found in any DAT |
| ❌ **Missing** | Games in the DAT you don't own |
| 📦 **Duplicates** | Same ROM found in multiple folders |
| ✦ **Multi-DAT** | Games present in 2+ DATs |

- 🔍 Full-text search across short names, titles, and manufacturers
- ↕️ Sort by name, title, clone count, file size, or romset count

## 🎮 Game Detail Panel

- 📋 All physical files for a game (parent + clones) in one view
- 🏅 Role badges: `parent` `clone` `duplicate` `orphan` `missing`
- 🌟 **Favorite** a specific file variant for quick launch
- 🗑️ Mark files for deletion, then trash them in bulk or export the list

## 🗜️ ZIP Inspector

> *Crack open your ZIPs and see exactly what's inside.*

- Lists every file with its **size and CRC**
- Cross-references against the active DAT and flags each entry:
  - ✅ CRC match
  - ❌ Bad CRC
  - ➕ Extra / unreferenced file
  - ⬇️ Expected but missing

## 📊 Romset Compatibility Panel

- Shows which of your loaded DATs include the selected game
- Full ROM manifest from the DAT: file names, sizes, CRCs, merge flags
- Switch the active DAT reference on the fly to re-check the ZIP against it

## ▶️ Emulator Integration

- 🕹️ Configure **any number of emulators** with a visual command-line token builder
- 🏗️ Build your launch command with drag-to-reorder tokens: `{rom}`, `{rompath}`, custom args
- 💡 Per-game emulator preference, saved persistently
- 🚀 Launch from: **double-click** a game, **double-click** a file, or **right-click** context menu
- 🎮 **Gamepad navigation** supported (D-pad / left stick + A button)
- 📟 Live console output (stdout/stderr) shown in a collapsible drawer

## 🖼️ Snap Viewer

- Displays a **screenshot** for the selected game from a local `snap/` folder
- Supports PNG, JPG, JPEG, WebP
- Resizable panel docked to the game list

---

## 🚀 Getting Started

**Requirements:** Node.js 18+

```bash
npm install
npm start
```

> On Windows, double-click **`START.BAT`** to launch without a visible terminal window.

---

## 📦 DAT Sources

| Source | Format |
|---|---|
| [MAME](https://www.mamedev.org/) | Official XML exports |
| [No-Intro](https://www.no-intro.org/) | Logiqx DAT |
| [Redump](http://redump.org/) | Logiqx DAT |
| [pleasuredome](https://pleasuredome.github.io/pleasuredome/) | MAME sets |

---

## 📜 License

MIT
