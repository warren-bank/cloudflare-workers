#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

url_cloudflare_worker='https://reverse-proxy-with-cors.warren-bank.workers.dev'
url_target='https://httpbin.org/ip'

url_request="${url_cloudflare_worker}/${url_target}"

curl -s -k -i -H 'Origin: https://let.me.see' -o "${DIR}/response.txt" "$url_request"
