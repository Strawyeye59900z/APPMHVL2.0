#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  update.sh — Atualização do App Condomínio
#  Uso: bash update.sh
# ─────────────────────────────────────────────────────────────

INSTALL_DIR="/opt/app-condominio"
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

log()  { echo -e "${GREEN}[✔]${RESET} $1"; }
warn() { echo -e "${YELLOW}[!]${RESET} $1"; }
err()  { echo -e "${RED}[✘]${RESET} $1"; exit 1; }
step() { echo -e "\n${BOLD}▶ $1${RESET}"; }

[ "$(id -u)" -eq 0 ] || err "Execute como root: sudo bash update.sh"
[ -d "$INSTALL_DIR" ] || err "Diretório $INSTALL_DIR não encontrado. Rode install.sh primeiro."

cd "$INSTALL_DIR"

# ── 1. Backup antes de atualizar ─────────────────────────────
step "Fazendo backup do banco antes da atualização"
BACKUP_FILE="/backup/condo_pre_update_$(date +%Y%m%d_%H%M%S).sql.gz"
docker compose exec -T postgres pg_dump -U condo condo | gzip > "$BACKUP_FILE" && \
  log "Backup salvo em $BACKUP_FILE" || \
  warn "Backup falhou — continuando mesmo assim"

# ── 2. Pull do código novo ────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$SCRIPT_DIR" != "$INSTALL_DIR" ]; then
  step "Copiando arquivos novos para $INSTALL_DIR"
  # Preserva o .env atual
  cp .env /tmp/condo_env_backup
  cp -r "$SCRIPT_DIR/." "$INSTALL_DIR/"
  cp /tmp/condo_env_backup .env
  log "Arquivos atualizados (.env preservado)"
elif [ -d .git ]; then
  step "Baixando atualizações do repositório Git"
  git pull
  log "Código atualizado via git pull"
else
  warn "Execute este script a partir do diretório com os novos arquivos"
fi

# ── 3. Rebuild e restart ──────────────────────────────────────
step "Rebuilding containers com o novo código"
docker compose up -d --build
log "Containers atualizados"

# ── 4. Migrations ─────────────────────────────────────────────
step "Aplicando migrations do banco (se houver novas)"
attempt=0
until docker compose exec -T postgres pg_isready -U condo -q 2>/dev/null; do
  attempt=$((attempt + 1))
  [ $attempt -ge 30 ] && err "PostgreSQL não respondeu após 60s"
  sleep 2
done
docker compose exec -T api npx prisma migrate deploy
log "Migrations aplicadas"

# ── 5. Limpeza de imagens antigas ────────────────────────────
step "Removendo imagens Docker antigas"
docker image prune -f --filter "until=24h" 2>/dev/null || true
log "Limpeza concluída"

# ── 6. Status final ───────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  Atualização concluída!${RESET}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════${RESET}"
echo ""
docker compose ps
echo ""
echo -e "  Backup pré-update: ${BOLD}$BACKUP_FILE${RESET}"
echo ""
