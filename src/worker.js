// -----------------------------------------------------------------------------
// configuration:

const api_key = 'my-password'

// -----------------------------------------------------------------------------
// documentation:

// https://developers.cloudflare.com/workers/runtime-apis/fetch/

// https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
// https://developer.mozilla.org/en-US/docs/Web/API/RequestInit
// https://developer.mozilla.org/en-US/docs/Web/API/Request
// https://developer.mozilla.org/en-US/docs/Web/API/Response
// https://developer.mozilla.org/en-US/docs/Web/API/Headers

// https://developer.mozilla.org/en-US/docs/Web/API/URL
// https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams

// -----------------------------------------------------------------------------
// do not edit:

export default {
	async fetch(request, env, ctx) {
		return handleProxyRequest(request, env, ctx)
	}
}

async function handleProxyRequest(request, env, ctx) {
  try {
    const req_url_params = (new URL(request.url)).searchParams

    if (!validate_key(req_url_params))
      return new Response(null, {status: 401, statusText: 'Unauthorized'})

    return await getProxyResponse(request, req_url_params)
  }
  catch(e) {
    return new Response(null, {status: 400, statusText: 'Bad Request'})
  }
}

function validate_key(req_url_params) {
  // no security
  if ((typeof api_key === 'undefined') || !api_key)
    return true

  const req_api_key = req_url_params.get('key')
  return (api_key === req_api_key)
}

async function getProxyResponse(request, req_url_params) {
  const proxyRequest  = getProxyRequest(request, req_url_params)
  const proxyResponse = await fetch(proxyRequest)

  const headers = new Headers(proxyResponse.headers)
  setCorsHeaders(headers, request.headers.get('Origin'))
  setHeaders(headers, req_url_params, 'resHeaders')

  return new Response(proxyResponse.body, {
    status:     proxyResponse.status,
    statusText: proxyResponse.statusText,
    headers:    headers
  })
}

function getProxyRequest(request, req_url_params) {
  const input = req_url_params.get('url')
  if (!input) throw new Error('missing required parameter: url')

  const headers = new Headers(request.headers)
  setHeaderParamValue(headers, 'cf-*:')
  setHeaders(headers, req_url_params, 'reqHeaders')

  return new Request(input, {
    method:  (request.method || 'GET'),
    headers: headers,
    body:    request.body
  })
}

function setHeaders(headers, req_url_params, param_name) {
  const param_values = req_url_params.getAll(param_name)

  while(param_values.length) {
    const param_value = param_values.shift()

    setHeaderParamValue(headers, param_value)
  }
}

function setHeaderParamValue(headers, param_value) {
  const split_index = param_value.indexOf(':')
  if (split_index < 0) return
  const header_name  = param_value.substring(0, split_index).trim()
  const header_value = param_value.substring(split_index + 1, param_value.length).trim()
  if (!header_name) return
  if (!header_value) {
    if (!header_name.endsWith('*')) {
      headers.delete(header_name)
    }
    else if (header_name.length === 1) {
      // param_value = "*:"
      for (const [entry_name, entry_value] of headers.entries()) {
        headers.delete(entry_name)
      }
    }
    else {
      // param_value = "${prefix}*:"
      const header_name_prefix = header_name.substring(0, header_name.length - 1).toLowerCase()
      for (const [entry_name, entry_value] of headers.entries()) {
        if (entry_name.toLowerCase().startsWith(header_name_prefix)) {
          headers.delete(entry_name)
        }
      }
    }
  }
  else {
    headers.set(header_name, header_value)
  }
}

function setCorsHeaders(headers, origin) {
  headers.set('Access-Control-Allow-Origin',      (origin || '*'))
  headers.set('Access-Control-Allow-Methods',     '*')
  headers.set('Access-Control-Allow-Headers',     '*')
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Max-Age',           '86400')
}
