# FTP Server

## Description

## Usage

- Create data dirs: `mkdir -p mounted_data/ftp-server mounted_data/uploads/{org1,org2}`
- Fix permissions for FTP uploads dir: `chmod 777 mounted_data/uploads/{org1,org2}`
- Initiate ftp org: `docker compose run --rm ftp-org-manager init-org org1`
- Create ftp user for org: `docker compose run --rm ftp-org-manager user-create org1 testing`
- Start services `docker compose up -d`

## Build Docker Images

```bash
docker build -f dockerfiles/ftp-server.dockerfile dockerfiles
docker build -f dockerfiles/ftp-org-manager.dockerfile .
```

## Running in Production

`docker-compose.yml` service

```yaml
services:
  ftp-server-org2:
    container_name: ftp-server-org2
    image: processwiz/ftp-server:latest
    depends_on:
      - traefik-certs-dumper
    volumes:
      - ./mounted_data/ftp-server/org2/ftpusers.passwd:/etc/vsftpd/ftpusers.passwd:ro
      - ./mounted_data/ftp-server/org2/logs/:/var/log/vsftpd/
      - ./mounted_data/uploads/org2:/uploads
      - ./mounted_data/extracted-certs/:/etc/pki/tls/:ro
    environment:
      VSFTPD_EXTERNAL_IP: ${FTP_SERVER_EXTERNAL_IP}
      VSFTPD_LISTEN_PORT: 10022
      VSFTPD_PASV_MIN_PORT: 21110
      VSFTPD_PASV_MAX_PORT: 21119
      VSFTPD_RSA_CERT_FILE: /etc/pki/tls/certs/${APP_HOSTNAME}.crt
      VSFTPD_RSA_PRIVATE_KEY_FILE: /etc/pki/tls/private/${APP_HOSTNAME}.key
    ports:
      - "10022:10022"
      - "21110-21119:21110-21119"
    restart: unless-stopped

  ftp-org-manager:
    container_name: ftp-org-manager
    image: processwiz/ftp-org-manager:latest
    volumes:
      - ./mounted_data/ftp-server:/tmp/orgs
    user: 1000:1000
    profiles: [ 'tools' ]
    restart: no
```
