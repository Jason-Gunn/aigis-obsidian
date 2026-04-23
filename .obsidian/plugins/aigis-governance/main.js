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
var DEFAULT_SETTINGS = {
  rootFolder: "AIGIS",
  auditFolderName: "Audit",
  dashboardNoteName: "Dashboard.md",
  autoOpenConsole: true
};
var MODULES = {
  inventory: {
    label: "Inventory",
    entryLabel: "Inventory record",
    folder: "Inventory",
    description: "Register models, agents, and governed AI systems.",
    fields: [
      { key: "title", label: "Record title", type: "text", required: true, placeholder: "Customer Support Agent" },
      { key: "vendor", label: "Vendor", type: "text", placeholder: "OpenAI" },
      { key: "model", label: "Model / version", type: "text", placeholder: "gpt-4.1" },
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
      { key: "owner", label: "Owner", type: "text", placeholder: "AI Governance Office" },
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
    description: "Track governed prompt artifacts and lifecycle stage.",
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
      { key: "provider", label: "Provider", type: "text", placeholder: "OpenAI" },
      { key: "target_model", label: "Target model", type: "text", placeholder: "gpt-4.1-mini" },
      { key: "owner", label: "Owner", type: "text", placeholder: "Prompt Engineering" },
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
      { key: "owner", label: "Owner", type: "text", placeholder: "Compliance Team" },
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
      { key: "owner", label: "Owner", type: "text", placeholder: "Product Operations" },
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
      { key: "team", label: "Owning team", type: "text", placeholder: "Customer Operations" },
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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
    const draft = await EntryModal.open(this.app, MODULES[module2]);
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
      return `- **${definition.label}:** ${count} note${count === 1 ? "" : "s"} in [[${this.getModuleFolder(module2)}]]`;
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
      `- [[${this.getAuditLogPath()}|Audit Log]]`,
      `- [[${this.getRootFolder()}/README|Workspace Guide]]`,
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
    return datedPolicies.map((entry) => `- ${entry.reviewDate}: [[${entry.file.path}|${entry.file.basename}]]`);
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
    const metadataLine = metadata ? ` | ${Object.entries(metadata).map(([key, value]) => `${key}=${value}`).join(", ")}` : "";
    await this.app.vault.append(auditFile, `- ${timestamp} | ${action} | ${summary}${metadataLine}
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
    return (0, import_obsidian.normalizePath)(this.settings.rootFolder);
  }
  getAuditFolder() {
    return (0, import_obsidian.normalizePath)(`${this.getRootFolder()}/${this.settings.auditFolderName}`);
  }
  getAuditLogPath() {
    return (0, import_obsidian.normalizePath)(`${this.getAuditFolder()}/Audit Log.md`);
  }
  getDashboardPath() {
    return (0, import_obsidian.normalizePath)(`${this.getRootFolder()}/${this.settings.dashboardNoteName}`);
  }
  getModuleFolder(module2) {
    return (0, import_obsidian.normalizePath)(`${this.getRootFolder()}/${MODULES[module2].folder}`);
  }
  isManagedPath(path) {
    return (0, import_obsidian.normalizePath)(path).startsWith(`${this.getRootFolder()}/`) || (0, import_obsidian.normalizePath)(path) === this.getRootFolder();
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
    const header = contentEl.createDiv({ cls: "aigis-console-header" });
    header.createEl("h2", { text: "AIGIS Console" });
    header.createEl("p", { text: "Governance note creation, counts, and quick links for this vault." });
    const actions = contentEl.createDiv({ cls: "aigis-console-actions" });
    const bootstrapButton = actions.createEl("button", { text: "Bootstrap vault" });
    bootstrapButton.addEventListener("click", () => void this.plugin.bootstrapWorkspace());
    const dashboardButton = actions.createEl("button", { text: "Open dashboard" });
    dashboardButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getDashboardPath()));
    const auditButton = actions.createEl("button", { text: "Open audit log" });
    auditButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getAuditLogPath()));
    const grid = contentEl.createDiv({ cls: "aigis-console-grid" });
    const entries = Object.entries(MODULES);
    for (const [module2, definition] of entries) {
      const card = grid.createDiv({ cls: "aigis-console-card" });
      card.createEl("h3", { text: definition.label });
      card.createEl("p", { text: definition.description });
      card.createSpan({ cls: "aigis-console-count", text: String(this.plugin.countModuleNotes(module2)) });
      const folderLinkList = card.createEl("ul");
      folderLinkList.createEl("li", { text: `Folder: ${this.plugin.getModuleFolder(module2)}` });
      folderLinkList.createEl("li", { text: `Create a new ${definition.entryLabel.toLowerCase()} from here.` });
      const createButton = card.createEl("button", { text: `Create ${definition.entryLabel}` });
      createButton.addEventListener("click", () => void this.plugin.createModuleNote(module2));
    }
  }
};
var EntryModal = class _EntryModal extends import_obsidian.Modal {
  constructor(app, definition, onResolve) {
    super(app);
    this.definition = definition;
    this.onResolve = onResolve;
    this.resolved = false;
    this.values = Object.fromEntries(
      definition.fields.map((field) => [field.key, field.defaultValue ?? ""])
    );
  }
  static open(app, definition) {
    return new Promise((resolve) => {
      const modal = new _EntryModal(app, definition, resolve);
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
  }
};
function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "untitled";
}
