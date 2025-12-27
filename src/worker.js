// -----------------------------------------------------------------------------
// configuration:

const allow_URLs_regex = /^https?:\/\/(?:www\.)?httpbin\.org\/ip$/i

// https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options
const request_options = {
  "headers": {
    "User-Agent": "Chrome 100"
  }
}

// -----------------------------------------------------------------------------
// do not edit:

export default {
	async fetch(request, env, ctx) {
		return handleProxyRequest(request, env, ctx)
	}
}

async function handleProxyRequest(request, env, ctx) {
  const url = new URL(request.url)

  if (!validate(url))
    return handleRedirectResponse(url)

  const target_url = url.pathname.substring(1)

  const proxyRequest    = new Request(target_url, request_options)
  const proxyResponse   = await fetch(proxyRequest)
  const responseHeaders = new Headers(proxyResponse.headers)

  injectCorsResponseHeaders(responseHeaders, request.headers.get('Origin'))

  return new Response(proxyResponse.body, {
    status:     proxyResponse.status,
    statusText: proxyResponse.statusText,
    headers:    responseHeaders
  })
}

function validate(url) {
  const pathname = url.pathname

  return (pathname.length && (pathname[0] === '/') && allow_URLs_regex.test(pathname.substring(1)))
}

function handleRedirectResponse(url) {
  const pathname   = url.pathname
  const target_url = pathname.substring(1)

  if (target_url.substring(0,4).toLowerCase() === 'http') {
    // 301 Moved Permanently
    return new Response(null, {
      status: 301,
      headers: {
        "Location": target_url
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

function injectCorsResponseHeaders(res_headers, req_origin) {
  res_headers.set('Access-Control-Allow-Origin',      req_origin || '*')
  res_headers.set('Access-Control-Allow-Methods',     '*')
  res_headers.set('Access-Control-Allow-Headers',     '*')
  res_headers.set('Access-Control-Allow-Credentials', 'true')
  res_headers.set('Access-Control-Max-Age',           '86400')
}
