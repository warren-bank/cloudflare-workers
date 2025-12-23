@echo off

set DIR=%~dp0.

set url_cloudflare_worker=https://reverse-proxy-with-cors.warren-bank.workers.dev
set url_target=https://httpbin.org/ip

set url_request="%url_cloudflare_worker%/%url_target%"

curl -s -k -i -H "Origin: https://let.me.see" -o "%DIR%\response.txt" %url_request%
