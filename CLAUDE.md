# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Liem Control Panel** is an Electron-based background tray app that acts as a Discord Rich Presence (RPC) bridge for applications that don't natively support it (e.g. Zoom, Figma). It is the first microservice under the "Liem Products" brand.

## Planned Stack

- **Electron** — main process runs as a system tray app (no visible window by default)
- **discord-rpc** — npm package for IPC communication with the local Discord client
- **Node.js** — process detection via `tasklist` (Windows) or platform-native commands
- **React** (planned) — settings/config UI rendered in an Electron BrowserWindow

## Architecture Intent

- **Main process** (`src/main/`) — tray lifecycle, process watcher (polls every ~5s), Discord RPC manager
- **Renderer process** (`src/renderer/`) — settings UI (shown on demand from tray menu)
- **App profiles** (`profiles/`) — JSON configs mapping process names to Discord RPC payloads (details, state, assets, timestamps)
- **IPC bridge** — main ↔ renderer communication for live status and config editing

## Key Behaviors

- App starts minimized to tray; no taskbar entry
- Process watcher detects foreground or running processes and activates the matching RPC profile
- Only one RPC presence is active at a time (last matched app wins, or priority-ordered)
- Config changes in the UI take effect immediately without restart
