import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function handleProxy(req: Request, method: 'GET' | 'POST') {
  const { searchParams } = new URL(req.url);
  let targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    const urlObj = new URL(targetUrl);
    const origin = urlObj.origin;

    const requestHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    let fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      redirect: 'follow',
    };

    if (method === 'POST') {
      const contentType = req.headers.get('content-type');
      if (contentType) requestHeaders['Content-Type'] = contentType;
      const bodyData = await req.arrayBuffer();
      fetchOptions.body = bodyData;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || 'text/html';

    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      let bodyText = await response.text();

      // Remove frame-busting security scripts & target="_top" attributes
      bodyText = bodyText.replace(/if\s*\(top\s*!==\s*self\)/gi, 'if(false)');
      bodyText = bodyText.replace(/top\.location\s*=/gi, 'window.location=');
      bodyText = bodyText.replace(/target=["']_top["']/gi, 'target="_self"');
      bodyText = bodyText.replace(/target=["']_parent["']/gi, 'target="_self"');

      // Inject AJAX & Link Click Interceptor Script
      const interceptorScript = `
        <script>
          (function() {
            try {
              Object.defineProperty(window, 'top', { get: function() { return window.self; } });
              Object.defineProperty(window, 'parent', { get: function() { return window.self; } });
            } catch(e) {}

            const origin = "${origin}";
            const origFetch = window.fetch;
            window.fetch = function(input, init) {
              let urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
              if (urlStr.startsWith('/') && !urlStr.startsWith('//')) {
                urlStr = origin + urlStr;
              }
              if (urlStr.startsWith('http') && !urlStr.includes('/api/proxy?url=')) {
                const proxiedUrl = '/api/proxy?url=' + encodeURIComponent(urlStr);
                return origFetch(proxiedUrl, init);
              }
              return origFetch(input, init);
            };

            const origOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...rest) {
              let urlStr = typeof url === 'string' ? url : '';
              if (urlStr.startsWith('/') && !urlStr.startsWith('//')) {
                urlStr = origin + urlStr;
              }
              if (urlStr.startsWith('http') && !urlStr.includes('/api/proxy?url=')) {
                urlStr = '/api/proxy?url=' + encodeURIComponent(urlStr);
              }
              return origOpen.call(this, method, urlStr, ...rest);
            };

            // Intercept link clicks to prevent top window hijack and open Google auth in popup
            document.addEventListener('click', function(e) {
              const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
              if (anchor) {
                if (anchor.target === '_top' || anchor.target === '_parent') {
                  anchor.target = '_self';
                }
                const href = anchor.href || '';
                if (href.includes('accounts.google.com') || href.includes('/ServiceLogin')) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(href, 'GoogleAuthPopup', 'width=540,height=660,left=200,top=100,status=no,menubar=no');
                }
              }
            }, true);
          })();
        </script>
      `;

      if (bodyText.includes('<head>')) {
        bodyText = bodyText.replace('<head>', `<head>${interceptorScript}`);
      } else {
        bodyText = interceptorScript + bodyText;
      }

      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', '*');
      headers.delete('x-frame-options');
      headers.delete('content-security-policy');
      headers.delete('x-content-type-options');

      return new Response(bodyText, {
        status: response.status,
        headers: headers,
      });
    } else {
      const buffer = await response.arrayBuffer();
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.delete('x-frame-options');
      headers.delete('content-security-policy');

      return new Response(buffer, {
        status: response.status,
        headers: headers,
      });
    }
  } catch (err: any) {
    console.error("Zodark Web Proxy Error:", err);
    return NextResponse.json({ error: `Failed to proxy URL: ${err.message}` }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handleProxy(req, 'GET');
}

export async function POST(req: Request) {
  return handleProxy(req, 'POST');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
