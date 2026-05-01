#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="${ROOT_DIR}/public/assets/vendor"
CHECKSUM_FILE="${VENDOR_DIR}/checksums.txt"
LOG_DIR="${ROOT_DIR}/logs"
DRY_RUN="${DRY_RUN:-0}"

APP_URL="${APP_URL:-https://apps.graswachstum.ch/drycalc/}"
API_URL="${API_URL:-https://apps.graswachstum.ch/drycalc/api/evaporation}"

mkdir -p "${LOG_DIR}"
mkdir -p "${VENDOR_DIR}"

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

run_or_echo() {
  if [[ "${DRY_RUN}" == "1" ]]; then
    echo "[DRY_RUN] $*"
  else
    eval "$@"
  fi
}

download_with_validation() {
  local target="$1"
  local url="$2"
  local marker="$3"
  local tmp_file="$4"

  curl -fL --retry 3 --connect-timeout 10 --max-time 120 "${url}" -o "${tmp_file}"

  if [[ ! -s "${tmp_file}" ]]; then
    log "ERROR: Downloaded file is empty: ${target}"
    return 1
  fi

  if ! grep -q "${marker}" "${tmp_file}"; then
    log "ERROR: Marker '${marker}' not found in ${target}."
    return 1
  fi

  return 0
}

smoke_test() {
  log "Running smoke test for ${APP_URL}"
  curl -fsS --max-time 20 "${APP_URL}" > /dev/null

  local payload
  payload='{"t2":20,"h2":60,"t3":15,"h3":90,"alt":600,"flow":15}'

  local api_response
  api_response="$(curl -fsS --max-time 20 -X POST "${API_URL}" -H 'Content-Type: application/json' -d "${payload}")"

  if [[ "${api_response}" != *'"status":"ok"'* ]]; then
    log "ERROR: API smoke test failed. Response: ${api_response}"
    return 1
  fi

  log "Smoke test passed"
}

main() {
  local -a assets=(
    "lucide.min.js|https://unpkg.com/lucide@latest/dist/umd/lucide.min.js|lucide"
    "chart.umd.min.js|https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.min.js|Chart"
    "chartjs-plugin-datalabels.min.js|https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js|datalabels"
    "tailwindcss.browser.min.js|https://cdn.tailwindcss.com|tailwind"
  )

  local changed=0
  local tmp_dir
  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "${tmp_dir}"' EXIT

  local backup_dir
  backup_dir="${tmp_dir}/backup"
  mkdir -p "${backup_dir}"

  log "Starting vendor update"

  for item in "${assets[@]}"; do
    IFS='|' read -r file_name source_url marker <<< "${item}"

    local_target="${VENDOR_DIR}/${file_name}"
    local_tmp="${tmp_dir}/${file_name}"

    log "Fetching ${file_name}"
    download_with_validation "${file_name}" "${source_url}" "${marker}" "${local_tmp}"

    if [[ -f "${local_target}" ]] && cmp -s "${local_target}" "${local_tmp}"; then
      log "No change: ${file_name}"
      continue
    fi

    changed=1
    if [[ -f "${local_target}" ]]; then
      cp -f "${local_target}" "${backup_dir}/${file_name}"
    fi

    run_or_echo "cp -f \"${local_tmp}\" \"${local_target}\""
    log "Updated: ${file_name}"
  done

  if [[ "${changed}" -eq 0 ]]; then
    log "No vendor changes detected"
    exit 0
  fi

  if [[ "${DRY_RUN}" == "1" ]]; then
    log "Dry run finished with pending changes"
    exit 0
  fi

  (cd "${VENDOR_DIR}" && sha256sum *.js | sort > "${CHECKSUM_FILE}")
  log "Wrote checksums: ${CHECKSUM_FILE}"

  log "Rebuilding and deploying container"
  (cd "${ROOT_DIR}" && docker compose up -d --build)

  if smoke_test; then
    log "Vendor update completed successfully"
    exit 0
  fi

  log "Smoke test failed, attempting rollback"
  for item in "${assets[@]}"; do
    IFS='|' read -r file_name _ _ <<< "${item}"
    if [[ -f "${backup_dir}/${file_name}" ]]; then
      cp -f "${backup_dir}/${file_name}" "${VENDOR_DIR}/${file_name}"
      log "Rolled back: ${file_name}"
    fi
  done

  (cd "${VENDOR_DIR}" && sha256sum *.js | sort > "${CHECKSUM_FILE}")
  (cd "${ROOT_DIR}" && docker compose up -d --build)

  log "Rollback completed"
  exit 1
}

main "$@"
