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
const MANAGED_GUIDE_NAME = "User Guide.md";

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

interface ConsoleStyle {
  cardBg: string;
  cardPadding: string;
  cardBorderColor: string;
  cardBorderWidth: string;
  cardBorderRadius: string;
  titleFontSize: string;
  titleColor: string;
  countFontSize: string;
  countColor: string;
  descFontSize: string;
  descColor: string;
  btnBg: string;
  btnColor: string;
  btnFontSize: string;
}

interface AigisSettings {
  rootFolder: string;
  auditFolderName: string;
  dashboardNoteName: string;
  autoOpenConsole: boolean;
  hiddenModules: ModuleKind[];
  moduleOrder: ModuleKind[];
  customLists: CustomLists;
  consoleStyle: ConsoleStyle;
}

type EntryDraft = Record<string, string>;

const ALL_MODULES: ModuleKind[] = ["inventory", "prompts", "policies", "workflows", "skills", "incidents"];

const DEFAULT_CONSOLE_STYLE: ConsoleStyle = {
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

const DEFAULT_SETTINGS: AigisSettings = {
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

const VAULT_MANUAL_CONTENT = `# AIGIS Governance User Guide

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
      rootFolder: sanitizeRelativeFolderPath(saved?.rootFolder, DEFAULT_SETTINGS.rootFolder),
      auditFolderName: sanitizeRelativeFolderPath(saved?.auditFolderName, DEFAULT_SETTINGS.auditFolderName),
      dashboardNoteName: sanitizeDashboardNoteName(saved?.dashboardNoteName, DEFAULT_SETTINGS.dashboardNoteName),
      hiddenModules: sanitizeModuleList(saved?.hiddenModules),
      moduleOrder: sanitizeModuleOrder(saved?.moduleOrder),
      customLists: normalizeCustomLists(saved?.customLists),
      consoleStyle: normalizeConsoleStyle(saved?.consoleStyle)
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
      normalizePath(`${this.getRootFolder()}/${MANAGED_GUIDE_NAME}`),
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
      return `- **${definition.label}:** ${count} note${count === 1 ? "" : "s"} in ${formatVaultMarkdownLink(this.getModuleFolder(module))}`;
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
      `- ${formatVaultMarkdownLink(normalizePath(`${this.getRootFolder()}/${MANAGED_GUIDE_NAME}`), "User Guide")}`,
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

    return datedPolicies.map((entry) => `- ${entry.reviewDate}: ${formatVaultMarkdownLink(entry.file.path, entry.file.basename)}`);
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
    const safeAction = sanitizeAuditValue(action);
    const safeSummary = sanitizeAuditValue(summary);
    const metadataLine = metadata
      ? ` | ${Object.entries(metadata)
        .map(([key, value]) => `${sanitizeAuditValue(key)}=${sanitizeAuditValue(value)}`)
        .join(", ")}`
      : "";
    await this.app.vault.append(auditFile, `- ${timestamp} | ${safeAction} | ${safeSummary}${metadataLine}\n`);
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
    return sanitizeRelativeFolderPath(this.settings.rootFolder, DEFAULT_SETTINGS.rootFolder);
  }

  getAuditFolder(): string {
    return normalizePath(`${this.getRootFolder()}/${sanitizeRelativeFolderPath(this.settings.auditFolderName, DEFAULT_SETTINGS.auditFolderName)}`);
  }

  getAuditLogPath(): string {
    return normalizePath(`${this.getAuditFolder()}/Audit Log.md`);
  }

  getDashboardPath(): string {
    return normalizePath(`${this.getRootFolder()}/${sanitizeDashboardNoteName(this.settings.dashboardNoteName, DEFAULT_SETTINGS.dashboardNoteName)}`);
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
    this.applyConsoleStyles(contentEl);

    const header = contentEl.createDiv({ cls: "aigis-console-header" });
    header.createEl("h2", { text: "AIGIS Console" });
    header.createEl("p", { text: "Governance note creation, counts, and quick links for this vault.", cls: "aigis-console-subtitle" });

    const grid = contentEl.createDiv({ cls: "aigis-console-grid" });
    const orderedVisible = this.plugin.settings.moduleOrder
      .filter((m) => !this.plugin.settings.hiddenModules.includes(m));

    for (const module of orderedVisible) {
      const definition = MODULES[module];
      const card = grid.createDiv({ cls: "aigis-console-card" });

      const cardHeader = card.createDiv({ cls: "aigis-console-card-header" });
      cardHeader.createEl("h3", { text: definition.label, cls: "aigis-console-card-title" });
      cardHeader.createSpan({ cls: "aigis-console-count", text: String(this.plugin.countModuleNotes(module)) });

      card.createEl("p", { text: definition.description, cls: "aigis-console-card-desc" });
      const createButton = card.createEl("button", { text: `Create ${definition.entryLabel}`, cls: "mod-cta aigis-console-create-btn" });
      const { btnBg, btnColor } = this.plugin.settings.consoleStyle;
      if (btnBg.trim()) createButton.style.backgroundColor = btnBg.trim();
      if (btnColor.trim()) createButton.style.color = btnColor.trim();
      createButton.addEventListener("click", () => void this.plugin.createModuleNote(module));
    }

    const actions = contentEl.createDiv({ cls: "aigis-console-actions" });

    const bootstrapButton = actions.createEl("button", { text: "Bootstrap vault", cls: "aigis-console-action-btn" });
    bootstrapButton.addEventListener("click", () => void this.plugin.bootstrapWorkspace());

    const dashboardButton = actions.createEl("button", { text: "Open dashboard", cls: "aigis-console-action-btn" });
    dashboardButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getDashboardPath()));

    const auditButton = actions.createEl("button", { text: "Open audit log", cls: "aigis-console-action-btn" });
    auditButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getAuditLogPath()));
  }

  private applyConsoleStyles(el: HTMLElement): void {
    const s = this.plugin.settings.consoleStyle;
    const set = (prop: string, val: string) => {
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
          const upBtn = btns.createEl("button", { text: "↑", cls: "aigis-order-btn" });
          upBtn.setAttribute("aria-label", "Move up");
          upBtn.addEventListener("click", async () => {
            [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
            await this.plugin.saveSettings();
            await this.plugin.refreshConsoleViews();
            renderOrder();
          });
        }
        if (idx < order.length - 1) {
          const downBtn = btns.createEl("button", { text: "↓", cls: "aigis-order-btn" });
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

    const styleFields: Array<{ key: keyof ConsoleStyle; name: string; desc: string; placeholder: string }> = [
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
      new Setting(containerEl)
        .setName(field.name)
        .setDesc(field.desc)
        .addText((text) => {
          text.setPlaceholder(field.placeholder);
          text.setValue(this.plugin.settings.consoleStyle[field.key]);
          text.onChange(async (value) => {
            this.plugin.settings.consoleStyle[field.key] = value;
            await this.plugin.saveSettings();
            await this.plugin.refreshConsoleViews();
          });
        });
    }

    new Setting(containerEl)
      .setName("Reset appearance to defaults")
      .setDesc("Restore all console appearance settings to their default values.")
      .addButton((btn) => {
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

function sanitizeModuleList(value: unknown): ModuleKind[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const valid = value.filter((item): item is ModuleKind => ALL_MODULES.includes(item as ModuleKind));
  return [...new Set(valid)];
}

function sanitizeModuleOrder(value: unknown): ModuleKind[] {
  const preferred = sanitizeModuleList(value);
  const remainder = ALL_MODULES.filter((module) => !preferred.includes(module));
  return preferred.length > 0 ? [...preferred, ...remainder] : [...ALL_MODULES];
}

function sanitizeRelativeFolderPath(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const segments = value
    .split(/[\\/]+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..");

  return segments.length > 0 ? normalizePath(segments.join("/")) : fallback;
}

function sanitizeDashboardNoteName(value: unknown, fallback: string): string {
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

function sanitizeAuditValue(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "/")
    .trim();
}

function normalizeCustomLists(value: unknown): CustomLists {
  const source = value && typeof value === "object" ? value as Partial<Record<CustomListKey, unknown>> : {};

  return {
    vendors: normalizeStringArray(source.vendors, DEFAULT_SETTINGS.customLists.vendors),
    models: normalizeStringArray(source.models, DEFAULT_SETTINGS.customLists.models),
    teams: normalizeStringArray(source.teams, DEFAULT_SETTINGS.customLists.teams)
  };
}

function normalizeConsoleStyle(value: unknown): ConsoleStyle {
  const source = value && typeof value === "object" ? value as Partial<Record<keyof ConsoleStyle, unknown>> : {};

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

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .filter((item, index, all) => all.indexOf(item) === index);
}

function normalizeConsoleStyleValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function formatVaultMarkdownLink(path: string, label?: string): string {
  const display = escapeMarkdownLinkText(label ?? path);
  const target = encodeVaultPath(path);
  return `[${display}](${target})`;
}

function escapeMarkdownLinkText(value: string): string {
  return value.replace(/[\[\]]/g, (match) => `\\${match}`);
}

function encodeVaultPath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment).replace(/[()]/g, (match) => (match === "(" ? "%28" : "%29")))
    .join("/");
}