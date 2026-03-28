// seo.ts

/**
 * Generate HTML meta tags for SEO.
 * @param title - The title of the page.
 * @param description - The description of the page.
 * @param image - The URL of the image.
 * @returns HTML string for meta tags.
 */
export const generateMetaTags = (title: string, description: string, image: string) => {
    return `\n    <meta property="og:title" content="${title}" />\n    <meta property="og:description" content="${description}" />\n    <meta property="og:image" content="${image}" />\n    <meta name="description" content="${description}" />\n`;
};

/**
 * Generate JSON-LD Schema Markup for a webpage.
 * @param data - The JSON-LD data to be converted.
 * @returns JSON-LD string for schema markup.
 */
export const generateSchema = (data: object) => {
    return JSON.stringify(data);
};

/**
 * Calculate reading time based on word count.
 * @param text - The text content to analyze.
 * @returns Estimated reading time in minutes.
 */
export const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.split(/\\\\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
};
