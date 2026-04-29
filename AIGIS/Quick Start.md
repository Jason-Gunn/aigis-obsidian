# AIGIS Quick Start

> AIGIS gives Obsidian users a structured place to register AI systems, prompts, policies, workflows, skills, and incidents.

## Start Here

1. Open Obsidian with this vault, or install the plugin into an existing vault.
2. Enable **AI Governance and Infrastructure Suite for Obsidian** in **Settings -> Community Plugins**.
3. Run **AIGIS: Bootstrap governance vault** from the command palette.
4. Open the **AIGIS Console** from the shield ribbon icon, or run **AIGIS: Open governance console**.

## What Bootstrap Does

- Creates any missing AIGIS folders.
- Creates `AIGIS/Audit/Audit Log.md` if it is missing.
- Creates `AIGIS/Dashboard.md` if it is missing, then refreshes its contents.
- Creates `AIGIS/User Guide.md` if it is missing.
- Appends a `vault.bootstrap` entry to the audit log.

## Console Basics

- Visible modules appear as cards with a live note count and a **Create** button.
- **Bootstrap vault**, **Open dashboard**, and **Open audit log** stay at the bottom of the panel.
- Use **Settings -> AIGIS Governance -> Console visibility** to show or hide module cards.
- Use **Settings -> AIGIS Governance -> Card order** to reorder the cards.

## Module Summary

- Inventory: register governed AI systems and models.
- Prompts: track prompt artifacts with versions and lifecycle stages.
- Policies: document AI use rules, owners, and review dates.
- Workflows: record approved AI-assisted processes with Mermaid diagrams.
- Skills: store reusable governed capabilities with output contracts.
- Incidents: log investigations, severity, status, and linked assets.

## Default Settings

| Setting | Default |
|---|---|
| Root folder | `AIGIS` |
| Audit folder | `Audit` |
| Dashboard note | `Dashboard.md` |
| Auto-open console | on |

## Notes

- The audit log is plain Markdown. Treat it as advisory evidence, not a tamper-proof log.
- Titles are slugified for filenames, and audit entries are stored as single-line records.
- The dashboard quick links point to the audit log and the user guide.
