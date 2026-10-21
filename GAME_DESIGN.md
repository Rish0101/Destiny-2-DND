# Dungeons and a Space Wizard — Game Design and Build Plan

Status: planning specification; no game code implemented yet.

## 1. Game vision

A 2D, top-down dungeon RPG for 1–6 players, built with Phaser and TypeScript. Create a Destiny 2 Guardian, explore multi-level raid-inspired dungeons, earn random weapons and armor, and interact with an AI dungeon master. The same dungeon supports solo play and cooperative fireteams through party-size scaling.

The experience combines visual exploration, tactical turn-based combat, and flexible storytelling. It adapts Destiny's class fantasy into a tabletop-style game rather than recreating its shooter controls or every D&D rule.

## 2. Confirmed requirements

- Character builder supports Hunter, Titan, and Warlock, with every supported Destiny 2 subclass available for each class.
- Dungeons contain multiple floors based on Destiny 2 raid themes and encounter ideas.
- Bungie's Destiny 2 API supplies weapon and armor catalog information.
- Only a curated, limited selection of that catalog is playable or eligible to drop.
- Weapons and armor drop randomly and should provide useful, interesting choices.
- There is no Aspect selection, inventory, unlock system, or equipment screen. Subclass kits already include their intended Aspect-like behavior, balanced for this game.
- AI assists storytelling, NPC dialogue, and interpretation of creative player actions.
- Support solo play and cooperative parties of up to six human players, with difficulty and encounter mechanics adapting to party size.

## 3. Proposed defaults

These are implementation recommendations, not additional confirmed requirements:

- Each player controls one Guardian; private online fireteams support 1–6 players. Solo uses the same rules and encounter system.
- Free movement while exploring; grid-based turns during combat.
- Simplified d20 checks for uncertain noncombat actions.
- Fixed authored dungeon layouts initially; randomized loot and selected encounter variations.
- No Bungie account login or inventory import needed for the initial catalog integration.
- No Fragment selection initially; necessary passive effects are included in the kit.
- Checkpoint saves between encounters and floors.
- Gear persists across runs; dungeon encounter state resets when starting a new run.

## 4. Character builder

### Choices

1. Name and appearance.
2. Class: Hunter, Titan, or Warlock.
3. Subclass.
4. A supported Super and ability loadout from that kit.
5. A balanced starter weapon loadout.

The planned baseline subclass families are Arc, Solar, Void, Stasis, Strand, and Prismatic for all three classes: 18 class/subclass combinations. Verify the current roster before implementation and use data-driven definitions so future additions do not require rebuilding the character builder.

| Class   | Intended identity                 | Example strengths                      |
| ------- | --------------------------------- | -------------------------------------- |
| Hunter  | Precision, movement, deception    | Dodge, positioning, burst damage       |
| Titan   | Frontline pressure and protection | Barriers, melee, damage mitigation     |
| Warlock | Ability control and support       | Healing, area effects, ability synergy |

### Complete subclass kits

Each class/subclass combination defines:

- Grenade, melee, class ability, and supported Super choices.
- A concise set of intrinsic passives capturing its intended playstyle.
- Elemental status effects and interactions.
- Cooldowns, costs, targeting rules, and counterplay.

Do not literally enable every Destiny Aspect simultaneously. Translate the desired behaviors into one coherent kit with a shared power budget. Strong combinations may require reduced damage, limited triggers, longer cooldowns, or mutually exclusive ability choices. Players see what their kit does without configuring Aspects.

Prismatic is a curated mixed-element kit with bounded choices, rather than unrestricted access to every other kit's strongest effects. Give single-element subclasses distinct benefits so they remain attractive.

All supported class/subclass combinations must be playable for the complete character-builder milestone. A smaller internal prototype may validate combat first, but does not satisfy that milestone.

## 5. Core play loop

Create Guardian → create or join fireteam (or play solo) → choose dungeon → explore floor → discover story and mechanics → resolve encounters → collect random loot → reach checkpoint → descend → defeat final boss → keep rewards.

Exploration supports movement, inspection, conversations, loot chests, environmental interactions, and creative typed actions.

