# AIGIS Workspace

This folder is the managed governance workspace used by the plugin.

## Modules

- `Inventory` stores AI system records.
- `Prompts` stores governed prompt artifacts.
- `Policies` stores approval and review documents.
- `Workflows` stores Mermaid-backed process notes.
- `Skills` stores reusable governed capabilities.
- `Incidents` stores structured event records.
- `Audit` stores plugin-written action history.

## Notes

- Run `AIGIS: Bootstrap governance vault` after enabling the plugin to create any missing managed files.
- The dashboard quick links point to `Audit Log.md` and `User Guide.md`.
- The audit log is advisory and should not be treated as tamper-proof evidence.
