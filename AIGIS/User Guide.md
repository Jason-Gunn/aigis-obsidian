# AIGIS Governance — User Guide

> A structured AI governance layer. Register AI systems, manage prompts and policies, document workflows, store governed skills, and track incidents — all as Markdown notes.

---

## Quick Start

1. Open the command palette (`Ctrl/Cmd + P`)
2. Run **AIGIS: Bootstrap governance vault**
3. Open the **AIGIS Console** from the ribbon (shield icon)

---

## Modules

### Inventory
Register every AI model, agent, or governed system in use. This is the foundation — all other modules should link back to an inventory record.

**Key fields:** vendor, model, integration type, risk level, owner, status

### Prompts
Store governed prompt artefacts with versioning and a lifecycle stage.

**Stages:** Development → Staging → Production

**Key fields:** version, lifecycle stage, provider, target model, goal

### Policies
Maintain formal AI-use policies. The Dashboard surfaces upcoming review dates.

**Key fields:** status (draft / approved / retired), version, owner, effective date, review date

### Workflows
Document approved AI-assisted processes. Includes a Mermaid diagram block.

**Key fields:** owner, human oversight requirement, Mermaid diagram

### Skills
Store reusable governed capabilities — instruction bundles with trigger conditions and an output contract.

**Key fields:** version, team, trigger phrases, output contract

### Incidents
Track events requiring investigation: prompt injection, PII leakage, misuse, or unexpected behaviour.

**Severity:** low / medium / high / critical

**Status:** open → investigating → resolved

---

## Console Panel

Open from the ribbon (shield icon) or via **AIGIS: Open governance console**.

- The **eye icon** on each module card toggles it hidden or visible
- Hidden modules collapse to a slim header row
- **Bootstrap vault**, **Open dashboard**, and **Open audit log** buttons are at the bottom of the panel

---

## Audit Log

`AIGIS/Audit/Audit Log.md` is append-only. The plugin writes a timestamped line for every note created and every bootstrap. Do not delete lines from this file manually.

---

## Dropdown Lists

Vendor, model, and team fields in note creation forms are backed by editable lists.

- Go to **Settings → AIGIS Governance → Manage dropdown lists** to add or remove values
- Or choose **＋ Add new…** inside any creation form to add a value on the fly

---

## Commands

| Command | Action |
|---|---|
| Bootstrap governance vault | Creates folders, dashboard, audit log, and this guide |
| Open governance console | Opens the side panel |
| Create Inventory record | New inventory note |
| Create Prompt | New prompt note |
| Create Policy | New policy note |
| Create Workflow | New workflow note |
| Create Skill | New skill note |
| Create Incident | New incident note |

---

## Settings

**Settings → AIGIS Governance**

| Setting | Default | Purpose |
|---|---|---|
| Root folder | `AIGIS` | Top-level vault folder the plugin manages |
| Audit folder | `Audit` | Sub-folder for the audit log |
| Dashboard note | `Dashboard.md` | Auto-generated dashboard filename |
| Auto-open console | on | Open side panel on startup |
| Console visibility | — | Toggle which modules appear in the console |
| Manage dropdown lists | — | Add/remove vendors, models, and teams |
