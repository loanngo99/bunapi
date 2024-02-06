import puppeteer from 'puppeteer'
import chromium from "@sparticuz/chromium-min"
import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/microsoft-badges:
 *   get:
 *     summary: Get a list of Microsoft Learning path badges, Trophies
 *     description: Returns the list Microsoft Learning path badges, Trophies
 *     parameters:
 *       - name: userid
 *         in: query
 *         description: Profile user name
 *         required: true
 *         schema:
 *           type: string
 *           default: bunhere
 *     responses:
 *       200:
 *         description: A JSON array of Microsoft Learning path badges, Trophies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       icon:
 *                         type: string
 *                       title:
 *                         type: string
 *                       date:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: Success
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const userid = searchParams.get('userid')
    try {
        if (!userid) {
            return NextResponse.json({ message: 'Invalid user profile id' }, { status: 500 })
        }
        const url = ' https://learn.microsoft.com/en-us/users/' + userid
        // Start the crawler
        const browser = await puppeteer.launch({
            args: chromium.args,
            headless: true,
        })
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle2' })

        const results = await page.evaluate(() => {
            /// Select all elements with the class 'badge-icon' and 'img'
            const iconElements = document.querySelectorAll('.card-header-image img')
            const icons = Array.from(iconElements).map(element => element.getAttribute('src'))

            // Select all elements with the class 'badge-meta' and 'badge-title'
            const titleElements = document.querySelectorAll('.card-content-title h3')
            const titles = Array.from(titleElements).map(element => element.textContent)

            // Select all elements with the class 'badge-meta' and 'badge-date'
            const dateElements = document.querySelectorAll('.card-content-metadata time')
            const dates = Array.from(dateElements).map(element => element.textContent)

            // Using a loop to create an object
            const badges = icons.map((icon, index) => ({
                icon: icon,
                title: titles[index],
                date: dates[index],
            }))
            return badges
        })

        await browser.close()

        return NextResponse.json({
            data: results,
            message: 'Success!'
        }, { status: 200 })
    } catch (error) {
        console.error('Error in Puppeteer script:', error)
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 })
    }
}
