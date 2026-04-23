# AIGIS Obsidian MVP

This workspace is a self-contained Obsidian vault with a stripped-down AIGIS-style governance plugin.

## What is included

- An Obsidian vault rooted at this folder
- A local plugin at `.obsidian/plugins/aigis-governance`
- Starter governance folders under `AIGIS/`
- A vault bootstrap flow that creates and maintains a dashboard and audit log

## MVP scope

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

## Run locally

1. Open this folder as an Obsidian vault.
2. In a terminal, change into `.obsidian/plugins/aigis-governance`.
3. Run `npm install`.
4. Run `npm run build`.
5. In Obsidian, enable the community plugin `AIGIS Governance`.
6. Run the command `AIGIS: Bootstrap governance vault`.

## Development

- `npm run dev` watches and rebuilds the plugin.
- The plugin source lives in `.obsidian/plugins/aigis-governance/src/main.ts`.
- The built output is `.obsidian/plugins/aigis-governance/main.js`.
