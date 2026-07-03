"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AigisGovernancePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var VIEW_TYPE_AIGIS_CONSOLE = "aigis-console";
var MANAGED_GUIDE_NAME = "User Guide.md";
var ALL_MODULES = ["inventory", "prompts", "policies", "workflows", "skills", "incidents"];
var DEFAULT_CONSOLE_STYLE = {
  cardBg: "",
  cardPadding: "0.9rem",
  cardBorderColor: "",
  cardBorderWidth: "1px",
  cardBorderRadius: "12px",
  titleFontSize: "1rem",
  titleColor: "",
  countFontSize: "1.1rem",
  countColor: "",
  descFontSize: "0.85rem",
  descColor: "",
  btnBg: "",
  btnColor: "",
  btnFontSize: "0.85rem"
};
var DEFAULT_SETTINGS = {
  rootFolder: "AIGIS",
  auditFolderName: "Audit",
  dashboardNoteName: "Dashboard.md",
  autoOpenConsole: true,
  hiddenModules: [],
  moduleOrder: [...ALL_MODULES],
  customLists: {
    vendors: ["Anthropic", "Cohere", "Google DeepMind", "Meta", "Mistral AI", "OpenAI"],
    models: ["claude-opus-4", "claude-sonnet-4", "gemini-2.0-flash", "gpt-4.1", "gpt-4o", "llama3:8b", "o3"],
    teams: ["AI Governance Office", "Compliance", "Engineering", "Product Operations"]
  },
  consoleStyle: { ...DEFAULT_CONSOLE_STYLE }
};
var MODULES = {
  inventory: {
    label: "Inventory",
    entryLabel: "Inventory record",
    folder: "Inventory",
    description: "Register models, agents, and governed AI systems.",
    fields: [
      { key: "title", label: "Record title", type: "text", required: true, placeholder: "Customer Support Agent" },
      { key: "vendor", label: "Vendor", type: "managed-select", listKey: "vendors" },
      { key: "model", label: "Model / version", type: "managed-select", listKey: "models" },
      {
        key: "integration_type",
        label: "Integration type",
        type: "select",
        defaultValue: "api-model",
        options: {
          "api-model": "API model",
          "custom-agent": "Custom agent",
          "on-prem": "On-prem"
        }
      },
      {
        key: "risk_level",
        label: "Risk level",
        type: "select",
        defaultValue: "medium",
        options: {
          low: "Low",
          medium: "Medium",
          high: "High"
        }
      },
      { key: "owner", label: "Owner", type: "managed-select", listKey: "teams" },
      {
        key: "status",
        label: "Status",
        type: "select",
        defaultValue: "active",
        options: {
          active: "Active",
          deprecated: "Deprecated",
          "under-review": "Under review"
        }
      }
    ]
  },
  prompts: {
    label: "Prompts",
    entryLabel: "Prompt",
    folder: "Prompts",
    description: "Track governed prompt artifacts and lifecycle stages.",
    fields: [
      { key: "title", label: "Prompt title", type: "text", required: true, placeholder: "Policy Summariser" },
      { key: "version", label: "Version", type: "text", defaultValue: "0.1.0" },
      {
        key: "stage",
        label: "Lifecycle stage",
        type: "select",
        defaultValue: "development",
        options: {
          development: "Development",
          staging: "Staging",
          production: "Production"
        }
      },
      { key: "provider", label: "Provider", type: "managed-select", listKey: "vendors" },
      { key: "target_model", label: "Target model", type: "managed-select", listKey: "models" },
      { key: "owner", label: "Owner", type: "managed-select", listKey: "teams" },
      { key: "goal", label: "Goal", type: "textarea", placeholder: "Summarise policy updates for non-technical reviewers." }
    ]
  },
  policies: {
    label: "Policies",
    entryLabel: "Policy",
    folder: "Policies",
    description: "Maintain formal AI governance policy notes.",
    fields: [
      { key: "title", label: "Policy title", type: "text", required: true, placeholder: "Acceptable Use Policy" },
      { key: "version", label: "Version", type: "text", defaultValue: "1.0.0" },
      {
        key: "status",
        label: "Status",
        type: "select",
        defaultValue: "draft",
        options: {
          draft: "Draft",
          approved: "Approved",
          retired: "Retired"
        }
      },
      { key: "owner", label: "Owner", type: "managed-select", listKey: "teams" },
      { key: "effective_date", label: "Effective date", type: "date" },
      { key: "review_date", label: "Review date", type: "date" }
    ]
  },
  workflows: {
    label: "Workflows",
    entryLabel: "Workflow",
    folder: "Workflows",
    description: "Document approved AI-assisted workflows and review points.",
    fields: [
      { key: "title", label: "Workflow title", type: "text", required: true, placeholder: "Model Deployment Approval" },
      { key: "owner", label: "Owner", type: "managed-select", listKey: "teams" },
      { key: "human_oversight", label: "Human oversight requirement", type: "text", placeholder: "Required before production release" },
      {
        key: "mermaid",
        label: "Mermaid flow",
        type: "textarea",
        defaultValue: "graph TD\n    A[Draft] --> B[Review]\n    B --> C{Approved?}\n    C -->|Yes| D[Release]\n    C -->|No| E[Rework]",
        helpText: "This will be inserted as a Mermaid code block in the note body."
      }
    ]
  },
  skills: {
    label: "Skills",
    entryLabel: "Skill",
    folder: "Skills",
    description: "Store reusable governed capabilities and output contracts.",
    fields: [
      { key: "title", label: "Skill title", type: "text", required: true, placeholder: "Complaint triage" },
      { key: "version", label: "Version", type: "text", defaultValue: "0.1.0" },
      { key: "team", label: "Owning team", type: "managed-select", listKey: "teams" },
      { key: "trigger_phrases", label: "Trigger phrases", type: "textarea", placeholder: "customer complaint\nrefund dispute" },
      { key: "output_contract", label: "Output contract", type: "textarea", placeholder: "Return sections: Risk Rating, Next Action, Escalation Path." }
    ]
  },
  incidents: {
    label: "Incidents",
    entryLabel: "Incident",
    folder: "Incidents",
    description: "Track events that require investigation and remediation.",
    fields: [
      { key: "title", label: "Incident title", type: "text", required: true, placeholder: "Prompt injection attempt blocked" },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        defaultValue: "medium",
        options: {
          low: "Low",
          medium: "Medium",
          high: "High",
          critical: "Critical"
        }
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        defaultValue: "open",
        options: {
          open: "Open",
          investigating: "Investigating",
          resolved: "Resolved"
        }
      },
      { key: "linked_asset", label: "Linked asset", type: "text", placeholder: "[[Customer Support Agent]]" },
      { key: "summary", label: "Summary", type: "textarea", placeholder: "Describe what happened, impact, and immediate containment." }
    ]
  }
};
var VAULT_MANUAL_CONTENT = `# AIGIS Governance User Guide

> A structured AI governance layer. Register AI systems, manage prompts and policies, document workflows, store governed skills, and track incidents, all as Markdown notes.

---

## Quick Start

1. Open the command palette (\`Ctrl/Cmd + P\`)
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

\`AIGIS/Audit/Audit Log.md\` is a plain Markdown log written by the plugin. It appends a timestamped line for each bootstrap action and each note created through the plugin.

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
| Root folder | \`AIGIS\` | Top-level vault folder the plugin manages |
| Audit folder | \`Audit\` | Sub-folder for the audit log |
| Dashboard note | \`Dashboard.md\` | Auto-generated dashboard filename |
| Auto-open console | on | Open the side panel on startup |
| Console visibility | all modules visible | Toggle which modules appear in the console |
| Card order | Inventory, Prompts, Policies, Workflows, Skills, Incidents | Reorder the console cards |
| Manage dropdown lists | defaults loaded | Add or remove vendors, models, and teams |
`;
var AigisGovernancePlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.registerView(
      VIEW_TYPE_AIGIS_CONSOLE,
      (leaf) => new AigisConsoleView(leaf, this)
    );
    this.addRibbonIcon("shield", "Open AIGIS Console", async () => {
      await this.activateConsole();
    });
    this.addCommand({
      id: "aigis-bootstrap-vault",
      name: "Bootstrap governance vault",
      callback: async () => {
        await this.bootstrapWorkspace();
      }
    });
    this.addCommand({
      id: "aigis-open-console",
      name: "Open governance console",
      callback: async () => {
        await this.activateConsole();
      }
    });
    this.addModuleCommands();
    this.addSettingTab(new AigisSettingTab(this.app, this));
    this.registerVaultEvents();
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.autoOpenConsole) {
        void this.activateConsole();
      }
    });
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_AIGIS_CONSOLE);
  }
  addModuleCommands() {
    const entries = Object.entries(MODULES);
    for (const [module2, definition] of entries) {
      this.addCommand({
        id: `aigis-create-${module2}`,
        name: `Create ${definition.entryLabel} note`,
        callback: async () => {
          await this.createModuleNote(module2);
        }
      });
    }
  }
  registerVaultEvents() {
    this.registerEvent(this.app.vault.on("create", (file) => void this.handleVaultMutation(file)));
    this.registerEvent(this.app.vault.on("delete", (file) => void this.handleVaultMutation(file)));
    this.registerEvent(this.app.vault.on("rename", (file) => void this.handleVaultMutation(file)));
  }
  async handleVaultMutation(file) {
    if (!this.isManagedPath(file.path)) {
      return;
    }
    await this.writeDashboardNote();
    await this.refreshConsoleViews();
  }
  async loadSettings() {
    const saved = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...saved,
      rootFolder: sanitizeRelativeFolderPath(saved?.rootFolder, DEFAULT_SETTINGS.rootFolder),
      auditFolderName: sanitizeRelativeFolderPath(saved?.auditFolderName, DEFAULT_SETTINGS.auditFolderName),
      dashboardNoteName: sanitizeDashboardNoteName(saved?.dashboardNoteName, DEFAULT_SETTINGS.dashboardNoteName),
      hiddenModules: sanitizeModuleList(saved?.hiddenModules),
      moduleOrder: sanitizeModuleOrder(saved?.moduleOrder),
      customLists: normalizeCustomLists(saved?.customLists),
      consoleStyle: normalizeConsoleStyle(saved?.consoleStyle)
    };
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async bootstrapWorkspace() {
    await this.ensureVaultStructure();
    await this.writeDashboardNote();
    await this.appendAudit("vault.bootstrap", "AIGIS governance vault bootstrapped.");
    await this.refreshConsoleViews();
    new import_obsidian.Notice("AIGIS governance vault is ready.");
  }
  async activateConsole() {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_AIGIS_CONSOLE)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_AIGIS_CONSOLE, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
  }
  async createModuleNote(module2) {
    await this.ensureVaultStructure();
    const draft = await EntryModal.open(this.app, MODULES[module2], this);
    if (!draft) {
      return;
    }
    const title = draft.title.trim();
    const fileName = `${slugify(title)}.md`;
    const path = (0, import_obsidian.normalizePath)(`${this.getModuleFolder(module2)}/${fileName}`);
    if (this.app.vault.getAbstractFileByPath(path)) {
      new import_obsidian.Notice(`A note already exists at ${path}.`);
      return;
    }
    const content = this.renderNote(module2, draft);
    const file = await this.app.vault.create(path, content);
    await this.appendAudit(
      "note.created",
      `${MODULES[module2].label} note created: ${title}`,
      { module: module2, file: file.path }
    );
    await this.writeDashboardNote();
    await this.refreshConsoleViews();
    await this.app.workspace.getLeaf(true).openFile(file);
    new import_obsidian.Notice(`${MODULES[module2].entryLabel} created.`);
  }
  renderNote(module2, draft) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const frontmatter = {
      aigis_module: module2,
      title: draft.title,
      created_at: timestamp,
      updated_at: timestamp
    };
    for (const [key, value] of Object.entries(draft)) {
      if (key === "title" || value.trim() === "") {
        continue;
      }
      frontmatter[key] = value.trim();
    }
    const header = `# ${draft.title.trim()}

`;
    const noteFrontmatter = this.renderFrontmatter(frontmatter);
    switch (module2) {
      case "inventory":
        return `${noteFrontmatter}${header}## Overview

Describe the governed system, its scope, and why it exists.

## Governance Notes

- Data categories:
- Human review expectation:
- Linked policies:

## Operational Context

- Agent identifier:
- API or service endpoint:
- Dependencies:
`;
      case "prompts":
        return `${noteFrontmatter}${header}## Purpose

${draft.goal?.trim() || "Document what this prompt is intended to achieve and where it is allowed to run."}

## Prompt Body

Paste the governed prompt here.

## Review Notes

- Promotion criteria:
- Known edge cases:
- Linked inventory:
`;
      case "policies":
        return `${noteFrontmatter}${header}## Policy Statement

State the rule, prohibition, or control this policy establishes.

## Enforcement

- Applies to:
- Exceptions:
- Evidence required:

## Review History

- Drafted by:
- Approved by:
- Next review:
`;
      case "workflows":
        return `${noteFrontmatter}${header}## Workflow Summary

Describe the approved AI-assisted process and the required controls.

## Mermaid Diagram

\`\`\`mermaid
${draft.mermaid?.trim() || "graph TD\n    A[Draft] --> B[Review]"}
\`\`\`

## Oversight Notes

${draft.human_oversight?.trim() || "Record where human review is mandatory."}
`;
      case "skills":
        return `${noteFrontmatter}${header}## Capability Summary

Describe when this governed capability should be used.

## Method

Write the core instruction bundle or operating method here.

## Readiness Review

- Edge cases covered:
- Linked prompts:
- Linked workflows:
- Linked policies:
- Linked incidents:
`;
      case "incidents":
        return `${noteFrontmatter}${header}## Incident Summary

${draft.summary?.trim() || "Describe what happened, how it was detected, and what the impact was."}

## Investigation

- Detection time:
- Immediate containment:
- Root cause:

## Resolution

- Owner:
- Follow-up actions:
- Control changes required:
`;
    }
  }
  renderFrontmatter(fields) {
    const lines = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
    return `---
${lines.join("\n")}
---

`;
  }
  async ensureVaultStructure() {
    await this.ensureFolder(this.getRootFolder());
    const moduleEntries = Object.keys(MODULES);
    for (const module2 of moduleEntries) {
      await this.ensureFolder(this.getModuleFolder(module2));
    }
    await this.ensureFolder(this.getAuditFolder());
    await this.ensureFile(
      this.getAuditLogPath(),
      "# AIGIS Audit Log\n\nThis log is appended by the plugin for consequential actions.\n\n"
    );
    await this.ensureFile(
      this.getDashboardPath(),
      "# AIGIS Dashboard\n\nRun the bootstrap command to populate this dashboard.\n"
    );
    await this.ensureFile(
      (0, import_obsidian.normalizePath)(`${this.getRootFolder()}/${MANAGED_GUIDE_NAME}`),
      VAULT_MANUAL_CONTENT
    );
  }
  async ensureFolder(path) {
    if (!this.app.vault.getAbstractFileByPath(path)) {
      await this.app.vault.createFolder(path);
    }
  }
  async ensureFile(path, content) {
    if (!this.app.vault.getAbstractFileByPath(path)) {
      await this.app.vault.create(path, content);
    }
  }
  async writeDashboardNote() {
    const path = this.getDashboardPath();
    const content = await this.buildDashboardContent();
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian.TFile) {
      await this.app.vault.modify(existing, content);
      return;
    }
    await this.app.vault.create(path, content);
  }
  async buildDashboardContent() {
    const policyHeadlines = await this.getUpcomingPolicyReviewLines();
    const moduleEntries = Object.entries(MODULES);
    const lines = moduleEntries.map(([module2, definition]) => {
      const count = this.countModuleNotes(module2);
      return `- **${definition.label}:** ${count} note${count === 1 ? "" : "s"} in ${formatVaultMarkdownLink(this.getModuleFolder(module2))}`;
    });
    return [
      "# AIGIS Dashboard",
      "",
      "A stripped-down governance layer for this vault.",
      "",
      "## Module Counts",
      ...lines,
      "",
      "## Quick Links",
      `- ${formatVaultMarkdownLink(this.getAuditLogPath(), "Audit Log")}`,
      `- ${formatVaultMarkdownLink((0, import_obsidian.normalizePath)(`${this.getRootFolder()}/${MANAGED_GUIDE_NAME}`), "User Guide")}`,
      "",
      "## Upcoming Policy Reviews",
      ...policyHeadlines.length > 0 ? policyHeadlines : ["- No policy review dates found yet."],
      ""
    ].join("\n");
  }
  async getUpcomingPolicyReviewLines() {
    const folder = this.app.vault.getAbstractFileByPath(this.getModuleFolder("policies"));
    if (!(folder instanceof import_obsidian.TFolder)) {
      return [];
    }
    const datedPolicies = folder.children.filter((child) => child instanceof import_obsidian.TFile && child.extension === "md").map((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      const reviewDate = cache?.frontmatter?.review_date;
      return {
        file,
        reviewDate: typeof reviewDate === "string" ? reviewDate : ""
      };
    }).filter((entry) => entry.reviewDate !== "").sort((left, right) => left.reviewDate.localeCompare(right.reviewDate)).slice(0, 5);
    return datedPolicies.map((entry) => `- ${entry.reviewDate}: ${formatVaultMarkdownLink(entry.file.path, entry.file.basename)}`);
  }
  async openManagedNote(path) {
    const file = this.app.vault.getAbstractFileByPath((0, import_obsidian.normalizePath)(path));
    if (!(file instanceof import_obsidian.TFile)) {
      new import_obsidian.Notice(`Note not found: ${path}`);
      return;
    }
    await this.app.workspace.getLeaf(true).openFile(file);
  }
  async appendAudit(action, summary, metadata) {
    await this.ensureVaultStructure();
    const auditFile = this.app.vault.getAbstractFileByPath(this.getAuditLogPath());
    if (!(auditFile instanceof import_obsidian.TFile)) {
      return;
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const safeAction = sanitizeAuditValue(action);
    const safeSummary = sanitizeAuditValue(summary);
    const metadataLine = metadata ? ` | ${Object.entries(metadata).map(([key, value]) => `${sanitizeAuditValue(key)}=${sanitizeAuditValue(value)}`).join(", ")}` : "";
    await this.app.vault.append(auditFile, `- ${timestamp} | ${safeAction} | ${safeSummary}${metadataLine}
`);
  }
  countModuleNotes(module2) {
    const folder = this.app.vault.getAbstractFileByPath(this.getModuleFolder(module2));
    if (!(folder instanceof import_obsidian.TFolder)) {
      return 0;
    }
    return folder.children.filter((child) => child instanceof import_obsidian.TFile && child.extension === "md").length;
  }
  async refreshConsoleViews() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AIGIS_CONSOLE);
    await Promise.all(leaves.map(async (leaf) => {
      if (leaf.view instanceof AigisConsoleView) {
        await leaf.view.render();
      }
    }));
  }
  getRootFolder() {
    return sanitizeRelativeFolderPath(this.settings.rootFolder, DEFAULT_SETTINGS.rootFolder);
  }
  getAuditFolder() {
    return (0, import_obsidian.normalizePath)(`${this.getRootFolder()}/${sanitizeRelativeFolderPath(this.settings.auditFolderName, DEFAULT_SETTINGS.auditFolderName)}`);
  }
  getAuditLogPath() {
    return (0, import_obsidian.normalizePath)(`${this.getAuditFolder()}/Audit Log.md`);
  }
  getDashboardPath() {
    return (0, import_obsidian.normalizePath)(`${this.getRootFolder()}/${sanitizeDashboardNoteName(this.settings.dashboardNoteName, DEFAULT_SETTINGS.dashboardNoteName)}`);
  }
  getModuleFolder(module2) {
    return (0, import_obsidian.normalizePath)(`${this.getRootFolder()}/${MODULES[module2].folder}`);
  }
  isManagedPath(path) {
    return (0, import_obsidian.normalizePath)(path).startsWith(`${this.getRootFolder()}/`) || (0, import_obsidian.normalizePath)(path) === this.getRootFolder();
  }
  async toggleModuleVisibility(module2) {
    const idx = this.settings.hiddenModules.indexOf(module2);
    if (idx >= 0) {
      this.settings.hiddenModules.splice(idx, 1);
    } else {
      this.settings.hiddenModules.push(module2);
    }
    await this.saveSettings();
  }
};
var AigisConsoleView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_AIGIS_CONSOLE;
  }
  getDisplayText() {
    return "AIGIS Console";
  }
  getIcon() {
    return "shield";
  }
  async onOpen() {
    await this.render();
  }
  async render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("aigis-console-view");
    this.applyConsoleStyles(contentEl);
    const header = contentEl.createDiv({ cls: "aigis-console-header" });
    header.createEl("h2", { text: "AIGIS Console" });
    header.createEl("p", { text: "Governance note creation, counts, and quick links for this vault.", cls: "aigis-console-subtitle" });
    const grid = contentEl.createDiv({ cls: "aigis-console-grid" });
    const orderedVisible = this.plugin.settings.moduleOrder.filter((m) => !this.plugin.settings.hiddenModules.includes(m));
    for (const module2 of orderedVisible) {
      const definition = MODULES[module2];
      const card = grid.createDiv({ cls: "aigis-console-card" });
      const cardHeader = card.createDiv({ cls: "aigis-console-card-header" });
      cardHeader.createEl("h3", { text: definition.label, cls: "aigis-console-card-title" });
      cardHeader.createSpan({ cls: "aigis-console-count", text: String(this.plugin.countModuleNotes(module2)) });
      card.createEl("p", { text: definition.description, cls: "aigis-console-card-desc" });
      const createButton = card.createEl("button", { text: `Create ${definition.entryLabel}`, cls: "mod-cta aigis-console-create-btn" });
      const { btnBg, btnColor } = this.plugin.settings.consoleStyle;
      if (btnBg.trim()) createButton.style.backgroundColor = btnBg.trim();
      if (btnColor.trim()) createButton.style.color = btnColor.trim();
      createButton.addEventListener("click", () => void this.plugin.createModuleNote(module2));
    }
    const actions = contentEl.createDiv({ cls: "aigis-console-actions" });
    const bootstrapButton = actions.createEl("button", { text: "Bootstrap vault", cls: "aigis-console-action-btn" });
    bootstrapButton.addEventListener("click", () => void this.plugin.bootstrapWorkspace());
    const dashboardButton = actions.createEl("button", { text: "Open dashboard", cls: "aigis-console-action-btn" });
    dashboardButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getDashboardPath()));
    const auditButton = actions.createEl("button", { text: "Open audit log", cls: "aigis-console-action-btn" });
    auditButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getAuditLogPath()));
  }
  applyConsoleStyles(el) {
    const s = this.plugin.settings.consoleStyle;
    const set = (prop, val) => {
      if (val.trim()) el.style.setProperty(prop, val.trim());
      else el.style.removeProperty(prop);
    };
    set("--aigis-card-bg", s.cardBg);
    set("--aigis-card-padding", s.cardPadding);
    set("--aigis-card-border-color", s.cardBorderColor);
    set("--aigis-card-border-width", s.cardBorderWidth);
    set("--aigis-card-border-radius", s.cardBorderRadius);
    set("--aigis-title-font-size", s.titleFontSize);
    set("--aigis-title-color", s.titleColor);
    set("--aigis-count-font-size", s.countFontSize);
    set("--aigis-count-color", s.countColor);
    set("--aigis-desc-font-size", s.descFontSize);
    set("--aigis-desc-color", s.descColor);
    set("--aigis-btn-bg", s.btnBg);
    set("--aigis-btn-color", s.btnColor);
    set("--aigis-btn-font-size", s.btnFontSize);
  }
};
var EntryModal = class _EntryModal extends import_obsidian.Modal {
  constructor(app, definition, plugin, onResolve) {
    super(app);
    this.definition = definition;
    this.plugin = plugin;
    this.onResolve = onResolve;
    this.resolved = false;
    this.values = Object.fromEntries(
      definition.fields.map((field) => [field.key, field.defaultValue ?? ""])
    );
  }
  static open(app, definition, plugin) {
    return new Promise((resolve) => {
      const modal = new _EntryModal(app, definition, plugin, resolve);
      modal.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: `Create ${this.definition.entryLabel}` });
    const grid = contentEl.createDiv({ cls: "aigis-modal-grid" });
    for (const field of this.definition.fields) {
      const fieldEl = grid.createDiv({ cls: "aigis-modal-field" });
      fieldEl.createEl("label", { text: field.label });
      if (field.type === "textarea") {
        const textarea = fieldEl.createEl("textarea");
        textarea.value = this.values[field.key] ?? "";
        textarea.placeholder = field.placeholder ?? "";
        textarea.addEventListener("input", () => {
          this.values[field.key] = textarea.value;
        });
      } else if (field.type === "select") {
        const select = fieldEl.createEl("select");
        for (const [value, label] of Object.entries(field.options ?? {})) {
          const option = select.createEl("option", { text: label, value });
          option.value = value;
        }
        select.value = this.values[field.key] ?? Object.keys(field.options ?? {})[0] ?? "";
        select.addEventListener("change", () => {
          this.values[field.key] = select.value;
        });
      } else if (field.type === "managed-select" && field.listKey) {
        const listKey = field.listKey;
        const select = fieldEl.createEl("select");
        select.createEl("option", { text: "\u2014 Select \u2014", value: "" });
        for (const item of this.plugin.settings.customLists[listKey]) {
          select.createEl("option", { text: item, value: item });
        }
        select.createEl("option", { text: "\uFF0B Add new\u2026", value: "__add_new__" });
        select.value = this.values[field.key] ?? "";
        select.addEventListener("change", () => {
          void (async () => {
            if (select.value === "__add_new__") {
              const newVal = window.prompt(`Add a new ${field.label.toLowerCase()}:`);
              if (newVal?.trim()) {
                const trimmed = newVal.trim();
                const customList = this.plugin.settings.customLists[listKey];
                if (!customList.includes(trimmed)) {
                  customList.push(trimmed);
                  customList.sort();
                  await this.plugin.saveSettings();
                }
                select.empty();
                select.createEl("option", { text: "\u2014 Select \u2014", value: "" });
                for (const item of this.plugin.settings.customLists[listKey]) {
                  select.createEl("option", { text: item, value: item });
                }
                select.createEl("option", { text: "\uFF0B Add new\u2026", value: "__add_new__" });
                select.value = trimmed;
                this.values[field.key] = trimmed;
              } else {
                select.value = this.values[field.key] ?? "";
              }
            } else {
              this.values[field.key] = select.value;
            }
          })();
        });
      } else {
        const input = fieldEl.createEl("input", { type: field.type === "date" ? "date" : "text" });
        input.value = this.values[field.key] ?? "";
        input.placeholder = field.placeholder ?? "";
        input.addEventListener("input", () => {
          this.values[field.key] = input.value;
        });
      }
      if (field.helpText) {
        fieldEl.createEl("div", { cls: "aigis-modal-help", text: field.helpText });
      }
    }
    const footer = contentEl.createDiv({ cls: "aigis-modal-footer" });
    const cancelButton = footer.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => this.close());
    const submitButton = footer.createEl("button", { text: "Create" });
    submitButton.addClass("mod-cta");
    submitButton.addEventListener("click", () => this.submit());
  }
  onClose() {
    this.contentEl.empty();
    if (!this.resolved) {
      this.onResolve(null);
    }
  }
  submit() {
    const missingRequiredField = this.definition.fields.find((field) => field.required && !this.values[field.key]?.trim());
    if (missingRequiredField) {
      new import_obsidian.Notice(`${missingRequiredField.label} is required.`);
      return;
    }
    this.resolved = true;
    this.onResolve(this.values);
    this.close();
  }
};
var AigisSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "AIGIS Governance Settings" });
    new import_obsidian.Setting(containerEl).setName("Root folder").setDesc("Top-level folder the plugin manages inside the vault.").addText((text) => {
      text.setValue(this.plugin.settings.rootFolder);
      text.onChange(async (value) => {
        this.plugin.settings.rootFolder = value.trim() || DEFAULT_SETTINGS.rootFolder;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Audit folder").setDesc("Folder under the root where the append-only audit note is stored.").addText((text) => {
      text.setValue(this.plugin.settings.auditFolderName);
      text.onChange(async (value) => {
        this.plugin.settings.auditFolderName = value.trim() || DEFAULT_SETTINGS.auditFolderName;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Dashboard note").setDesc("Filename used for the generated dashboard inside the root folder.").addText((text) => {
      text.setValue(this.plugin.settings.dashboardNoteName);
      text.onChange(async (value) => {
        this.plugin.settings.dashboardNoteName = value.trim() || DEFAULT_SETTINGS.dashboardNoteName;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Auto-open console on startup").setDesc("Open the AIGIS side panel when the workspace loads.").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.autoOpenConsole);
      toggle.onChange(async (value) => {
        this.plugin.settings.autoOpenConsole = value;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: "Console visibility" });
    containerEl.createEl("p", {
      text: "Toggle which modules appear as cards in the AIGIS Console.",
      cls: "aigis-settings-desc"
    });
    const moduleEntries = Object.entries(MODULES);
    for (const [module2, definition] of moduleEntries) {
      new import_obsidian.Setting(containerEl).setName(definition.label).addToggle((toggle) => {
        toggle.setValue(!this.plugin.settings.hiddenModules.includes(module2));
        toggle.onChange(async (value) => {
          if (value) {
            this.plugin.settings.hiddenModules = this.plugin.settings.hiddenModules.filter((m) => m !== module2);
          } else if (!this.plugin.settings.hiddenModules.includes(module2)) {
            this.plugin.settings.hiddenModules.push(module2);
          }
          await this.plugin.saveSettings();
          await this.plugin.refreshConsoleViews();
        });
      });
    }
    containerEl.createEl("h3", { text: "Card order" });
    containerEl.createEl("p", {
      text: "Use the arrows to reorder the module cards in the console.",
      cls: "aigis-settings-desc"
    });
    const orderSection = containerEl.createDiv({ cls: "aigis-order-section" });
    const renderOrder = () => {
      orderSection.empty();
      const order = this.plugin.settings.moduleOrder;
      order.forEach((mod, idx) => {
        const row = orderSection.createDiv({ cls: "aigis-order-row" });
        row.createSpan({ text: MODULES[mod].label, cls: "aigis-order-label" });
        const btns = row.createDiv({ cls: "aigis-order-btns" });
        if (idx > 0) {
          const upBtn = btns.createEl("button", { text: "\u2191", cls: "aigis-order-btn" });
          upBtn.setAttribute("aria-label", "Move up");
          upBtn.addEventListener("click", async () => {
            [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
            await this.plugin.saveSettings();
            await this.plugin.refreshConsoleViews();
            renderOrder();
          });
        }
        if (idx < order.length - 1) {
          const downBtn = btns.createEl("button", { text: "\u2193", cls: "aigis-order-btn" });
          downBtn.setAttribute("aria-label", "Move down");
          downBtn.addEventListener("click", async () => {
            [order[idx + 1], order[idx]] = [order[idx], order[idx + 1]];
            await this.plugin.saveSettings();
            await this.plugin.refreshConsoleViews();
            renderOrder();
          });
        }
      });
    };
    renderOrder();
    containerEl.createEl("h3", { text: "Console appearance" });
    containerEl.createEl("p", {
      text: "Customize font sizes, colors, and borders. Leave blank to use the theme default.",
      cls: "aigis-settings-desc"
    });
    const styleFields = [
      { key: "cardBg", name: "Card background", desc: "CSS color, e.g. #1e2030", placeholder: "theme default" },
      { key: "cardPadding", name: "Card padding", desc: "CSS spacing, e.g. 0.9rem or 12px", placeholder: "0.9rem" },
      { key: "cardBorderColor", name: "Card border color", desc: "CSS color, e.g. #444", placeholder: "theme default" },
      { key: "cardBorderWidth", name: "Card border width", desc: "CSS length, e.g. 1px or 2px", placeholder: "1px" },
      { key: "cardBorderRadius", name: "Card border radius", desc: "CSS length, e.g. 12px or 0.5rem", placeholder: "12px" },
      { key: "titleFontSize", name: "Title font size", desc: "CSS font-size, e.g. 1rem or 14px", placeholder: "1rem" },
      { key: "titleColor", name: "Title color", desc: "CSS color, e.g. #fff", placeholder: "theme default" },
      { key: "countFontSize", name: "Count font size", desc: "The note count shown in each card header", placeholder: "1.1rem" },
      { key: "countColor", name: "Count color", desc: "CSS color, e.g. #aaa", placeholder: "theme default" },
      { key: "descFontSize", name: "Description font size", desc: "The module description text", placeholder: "0.85rem" },
      { key: "descColor", name: "Description color", desc: "CSS color", placeholder: "theme default" },
      { key: "btnBg", name: "Button color", desc: "CSS color for the create button background, e.g. #5c6bc0", placeholder: "theme default" },
      { key: "btnColor", name: "Button text color", desc: "CSS color for the create button text, e.g. #fff", placeholder: "theme default" },
      { key: "btnFontSize", name: "Button font size", desc: "Create button in each card", placeholder: "0.85rem" }
    ];
    for (const field of styleFields) {
      new import_obsidian.Setting(containerEl).setName(field.name).setDesc(field.desc).addText((text) => {
        text.setPlaceholder(field.placeholder);
        text.setValue(this.plugin.settings.consoleStyle[field.key]);
        text.onChange(async (value) => {
          this.plugin.settings.consoleStyle[field.key] = value;
          await this.plugin.saveSettings();
          await this.plugin.refreshConsoleViews();
        });
      });
    }
    new import_obsidian.Setting(containerEl).setName("Reset appearance to defaults").setDesc("Restore all console appearance settings to their default values.").addButton((btn) => {
      btn.setButtonText("Reset");
      btn.onClick(async () => {
        this.plugin.settings.consoleStyle = { ...DEFAULT_CONSOLE_STYLE };
        await this.plugin.saveSettings();
        await this.plugin.refreshConsoleViews();
        this.display();
      });
    });
    containerEl.createEl("h3", { text: "Manage dropdown lists" });
    containerEl.createEl("p", {
      text: "These lists populate vendor, model, and team fields in note creation forms.",
      cls: "aigis-settings-desc"
    });
    containerEl.createEl("h4", { text: "Vendors / Providers" });
    this.renderListManager(containerEl, "vendors", "e.g. OpenAI");
    containerEl.createEl("h4", { text: "Models" });
    this.renderListManager(containerEl, "models", "e.g. gpt-4.1");
    containerEl.createEl("h4", { text: "Teams" });
    this.renderListManager(containerEl, "teams", "e.g. AI Governance Office");
  }
  renderListManager(containerEl, listKey, placeholder) {
    const section = containerEl.createDiv({ cls: "aigis-list-manager" });
    const renderItems = () => {
      section.empty();
      const currentItems = this.plugin.settings.customLists[listKey];
      if (currentItems.length === 0) {
        section.createEl("p", { text: "No items yet.", cls: "aigis-list-empty" });
      } else {
        for (const item of [...currentItems]) {
          const row = section.createDiv({ cls: "aigis-list-row" });
          row.createSpan({ text: item });
          const removeBtn = row.createEl("button", { text: "Remove", cls: "aigis-list-remove-btn" });
          removeBtn.addEventListener("click", async () => {
            this.plugin.settings.customLists[listKey] = this.plugin.settings.customLists[listKey].filter((i) => i !== item);
            await this.plugin.saveSettings();
            renderItems();
          });
        }
      }
      const addRow = section.createDiv({ cls: "aigis-list-add-row" });
      const addInput = addRow.createEl("input", { type: "text", placeholder, cls: "aigis-list-input" });
      const addBtn = addRow.createEl("button", { text: "Add", cls: "aigis-list-add-btn" });
      const doAdd = async () => {
        const val = addInput.value.trim();
        if (!val) return;
        const list = this.plugin.settings.customLists[listKey];
        if (!list.includes(val)) {
          list.push(val);
          list.sort();
          await this.plugin.saveSettings();
        }
        renderItems();
      };
      addBtn.addEventListener("click", () => void doAdd());
      addInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          void doAdd();
        }
      });
    };
    renderItems();
  }
};
function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "untitled";
}
function sanitizeModuleList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const valid = value.filter((item) => ALL_MODULES.includes(item));
  return [...new Set(valid)];
}
function sanitizeModuleOrder(value) {
  const preferred = sanitizeModuleList(value);
  const remainder = ALL_MODULES.filter((module2) => !preferred.includes(module2));
  return preferred.length > 0 ? [...preferred, ...remainder] : [...ALL_MODULES];
}
function sanitizeRelativeFolderPath(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const segments = value.split(/[\\/]+/).map((segment) => segment.trim()).filter((segment) => segment !== "" && segment !== "." && segment !== "..");
  return segments.length > 0 ? (0, import_obsidian.normalizePath)(segments.join("/")) : fallback;
}
function sanitizeDashboardNoteName(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const collapsed = value.trim().replace(/[\\/]+/g, "-");
  const safe = collapsed.replace(/[^A-Za-z0-9._ -]+/g, "").trim();
  if (!safe) {
    return fallback;
  }
  return safe.toLowerCase().endsWith(".md") ? safe : `${safe}.md`;
}
function sanitizeAuditValue(value) {
  return String(value ?? "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").replace(/\|/g, "/").trim();
}
function normalizeCustomLists(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    vendors: normalizeStringArray(source.vendors, DEFAULT_SETTINGS.customLists.vendors),
    models: normalizeStringArray(source.models, DEFAULT_SETTINGS.customLists.models),
    teams: normalizeStringArray(source.teams, DEFAULT_SETTINGS.customLists.teams)
  };
}
function normalizeConsoleStyle(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    cardBg: normalizeConsoleStyleValue(source.cardBg, DEFAULT_CONSOLE_STYLE.cardBg),
    cardPadding: normalizeConsoleStyleValue(source.cardPadding, DEFAULT_CONSOLE_STYLE.cardPadding),
    cardBorderColor: normalizeConsoleStyleValue(source.cardBorderColor, DEFAULT_CONSOLE_STYLE.cardBorderColor),
    cardBorderWidth: normalizeConsoleStyleValue(source.cardBorderWidth, DEFAULT_CONSOLE_STYLE.cardBorderWidth),
    cardBorderRadius: normalizeConsoleStyleValue(source.cardBorderRadius, DEFAULT_CONSOLE_STYLE.cardBorderRadius),
    titleFontSize: normalizeConsoleStyleValue(source.titleFontSize, DEFAULT_CONSOLE_STYLE.titleFontSize),
    titleColor: normalizeConsoleStyleValue(source.titleColor, DEFAULT_CONSOLE_STYLE.titleColor),
    countFontSize: normalizeConsoleStyleValue(source.countFontSize, DEFAULT_CONSOLE_STYLE.countFontSize),
    countColor: normalizeConsoleStyleValue(source.countColor, DEFAULT_CONSOLE_STYLE.countColor),
    descFontSize: normalizeConsoleStyleValue(source.descFontSize, DEFAULT_CONSOLE_STYLE.descFontSize),
    descColor: normalizeConsoleStyleValue(source.descColor, DEFAULT_CONSOLE_STYLE.descColor),
    btnBg: normalizeConsoleStyleValue(source.btnBg, DEFAULT_CONSOLE_STYLE.btnBg),
    btnColor: normalizeConsoleStyleValue(source.btnColor, DEFAULT_CONSOLE_STYLE.btnColor),
    btnFontSize: normalizeConsoleStyleValue(source.btnFontSize, DEFAULT_CONSOLE_STYLE.btnFontSize)
  };
}
function normalizeStringArray(value, fallback) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter((item) => item !== "").filter((item, index, all) => all.indexOf(item) === index);
}
function normalizeConsoleStyleValue(value, fallback) {
  return typeof value === "string" ? value : fallback;
}
function formatVaultMarkdownLink(path, label) {
  const display = escapeMarkdownLinkText(label ?? path);
  const target = encodeVaultPath(path);
  return `[${display}](${target})`;
}
function escapeMarkdownLinkText(value) {
  return value.replace(/[\[\]]/g, (match) => `\\${match}`);
}
function encodeVaultPath(path) {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}
