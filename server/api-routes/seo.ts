import { Router } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { blogPosts } from '@shared/schema';

const router = Router();

// Generate and serve sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Get base URL from host or default
    const host = req.get('host') || 'advisoroffers.com';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Static routes - core pages of the application
    const staticRoutes = [
      '/',                   // Homepage
      '/calculator',         // Calculator page
      '/about',              // About page
      '/contact',            // Contact page
      '/blog',               // Blog index
      '/marketplace',        // Marketplace
      '/auth',               // Auth page
      '/pricing',            // Pricing page
      '/terms',              // Terms page
      '/privacy',            // Privacy policy
    ];
    
    // Get dynamic blog posts
    const blogPostsData = await db.select({
      slug: blogPosts.slug,
      createdAt: blogPosts.createdAt,
      // Only include published posts
    }).from(blogPosts).where(eq(blogPosts.published, true));
    
    // Start XML generation
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static routes
    staticRoutes.forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${route}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });
    
    // Add blog posts
    blogPostsData.forEach(post => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      // Add last modified date if available
      if (post.createdAt) {
        const date = new Date(post.createdAt);
        xml += `    <lastmod>${date.toISOString().split('T')[0]}</lastmod>\n`;
      }
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });
    
    // Close XML
    xml += '</urlset>';
    
    // Set proper headers and send response
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Serve robots.txt
router.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'advisoroffers.com';
  const protocol = req.protocol || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/api/seo/sitemap.xml

# Disallow admin areas
Disallow: /secure-management-portal
Disallow: /api/admin-auth
`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;