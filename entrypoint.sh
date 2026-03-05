#!/bin/sh

cd /usr/local/apache2/conf
if [ -n $BACKEND_BASE_URL ]; then
	envsubst < httpd.template.conf > httpd.conf
	echo "INFO: proxy from /api to $BACKEND_BASE_URL enabled" >&2
else
	cp httpd.backup.conf httpd.conf
	echo 'WARNING: BACKEND_BASE_URL env var is not set; proxy disabled' >&2
fi

exec httpd-foreground
