/** Wraps CMS HTML in a mobile-friendly document for WebView rendering. */
export function buildLegalDocumentHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.55;
      color: #1e293b;
      padding: 0;
      margin: 0;
      -webkit-overflow-scrolling: touch;
    }
    h1, h2, h3, h4 {
      color: #172554;
      line-height: 1.3;
    }
    p { margin: 0 0 12px; }
    ul, ol { margin: 0 0 12px; padding-left: 20px; }
    a { color: #ea580c; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}
