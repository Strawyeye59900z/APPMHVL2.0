#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  install.sh — Instalação inicial do App Condomínio no LXC
#  Uso: bash install.sh
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

# ── 1. Root check ────────────────────────────────────────────
[ "$(id -u)" -eq 0 ] || err "Execute como root: sudo bash install.sh"

step "Atualizando pacotes e instalando dependências"
apt-get update -q
apt-get install -y -q docker.io docker-compose curl nano git
systemctl enable --now docker
log "Docker instalado e iniciado"

# ── 2. Diretório de instalação ───────────────────────────────
step "Preparando diretório $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
mkdir -p /backup

# Copia arquivos do diretório atual se não estiver já em /opt
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$SCRIPT_DIR" != "$INSTALL_DIR" ]; then
  cp -r "$SCRIPT_DIR/." "$INSTALL_DIR/"
  log "Arquivos copiados para $INSTALL_DIR"
fi
cd "$INSTALL_DIR"

# ── 3. Configuração do .env ──────────────────────────────────
step "Configurando variáveis de ambiente"
if [ ! -f .env ]; then
  cp .env.example .env
  warn "Arquivo .env criado a partir do .env.example"
  echo ""
  echo -e "${YELLOW}══════════════════════════════════════════════════${RESET}"
  echo -e "${YELLOW}  ATENÇÃO: Edite o .env antes de continuar!${RESET}"
  echo -e "${YELLOW}  Preencha: JWT_SECRET, JWT_REFRESH_SECRET,${RESET}"
  echo -e "${YELLOW}  GOOGLE_SA_JSON, GOOGLE_DRIVE_ROOT_FOLDER_ID,${RESET}"
  echo -e "${YELLOW}  EVOLUTION_API_KEY e CF_TUNNEL_TOKEN${RESET}"
  echo -e "${YELLOW}══════════════════════════════════════════════════${RESET}"
  echo ""
  read -rp "Pressione ENTER após editar o .env para continuar (ou Ctrl+C para sair e editar agora): "
else
  log ".env já existe, mantendo configurações atuais"
fi

# Validação mínima do .env
check_env() {
  local val
  val=$(grep -E "^$1=" .env | cut -d= -f2-)
  if [ -z "$val" ] || echo "$val" | grep -qE "^(troque|token_do|chave_da)"; then
    warn "Variável $1 parece não configurada — verifique o .env"
  fi
}
check_env "JWT_SECRET"
check_env "JWT_REFRESH_SECRET"
check_env "CF_TUNNEL_TOKEN"
check_env "GOOGLE_DRIVE_ROOT_FOLDER_ID"

# ── 4. Build e subida dos containers ─────────────────────────
step "Fazendo build e iniciando containers (pode demorar ~5 min no primeiro build)"
docker compose up -d --build
log "Containers iniciados"

# ── 5. Aguarda o banco subir ──────────────────────────────────
step "Aguardando PostgreSQL ficar pronto"
attempt=0
until docker compose exec -T postgres pg_isready -U condo -q 2>/dev/null; do
  attempt=$((attempt + 1))
  [ $attempt -ge 30 ] && err "PostgreSQL não respondeu após 60s"
  sleep 2
done
log "PostgreSQL pronto"

# ── 6. Migrations e seed ─────────────────────────────────────
step "Rodando migrations do banco"
docker compose exec -T api npx prisma migrate deploy
log "Migrations aplicadas"

step "Rodando seed (criando admin padrão)"
docker compose exec -T api npx ts-node prisma/seed.ts || \
  docker compose exec -T api node dist/prisma/seed.js || \
  warn "Seed não executado automaticamente — rode manualmente se necessário"

# ── 7. Cron de backup ─────────────────────────────────────────
step "Configurando backup automático diário às 3h"
CRON_JOB="0 3 * * * docker exec app-condominio-postgres-1 pg_dump -U condo condo | gzip > /backup/condo_\$(date +\%Y\%m\%d).sql.gz"
(crontab -l 2>/dev/null | grep -v "app-condominio-postgres"; echo "$CRON_JOB") | crontab -
log "Cron de backup configurado"

# ── 8. Resumo ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  App Condomínio instalado com sucesso!${RESET}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════${RESET}"
echo ""
echo -e "  Acesso local:   ${BOLD}http://$(hostname -I | awk '{print $1}'):3000${RESET}"
echo -e "  Acesso público: ${BOLD}https://app.mhvl.com.br${RESET} (após configurar Tunnel)"
echo ""
echo -e "  Login admin:    ${BOLD}admin@condominio.com${RESET} / ${BOLD}admin123${RESET}"
echo -e "  ${YELLOW}Troque a senha no primeiro acesso!${RESET}"
echo ""
echo -e "  Logs:    docker compose -f $INSTALL_DIR/docker-compose.yml logs -f"
echo -e "  Status:  docker compose -f $INSTALL_DIR/docker-compose.yml ps"
echo ""
