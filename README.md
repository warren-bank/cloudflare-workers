### [corsproxy](https://github.com/warren-bank/cloudflare-workers/tree/corsproxy)

Reverse proxy to conditionally inject HTTP response headers that permit CORS.

#### Notes

* the [reverse-proxy-with-cors](https://github.com/warren-bank/cloudflare-workers/tree/reverse-proxy-with-cors) Cloudflare Worker is an earlier effort with similar goals
* this [corsproxy](https://github.com/warren-bank/cloudflare-workers/tree/corsproxy) Cloudflare Worker differs in the following ways:
  - [corsproxy.io](https://corsproxy.io/) API compatibility&hellip; can be used as a self-hosted drop-in replacement
  - supports per-request [header overrides](https://corsproxy.io/docs/header-rewrites/) via query parameters
  - supports restricting access to requests that include a hard-coded [API key](https://corsproxy.io/docs/get-api-key/)
* [corsproxy.io](https://corsproxy.io/) offers a [free-tier](https://corsproxy.io/pricing/) for development:
  - no account required
  - requests must originate from a development server:
    * localhost
    * github.io
    * ngrok.io
    * trycloudflare.com
    * etc&hellip;
  - commentary:
    * this is very generous&hellip;<br>and could be used for SPAs hosted by [Github Pages](https://pages.github.com/)
    * it is unclear to me how they count bandwidth
      - the limit is: 10 GB of bandwidth per month
      - is this counted by the request `Origin`,<br>or `IP` of client making the request
      - as `localhost` is a whitelisted `Origin`,<br>I would assume they must count based on `IP`&hellip;<br>but who knows?
    * in any case, I wouldn't feel right about filtering massive amounts of bandwidth through the free-tier of their service

#### Real-World Examples

* the [Crossword Puzzles](https://warren-bank.github.io/single-page-apps/crossword-puzzles/index.html) SPA
  - uses the [reverse-proxy-with-cors](https://github.com/warren-bank/cloudflare-workers/tree/reverse-proxy-with-cors) Cloudflare Worker to fetch [external crossword puzzles](https://github.com/warren-bank/single-page-apps/blob/726bd3a47e667e2cb7579ae3e369f4b8391626c1/crossword-puzzles/js/tags.js#L101-L125)
    * hostname of deployed Cloudflare Worker:<br>`https://cors-crossword-puzzles.warren-bank.workers.dev/`
* the [yt-dlp web console](https://warren-bank.github.io/single-page-apps/yt-dlp-web-console/index.html) SPA
  - uses the [Simple Modify Headers - Extended](https://github.com/warren-bank/crx-simple-modify-headers/tree/extended) WebExtension that requires [Manifest v2 (_mv2_)](https://developer.chrome.com/docs/extensions/mv2) to extract and rehydrate "unsafe" request headers that were [encoded and embedded](https://github.com/warren-bank/single-page-apps/blob/d1b53e3248626405088270124622075f717eead4/yt-dlp-web-console/index.pyodide-0.27.0-fork-2.0.0.html#L361-L471) into ["safe" request header](https://developer.mozilla.org/en-US/docs/Glossary/CORS-safelisted_request_header) values
    * default behavior
    * Chrome 139 [removed support for _mv2_ WebExtensions](https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline)
  - uses the [corsproxy](https://github.com/warren-bank/cloudflare-workers/tree/corsproxy) Cloudflare Worker
    * alternate behavior
      - instead of the _mv2_ WebExtension
      - enabled by configuration
    * hostname of deployed Cloudflare Worker:<br>`https://cors-yt-dlp-web-console.warren-bank.workers.dev/`

#### Install with [`wrangler`](https://www.npmjs.com/package/wrangler):

```bash
cd ~/temp-workspace

git clone --depth 1 -b 'corsproxy' 'https://github.com/warren-bank/cloudflare-workers.git' 'corsproxy'
cd 'corsproxy'

# edit file: src/worker.js
# customize: api_key

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
     * Worker name = `corsproxy`
   - click: "Deploy"
5. view Worker
   - URL: `https://dash.cloudflare.com/<Account-ID>/workers/services/view/corsproxy/production`
6. click: "..." menu in top right &gt; Edit code
   - URL: `https://dash.cloudflare.com/<Account-ID>/workers/services/edit/corsproxy/production`
7. edit Worker
   - enter:
     * `worker.js` = copy and paste code from [./src/worker.js](https://github.com/warren-bank/cloudflare-workers/raw/corsproxy/src/worker.js)
   - customize:
     * change value of `api_key`
   - click: "Deploy"

#### Usage:

```javascript
  const api_url     = 'https://corsproxy.warren-bank.workers.dev/'
  const api_key     = 'my-password'
  const req_url     = 'https://httpbin.org/anything'
  const req_headers = [{name: 'x-foo', value: 'req-foo'},{name: 'x-bar', value: 'req-bar'}]
  const res_headers = [{name: 'x-foo', value: 'res-foo'},{name: 'x-bar', value: 'res-bar'}]

  const qs_params = [`url=${encodeURIComponent(req_url)}`]
  if (api_key)
    qs_params.push(`key=${encodeURIComponent(api_key)}`)
  for(const {name: header_name, value: header_value} of req_headers) {
    qs_params.push(`reqHeaders=${encodeURIComponent(`${header_name}:${header_value || ''}`)}`)
  }
  for(const {name: header_name, value: header_value} of res_headers) {
    qs_params.push(`resHeaders=${encodeURIComponent(`${header_name}:${header_value || ''}`)}`)
  }

  let corsproxy_url = api_url || 'https://corsproxy.io/'
  corsproxy_url += '?' + qs_params.join('&')

  console.log(corsproxy_url)
  // https://corsproxy.warren-bank.workers.dev/?url=https%3A%2F%2Fhttpbin.org%2Fanything&key=my-password&reqHeaders=x-foo%3Areq-foo&reqHeaders=x-bar%3Areq-bar&resHeaders=x-foo%3Ares-foo&resHeaders=x-bar%3Ares-bar

  fetch(corsproxy_url, {method: 'GET'})
    .then(res => res.json()).then(console.log)

  fetch(corsproxy_url, {method: 'POST', body: '{"hello": "world"}', headers: {'content-type': 'application/json'}})
    .then(res => res.json()).then(console.log)
```

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