Combat supports movement, weapon attacks, grenade, melee, class ability, Super, interaction, and end turn. Use a limited action budget per turn. Damage, ammunition, cooldowns, status durations, and victory conditions are resolved by code.

In cooperative combat, use a shared player phase: each Guardian can spend their own action budget, with the server resolving submitted actions in a stable order. The enemy phase starts when all participating Guardians end their turns. Clearly show pending actions and whose turn budget remains. Use a configurable inactivity policy and reconnect grace period so one disconnected player cannot block the session indefinitely.

## 6. Multi-level raid-inspired dungeons

A dungeon is a connected sequence of authored floors with escalating mechanics. Each floor contains rooms, enemies, interactable objects, objectives, encounter state, reward tables, and an exit condition.

### First dungeon proposal: a Vault of Glass-inspired descent

The following encounters are original adaptations for this game's solo and cooperative tactical format, not exact raid reproductions.

| Floor | Theme           | Main mechanic                                      | Completion                        |
| ----- | --------------- | -------------------------------------------------- | --------------------------------- |
| 1     | Ruined entrance | Capture plates while managing enemy waves          | Open the vault                    |
| 2     | Oracle chambers | Observe and repeat a short symbol sequence         | Break the chamber seal            |
| 3     | Temporal depths | Alternate between two room states to expose a boss | Defeat the timekeeper and extract |

Every encounter defines variants for 1–6 players. Solo uses sequential plate activation, timed devices, or controllable relics; larger parties can coordinate concurrent objectives. Never require more simultaneous operators than the encounter's locked party size. Encounters must be solvable by every class and subclass without a mandatory weapon drop or class composition.

Teach each mechanic in a safe or low-risk room before combining it with combat. Clearly show objectives, interactable objects, telegraphed hazards, and boss vulnerability phases. Essential instructions must exist in authored UI even when AI is unavailable.

Future dungeons can draw on other raid identities after the first complete descent works. New dungeon content should be data-driven.

### Scalable difficulty for 1–6 players

Party-size scaling is mandatory. Optional challenge tiers can be added later as a separate setting; bringing more players should not automatically mean selecting a harder tier.

- Lock the participating roster, party size, and scaling profile when an encounter starts. Downed Guardians still count toward that profile.
- Define explicit profiles for all six party sizes: enemy budget, wave composition, boss health, objective count, mechanic timing, and revive resources.
- Increase enemy pressure and coordination demands alongside boss durability. Avoid multiplying enemy damage by player count or simply giving every enemy six times its health.
- A starting boss-health hypothesis is `baseHealth * (1 + 0.65 * (players - 1))`. This is an untested tuning value; adjust after measuring party damage, support synergy, and encounter duration at every party size.
- Use authored objective variants rather than a formula for simultaneous tasks. A solo plate sequence can become two concurrent roles in a duo and several roles in a larger fireteam.
- Scale enemy budgets within map capacity and turn-duration limits. Prefer stronger enemy variants or bounded waves over overcrowding the map.
- Keep damage telegraphs readable, solo survival viable, and boss phase length comparable across party sizes.
- Solo defeat restarts the encounter. In co-op, downed players can be revived through a configured action and limited encounter resource; a full-party wipe restarts the encounter.
- Do not lower difficulty immediately when someone leaves or disconnects. Allow rejoining the same Guardian state; roster changes and rescaling occur at the next checkpoint or encounter restart.
- New players join the active roster only at a safe checkpoint. Reject a seventh player and prevent joining/rejoining from resetting health, ammunition, abilities, or earned rewards.

Validate all six party sizes, including intermediate sizes 2–5. Solo viability and six-player coordination are both required, rather than separate dungeon modes with unrelated progression.

## 7. Weapons and armor

### Catalog versus playable gear

The Bungie Manifest is a source of item definitions. Downloading an item definition does not make that item playable automatically. Maintain an explicit allowlist and a local gameplay adaptation for each supported item.

Each supported item stores a stable local ID, Bungie item hash, catalog metadata, local balance values, supported perk behavior, and eligible loot tables. Deduplicate cosmetic or otherwise equivalent catalog entries intentionally.

