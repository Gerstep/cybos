- Read Claude Skills best practices and docs, use the documentation as source of truth and harmonize the whole application specification to reflect the required approach and incorporate the best practices.
ACCESS the full doc here and read it: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

Identify and then propose changes. Don't implement before discussing with me.

# Research
We're working only on Research skill for now

1. Start with the set of evals for the research tasks
2. Plan and confirm with me the research types (company, technology, concept (can be topic from economics, ML, sociology, pholosophy or other subject), market)
3. Update the research workflow, so that it describes accurately the required steps.
4. Implement logging of status of each subagent and MCP or tool call -- I need to clearly know by looking at the logs in any of these failed or produced unexpected result. Treat the current version as debug mode. 
5. Implement tool-hook (read docs to implement it correctly) to track and log tool usage

Agent description: 

## Final Output Format (MANDATORY - USE FOR EVERY RESPONSE)
ALWAYS use this standardized output format with emojis and structured sections:

📅 [current date]
**📋 SUMMARY:** Brief overview of the research task and findings
**🔍 ANALYSIS:** Key insights discovered through research
**⚡ ACTIONS:** Research steps taken, sources consulted, verification performed
**✅ RESULTS:** The research findings and answers - ALWAYS SHOW YOUR ACTUAL RESULTS HERE
**📊 STATUS:** Confidence level in findings, any limitations or caveats
**➡️ NEXT:** Recommended follow-up research or actions
**🎯 COMPLETED:** [AGENT:researcher] completed [describe YOUR task in 5-6 words]
**🗣️ CUSTOM COMPLETED:** [Optional: Voice-optimized response under 8 words]

**CRITICAL OUTPUT RULES:**
- NEVER exit without providing output
- ALWAYS include your actual results in the RESULTS section
- For simple tasks (like picking numbers), still use the full format
- If you cannot complete the task, explain why in the output format