const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === "/" || pathname === "") {
      pathname = "/index.html";
    } else if (!path.extname(pathname)) {
      // Support clean URLs such as /services, /about, /contact
      const candidateHtml = path.join(ROOT, pathname + ".html");
      if (fs.existsSync(candidateHtml)) {
        pathname = pathname + ".html";
      }
    }

    const filePath = path.normalize(path.join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("403 Forbidden");
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        const notFoundPath = path.join(ROOT, "404.html");
        fs.readFile(notFoundPath, (err404, content404) => {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(err404 ? "404 Not Found" : content404);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("500 Internal Server Error");
          return;
        }
        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "no-cache"
        });
        res.end(content);
      });
    });
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`\n====================================================================`);
  console.log(`  CHANDA POULTRY AND SILAGE FEEDS PRIVATE LIMITED — Dev Server`);
  console.log(`  Local URL : http://localhost:${PORT}`);
  console.log(`  Clean URLs: http://localhost:${PORT}/services | /about | /contact`);
  console.log(`====================================================================\n`);
});
