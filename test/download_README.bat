@echo off

set DIR=%~dp0.

set url_cloudflare_worker=https://reverse-proxy-github-markdown.warren-bank.workers.dev
set url_markdown=https://github.com/warren-bank/cloudflare-workers/blob/reverse-proxy-github-markdown/README.md

set url_request="%url_cloudflare_worker%/%url_markdown%?target=_blank&padding=20"

curl -s -k -i -o "%DIR%\README.html" %url_request%
