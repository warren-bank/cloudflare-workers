### [reverse-proxy-github-markdown](https://github.com/warren-bank/cloudflare-workers/tree/reverse-proxy-github-markdown)

Reverse proxy to display GitHub markdown files in any public repo without any other HTML page elements.

#### Install with [`wrangler`](https://www.npmjs.com/package/wrangler):

```bash
cd ~/temp-workspace

git clone --depth 1 -b 'reverse-proxy-github-markdown' 'https://github.com/warren-bank/cloudflare-workers.git' 'reverse-proxy-github-markdown'
cd 'reverse-proxy-github-markdown'

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
     * Worker name = `reverse-proxy-github-markdown`
   - click: "Deploy"
5. view Worker
   - URL: `https://dash.cloudflare.com/<Account-ID>/workers/services/view/reverse-proxy-github-markdown/production`
6. click: "..." menu in top right &gt; Edit code
   - URL: `https://dash.cloudflare.com/<Account-ID>/workers/services/edit/reverse-proxy-github-markdown/production`
7. edit Worker
   - enter:
     * `worker.js` = copy and paste code from [./src/worker.js](https://github.com/warren-bank/cloudflare-workers/raw/reverse-proxy-github-markdown/src/worker.js)
   - click: "Deploy"

#### Usage:

```bash
url_cloudflare_worker='https://reverse-proxy-github-markdown.warren-bank.workers.dev'
url_markdown='https://github.com/warren-bank/cloudflare-workers/blob/reverse-proxy-github-markdown/README.md'

url_request="${url_cloudflare_worker}/${url_markdown}?target=_blank&padding=20"

wget -O "README.html" "$url_request"
```

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
