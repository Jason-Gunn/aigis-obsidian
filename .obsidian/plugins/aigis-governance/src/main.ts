import {
  App,
  ItemView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TFile,
  TFolder,
  WorkspaceLeaf,
  normalizePath
} from "obsidian";

const VIEW_TYPE_AIGIS_CONSOLE = "aigis-console";

type ModuleKind = "inventory" | "prompts" | "policies" | "workflows" | "skills" | "incidents";
type FieldType = "text" | "textarea" | "select" | "managed-select" | "date";
type CustomListKey = "vendors" | "models" | "teams";

interface EntryField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  options?: Record<string, string>;
  listKey?: CustomListKey;
}

interface ModuleDefinition {
  label: string;
  entryLabel: string;
  folder: string;
  description: string;
  fields: EntryField[];
}

interface CustomLists {
  vendors: string[];
  models: string[];
  teams: string[];
}

interface AigisSettings {
  rootFolder: string;
  auditFolderName: string;
  dashboardNoteName: string;
  autoOpenConsole: boolean;
  hiddenModules: ModuleKind[];
  customLists: CustomLists;
}

type EntryDraft = Record<string, string>;

const DEFAULT_SETTINGS: AigisSettings = {
  rootFolder: "AIGIS",
  auditFolderName: "Audit",
  dashboardNoteName: "Dashboard.md",
  autoOpenConsole: true,
  hiddenModules: [],
  customLists: {
    vendors: ["Anthropic", "Cohere", "Google DeepMind", "Meta", "Mistral AI", "OpenAI"],
    models: ["claude-opus-4", "claude-sonnet-4", "gemini-2.0-flash", "gpt-4.1", "gpt-4o", "llama3:8b", "o3"],
    teams: ["AI Governance Office", "Compliance", "Engineering", "Product Operations"]
  }
};

