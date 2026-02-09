Research a company for investment due diligence.

**MANDATORY**: Always use the orchestrator. Never launch research agents directly via Task tool without creating a workspace first and passing the path to every agent.

Load workflow:
@.claude/skills/Research/workflows/orchestrator.md

Research type: COMPANY
Target: $ARGUMENTS

Parse intensity from arguments: --quick, --standard (default), --deep

Apply cyber•Fund investment rubric throughout the research process.
