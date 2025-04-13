FROM alpine:3.19

RUN apk update && apk add --no-cache python3 py3-click py3-passlib

WORKDIR /app

COPY source/ftp_org_manager/ftp_org_manager.py /app/

ENTRYPOINT ["python", "/app/ftp_org_manager.py"]
