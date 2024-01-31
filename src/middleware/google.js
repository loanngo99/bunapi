async function hanleCrawler(url) {
    const { PlaywrightCrawler } = require('crawlee');

    var result = {};
    const crawler = new PlaywrightCrawler({
        requestHandler: async ({ page }) => {
            // Wait for the actor cards to render.
            await page.waitForSelector('.badge')

            // Execute a function in the browser which targets
            // the actor card elements and allows their manipulation.
            const icons = await page.$$eval('.badge-icon img', (els) => {
                // Extract text content from the actor cards
                return els.map((el) => el.src)
            })

            const titles = await page.$$eval('.badge-meta .badge-title', (els) => {
                // Extract text content from the actor cards
                return els.map((el) => el.textContent || '')
            })

            const dates = await page.$$eval('.badge-meta .badge-date', (els) => {
                // Extract text content from the actor cards
                return els.map((el) => el.textContent || '')
            })

            // Using a loop to create an object
            const badges = icons.map((icon, index) => ({
                icon: icon,
                title: titles[index],
                date: dates[index],
            }))

            result = badges
        },
    });

    // Start the crawler with the provided URLs
    await crawler.run([url]);

    return result
}

export async function getGoogleBadges(url) {
    return await hanleCrawler(url)
}