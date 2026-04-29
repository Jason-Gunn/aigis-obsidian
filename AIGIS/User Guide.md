# AIGIS Governance User Guide

> A structured AI governance layer. Register AI systems, manage prompts and policies, document workflows, store governed skills, and track incidents, all as Markdown notes.

---

## Quick Start

1. Open the command palette (`Ctrl/Cmd + P`)
2. Run **AIGIS: Bootstrap governance vault**
3. Open the **AIGIS Console** from the ribbon (shield icon)

---

## Modules

### Inventory
Register every AI model, agent, or governed system in use. This is the foundation. All other modules should link back to an inventory record.

**Key fields:** vendor, model, integration type, risk level, owner, status

### Prompts
Store governed prompt artifacts with versioning and lifecycle stages.

**Stages:** Development -> Staging -> Production

**Key fields:** version, lifecycle stage, provider, target model, goal

### Policies
Maintain formal AI use policies. The dashboard surfaces upcoming review dates.

**Key fields:** status (draft / approved / retired), version, owner, effective date, review date

### Workflows
Document approved AI-assisted processes. Each note includes a Mermaid diagram block.

**Key fields:** owner, human oversight requirement, Mermaid diagram

### Skills
Store reusable governed capabilities. These are instruction bundles with trigger conditions and an output contract.

**Key fields:** version, team, trigger phrases, output contract

### Incidents
Track events that require investigation: prompt injection, PII leakage, misuse, or unexpected behavior.

**Severity:** low / medium / high / critical

**Status:** open -> investigating -> resolved

---

## Console Panel

Open from the ribbon (shield icon) or by running **AIGIS: Open governance console**.

- One card per visible module shows the live note count and a **Create** button.
- Module visibility is controlled in **Settings -> AIGIS Governance -> Console visibility**.
- **Bootstrap vault**, **Open dashboard**, and **Open audit log** buttons are at the bottom of the panel.

---

## Audit Log

`AIGIS/Audit/Audit Log.md` is a plain Markdown log written by the plugin. It appends a timestamped line for each bootstrap action and each note created through the plugin.

---

## Dropdown Lists

Vendor, model, and team fields in note creation forms are backed by editable lists.

- Go to **Settings -> AIGIS Governance -> Manage dropdown lists** to add or remove values.
- Or choose **+ Add new...** inside any creation form to add a value on the fly.

---

## Commands

| Command | Action |
|---|---|
| Bootstrap governance vault | Creates any missing folders and files, refreshes the dashboard, and appends an audit entry |
| Open governance console | Opens the side panel |
| Create Inventory record note | Opens the inventory form |
| Create Prompt note | Opens the prompt form |
| Create Policy note | Opens the policy form |
| Create Workflow note | Opens the workflow form |
| Create Skill note | Opens the skill form |
| Create Incident note | Opens the incident form |

---

## Settings

**Settings -> AIGIS Governance**

| Setting | Default | Purpose |
|---|---|---|
| Root folder | `AIGIS` | Top-level vault folder the plugin manages |
| Audit folder | `Audit` | Sub-folder for the audit log |
| Dashboard note | `Dashboard.md` | Auto-generated dashboard filename |
| Auto-open console | on | Open the side panel on startup |
| Console visibility | all modules visible | Toggle which modules appear in the console |
| Card order | Inventory, Prompts, Policies, Workflows, Skills, Incidents | Reorder the console cards |
| Manage dropdown lists | defaults loaded | Add or remove vendors, models, and teams |