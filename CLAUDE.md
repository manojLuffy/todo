# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Task Slayer is a Chrome Extension (Manifest V3) for managing to-do tasks with gamification elements. Users earn "Slayer Points" for completing tasks and level up through ranks.

## Development Commands

```bash
# Load the extension in Chrome for development:
# 1. Navigate to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select this directory
```

No build step required - this is vanilla JavaScript that runs directly in Chrome.

## Architecture

### File Structure
- `manifest.json` - Chrome extension configuration (Manifest V3)
- `background.js` - Service worker for storage change listeners
- `popup/` - Main extension UI
  - `popup.html` - Entry point
  - `popup.js` - All application logic
  - `popup.css` - Styles with CSS variables for theming

### Data Storage
- **Tasks**: Stored in `chrome.storage.sync` (syncs across Chrome browsers)
- **Game data** (slayerPoints, currentLevel): Stored in `localStorage`
- **Theme preference**: Stored in `localStorage` as "darkMode"

### Gamification System
- Points: +5 SP for completing a task, -5 SP for un-completing
- 6 levels with thresholds: 0, 100, 250, 500, 2500, 5000 SP
- Level-up triggers a modal with confetti animation

### Theming
Uses CSS variables (--bg-color, --text-color, --task-bg) toggled via `.dark-mode` class on body. Icon assets have `_light` and `_dark` variants in `img/`.

### Key Functions in popup.js
- `renderTasks()` - Main render function, rebuilds both task lists
- `completeTask(index)` - Toggles completion, handles point awards/deductions
- `updateLevel()` - Checks thresholds and triggers level-up modal
- `updateTasksInStorage()` / `loadTasksFromStorage()` - Chrome storage operations
