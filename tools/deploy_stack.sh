#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <main|staging|develop>"
  exit 1
fi

stack="$1"
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="$repo_dir/deploy/${stack}.env"

if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file"
  echo "Copy deploy/${stack}.env.example to deploy/${stack}.env and adjust values."
  exit 1
fi

cd "$repo_dir"
docker compose --env-file "$env_file" -p "drywatch_${stack}" up -d --build
echo "Deployed stack '$stack' using $env_file"
