# Tranche A — research notes and reference cache

Accessed 2026-09-13. Purpose: choose a defensible small process model, preserve energy/material accounting, and specify accessible interaction. This is targeted background research for implementation planning, not a survey of all laser manufacturing or fusion engineering. Cached originals are reference material, not game assets. [Manifest](manifest.json) records source URL, resolved URL, retrieval date, byte count and SHA-256. Sources retain their original rights; do not bundle these snapshots into a game release. No source figures are repurposed as artwork.

## R1 — process motivation

Flamm et al., *Beam shaping for ultrafast materials processing*, SPIE 2019 paper; arXiv v1 posted 2020. [Source](https://arxiv.org/abs/2010.12851), [cached PDF](beam-shaping-2010.12851v1.pdf).

The authors discuss tailored focal distributions and in-situ diagnostics for material processing, with cutting, welding and drilling examples. This supports making field distribution and observable processing outcomes matter. It does not establish the game's two-zone model, cycle time, dose thresholds or recipe. The game initially omits ultrafast pulse physics; a continuous accumulated-exposure abstraction is an intentional design choice, not a calibrated substitute for those experiments.

## R2 — power-preserving field abstraction

MIT OCW 6.974, *Classical Electromagnetism and Optics*, chapter 2, spring 2006. [Source](https://www.ocw.mit.edu/courses/6-974-fundamentals-of-photonics-quantum-electronics-spring-2006/8e54d1625e9e71eb5b4e4998e6967e4e_chapter2.pdf), [cached PDF](mit-photonics-chapter2.pdf). Relevant printed pages 72–76 (PDF indices 59–63), scattering matrices and interferometers.

The notes connect lossless scattering to unitarity and show phase-dependent redistribution between interferometer outputs while conserving total power. We use that principle to choose orthonormal sum/difference target modes. The specific target basis, capture coefficients and emitter assignment constraints are our game-model decisions. They should be tested algebraically and against the network ledger rather than claimed as an optical fabrication prediction.

## R3 — modal interaction

W3C WAI, *ARIA Authoring Practices: Dialog (Modal) Pattern*. [Source](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [cached HTML](w3c-modal-dialog.html).

Use labeled dialogs, focus inside the active dialog, contained tab navigation, Escape dismissal and sensible focus restoration. Pausing game simulation is our product decision; accessibility guidance does not mandate that policy. The code spec separates modal pause from user pause and leaves inspectors live.

## R4 — future energy boundary

LLNL, *Exploring Energy Security*. [Source](https://lasers.llnl.gov/science/energy-security), [cached HTML](llnl-energy-security.html).

The facility explains that ignition and a continuously electricity-producing fusion installation are different engineering goals. For A, retain separate delivered-field, electrical-service and material-consumption records so later pulse/plant accounting can be added explicitly. No NIF yield record, commercial repetition rate or power-plant performance is used to set A constants. Fusion remains outside A implementation.

## Engineering deductions and limits

1. **Bound the target operator.** Reusing an unnormalized projection for every target could create energy. Exclusive emitter assignment plus orthonormal process modes provides a simple explicit bound. A later multi-target delivery model needs a joint contractive operator or physical splitting.
2. **Keep fields grouped.** Equal settings do not make independent sources mutually coherent. Current network group identities must survive process projection and blueprint source replication.
3. **Integrate exposure only once.** Solver/controller previews are pure observations. Only the fixed simulation step changes dose, material ownership or temperature.
4. **Treat a workpiece as owned state.** Reservation, consumption and final disposition need one persisted owner and exactly-once transitions. This is project engineering judgment; no claim that a local game needs a distributed transaction framework.
5. **Separate configuration from operation.** Thermal drift and commanded phase corrections are ordinary operating state. Configuration changes and failures invalidate local certificates through explicit dependencies.
6. **Generate to an interface.** Existing project evidence in 014 shows matte, crop and anchor problems. Lock the footprint and rendered landmarks first, then produce art; this is a lesson from this repository, not an external claim.

## What remains unvalidated

All recipe quantities, thermal coefficients, exposure bounds, qualification cycle count, UI pacing and asset tolerances are proposed game defaults. The standalone-cell cost arithmetic is an estimate from current DEFS plus the proposed cell; it does not prove route reachability, player comprehension or performance. A-05 and A-12 own those measurements. No current vendor roadmap or speculative commercial fusion architecture is needed to unblock A.

## Cache maintenance

Run `node scripts/validate-tranche-a-plan.mjs` to verify local hashes and planning references without network access. The source URLs in the manifest are sufficient to retrieve originals again; keep old hashes and retrieval dates when replacing a snapshot, and inspect changes before updating the notes. HTML may contain site scripts; these files are stored as reference snapshots and are not loaded by the game.