### Initial pool proposal

- Approximately 12 weapons covering close, medium, and long range, plus several heavy options.
- Approximately two standard armor choices per slot per class.
- Add a small number of supported Exotics after basic gear works.
- Use head, arms, chest, legs, and class-item slots as a simplified local equipment model.
- Use three weapon slots with explicitly authored compatibility rules; do not assume element alone determines the slot.
- If Exotics are enabled, initially allow one Exotic weapon and one Exotic armor item equipped.

This is deliberately a local balance model. Do not promise exact parity with Destiny 2's current equipment, ammunition, stat, or perk systems.

### Make drops useful

- Give weapons different tactical roles, such as precision, crowd control, shield breaking, burst damage, and sustained damage.
- Translate each supported weapon into readable local values: damage, range, accuracy, ammunition, reload/action cost, and one or two supported traits.
- Use a small curated perk pool rather than importing every possible perk combination.
- Balance armor through a few clear effects: survival, movement, ability recovery, and specific kit synergies.
- Scale difficulty without making early equipment immediately worthless.
- Show a comparison before equipping a drop.

### Random loot rules

- Loot comes only from the curated supported pool.
- Use weighted tables by dungeon, floor, encounter, and reward type.
- Armor drops must be usable by the current class.
- Start every run with a functional loadout; progression cannot depend on random luck.
- Give bosses a guaranteed gear reward with an explicitly configured chance of special loot.
- Add duplicate protection or convert duplicates into a useful upgrade resource.
- Record the run seed and loot events so problems can be reproduced.
- Persist granted rewards before showing the completed reward screen to prevent repeated claims after reloads.
- Use personal loot: each eligible participant receives an independent class-compatible reward roll without splitting a shared drop. Record encounter participation server-side and grant each reward once per player and encounter completion.
- Keep expected rewards per player comparable across party sizes; do not penalize solo players or multiply an individual's reward count by fireteam size.

Drop chances and exact item selections remain balance decisions. The AI never chooses or grants loot independently.

## 8. Destiny 2 API integration

### What the API supplies

Use Bungie's Manifest to obtain catalog definitions such as item names, descriptions, icons, item categories, and relevant references. Resolve any additional definition tables needed by the curated selection.

The API is not this game's combat engine, multiplayer server, or loot service. Our application owns encounter rules, local item balance, reward probabilities, and save data. Do not assume catalog definitions provide complete raid loot tables or ready-to-run perk logic.

### Data pipeline

1. Register a Bungie application and configure its API key on the backend through `.env`.
2. Request `GetDestinyManifest` and read the returned version and definition-file locations.
3. Download the required language-specific definition data and cache it outside the browser request path.
4. Resolve the supported item hashes against the allowlist.
5. Merge catalog metadata with versioned local balance definitions.
6. Validate the resulting playable catalog and publish a compact client-safe snapshot.
7. Refresh when the Manifest changes; retain the last valid snapshot if a refresh fails.

Use Bungie's documented `X-API-Key` header for applicable API requests. Keep keys out of source control and client bundles. API credentials are entered in project configuration, never pasted into chat.

Public definition browsing does not require importing a player's account. OAuth belongs in a later, separate feature if player-specific data is requested. Never modify a player's real Destiny equipment or inventory as part of this game's loot system.

Handle throttling, missing definitions, unavailable icons, and removed or changed catalog entries. Pin a catalog/balance version to each run so a background refresh does not change equipment mid-dungeon.

## 9. AI dungeon master

### AI responsibilities

- Describe rooms using actual room state.
- Speak for NPCs and react to player choices.
- Interpret creative actions into supported intent proposals.
- Narrate resolved combat and skill-check results.
- Summarize events while preserving established facts.

### Authority boundary

Player action → AI intent proposal when needed → code validation → rules resolution → saved state update → narration → Phaser visual update.

AI output must use a validated structured schema. Proposed actions reference known entity IDs and an allowlisted action type. The server rejects unknown objects, impossible movement, unauthorized rewards, invalid ability use, and changes outside the rules.

