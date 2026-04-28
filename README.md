# AIGIS for Obsidian

A lightweight version of [AIGIS: The AI Governance and Infrastructure Suite](https://dialogisticindustries.com/solutions/software/aigis/) built for Obsidian. It gives you a centralized command center for every AI model you deploy, with inventories for prompts, agent skills, workflows, policies and more.

> This is currently in beta. I've been using it and I like it well enough, but mileage my vary.

## What is included

- An Obsidian vault rooted at this folder
- A local plugin at `.obsidian/plugins/aigis-governance`
- Starter governance folders under `AIGIS/`
- A vault bootstrap flow that creates and maintains a dashboard and audit log

## Scope

This version focuses on the parts of AIGIS that map naturally onto Obsidian:

- AI inventory notes
- Prompt notes
- Policy notes
- Workflow notes with Mermaid blocks
- Skill notes
- Incident notes
- Append-only audit log
- A simple side-panel console for counts and quick actions

It does not attempt to reproduce the original WordPress analytics, budgets, REST API, or live provider sandbox.

## Installation

The compiled plugin (`main.js`) is included in the repository — no build step needed for standard use.

1. Download or clone this repository and unzip if needed.
2. Open Obsidian → **Open another vault** → **Open folder as vault** → select the `AIGIS-Obsidian` folder.
3. Go to **Settings → Community Plugins**. If prompted, disable Restricted Mode. Find **AIGIS Governance** and enable it.
4. Open the command palette (`Ctrl/Cmd + P`) and run **AIGIS: Bootstrap governance vault**.

A `User Guide.md` note is created inside the vault as part of bootstrap.

## Adding to an existing vault

Copy these three files into `<your-vault>/.obsidian/plugins/aigis-governance/`:

- `main.js`
- `manifest.json`
- `styles.css`

Then enable the plugin and run the bootstrap command.

## Development

- `npm install` then `npm run dev` watches and rebuilds on save.
- Source: `.obsidian/plugins/aigis-governance/src/main.ts`
- Output: `.obsidian/plugins/aigis-governance/main.js`
