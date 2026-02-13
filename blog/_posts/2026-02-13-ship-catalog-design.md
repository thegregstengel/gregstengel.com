---
title: "Big Bang Smugglers: Ship Catalog Design"
date: 2026-02-13 06:48:00 -0500
categories: [Big Bang Smugglers, Game Design]
tags: [ships, balance, progression, factions]
---

## Fleet Architecture

Big Bang Smugglers features 30 ships across two factions: Federation and Pirates. Each faction has 15 ships organized into three distinct classes across five levels (2-6).

### Class Specializations

**Trading/Smuggling** - Cargo-focused vessels with maximum hold capacity, minimal weapons
**War/Raider** - Combat-focused ships with devastating firepower, limited cargo
**Balanced/Corsair** - Multi-role vessels splitting the difference

### Design Philosophy

- **Equal shields per level** - Survivability isn't penalized by specialization
- **Clear trade-offs** - Trading ships carry ~3x cargo but ~1/3 weapons vs War class
- **Exponential pricing** - Ships cost ~3x more per level (5K → 15K → 40K → 100K → 250K)
- **Upgradeable to ~2x** - Ships can roughly double their specialized stat through upgrades

---

## Federation Fleet

*Corporate vessels with professional military-grade construction*

### 💼 Trading Class (Holds Focused)

| Level | Ship Name | Shields | Holds | Attack | Price | Max Upgrades (W/Wp/H) |
|-------|-----------|---------|-------|--------|-------|----------------------|
| 2 | Nebula Merchant | 150 | 60 | 20 | 5,000 | 3/10/60 |
| 3 | CoreStar Freighter | 225 | 90 | 30 | 15,000 | 4/20/90 |
| 4 | TriStar Hauler | 350 | 140 | 45 | 40,000 | 5/35/140 |
| 5 | Vanguard Trader | 525 | 210 | 65 | 100,000 | 6/50/210 |
| 6 | Federation Galleon | 800 | 320 | 100 | 250,000 | 7/75/320 |

*Entry-level haulers to flagship cargo transports. The Federation Galleon can max out at 640 holds.*

### ⚔️ War Class (Attack Focused)

| Level | Ship Name | Shields | Holds | Attack | Price | Max Upgrades (W/Wp/H) |
|-------|-----------|---------|-------|--------|-------|----------------------|
| 2 | Patrol Corvette | 150 | 25 | 50 | 5,000 | 3/50/15 |
| 3 | Strike Frigate | 225 | 35 | 75 | 15,000 | 4/75/25 |
| 4 | Battle Cruiser | 350 | 50 | 115 | 40,000 | 5/115/35 |
| 5 | Enforcer Dreadnought | 525 | 75 | 175 | 100,000 | 6/175/55 |
| 6 | Federation Battleship | 800 | 110 | 265 | 250,000 | 7/265/80 |

*Light combat vessels to capital warships. The Federation Battleship can max out at 530 attack power.*

### ⚖️ Balanced Class (All-Purpose)

| Level | Ship Name | Shields | Holds | Attack | Price | Max Upgrades (W/Wp/H) |
|-------|-----------|---------|-------|--------|-------|----------------------|
| 2 | Frontier Scout | 150 | 40 | 35 | 5,000 | 3/30/35 |
| 3 | Pathfinder | 225 | 60 | 50 | 15,000 | 4/45/55 |
| 4 | Vanguard Ranger | 350 | 90 | 75 | 40,000 | 4/70/80 |
| 5 | Horizon Cruiser | 525 | 135 | 115 | 100,000 | 5/110/125 |
| 6 | Federation Odyssey | 800 | 200 | 175 | 250,000 | 6/170/190 |

*Versatile exploration and multi-role vessels. The Federation Odyssey offers the best of both worlds.*

---

## Pirate Fleet

*Outlaw vessels built for raids, smuggling, and asymmetric warfare*

### 💼 Smuggling Class (Holds Focused)