AI cannot invent authoritative damage, ammunition, drops, equipment ownership, boss phases, or completed objectives. Unsupported creative actions receive a clear explanation or a supported alternative.

Store canonical state and an event log separately from narrative summaries. Send the AI only relevant room state, NPC knowledge, quest facts, recent events, and the player's action. Treat player and NPC text as untrusted content rather than executable instructions.

Use authored fallback text when AI is slow or unavailable. Walking, inventory use, combat buttons, dungeon mechanics, and saving must continue without AI. Ignore stale AI responses after the scene or state has changed.

All players share one canonical dungeon story and encounter state. Attribute creative actions to the acting Guardian and validate that player's permissions and remaining actions. Broadcast resolved events and shared narration to the fireteam. Use a proposed ready vote for major story branches and floor transitions, with a defined timeout/tie rule; one player's dialogue cannot silently commit the whole party. Bound narration frequency so six players do not produce six redundant summaries of the same event.

## 10. Technical structure

- Phaser + TypeScript + Vite for rendering, maps, input, animations, and audio.
- HTML/CSS interface for character creation, character sheet, inventory, dialogue, and story log.
- TypeScript backend for private API credentials, AI requests, validation, and authoritative rules/state.
- Server-authoritative multiplayer sessions over WebSockets for party membership, action submission, shared state, and reconnect snapshots. The Bungie API does not provide this game's multiplayer transport.
- A pure rules module for combat, abilities, effects, checks, encounter transitions, and loot.
- JSON content definitions for kits, items, encounters, and dungeon floors.
- SQLite initially for saves, inventory, run checkpoints, and event records.
- Separate persistent player characters/inventories from shared run state. Authenticate session identity, validate character ownership, enforce the six-player limit, and accept only actions belonging to the connected player's Guardian.
- Assign ordered event IDs and idempotent action/reward IDs. Reconnecting clients receive a current state snapshot and cannot replay stale actions or duplicate rewards. Serialize rule mutations per session to resolve simultaneous inputs consistently.

Suggested directories:

```text
src/game/             Phaser scenes and presentation
src/ui/               Builder, inventory, dialogue, HUD
src/shared/           Shared types and validated contracts
server/rules/         Deterministic game rules
server/sessions/      Parties, WebSocket sync, reconnects, turn phases
server/services/      Bungie catalog and AI adapters
server/persistence/   Saves, migrations, event records
content/kits/         Class/subclass kits
content/items/        Allowlist, balance, perk adaptations
content/dungeons/     Floors, encounters, loot tables
```

The database and rules state are authoritative. Phaser objects and AI narration are representations of that state. Save schema, kit definitions, and balance versions need explicit versioning.

## 11. Build milestones

### Milestone 1 — Playable mechanics prototype

- One room, movement, collisions, interaction, and combat transition.
- One temporary Guardian kit, one enemy, and a complete turn loop.
- Local test items and deterministic rules without API dependencies.
- Verify abilities, damage, cooldowns, enemy turns, defeat, and reset.
- Keep authoritative rules on the server from the start. A one-client prototype is an internal step toward required 1–6-player support.

### Milestone 1B — Cooperative session foundation

- Private lobby creation/joining, ready state, and one owned Guardian per player.
- Shared exploration and player/enemy phases with up to six connected clients.
- Scaling profiles for party sizes 1–6 in the prototype encounter.
- Reconnect snapshots, inactivity handling, checkpoint roster changes, and personal rewards.
- Verify concurrent actions, ownership checks, seventh-player rejection, disconnects, reconnects, and duplicate action/reward prevention before expanding dungeon content.

### Milestone 2 — Full character-builder coverage

- All planned class/subclass combinations have playable kits.
- No Aspect or Fragment configuration.
- Ability previews, kit descriptions, starter loadout, and character save/load.
- Validate every kit against the same basic encounters.

### Milestone 3 — Catalog-backed gear and random loot

- Backend Manifest synchronization and cached catalog snapshot.
- Curated weapon/armor pool with local balance definitions.
- Equipment, comparisons, weighted rewards, and duplicate handling.
- Verify API outage fallback, class compatibility, reward persistence, and reproducible rolls.

