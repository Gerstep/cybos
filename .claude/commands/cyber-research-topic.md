Research a topic (idea, narrative, or person) for content creation or investment thesis.

**MANDATORY**: Always use the orchestrator. Never launch research agents directly via Task tool without creating a workspace first and passing the path to every agent.

Load workflow:
@.claude/skills/Research/workflows/orchestrator.md

Research type: Infer from context:
- TOPIC-CONTENT: For essays, tweets, content (uses content-researcher)
- TOPIC-INVESTMENT: For investment thesis (uses investment-researcher)

Target: $ARGUMENTS

Parse intensity from arguments: --quick, --standard (default), --deep

If purpose is unclear, ask user whether research is for content creation or investment analysis.
