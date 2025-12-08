### [Cloudflare Workers](https://github.com/warren-bank/cloudflare-workers/tree/main)

Assorted collection of Cloudflare Workers:

* [reverse-proxy-github-markdown](https://github.com/warren-bank/cloudflare-workers/tree/reverse-proxy-github-markdown)
  - reverse proxy to display GitHub markdown files in any public repo without any other HTML page elements
  - usage:
    * prepend URL of Cloudflare Worker to the GitHub URL for the markdown file, such that the GitHub URL is the pathname
  - example:
    * [URL of Cloudflare Worker](https://reverse-proxy-github-markdown.warren-bank.workers.dev)
    * [URL of GitHub markdown file](https://github.com/warren-bank/crx-LiveNewsOn/blob/webmonkey-userscript/es5/BOOKMARKS.md)
    * [URL to view proxied markdown](https://reverse-proxy-github-markdown.warren-bank.workers.dev/https://github.com/warren-bank/crx-LiveNewsOn/blob/webmonkey-userscript/es5/BOOKMARKS.md?target=_blank&padding=20)
