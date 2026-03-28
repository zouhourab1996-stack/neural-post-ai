const fs = require('fs');
const RSS = require('rss');

// Fetch articles from your data source (e.g., database, API)
const fetchArticles = async () => {
    // Replace this with your actual data fetching logic
    return [
        {
            title: 'First Article',
            description: 'This is the first article.',
            url: 'http://example.com/article1',
            date: '2023-03-27T12:00:00Z'
        },
        {
            title: 'Second Article',
            description: 'This is the second article.',
            url: 'http://example.com/article2',
            date: '2023-03-26T12:00:00Z'
        },
    ];
};

const generateRSS = async () => {
    const feed = new RSS({
        title: 'Your Feed Title',
        description: 'A description of your feed',
        feed_url: 'http://example.com/rss',
        site_url: 'http://example.com',
        language: 'en',
    });

    const articles = await fetchArticles();
    articles.forEach(article => {
        feed.item({
            title: article.title,
            description: article.description,
            url: article.url,
            date: article.date,
        });
    });

    fs.writeFileSync('rss.xml', feed.xml({ indent: true }));
};

generateRSS();