const MODULES: Record<ModuleKind, ModuleDefinition> = {
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

const VAULT_MANUAL_CONTENT = `# AIGIS Governance — User Guide

> A structured AI governance layer. Register AI systems, manage prompts and policies, document workflows, store governed skills, and track incidents — all as Markdown notes.

---

## Quick Start

1. Open the command palette (\`Ctrl/Cmd + P\`)
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

\`AIGIS/Audit/Audit Log.md\` is append-only. The plugin writes a timestamped line for every note created and every bootstrap. Do not delete lines from this file manually.

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
| Root folder | \`AIGIS\` | Top-level vault folder the plugin manages |
| Audit folder | \`Audit\` | Sub-folder for the audit log |
| Dashboard note | \`Dashboard.md\` | Auto-generated dashboard filename |
| Auto-open console | on | Open side panel on startup |
| Console visibility | — | Toggle which modules appear in the console |
| Manage dropdown lists | — | Add/remove vendors, models, and teams |
`;

export default class AigisGovernancePlugin extends Plugin {
  settings!: AigisSettings;

  async onload(): Promise<void> {
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

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_AIGIS_CONSOLE);
  }

  private addModuleCommands(): void {
    const entries = Object.entries(MODULES) as Array<[ModuleKind, ModuleDefinition]>;

    for (const [module, definition] of entries) {
      this.addCommand({
        id: `aigis-create-${module}`,
        name: `Create ${definition.entryLabel} note`,
        callback: async () => {
          await this.createModuleNote(module);
        }
      });
    }
  }

  private registerVaultEvents(): void {
    this.registerEvent(this.app.vault.on("create", (file) => void this.handleVaultMutation(file)));
    this.registerEvent(this.app.vault.on("delete", (file) => void this.handleVaultMutation(file)));
    this.registerEvent(this.app.vault.on("rename", (file) => void this.handleVaultMutation(file)));
  }

  private async handleVaultMutation(file: TAbstractFile): Promise<void> {
    if (!this.isManagedPath(file.path)) {
      return;
    }

    await this.writeDashboardNote();
    await this.refreshConsoleViews();
  }

  async loadSettings(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saved: any = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...saved,
      hiddenModules: Array.isArray(saved?.hiddenModules) ? saved.hiddenModules : [],
      customLists: {
        ...DEFAULT_SETTINGS.customLists,
        ...(saved?.customLists ?? {})
      }
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async bootstrapWorkspace(): Promise<void> {
    await this.ensureVaultStructure();
    await this.writeDashboardNote();
    await this.appendAudit("vault.bootstrap", "AIGIS governance vault bootstrapped.");
    await this.refreshConsoleViews();
    new Notice("AIGIS governance vault is ready.");
  }

  async activateConsole(): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_AIGIS_CONSOLE)[0];

    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_AIGIS_CONSOLE, active: true });
    }

    this.app.workspace.revealLeaf(leaf);
  }

  async createModuleNote(module: ModuleKind): Promise<void> {
    await this.ensureVaultStructure();

    const draft = await EntryModal.open(this.app, MODULES[module], this);
    if (!draft) {
      return;
    }

    const title = draft.title.trim();
    const fileName = `${slugify(title)}.md`;
    const path = normalizePath(`${this.getModuleFolder(module)}/${fileName}`);

    if (this.app.vault.getAbstractFileByPath(path)) {
      new Notice(`A note already exists at ${path}.`);
      return;
    }

    const content = this.renderNote(module, draft);
    const file = await this.app.vault.create(path, content);

    await this.appendAudit(
      "note.created",
      `${MODULES[module].label} note created: ${title}`,
      { module, file: file.path }
    );
    await this.writeDashboardNote();
    await this.refreshConsoleViews();

    await this.app.workspace.getLeaf(true).openFile(file);
    new Notice(`${MODULES[module].entryLabel} created.`);
  }

  private renderNote(module: ModuleKind, draft: EntryDraft): string {
    const timestamp = new Date().toISOString();
    const frontmatter: Record<string, string> = {
      aigis_module: module,
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

    const header = `# ${draft.title.trim()}\n\n`;
    const noteFrontmatter = this.renderFrontmatter(frontmatter);

    switch (module) {
      case "inventory":
        return `${noteFrontmatter}${header}## Overview\n\nDescribe the governed system, its scope, and why it exists.\n\n## Governance Notes\n\n- Data categories:\n- Human review expectation:\n- Linked policies:\n\n## Operational Context\n\n- Agent identifier:\n- API or service endpoint:\n- Dependencies:\n`;
      case "prompts":
        return `${noteFrontmatter}${header}## Purpose\n\n${draft.goal?.trim() || "Document what this prompt is intended to achieve and where it is allowed to run."}\n\n## Prompt Body\n\nPaste the governed prompt here.\n\n## Review Notes\n\n- Promotion criteria:\n- Known edge cases:\n- Linked inventory:\n`;
      case "policies":
        return `${noteFrontmatter}${header}## Policy Statement\n\nState the rule, prohibition, or control this policy establishes.\n\n## Enforcement\n\n- Applies to:\n- Exceptions:\n- Evidence required:\n\n## Review History\n\n- Drafted by:\n- Approved by:\n- Next review:\n`;
      case "workflows":
        return `${noteFrontmatter}${header}## Workflow Summary\n\nDescribe the approved AI-assisted process and the required controls.\n\n## Mermaid Diagram\n\n\`\`\`mermaid\n${draft.mermaid?.trim() || "graph TD\n    A[Draft] --> B[Review]"}\n\`\`\`\n\n## Oversight Notes\n\n${draft.human_oversight?.trim() || "Record where human review is mandatory."}\n`;
      case "skills":
        return `${noteFrontmatter}${header}## Capability Summary\n\nDescribe when this governed capability should be used.\n\n## Method\n\nWrite the core instruction bundle or operating method here.\n\n## Readiness Review\n\n- Edge cases covered:\n- Linked prompts:\n- Linked workflows:\n- Linked policies:\n- Linked incidents:\n`;
      case "incidents":
        return `${noteFrontmatter}${header}## Incident Summary\n\n${draft.summary?.trim() || "Describe what happened, how it was detected, and what the impact was."}\n\n## Investigation\n\n- Detection time:\n- Immediate containment:\n- Root cause:\n\n## Resolution\n\n- Owner:\n- Follow-up actions:\n- Control changes required:\n`;
    }
  }

  private renderFrontmatter(fields: Record<string, string>): string {
    const lines = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
    return `---\n${lines.join("\n")}\n---\n\n`;
  }

  async ensureVaultStructure(): Promise<void> {
    await this.ensureFolder(this.getRootFolder());

    const moduleEntries = Object.keys(MODULES) as ModuleKind[];
    for (const module of moduleEntries) {
      await this.ensureFolder(this.getModuleFolder(module));
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
      normalizePath(`${this.getRootFolder()}/User Guide.md`),
      VAULT_MANUAL_CONTENT
    );
  }

  private async ensureFolder(path: string): Promise<void> {
    if (!this.app.vault.getAbstractFileByPath(path)) {
      await this.app.vault.createFolder(path);
    }
  }

  private async ensureFile(path: string, content: string): Promise<void> {
    if (!this.app.vault.getAbstractFileByPath(path)) {
      await this.app.vault.create(path, content);
    }
  }

  async writeDashboardNote(): Promise<void> {
    const path = this.getDashboardPath();
    const content = await this.buildDashboardContent();
    const existing = this.app.vault.getAbstractFileByPath(path);

    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, content);
      return;
    }

    await this.app.vault.create(path, content);
  }

  private async buildDashboardContent(): Promise<string> {
    const policyHeadlines = await this.getUpcomingPolicyReviewLines();
    const moduleEntries = Object.entries(MODULES) as Array<[ModuleKind, ModuleDefinition]>;
    const lines = moduleEntries.map(([module, definition]) => {
      const count = this.countModuleNotes(module);
      return `- **${definition.label}:** ${count} note${count === 1 ? "" : "s"} in [[${this.getModuleFolder(module)}]]`;
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
      ...(policyHeadlines.length > 0 ? policyHeadlines : ["- No policy review dates found yet."]),
      ""
    ].join("\n");
  }

  private async getUpcomingPolicyReviewLines(): Promise<string[]> {
    const folder = this.app.vault.getAbstractFileByPath(this.getModuleFolder("policies"));
    if (!(folder instanceof TFolder)) {
      return [];
    }

    const datedPolicies = folder.children
      .filter((child): child is TFile => child instanceof TFile && child.extension === "md")
      .map((file) => {
        const cache = this.app.metadataCache.getFileCache(file);
        const reviewDate = cache?.frontmatter?.review_date;

        return {
          file,
          reviewDate: typeof reviewDate === "string" ? reviewDate : ""
        };
      })
      .filter((entry) => entry.reviewDate !== "")
      .sort((left, right) => left.reviewDate.localeCompare(right.reviewDate))
      .slice(0, 5);

    return datedPolicies.map((entry) => `- ${entry.reviewDate}: [[${entry.file.path}|${entry.file.basename}]]`);
  }

  async openManagedNote(path: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
    if (!(file instanceof TFile)) {
      new Notice(`Note not found: ${path}`);
      return;
    }

    await this.app.workspace.getLeaf(true).openFile(file);
  }

  async appendAudit(action: string, summary: string, metadata?: Record<string, string>): Promise<void> {
    await this.ensureVaultStructure();
    const auditFile = this.app.vault.getAbstractFileByPath(this.getAuditLogPath());

    if (!(auditFile instanceof TFile)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const metadataLine = metadata ? ` | ${Object.entries(metadata).map(([key, value]) => `${key}=${value}`).join(", ")}` : "";
    await this.app.vault.append(auditFile, `- ${timestamp} | ${action} | ${summary}${metadataLine}\n`);
  }

  countModuleNotes(module: ModuleKind): number {
    const folder = this.app.vault.getAbstractFileByPath(this.getModuleFolder(module));
    if (!(folder instanceof TFolder)) {
      return 0;
    }

    return folder.children.filter((child) => child instanceof TFile && child.extension === "md").length;
  }

  async refreshConsoleViews(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AIGIS_CONSOLE);
    await Promise.all(leaves.map(async (leaf) => {
      if (leaf.view instanceof AigisConsoleView) {
        await leaf.view.render();
      }
    }));
  }

  getRootFolder(): string {
    return normalizePath(this.settings.rootFolder);
  }

  getAuditFolder(): string {
    return normalizePath(`${this.getRootFolder()}/${this.settings.auditFolderName}`);
  }

  getAuditLogPath(): string {
    return normalizePath(`${this.getAuditFolder()}/Audit Log.md`);
  }

  getDashboardPath(): string {
    return normalizePath(`${this.getRootFolder()}/${this.settings.dashboardNoteName}`);
  }

  getModuleFolder(module: ModuleKind): string {
    return normalizePath(`${this.getRootFolder()}/${MODULES[module].folder}`);
  }

  isManagedPath(path: string): boolean {
    return normalizePath(path).startsWith(`${this.getRootFolder()}/`) || normalizePath(path) === this.getRootFolder();
  }

  async toggleModuleVisibility(module: ModuleKind): Promise<void> {
    const idx = this.settings.hiddenModules.indexOf(module);
    if (idx >= 0) {
      this.settings.hiddenModules.splice(idx, 1);
    } else {
      this.settings.hiddenModules.push(module);
    }
    await this.saveSettings();
  }
}

