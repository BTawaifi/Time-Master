<div align="center">

# ⚡ Time Master

**A cross-platform desktop focus system that turns stated goals into enforced work sessions and structured outcome reviews.**

![Engine: Electron](https://img.shields.io/badge/Engine-Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![Frontend: React 19](https://img.shields.io/badge/Frontend-React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Build: Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Styling: TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

## Why it exists

Passive time trackers record what happened after the fact. Time Master is built around **pre-commitment**: define the intended outcome first, run the session, then explicitly review what was actually produced.

The application combines normal productivity features with desktop-level enforcement mechanisms that are difficult to implement reliably in a browser-only application.

## Core modes

### Deep Work
A session begins with a concrete goal and ends with a structured review. The review records outcome quality, focus, friction, energy, tangible output, and whether the original objective was achieved.

### Neuro-Ledger
A multi-stream task mode for work that does not fit a single linear timer. Parallel streams can be created, switched, linked, completed, and reviewed while preserving the history of transitions between them.

### Pomodoro
Traditional alternating focus/rest blocks with persistent session counts.

## Desktop enforcement

Time Master can deliberately make unfinished sessions difficult to ignore:

- **Always-on-top / kiosk behavior** for mandatory session review.
- **Desktop Eclipse** to progressively dim the desktop when attention is required.
- **Sonic escalation** using generated oscillator tones and configurable waveforms.
- **Mantra Gate** requiring the original session goal to be re-entered before a completed session can be dismissed.

These features are optional and configurable.

## Engineering overview

Time Master is split between two responsibilities:

```text
Electron main process
├── native window lifecycle
├── desktop-level behavior
├── local filesystem access
└── application packaging

React renderer
├── session state and timers
├── Deep Work / Pomodoro / Neuro-Ledger UI
├── review and archive views
├── visualizers and themes
└── user configuration
```

The Electron boundary exists because enforcement, native window control, local data portability, and distributable desktop builds are first-class requirements rather than wrappers around a web page.

### State and persistence

Work history is stored as portable local JSON rather than being tied to a hosted account. Users can select different data files for different contexts and move or back them up independently of the application.

This creates an explicit tradeoff: local files provide portability and privacy, while the application must handle malformed, missing, moved, or older data safely.

### Session engines

The three modes have different state-transition rules rather than being visual variations of one timer:

- Deep Work has a single commitment → execution → audit lifecycle.
- Pomodoro alternates between focus and recovery phases.
- Neuro-Ledger maintains multiple task streams and transition history.

Keeping those semantics explicit is more important than forcing all three through a single overly-generic abstraction.

## Reliability and verification

The repository includes a Node test suite and CI validation for pushes and pull requests.

```bash
npm test
npm run build
```

Releases are built through GitHub Actions across Windows, macOS, and Linux, with Electron Builder producing native distributables.

The project history also contains targeted fixes around settings validation, archive safety, release packaging, security hardening, state updates, and UI performance rather than treating successful rendering as sufficient verification.

## Performance considerations

Interactive desktop software has several high-frequency paths—typing, timer updates, archive interaction, and visual effects. Performance work is kept targeted to measured hot paths rather than pre-optimizing the whole application.

For example, archive state updates and other repeated collection operations have been reviewed specifically for unnecessary full-array work and allocation overhead.

## Design tradeoffs

### Electron instead of browser-only

**Benefit:** native desktop control, local filesystem integration, native packaging, always-on-top behavior.

**Cost:** larger binaries, separate main/renderer concerns, and more platform-specific release behavior.

### Local JSON instead of a hosted database

**Benefit:** no account requirement, portable data, easy backups, user-controlled storage.

**Cost:** migrations and corruption handling become application responsibilities and there is no automatic multi-device synchronization.

### Strong enforcement instead of passive reminders

**Benefit:** the product can actually change the environment when a commitment is ignored.

**Cost:** enforcement features must remain configurable because an intentionally intrusive default would make the product unusable for many people.

## Known limitations

- Desktop behavior varies by operating system and window manager.
- Local-file persistence intentionally does not provide automatic cloud synchronization.
- The application is optimized for individual use rather than multi-user/team collaboration.
- Some visual effects are GPU/CPU intensive and are optional rather than required for the core workflow.

## Development

Requirements: a current Node.js installation.

```bash
npm install
npm start
```

Run validation:

```bash
npm test
npm run build
```

Build distributables:

```bash
# Windows
npm run compile

# macOS
npm run compile:mac
```

The release workflow also packages Linux builds.

## Stack

- Electron
- React 19
- Vite
- Tailwind CSS
- Electron Builder
- Node's built-in test runner
- GitHub Actions

## Project philosophy

The product still has an intentionally forceful personality, but the engineering principle underneath it is simple:

> A focus tool should make the gap between intended work and completed work visible.

Features are useful only if they improve that feedback loop without compromising correctness, recoverability, or user control.
