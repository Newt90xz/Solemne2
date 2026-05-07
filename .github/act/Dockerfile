FROM node:20-bullseye

LABEL maintainer="digitalvoid"

# Use a workspace directory mounted by act at runtime
WORKDIR /workspace

# Install system packages commonly needed by JS projects and act
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    build-essential \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

# Make the hosted tool cache writable for actions like setup-node.
RUN mkdir -p /opt/hostedtoolcache/node \
  && chown -R root:root /opt/hostedtoolcache \
  && chmod -R 0777 /opt/hostedtoolcache

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create a non-root user to match how act runs containers
RUN useradd -m actuser && chown -R actuser:actuser /workspace
USER actuser

ENV PNPM_HOME=/home/actuser/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"

# Default to bash so act can run steps normally
CMD ["/bin/bash"]
