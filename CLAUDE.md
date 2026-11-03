# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Authoritative guide

`AGENTS.md` in this directory is the canonical project guide — commands, tech
stack, architecture, gotchas and conventions — and is loaded alongside this
file. Do not duplicate it here, and when the two disagree, `AGENTS.md` wins.
Everything below is a verified addition it does not cover.

## Cross-mode state

- Scene selection is shared by all three modes through `shared/use-scene.ts`.
  Resolution order: `#scene=<name>` hash → localStorage `3dtool_scene` → first
  entry of `/api/scenes`. `3dtool_scene` is the one storage key outside the
  `3dbbox_` / `sge_` / `scene_` namespaces.
- While the `/api/scenes` listing is in flight, `scene` is legitimately `""`.
  Consumers must hold off fetches (pass a `null` endpoint to `useCloudFiles`)
  until `scenesLoaded`; once it settles, `""` means "no scene", not "loading".
- `useScene` and `useCloudFiles` keep module-level caches so mode switches do
  not flash empty listings; revalidate those caches instead of adding a fresh
  fetch.

## SceneGraph load / export contract

- `GET /api/scene-graph` serves `scene_graph_exported/` first, falling back to
  `scene_graph_saved/`; `source=saved|exported` forces a copy. The response
  carries `X-Scene-Source`, which `loadSceneGraph` returns as `source`.
- `POST /api/export` must be sent with `base` equal to that source. Exporting a
  session that loaded the exported copy with `base: "saved"` silently rebuilds
  `exported/` from `saved/` and wipes the earlier session's edits.
- All edits are pending client-side `Mutations`; nothing reaches disk until
  Export. Pure helpers live in `modes/scenegraph/lib/mutations.ts` — put new
  mutation logic there and keep `SceneGraphMode.tsx` (~3.7k lines) as wiring.

## Trajectory mode

- Trajectories are drawn at their recorded coordinates and are not movable: the
  viewer exposes no offset/yaw controls or grab handle. Do not reintroduce
  manual placement — record the trajectory in the scene's world frame
  (`frame: "world_zup"`) instead.
- Browsing is read-only and path-confined by the backend: every requested path
  must stay inside `scenes/<scene>/trajectories/`, and only whitelisted step
  artifacts are readable.

## 3DGS viewer cache

- `GaussianSplatLayer` keeps a module-level viewer cache keyed
  `scene:<scene>/<name>` and validated against the host `gl` renderer. Do not
  key by request URL — the three modes fetch the same file with different query
  shapes — and do not drop the scene component, or same-named assets in
  different scenes collide.
- Unmounting the layer only detaches the viewer; it is disposed solely on a
  renderer mismatch or a failed load.

## Verification

- `bun test` covers the pure `lib/` modules (bbox, mutations, history, picking,
  shortcuts): 28 tests across 5 files. There is no lint, format or CI check, so
  run `bunx tsc -p frontend --noEmit` and `bun test` before handing work back.
