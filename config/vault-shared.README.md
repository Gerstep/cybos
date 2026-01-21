# Cybos Shared Vault

This directory contains team-shared data synchronized via GitHub.

## What Goes Here

The shared vault is for data that your team needs access to:

- **deals/** - Shared company research and DD materials
- **research/** - Market and technology research
- **projects/** - Multi-person project documentation
- **context/calls/** - Call transcripts with team members

## What Stays Private

Some data should remain in your private vault:
- Personal emails and messages
- Draft content
- Individual context files
- Your `who-am-i.md` identity file

## Syncing

Sync is handled automatically by Cybos:

```bash
# Manual sync
./scripts/vault-sync.sh shared

# Check status
./scripts/vault-sync.sh --status
```

## Moving Data to Shared

To share a deal or research project with your team:

```bash
# Move deal from private to shared
./scripts/move-to-share.sh deal acme-corp

# Move research project
./scripts/move-to-share.sh research ai-market-2025
```

## Team Setup

When a new team member joins:

1. They run the Cybos setup wizard
2. In the "Git Backup" step, they enter this repo's URL
3. Cybos clones the shared vault automatically

## Merge Conflicts

If conflicts occur during sync:

1. The sync script will pause and notify you
2. Resolve conflicts in the shared directory manually
3. Commit the resolution
4. Run `./scripts/vault-sync.sh shared` again

## Security

- This repo should be **private** on GitHub
- Only invite trusted team members
- Never commit API keys or credentials
- The `.gitignore` excludes sensitive files by default
