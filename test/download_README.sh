#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

url_cloudflare_worker='https://reverse-proxy-github-markdown.warren-bank.workers.dev'
url_markdown='https://github.com/warren-bank/cloudflare-workers/blob/reverse-proxy-github-markdown/README.md'

url_request="${url_cloudflare_worker}/${url_markdown}?target=_blank&padding=20"

curl -s -k -i -o "${DIR}/README.html" "$url_request"