class AigisConsoleView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private readonly plugin: AigisGovernancePlugin) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_AIGIS_CONSOLE;
  }

  getDisplayText(): string {
    return "AIGIS Console";
  }

  getIcon(): string {
    return "shield";
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async render(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("aigis-console-view");

    const header = contentEl.createDiv({ cls: "aigis-console-header" });
    header.createEl("h2", { text: "AIGIS Console" });
    header.createEl("p", { text: "Governance note creation, counts, and quick links for this vault.", cls: "aigis-console-subtitle" });

    const grid = contentEl.createDiv({ cls: "aigis-console-grid" });
    const entries = Object.entries(MODULES) as Array<[ModuleKind, ModuleDefinition]>;

    for (const [module, definition] of entries) {
      const isHidden = this.plugin.settings.hiddenModules.includes(module);
      const card = grid.createDiv({ cls: `aigis-console-card${isHidden ? " aigis-console-card--hidden" : ""}` });

      const cardHeader = card.createDiv({ cls: "aigis-console-card-header" });
      cardHeader.createEl("h3", { text: definition.label });

      const toggleBtn = cardHeader.createEl("button", { cls: "aigis-console-card-toggle" });
      toggleBtn.setAttribute("aria-label", isHidden ? "Show module" : "Hide module");
      toggleBtn.setAttribute("title", isHidden ? "Show" : "Hide");
      toggleBtn.innerHTML = isHidden
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

      toggleBtn.addEventListener("click", async () => {
        await this.plugin.toggleModuleVisibility(module);
        await this.render();
      });

      if (!isHidden) {
        card.createEl("p", { text: definition.description, cls: "aigis-console-card-desc" });
        card.createSpan({ cls: "aigis-console-count", text: String(this.plugin.countModuleNotes(module)) });
        const createButton = card.createEl("button", { text: `Create ${definition.entryLabel}`, cls: "mod-cta aigis-console-create-btn" });
        createButton.addEventListener("click", () => void this.plugin.createModuleNote(module));
      }
    }

    const actions = contentEl.createDiv({ cls: "aigis-console-actions" });

    const bootstrapButton = actions.createEl("button", { text: "Bootstrap vault", cls: "aigis-console-action-btn" });
    bootstrapButton.addEventListener("click", () => void this.plugin.bootstrapWorkspace());

    const dashboardButton = actions.createEl("button", { text: "Open dashboard", cls: "aigis-console-action-btn" });
    dashboardButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getDashboardPath()));

    const auditButton = actions.createEl("button", { text: "Open audit log", cls: "aigis-console-action-btn" });
    auditButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getAuditLogPath()));
  }
}

