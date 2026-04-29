# AIGIS for Obsidian

A lightweight version of [AIGIS: The AI Governance and Infrastructure Suite](https://dialogisticindustries.com/solutions/software/aigis/) built for Obsidian. It gives you a centralized command center for every AI model you deploy, with inventories for prompts, agent skills, workflows, policies and more.

> This release is packaged as a clean starter vault and plugin.

## What is included

- An Obsidian vault rooted at this folder
- A local plugin at `.obsidian/plugins/aigis-governance`
- Starter governance folders under `AIGIS/`
- A vault bootstrap flow that creates and maintains a dashboard, audit log, and user guide

## Scope

This version focuses on the parts of AIGIS that map naturally onto Obsidian:

- AI inventory notes
- Prompt notes
- Policy notes
- Workflow notes with Mermaid blocks
- Skill notes
- Incident notes
- A plain Markdown audit log for bootstrap and note creation events
- A simple side-panel console for counts and quick actions

It does not attempt to reproduce the original WordPress analytics, budgets, REST API, or live provider sandbox.

## Installation

The compiled plugin (`main.js`) is included in the repository. No build step is needed for standard use.

1. Download or clone this repository and unzip if needed.
2. Open Obsidian → **Open another vault** → **Open folder as vault** → select the `AIGIS-Obsidian` folder.
3. Go to **Settings -> Community Plugins**. If prompted, disable Restricted Mode. Find **AI Governance and Infrastructure Suite for Obsidian** and enable it.
4. Open the command palette (`Ctrl/Cmd + P`) and run **AIGIS: Bootstrap governance vault**.

Bootstrap creates any missing managed folders and files, refreshes the dashboard, and appends an audit entry.

## Adding to an existing vault

Copy these three files into `<your-vault>/.obsidian/plugins/aigis-governance/`:

- `main.js`
- `manifest.json`
- `styles.css`

Then enable the plugin and run the bootstrap command.

## Security Notes

- Filenames are slugified from note titles.
- Audit entries are stored as single-line records.
- The audit log is advisory and should not be treated as tamper-proof evidence.
- Settings-backed paths are sanitized before the plugin uses them.

## Development

- `npm install` then `npm run dev` watches and rebuilds on save.
- Source: `.obsidian/plugins/aigis-governance/src/main.ts`
- Output: `.obsidian/plugins/aigis-governance/main.js`