| Level | Ship Name | Shields | Holds | Attack | Price | Max Upgrades (W/Wp/H) |
|-------|-----------|---------|-------|--------|-------|----------------------|
| 2 | Shadow Runner | 150 | 60 | 20 | 5,000 | 3/10/60 |
| 3 | Black Market Hauler | 225 | 90 | 30 | 15,000 | 4/20/90 |
| 4 | Plunder Barge | 350 | 140 | 45 | 40,000 | 5/35/140 |
| 5 | Marauder's Fortune | 525 | 210 | 65 | 100,000 | 6/50/210 |
| 6 | Pirate Leviathan | 800 | 320 | 100 | 250,000 | 7/75/320 |

*Fast runners and cargo raiders. The Pirate Leviathan matches Federation cargo capacity.*

### ⚔️ Raider Class (Attack Focused)

| Level | Ship Name | Shields | Holds | Attack | Price | Max Upgrades (W/Wp/H) |
|-------|-----------|---------|-------|--------|-------|----------------------|
| 2 | Cutthroat | 150 | 25 | 50 | 5,000 | 3/50/15 |
| 3 | Reaver | 225 | 35 | 75 | 15,000 | 4/75/25 |
| 4 | Warlord | 350 | 50 | 115 | 40,000 | 5/115/35 |
| 5 | Blood Talon | 525 | 75 | 175 | 100,000 | 6/175/55 |
| 6 | Pirate Juggernaut | 800 | 110 | 265 | 250,000 | 7/265/80 |

*Aggressive combat vessels. The Pirate Juggernaut brings equal firepower to the Federation Battleship.*

### ⚖️ Corsair Class (All-Purpose)

| Level | Ship Name | Shields | Holds | Attack | Price | Max Upgrades (W/Wp/H) |
|-------|-----------|---------|-------|--------|-------|----------------------|
| 2 | Rogue's Gambit | 150 | 40 | 35 | 5,000 | 3/30/35 |
| 3 | Freebooter | 225 | 60 | 50 | 15,000 | 4/45/55 |
| 4 | Blackheart | 350 | 90 | 75 | 40,000 | 4/70/80 |
| 5 | Crimson Eclipse | 525 | 135 | 115 | 100,000 | 5/110/125 |
| 6 | Pirate Dominion | 800 | 200 | 175 | 250,000 | 6/170/190 |

*Versatile outlaw ships. The Pirate Dominion offers complete flexibility for any playstyle.*

---

## Upgrade System

Ships can be enhanced at starport shipyards with three upgrade types:

- **Warp Drive** - Increases speed/range (scales with level: 3→7 max)
- **Weapons** - Boosts attack power (can roughly double base attack on War/Raider ships)
- **Cargo Holds** - Expands capacity (can roughly double base holds on Trading/Smuggling ships)

### Upgrade Philosophy

Each ship can upgrade to approximately **2x its specialized stat**:
- A Level 6 Federation Galleon: 320 base holds + 320 upgrade capacity = **640 total holds**
- A Level 6 Pirate Juggernaut: 265 base attack + 265 upgrade capacity = **530 total attack**

This creates meaningful progression while maintaining class identity.

---

## Naming Conventions

### Federation
- **Trading**: Corporate brands (Nebula, CoreStar, TriStar) + commercial terms
- **War**: Military designations (Patrol, Strike, Battle, Enforcer)
- **Balanced**: Exploration themes (Frontier, Pathfinder, Horizon, Odyssey)
- **Level 6**: All prefixed with "Federation" for prestige

### Pirates
- **Smuggling**: Shadow/stealth/fortune themes
- **Raider**: Aggressive/violent names
- **Corsair**: Freedom/outlaw/legendary names
- **Level 6**: All prefixed with "Pirate" to match Federation prestige

---

## Balance Notes

Both factions are **perfectly balanced** with identical stats per level and class. The only difference is thematic naming and eventual faction-specific abilities/perks.

This creates:
- **Fair competition** between factions
- **Clear specialization** within each faction
- **Meaningful choices** at every level
- **Room for meta diversity** as players optimize different paths

Next up: Implementing the Nebula Ship Sales modal in the game's starport directory! 🚀
