# Wasser

Wasser is a fork of Stremio focused on improving the overall user experience while keeping the familiar media-center workflow for discovering, organizing, and watching video content through addons. It also modernizes parts of the stack with faster, newer tooling such as Bun and Vite.

## Requirements

- [Bun](https://bun.sh/) 1.3 or newer
- `git` installed locally

`git` is required because some dependencies are installed directly from GitHub.

## Setup

Install dependencies:

```bash
bun install
```

## Development

Run the desktop app in development mode. This starts the Vite dev server and then opens Electron:

```bash
bun run dev
```

`bun dev` and `bun run dev:desktop` point to the same desktop development flow.

Run only the web development server:

```bash
bun run dev:web
```

## Production Build

Create the web production build:

```bash
bun run build
```

Preview the production build locally on port `8080`:

```bash
bun run preview
```

Serve the built app through the local HTTP server:

```bash
bun run serve
```

## Desktop Packaging

Create an unpacked desktop build:

```bash
bun run build:desktop
```

Create installable desktop artifacts for the current OS:

```bash
bun run dist:desktop
```

Create installable desktop artifacts for a specific OS from the project root:

```bash
bun run dist:mac
bun run dist:win
bun run dist:linux
```

These commands use `electron-builder` platform flags directly. Cross-platform output can depend on your current OS, signing setup, and any native dependencies in the app.

## Quality Checks

Run tests:

```bash
bun run test
```

Run the linter:

```bash
bun run lint
```

Scan translation usage:

```bash
bun run scan-translations
```

## Screenshots

### Board

![Board](./assets/screenshots/board.png)

### Discover

![Discover](./assets/screenshots/discover.png)

### Meta Details

![Meta Details](./assets/screenshots/metadetails.png)

## License

Wasser is copyright 2017-2023 Smart code and available under GPLv2 license. See the [LICENSE](/LICENSE.md) file for more information.
