FROM alpine:3.19

# Update the system
RUN apk update && apk upgrade

# Install vsftpd
RUN apk update && apk add --no-cache vsftpd ca-certificates

# Copy the vsftpd config to the container
COPY includes/vsftpd/vsftpd.conf /etc/vsftpd/
COPY includes/vsftpd/pam_pwdfile.so /lib/security/
COPY includes/vsftpd/vsftpd_pam /etc/pam.d/vsftpd
COPY includes/vsftpd/user_list /etc/vsftpd/
COPY includes/vsftpd/banner.txt /etc/vsftpd/

# Set up logging
RUN mkdir -p /var/log/vsftpd

# Create upload directory
RUN mkdir -p /uploads && chown ftp:ftp /uploads

VOLUME /var/log/vsftpd

ENV VSFTPD_EXTERNAL_IP 127.0.0.1
ENV VSFTPD_LISTEN_PORT 21
ENV VSFTPD_PASV_MIN_PORT 21100
ENV VSFTPD_PASV_MAX_PORT 21109
ENV VSFTPD_RSA_CERT_FILE /etc/pki/tls/certs/default.pem
ENV VSFTPD_RSA_PRIVATE_KEY_FILE /etc/pki/tls/private/default.key

# Start vsftpd
CMD /usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf -olisten_port=${VSFTPD_LISTEN_PORT} -opasv_address=${VSFTPD_EXTERNAL_IP} -opasv_min_port=${VSFTPD_PASV_MIN_PORT} -opasv_max_port=${VSFTPD_PASV_MAX_PORT} -orsa_cert_file=${VSFTPD_RSA_CERT_FILE} -orsa_private_key_file=${VSFTPD_RSA_PRIVATE_KEY_FILE}
