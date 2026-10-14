const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const index = path.join(dist, 'index.html');
const target404 = path.join(dist, '404.html');
const { loadEnv } = require('vite');
const siteUrl = 'https://www.scripthub.site';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const replaceTag = (html, selector, value) => html.replace(selector, (_, before, after) => `${before}${escapeHtml(value)}${after}`);

if (!fs.existsSync(index)) {
  console.error('index.html not found in dist. Run `npm run build` first.');
  process.exit(1);
}

async function generatePages() {
  fs.copyFileSync(index, target404);
  const template = fs.readFileSync(index, 'utf8');
  const env = loadEnv('production', path.join(__dirname, '..'), 'VITE_');
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  let scripts = [];
  if (supabaseUrl && anonKey) {
    const endpoint = new URL('/rest/v1/scripts', supabaseUrl);
    endpoint.searchParams.set('select', 'id,title,description,image_url,game_name,created_at');
    endpoint.searchParams.set('order', 'created_at.desc');
    endpoint.searchParams.set('limit', '1000');
    const response = await fetch(endpoint, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
    if (!response.ok) throw new Error(`Could not fetch public scripts for SEO pages: HTTP ${response.status}`);
    scripts = await response.json();
  }
  const urls = ['/', '/executors', '/about', '/privacy', '/slenderhub'];
  for (const script of scripts) {
    if (!/^[0-9a-f-]{36}$/i.test(script.id)) continue;
    const scriptPath = `/script/${script.id}`;
    const pageUrl = `${siteUrl}${scriptPath}`;
    const title = `${script.title} — ${script.game_name} | SlenderHub`;
    const description = (script.description || `View ${script.title} for ${script.game_name} on SlenderHub.`).replace(/\s+/g, ' ').slice(0, 155);
    let page = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
    page = replaceTag(page, /(<meta name="description" content=")[^"]*("\s*\/>)/, description);
    page = replaceTag(page, /(<link rel="canonical" href=")[^"]*("\s*\/>)/, pageUrl);
    page = replaceTag(page, /(<meta property="og:url" content=")[^"]*("\s*\/>)/, pageUrl);
    page = replaceTag(page, /(<meta property="og:title" content=")[^"]*("\s*\/>)/, title);
    page = replaceTag(page, /(<meta property="og:description" content=")[^"]*("\s*\/>)/, description);
    page = replaceTag(page, /(<meta name="twitter:title" content=")[^"]*("\s*\/>)/, title);
    page = replaceTag(page, /(<meta name="twitter:description" content=")[^"]*("\s*\/>)/, description);
    if (script.image_url?.startsWith('https://')) page = replaceTag(page, /(<meta property="og:image" content=")[^"]*("\s*\/>)/, script.image_url);
    const directory = path.join(dist, 'script');
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, `${script.id}.html`), page);
    const directoryRoute = path.join(directory, script.id);
    fs.mkdirSync(directoryRoute, { recursive: true });
    fs.writeFileSync(path.join(directoryRoute, 'index.html'), page);
    urls.push(scriptPath);
  }
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${escapeHtml(siteUrl + url)}</loc></url>`).join('')}</urlset>`);
  fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
  const redirectsFile = path.join(dist, '_redirects');
  const fallbackRedirects = fs.existsSync(redirectsFile) ? fs.readFileSync(redirectsFile, 'utf8') : '/* /index.html 200\n';
  const scriptRedirects = scripts.filter(script => /^[0-9a-f-]{36}$/i.test(script.id))
    .flatMap(script => [`/script/${script.id} /script/${script.id}/index.html 200!`, `/script/${script.id}/ /script/${script.id}/index.html 200!`]);
  fs.writeFileSync(redirectsFile, `${scriptRedirects.join('\n')}\n${fallbackRedirects}`);
  console.log(`Generated ${scripts.length} script pages and sitemap.xml`);
}

generatePages().catch(err => {
  console.error('Failed to copy index.html to 404.html', err);
  process.exit(1);
});