### Milestone 4 — Complete multi-floor dungeon

- Three connected floors with checkpoints and distinct mechanics.
- Boss vulnerability cycle, defeat/retry, final rewards, and extraction.
- Verify every class can finish without requiring a lucky drop.
- Verify all three floors and boss mechanics work at every party size from 1 through 6, including wipe/retry and checkpoint roster changes.

### Milestone 5 — AI storytelling

- Context-aware room narration and NPC conversations.
- Validated creative-action proposals and narration of resolved results.
- Persistent story facts and fallback text.
- Verify fabricated IDs, forbidden rewards, timeouts, and stale replies cannot corrupt state.

### Milestone 6 — Balance and presentation

- Clear telegraphs, tooltips, sound, effects, and equipment feedback.
- Tune kits, encounter pacing, loot usefulness, and AI response length.
- Playtest complete runs across all supported kits.
- Measure encounter duration, survival, coordination load, and rewards per player at all six party sizes; tune scaling profiles accordingly.

## 12. Completion criteria for the first complete version

- A player can create any supported Hunter, Titan, or Warlock subclass without selecting Aspects.
- Every offered kit has functioning abilities and documented passives.
- One raid-inspired dungeon has at least three playable floors and a final boss.
- Catalog-backed weapons and armor can drop, be inspected, equipped, saved, and loaded.
- Unsupported catalog items never enter loot tables.
- Combat and rewards remain correct with AI disabled.
- Narration matches actual objectives, inventory, enemy state, and encounter outcomes.
- Save/load preserves checkpoints, equipment, and granted rewards without duplication.
- Solo and 2–6-player parties can complete the same dungeon with appropriate scaling and solvable mechanics.
- Multiplayer clients agree on turns, enemy state, objectives, and rewards; reconnects restore the correct Guardian and run state.
- Disconnecting, joining, or replaying an action cannot reroll rewards, reset resources, or lower a live encounter's scaling.

## 13. Decisions to settle before implementation

Recommended starting answers are included so planning can continue without blocking:

| Decision               | Recommended starting answer                                         |
| ---------------------- | ------------------------------------------------------------------- |
| Combat style           | Turn-based tactical combat                                          |
| Party control          | One Guardian per player; solo or cooperative fireteams of up to six |
| Party access           | Private online lobbies initially                                    |
| Scaling                | Automatic party-size profiles, locked per encounter                 |
| Cooperative combat     | Shared player phase, then enemy phase                               |
| Cooperative rewards    | Independent personal loot for eligible participants                 |
| First raid inspiration | Vault of Glass                                                      |
| Subclass switching     | Safe checkpoints only                                               |
| Fragment interface     | Omit; include necessary behavior in kits                            |
| Defeat penalty         | Restart current encounter; retain already committed rewards         |
| Loot persistence       | Permanent collection across runs                                    |
| Maps                   | Authored layouts with bounded encounter variation                   |
| AI provider/model      | Choose during implementation based on latency and cost              |

## 14. Sources and reference boundaries

- [Phaser Tilemap documentation](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) — tilemap support for the visual dungeon.
- [Bungie API documentation](https://bungie-net.github.io/) — API registration, keys, endpoints, and definitions.
- [Obtaining Destiny definitions: The Manifest](https://github.com/Bungie-net/api/wiki/Obtaining-Destiny-Definitions-%22The-Manifest%22) — Manifest version and definition download workflow.
- [Bungie subclass, ability, and gear guide](https://help.bungie.net/hc/en-us/articles/45080200239892--3-Your-Guardian-Subclasses-Abilities-and-Gear) — class and subclass reference.
- [Bungie Prismatic deep dive](https://www.bungie.net/7/en/News/article/prismatic_deep_dive) — mixed-element subclass reference.

Local combat values, simplified equipment rules, floor layouts, drop rates, and kit passives are original design proposals. Destiny-derived branding and assets require a separate usage review before public distribution; API access alone does not establish asset redistribution permission.

## Next step

Review the proposed defaults in section 13, then build Milestone 1 before expanding the content or adding AI.
