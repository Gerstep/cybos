# Asana MCP Integration Plan (Draft)

## Goal
Enable Claude to list Asana projects on request using MCP with the @roychri/mcp-server-asana server.

## Plan
1. Add an Asana MCP server entry in `.claude/.mcp.json` with `ASANA_ACCESS_TOKEN` and optional `READ_ONLY_MODE=true` for safe testing.
2. Create a workflow file under `.claude/skills/Asana/workflows/` that:
   - Calls `asana_list_workspaces` to fetch workspace(s)
   - If multiple workspaces are returned, prompts for selection
   - Calls `asana_search_projects` with `name_pattern: ".*"` and `archived: false`
   - Uses `opt_fields` to return `name`, `gid`, and `workspace`
3. (Optional later) Add a slash command to invoke the workflow, e.g., `/cyber-asana-projects`.
4. Validate: run the workflow and confirm it lists project name + GID.

## Notes
- The @roychri server supports project/task read + create/update, but does not include attachment download tools.
- If attachment downloads become required, revisit server choice or add a small TS wrapper.
