Overview

This image is intended for running the repository's GitHub Actions locally with `act`.

Build the image (from repo root):

```bash
docker build -t digitalvoid-act:latest -f .github/act/Dockerfile .
```

Run `act` mapping `ubuntu-latest` to the built image (example):

```bash
# run the default workflow (or specify -e, -j, etc.)
act -P ubuntu-latest=digitalvoid-act:latest
```

Notes

- The image provides Node 20 and `pnpm` via Corepack. It installs common build tools and `git`.
- If you need additional system packages, add them to `.github/act/Dockerfile` before building.
- On Apple Silicon you may need to add `--platform linux/amd64` to the `docker build` and `act` commands.
