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
type FieldType = "text" | "textarea" | "select" | "date";

interface EntryField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  options?: Record<string, string>;
}

interface ModuleDefinition {
  label: string;
  entryLabel: string;
  folder: string;
  description: string;
  fields: EntryField[];
}

interface AigisSettings {
  rootFolder: string;
  auditFolderName: string;
  dashboardNoteName: string;
  autoOpenConsole: boolean;
}

type EntryDraft = Record<string, string>;

const DEFAULT_SETTINGS: AigisSettings = {
  rootFolder: "AIGIS",
  auditFolderName: "Audit",
  dashboardNoteName: "Dashboard.md",
  autoOpenConsole: true
};

const MODULES: Record<ModuleKind, ModuleDefinition> = {
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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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

    const draft = await EntryModal.open(this.app, MODULES[module]);
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
    header.createEl("p", { text: "Governance note creation, counts, and quick links for this vault." });

    const actions = contentEl.createDiv({ cls: "aigis-console-actions" });

    const bootstrapButton = actions.createEl("button", { text: "Bootstrap vault" });
    bootstrapButton.addEventListener("click", () => void this.plugin.bootstrapWorkspace());

    const dashboardButton = actions.createEl("button", { text: "Open dashboard" });
    dashboardButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getDashboardPath()));

    const auditButton = actions.createEl("button", { text: "Open audit log" });
    auditButton.addEventListener("click", () => void this.plugin.openManagedNote(this.plugin.getAuditLogPath()));

    const grid = contentEl.createDiv({ cls: "aigis-console-grid" });
    const entries = Object.entries(MODULES) as Array<[ModuleKind, ModuleDefinition]>;

    for (const [module, definition] of entries) {
      const card = grid.createDiv({ cls: "aigis-console-card" });
      card.createEl("h3", { text: definition.label });
      card.createEl("p", { text: definition.description });
      card.createSpan({ cls: "aigis-console-count", text: String(this.plugin.countModuleNotes(module)) });

      const folderLinkList = card.createEl("ul");
      folderLinkList.createEl("li", { text: `Folder: ${this.plugin.getModuleFolder(module)}` });
      folderLinkList.createEl("li", { text: `Create a new ${definition.entryLabel.toLowerCase()} from here.` });

      const createButton = card.createEl("button", { text: `Create ${definition.entryLabel}` });
      createButton.addEventListener("click", () => void this.plugin.createModuleNote(module));
    }
  }
}

class EntryModal extends Modal {
  private readonly values: EntryDraft;
  private resolved = false;

  private constructor(
    app: App,
    private readonly definition: ModuleDefinition,
    private readonly onResolve: (value: EntryDraft | null) => void
  ) {
    super(app);
    this.values = Object.fromEntries(
      definition.fields.map((field) => [field.key, field.defaultValue ?? ""])
    );
  }

  static open(app: App, definition: ModuleDefinition): Promise<EntryDraft | null> {
    return new Promise((resolve) => {
      const modal = new EntryModal(app, definition, resolve);
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