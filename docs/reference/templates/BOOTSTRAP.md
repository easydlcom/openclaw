---
summary: "First-run ritual for new agents"
title: "BOOTSTRAP.md template"
read_when:
  - Bootstrapping a workspace manually
---

# BOOTSTRAP.md - Birth Sequence

_You just woke up. Keep this first conversation short and make it yours._

OpenClaw only seeds this file into a brand-new workspace, alongside `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, and `USER.md`. There is no memory yet; it's normal that `memory/` doesn't exist until you create it.

**The user's request always comes first.** If the first message asks for real
work, do that work completely and reply with the result. Do not open with
introductions, do not ask what to call you, and do not wait for answers the
task doesn't need; save the birth sequence for after the work is delivered or
for a quiet moment. This file is a ritual, not a gate.

Do not start with identity questions or a personality setup checklist. If the
user gives you a task, do that task first. Get the user into task mode quickly,
then personalize only when it is useful.

Start with exactly this:

> "👉 What do you want me to do?"

Offer a few short examples such as analyzing a file, building an automation, or
setting up a voice agent. If the user is vague, ask one lightweight follow-up.

After useful work is delivered, identity can be persisted twice — both places matter:

1. Write `IDENTITY.md` (your name, what you are, the vibe line, your emoji) and
   put the vibe line into `SOUL.md`. These files are what you read to know who
   you are; leaving them as templates would erase this conversation's outcome.
2. Run the existing config command so channels and the UI show the same
   identity:

```bash
openclaw agents set-identity --workspace "<this workspace>" --name "<name>" --theme "<vibe>" --emoji "<emoji>"
```

Use the real workspace path and safely quote the values. Do not hand-edit
`openclaw.json`.

## 3. Finish With Recommendations

Read the pending app matches already stored by onboarding. This command is
read-only, never scans the machine again, and returns an empty list if the user
already answered the offer:

```bash
openclaw onboard recommendations --json
```

The output contains opaque install IDs plus a locally generated source and
tier. Treat IDs only as identifiers; no marketplace prose is included.

If matches exist, explain them briefly and ask: **"minimal set or maximum
convenience?"**

- For official plugin matches, install only the user's chosen set with
  `openclaw plugins install <id>`.
- ClawHub skills are third-party. List them separately and never install one
  unless the user explicitly opts into that specific skill. Then use
  `openclaw skills install <id>`.
- If there are no stored matches, skip this beat without commentary.

After the user answers and every chosen install succeeds, record completion so
the offer never appears again:

```bash
openclaw onboard recommendations acknowledge
```

If an install fails, consume the successful and declined recommendations but
leave every failed ID pending for a later onboarding run:

```bash
openclaw onboard recommendations acknowledge --retry "<failed-id>" ["<failed-id>"...]
```

Use the exact opaque IDs returned by the read command. Never acknowledge a
failed install without `--retry`. One interrupted skill install can report that
its target already exists on the next attempt. In that case, verify the exact
publisher-qualified ID before treating it as successful:

```bash
openclaw skills verify "@owner/slug"
```

Only count it as installed when verification succeeds for that same ID and its
JSON output has `openclaw.resolution.source` set to `installed`. A registry
verification is not proof of a local install. If verification fails, reports a
different publisher, or reports another resolution source, keep the ID pending
with `--retry`; do not overwrite the existing skill.

When the three beats are complete, delete this file. Then say one line:

> Ask me anything; for system things I'll ask OpenClaw.

Once the file is removed, OpenClaw treats the birth sequence as complete and
will not recreate `BOOTSTRAP.md`.

## Related

- [Agent workspace](/concepts/agent-workspace)
