# Guia de Setup — App Condomínio

## 1. Pré-requisitos no LXC Proxmox

```bash
# Ubuntu 22.04 LTS (recomendado para o LXC)
apt update && apt install -y docker.io docker-compose-plugin curl
systemctl enable --now docker
```

## 2. Deploy

```bash
git clone <seu-repo> /opt/app-condominio
cd /opt/app-condominio

cp .env.example .env
# Edite .env com seus valores reais
nano .env

docker compose up -d --build
```

## 3. Primeiro acesso

Após o build (alguns minutos), acesse http://localhost:3000.

- **Login Admin:** `admin@condominio.com` / `admin123`
- **Troca de senha obrigatória** no primeiro acesso.

## 4. Configurar WhatsApp (Evolution API)

```bash
# Criar instância na Evolution API
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: $EVOLUTION_API_KEY" \
  -d '{"instanceName":"portaria","qrcode":true}'

# Ver QR Code
curl http://localhost:8080/instance/connect/portaria \
  -H "apikey: $EVOLUTION_API_KEY"
```

Escaneie o QR Code com o celular da portaria. Feito isso, o número ficará conectado permanentemente (a instância persiste no volume Docker).

## 5. Configurar Google Drive (Service Account)

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto → APIs & Services → Enable **Google Drive API**
3. IAM & Admin → Service Accounts → Create → baixe o JSON
4. Crie uma pasta no Drive e compartilhe com o e-mail da Service Account (permissão Editor)
5. Copie o ID da pasta (na URL do Drive) para `GOOGLE_DRIVE_ROOT_FOLDER_ID` no `.env`
6. Cole o conteúdo do JSON (em uma linha) em `GOOGLE_SA_JSON` no `.env`

## 6. Cloudflare Tunnel

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → Zero Trust → Tunnels → Create
2. Escolha "Cloudflared" → copie o token para `CF_TUNNEL_TOKEN` no `.env`
3. Configure a rota no painel: `app.mhvl.com.br` → `http://web:3000`
4. `docker compose restart cloudflared`

## 7. Backup automático

```bash
# Crontab no host Proxmox (diário às 3h)
0 3 * * * docker exec app-condominio-postgres-1 \
  pg_dump -U condo condo | gzip > /backup/condo_$(date +\%Y\%m\%d).sql.gz
```

## 8. Atualizar o sistema

```bash
cd /opt/app-condominio
git pull
docker compose up -d --build
```
