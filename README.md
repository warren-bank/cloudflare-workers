### [reverse-proxy-with-cors](https://github.com/warren-bank/cloudflare-workers/tree/reverse-proxy-with-cors)

Reverse proxy to conditionally inject HTTP response headers that permit CORS.

#### Install with [`wrangler`](https://www.npmjs.com/package/wrangler):

```bash
cd ~/temp-workspace

git clone --depth 1 -b 'reverse-proxy-with-cors' 'https://github.com/warren-bank/cloudflare-workers.git' 'reverse-proxy-with-cors'
cd 'reverse-proxy-with-cors'

# edit file: src/worker.js
# customize: allow_URLs_regex

wranger deploy
```

#### Install with Cloudflare Dashboard:

1. open the Dashboard for your Cloudflare account
   - the free tier is OK
   - URL: `https://dash.cloudflare.com/<Account-ID>`
2. open: Dashboard &gt; Compute &amp; AI &gt; Workers &amp; Pages
   - URL: `https://dash.cloudflare.com/<Account-ID>/workers-and-pages`
3. click: "Create application"
   - URL: `https://dash.cloudflare.com/<Account-ID>/workers-and-pages/create`
4. click: "Start with Hello World!"
   - enter:
     * Worker name = `reverse-proxy-with-cors`
   - click: "Deploy"
5. view Worker
   - URL: `https://dash.cloudflare.com/<Account-ID>/workers/services/view/reverse-proxy-with-cors/production`
6. click: "..." menu in top right &gt; Edit code
   - URL: `https://dash.cloudflare.com/<Account-ID>/workers/services/edit/reverse-proxy-with-cors/production`
7. edit Worker
   - enter:
     * `worker.js` = copy and paste code from [./src/worker.js](https://github.com/warren-bank/cloudflare-workers/raw/reverse-proxy-with-cors/src/worker.js)
   - customize:
     * change value of `allow_URLs_regex`
   - click: "Deploy"

#### Usage:

```bash
# pre-condition:
#   const allow_URLs_regex = /^https?:\/\/(?:www\.)?httpbin\.org\/ip$/i

url_cloudflare_worker='https://reverse-proxy-with-cors.warren-bank.workers.dev'
url_target='https://httpbin.org/ip'

url_request="${url_cloudflare_worker}/${url_target}"

curl -s -k -i -H "Origin: https://let.me.see" -o "response.txt" "$url_request"
```

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
