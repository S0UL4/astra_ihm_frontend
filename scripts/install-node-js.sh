#!/bin/bash

# Install curl if not already installed
sudo apt update
sudo apt install -y curl

# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Load NVM immediately (important: this makes nvm command available in this session)
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check available Node.js versions
# nvm ls-remote ## si vous voulez regarder les autres versions .. 

# Install a specific version of Node.js
nvm install v16.20.2

# Check installed Node and npm versions
node_version=$(node --version)
npm_version=$(npm --version)


echo "Node.js version: $node_version"
echo "npm version: $npm_version"
