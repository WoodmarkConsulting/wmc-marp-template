#!/usr/bin/env bash
set -euo pipefail

base=assets/screenshots
mkdir -p "$base"/light "$base"/dark

slides=(
  [1]=cover
  [2]=banner
  [3]=banner-subtitle
  [4]=steps
  [5]=default-content
  [6]=mermaid
  [7]=statement
)

render_and_copy() {
  local variant=$1
  local out=$base/$variant

  marp --config marp.config.mjs "decks/starter-${variant}.md"      \
    --images png -o "decks/rendered/starter-${variant}.png"

  for num in "${!slides[@]}"; do
    cp "decks/rendered/starter-${variant}.$(printf '%03d' "$num").png" \
      "$out/${slides[$num]}.png"
  done
}

render_and_copy light
render_and_copy dark