class EntryModal extends Modal {
  private readonly values: EntryDraft;
  private resolved = false;

  private constructor(
    app: App,
    private readonly definition: ModuleDefinition,
    private readonly plugin: AigisGovernancePlugin,
    private readonly onResolve: (value: EntryDraft | null) => void
  ) {
    super(app);
    this.values = Object.fromEntries(
      definition.fields.map((field) => [field.key, field.defaultValue ?? ""])
    );
  }

  static open(app: App, definition: ModuleDefinition, plugin: AigisGovernancePlugin): Promise<EntryDraft | null> {
    return new Promise((resolve) => {
      const modal = new EntryModal(app, definition, plugin, resolve);
      modal.open();
    });
  }

  onOpen(): void {
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
        select.createEl("option", { text: "\uff0b Add new\u2026", value: "__add_new__" });
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
                select.createEl("option", { text: "\uff0b Add new\u2026", value: "__add_new__" });
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

  onClose(): void {
    this.contentEl.empty();

    if (!this.resolved) {
      this.onResolve(null);
    }
  }

  private submit(): void {
    const missingRequiredField = this.definition.fields.find((field) => field.required && !this.values[field.key]?.trim());
    if (missingRequiredField) {
      new Notice(`${missingRequiredField.label} is required.`);
      return;
    }

    this.resolved = true;
    this.onResolve(this.values);
    this.close();
  }
}

class AigisSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: AigisGovernancePlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "AIGIS Governance Settings" });

    new Setting(containerEl)
      .setName("Root folder")
      .setDesc("Top-level folder the plugin manages inside the vault.")
      .addText((text) => {
        text.setValue(this.plugin.settings.rootFolder);
        text.onChange(async (value) => {
          this.plugin.settings.rootFolder = value.trim() || DEFAULT_SETTINGS.rootFolder;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Audit folder")
      .setDesc("Folder under the root where the append-only audit note is stored.")
      .addText((text) => {
        text.setValue(this.plugin.settings.auditFolderName);
        text.onChange(async (value) => {
          this.plugin.settings.auditFolderName = value.trim() || DEFAULT_SETTINGS.auditFolderName;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Dashboard note")
      .setDesc("Filename used for the generated dashboard inside the root folder.")
      .addText((text) => {
        text.setValue(this.plugin.settings.dashboardNoteName);
        text.onChange(async (value) => {
          this.plugin.settings.dashboardNoteName = value.trim() || DEFAULT_SETTINGS.dashboardNoteName;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Auto-open console on startup")
      .setDesc("Open the AIGIS side panel when the workspace loads.")
      .addToggle((toggle) => {
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

    const moduleEntries = Object.entries(MODULES) as Array<[ModuleKind, ModuleDefinition]>;
    for (const [module, definition] of moduleEntries) {
      new Setting(containerEl)
        .setName(definition.label)
        .addToggle((toggle) => {
          toggle.setValue(!this.plugin.settings.hiddenModules.includes(module));
          toggle.onChange(async (value) => {
            if (value) {
              this.plugin.settings.hiddenModules = this.plugin.settings.hiddenModules.filter((m) => m !== module);
            } else if (!this.plugin.settings.hiddenModules.includes(module)) {
              this.plugin.settings.hiddenModules.push(module);
            }
            await this.plugin.saveSettings();
            await this.plugin.refreshConsoleViews();
          });
        });
    }

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

  private renderListManager(containerEl: HTMLElement, listKey: CustomListKey, placeholder: string): void {
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
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}