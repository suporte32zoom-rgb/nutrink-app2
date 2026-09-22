import fs from 'fs';
import path from 'path';

/**
 * Gerador Automático de Sitemap para NutrinK
 * Domínio base oficial e estrito: https://nutrink.com.br
 */

const BASE_DOMAIN = 'https://nutrink.com.br';
const TODAY = new Date().toISOString().split('T')[0];

const SITEMAP_ROUTES = [
  // 1. Página Principal (Home)
  { path: '/', priority: '1.0', changefreq: 'daily' },

  // 2. Módulos Principais & Conversão
  { path: '/#planos', priority: '0.9', changefreq: 'weekly' },
  { path: '/#telemedicina', priority: '0.9', changefreq: 'weekly' },
  { path: '/#nutria-ia', priority: '0.9', changefreq: 'weekly' },
  { path: '/#nutricalc', priority: '0.8', changefreq: 'weekly' },
  { path: '/#prontuario', priority: '0.8', changefreq: 'weekly' },
  { path: '/#agenda', priority: '0.8', changefreq: 'weekly' },
  { path: '/#financeiro', priority: '0.8', changefreq: 'weekly' },

  // 3. Páginas Institucionais & Recursos
  { path: '/#doc-inicio', priority: '0.8', changefreq: 'monthly' },
  { path: '/#doc-recursos', priority: '0.8', changefreq: 'monthly' },
  { path: '/#doc-planos', priority: '0.8', changefreq: 'weekly' },
  { path: '/#doc-sobre', priority: '0.7', changefreq: 'monthly' },
  { path: '/#doc-metodologia', priority: '0.7', changefreq: 'monthly' },
  { path: '/#doc-clientes', priority: '0.7', changefreq: 'monthly' },
  { path: '/#doc-faq', priority: '0.8', changefreq: 'weekly' },
  { path: '/#doc-fale_conosco', priority: '0.6', changefreq: 'monthly' },
  { path: '/#doc-acessar', priority: '0.6', changefreq: 'monthly' },

  // 4. Páginas Legais, Privacidade & Termos
  { path: '/#doc-privacidade_lgpd', priority: '0.6', changefreq: 'monthly' },
  { path: '/#doc-termos_servico', priority: '0.6', changefreq: 'monthly' },
  { path: '/#doc-politica_uso_aceitavel', priority: '0.6', changefreq: 'monthly' }
];

export function generateSitemapXml() {
  const urlsXml = SITEMAP_ROUTES.map(route => {
    const loc = route.path === '/' ? `${BASE_DOMAIN}/` : `${BASE_DOMAIN}${route.path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- ========================================== -->
  <!-- 1. PÁGINA PRINCIPAL (HOME)                -->
  <!-- Domínio Base Oficial: https://nutrink.com.br -->
  <!-- ========================================== -->
${urlsXml}

</urlset>
`;
}

export function writeSitemapFiles() {
  const rootDir = process.cwd();
  const xml = generateSitemapXml();

  const targets = [
    path.join(rootDir, 'sitemap.xml'),
    path.join(rootDir, 'public', 'sitemap.xml')
  ];

  targets.forEach(targetPath => {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, xml, 'utf8');
    console.log(`[SITEMAP] Gerado com sucesso: ${targetPath}`);
  });
}

// Execução direta via CLI
writeSitemapFiles();
