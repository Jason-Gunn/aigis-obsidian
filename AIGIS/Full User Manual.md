# AIGIS for Obsidian

> **v0.1.2** · By [Dialogistic Industries](https://dialogisticindustries.com/)

AIGIS for Obsidian is a focused governance plugin for teams that want local Markdown records for AI systems, prompts, policies, workflows, skills, and incidents.

## Contents

- [[#Overview]]
- [[#Vault Structure]]
- [[#Modules]]
- [[#Installation]]
- [[#Command Reference]]
- [[#Settings]]
- [[#Frontmatter Reference]]
- [[#Security Notes]]

## Overview

This plugin is a local governance layer for Obsidian. It does not call model providers, execute prompts, or provide server-side analytics. It creates structured notes, keeps a dashboard up to date, and appends simple audit entries for bootstrap actions and note creation.

Use it when you want:

- Local records for AI systems and governed prompts.
- A repeatable note structure with YAML frontmatter.
- A side panel for quick creation and counts.
- A lightweight audit log for operational traceability.

## Vault Structure

The default managed root is `AIGIS/`.

```text
AIGIS/
|-- Dashboard.md
|-- User Guide.md
|-- Inventory/
|-- Prompts/
|-- Policies/
|-- Workflows/
|-- Skills/
|-- Incidents/
`-- Audit/
    `-- Audit Log.md
```

Bootstrap creates any missing folders and files, refreshes `Dashboard.md`, and appends a `vault.bootstrap` entry to the audit log.

## Modules

### Inventory

Use Inventory for governed AI systems and models.

| Field | Description |
|---|---|
| `vendor` | The organization or provider operating the model. |
| `model` | Model name and version. |
| `integration_type` | `api-model`, `custom-agent`, or `on-prem`. |
| `risk_level` | `low`, `medium`, or `high`. |
| `owner` | The responsible team. |
| `status` | `active`, `deprecated`, or `under-review`. |

### Prompts

Prompt notes track prompt artifacts with versions and lifecycle stages.

| Field | Description |
|---|---|
| `version` | Version string, default `0.1.0`. |
| `stage` | `development`, `staging`, or `production`. |
| `provider` | Provider selected from the managed list. |
| `target_model` | Target model selected from the managed list. |
| `goal` | Intended use for the prompt. |

### Policies

Policy notes capture AI use rules and review dates.

| Field | Description |
|---|---|
| `version` | Version string, default `1.0.0`. |
| `status` | `draft`, `approved`, or `retired`. |
| `owner` | Responsible team. |
| `effective_date` | Effective date. |
| `review_date` | Review date used by the dashboard. |

### Workflows

Workflow notes document approved AI-assisted processes and include a Mermaid block.

| Field | Description |
|---|---|
| `owner` | Responsible team. |
| `human_oversight` | Required review checkpoint. |
| `mermaid` | Mermaid diagram source. |

### Skills

Skill notes store reusable governed capabilities.

| Field | Description |
|---|---|
| `version` | Version string. |
| `team` | Owning team. |
| `trigger_phrases` | One trigger phrase per line. |
| `output_contract` | Required output structure. |

### Incidents

Incident notes track investigations and remediation.

| Field | Description |
|---|---|
| `severity` | `low`, `medium`, `high`, or `critical`. |
| `status` | `open`, `investigating`, or `resolved`. |
| `linked_asset` | Related note or system link. |
| `summary` | Incident summary. |

## Installation

### Open this repo as a vault

1. Open the `AIGIS-Obsidian` folder as a vault in Obsidian.
2. Go to **Settings -> Community Plugins**.
3. Enable **AI Governance and Infrastructure Suite for Obsidian**.
4. Run **AIGIS: Bootstrap governance vault**.

### Add the plugin to an existing vault

1. Create `<your-vault>/.obsidian/plugins/aigis-governance/`.
2. Copy `main.js`, `manifest.json`, and `styles.css` into that folder.
3. Reload community plugins and enable **AI Governance and Infrastructure Suite for Obsidian**.
4. Optionally change **Root folder** in **Settings -> AIGIS Governance**.
5. Run **AIGIS: Bootstrap governance vault**.

### Development

```bash
cd ".obsidian/plugins/aigis-governance"
npm install
npm run dev
```

## Command Reference

| Command | Description |
|---|---|
| `AIGIS: Bootstrap governance vault` | Creates any missing structure, refreshes the dashboard, and appends an audit entry. |
| `AIGIS: Open governance console` | Opens or focuses the console panel. |
| `AIGIS: Create Inventory record note` | Opens the inventory form. |
| `AIGIS: Create Prompt note` | Opens the prompt form. |
| `AIGIS: Create Policy note` | Opens the policy form. |
| `AIGIS: Create Workflow note` | Opens the workflow form with a starter Mermaid diagram. |
| `AIGIS: Create Skill note` | Opens the skill form. |
| `AIGIS: Create Incident note` | Opens the incident form. |

## Settings

### General

| Setting | Default | Description |
|---|---|---|
| Root folder | `AIGIS` | Managed root inside the vault. |
| Audit folder | `Audit` | Folder under the root for the audit log. |
| Dashboard note | `Dashboard.md` | Dashboard filename inside the root folder. |
| Auto-open console | on | Open the console on startup. |

### Console visibility

Visibility is controlled in settings only. The console itself does not include hide or show toggles.

### Card order

Use the arrow buttons in settings to reorder cards.

### Console appearance

Console appearance settings control card background, borders, spacing, title styling, count styling, description styling, and the create button colors.

### Dropdown lists

The vendor, model, and team lists are editable in settings and also support **+ Add new...** inside creation forms.

## Frontmatter Reference

All created notes include these fields:

| Field | Description |
|---|---|
| `aigis_module` | Module type. |
| `title` | Human-readable title from the form. |
| `created_at` | ISO-8601 timestamp written at creation time. |
| `updated_at` | ISO-8601 timestamp written at creation time. |

## Security Notes

- Filenames are slugified from note titles.
- Audit entries are normalized to a single line to reduce log-forging risk.
- The audit log is plain Markdown and should be treated as advisory, not tamper-proof.
- Settings-backed paths are sanitized before the plugin uses them.

## Dashboard and Audit Behavior

- The dashboard updates when managed notes are created, renamed, or deleted.
- The dashboard links to the audit log and the user guide.
- The audit log records `vault.bootstrap` and `note.created` actions.

*AIGIS for Obsidian · v0.1.2 · MIT License*  
*By [Dialogistic Industries](https://dialogisticindustries.com/)*
