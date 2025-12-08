export default {
	async fetch(request, env, ctx) {
		return handleProxyRequest(request, env, ctx)
	}
}

/*
 * depends on HTMLRewriter class:
 *   https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/
 */

const rewriter = new HTMLRewriter()

class DocumentHandler {
  doctype(doctype) {
  }

  comments(comment) {
    comment.remove()
  }

  text(text) {
    text.remove()
  }

  end(end) {
  }
}

class ElementHandler {
  constructor() {
    this.txt = ''
  }

  element(element) {
    if (!ElementHandler.isScriptElement(element)) {
      element.removeAndKeepContent()
    }
  }

  comments(comment) {
    comment.remove()
  }

  text(text) {
    if (!text.removed) {
      this.txt += text.text

      if (text.lastInTextNode) {
        const html = this.extractMarkdownHtml()
        this.txt = ''

        if (html)
          text.replace(html, {html: true})
        else
          text.remove()
      }
    }
  }

  extractMarkdownHtml() {
    try {
      const data = JSON.parse(this.txt)
      return data.payload.blob.richText
    }
    catch(e) {}
    return null
  }

  static isScriptElement(element) {
    return ElementHandler.isTagName(element, 'script')
        && ElementHandler.hasTagAttribute(element, 'type', 'application/json')
        && ElementHandler.hasTagAttribute(element, 'data-target', 'react-app.embeddedData')
  }

  static isTagName(element, name) {
    return (element.tagName.toLowerCase() === name)
  }

  static hasTagAttribute(element, name, value) {
    return element.hasAttribute(name) && (element.getAttribute(name) === value)
  }
}

rewriter
  .onDocument(new DocumentHandler())
  .on('*', new ElementHandler())

const regexs = {
  validate: {
    pathname: /^\/https?:\/\/(?:[^\.\/]*\.)*github\.com\/[^\/]+\/[^\/]+\/blob\/.+\.(?:md|markdown|mdown|mkdn)(\?.*)?$/,
    target:   /^_?blank$/
  }
}

async function handleProxyRequest(request, env, ctx) {
  const url = new URL(request.url)

  if (!validate(url))
    return handleRedirectResponse(url)

  const github_url = url.pathname.substring(1)
  const options    = parseOptions(url)

  const proxyRequest        = new Request(github_url)
  const proxyResponse       = await fetch(proxyRequest)
  const transformedResponse = await rewriter.transform(proxyResponse)

  if (!transformedResponse || !transformedResponse.body)
    return handleRedirectResponse(url)

  const transformedHtml = await transformedResponse.text()
  const finalHtml       = modifyHtml(transformedHtml, options)

  if (!finalHtml)
    return handleRedirectResponse(url)

  return new Response(finalHtml, {
    status:     proxyResponse.status,
    statusText: proxyResponse.statusText,
    headers:    proxyResponse.headers
  })
}

function validate(url) {
  const pathname = url.pathname

  return regexs.validate.pathname.test(pathname)
}

function handleRedirectResponse(url) {
  const pathname   = url.pathname
  const github_url = pathname.substring(1)

  if (github_url.substring(0,4).toLowerCase() === 'http') {
    // 301 Moved Permanently
    return new Response(null, {
      status: 301,
      headers: {
        "Location": github_url
      }
    })
  }
  else {
    // 400 Bad Request
    return new Response(pathname, {
      status: 400
    })
  }
}

function parseOptions(url) {
  return {
    target:  parseOptionalTarget(url),
    padding: parseOptionalPadding(url)
  }
}

function parseOptionalTarget(url) {
  const qs    = url.searchParams
  const value = qs.get('target')
  if (!value) return false

  return regexs.validate.target.test(value)
}

function parseOptionalPadding(url) {
  const qs    = url.searchParams
  const value = qs.get('padding')
  if (!value) return null

  let padding = decodeURIComponent(value)

  if (/^\d+$/.test(padding))
    padding = padding + 'px'

  return padding
}

function modifyHtml(html, options) {
  let needle, index

  // trim left
  needle = '<article'
  index = html.indexOf(needle)
  if (index < 0)
    return null
  if (index > 0)
    html = html.substring(index)

  // trim right
  needle = '</article>'
  index = html.lastIndexOf(needle)
  if (index < 0)
    return null
  if (index > 0)
    html = html.substring(0, index + needle.length)

  if (options.target)
    html = html.replace(/(<a)\s+/g, '$1 target="_blank" ')

  if (options.padding)
    html = `<body style="padding: ${options.padding};">\n${html}\n</body>`
  else
    html = `<body>\n${html}\n</body>`

  html = `<!doctype html>\n<html>\n${html}\n</html>`

  return html
}
