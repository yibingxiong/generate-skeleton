// The MIT License (MIT)

// Copyright (c) 2017-2018

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict'

const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors')
const { parse, toPlainObject, fromPlainObject, generate } = require('css-tree')
const { sleep, genScriptContent, htmlMinify, collectImportantComments } = require('./util')

class Skeleton {
  constructor(options = {}, log) {
    this.options = options
    this.browser = null
    this.scriptContent = ''
    this.pages = new Set()
    this.log = log
    this.initialize()
  }

  // Launch headless Chrome by puppeteer and load script
  async initialize() {
    console.log('initialize')
    const { headless } = this.options
    const { log } = this
    try {
      // load script content from `script` folder
      this.scriptContent = await genScriptContent()
      console.log('1-----');
      // Launch the browser
      this.browser = await puppeteer.launch({ headless:false, devtools:true })  // 得改
      console.log('2------')
    } catch (err) {
      console.log(err);
      console.log('3-------')
      log(err)
    }
  }

  async newPage() {
    const { device, debug } = this.options
    console.log('page-----1')
    const page = await this.browser.newPage()
    console.log('page----')
    this.pages.add(page)
    await page.emulate(devices[device])
    if (debug) {
      page.on('console', (...args) => {
        this.log.info(...args)
      })
    }
    return page
  }

  async closePage(page) {
    await page.close()
    return this.pages.delete(page)
  }

  // Generate the skeleton screen for the specific `page`
  async makeSkeleton(page) {
    const { defer } = this.options
    await page.addScriptTag({ content: this.scriptContent })
    await sleep(defer)
    await page.evaluate((options) => {
      Skeleton.genSkeleton(options)
    }, this.options)
  }
  async genHtml(url, route) {
    const stylesheetAstObjects = {}
    const stylesheetContents = {}

    const page = await this.newPage()
    const { cookies } = this.options

    await page.setRequestInterception(true)
    page.on('request', (request) => {
      if (stylesheetAstObjects[request.url]) {
        // don't need to download the same assets
        request.abort()
      } else {
        request.continue()
      }
    })
    // To build a map of all downloaded CSS (css use link tag)
    page.on('response', (response) => {
      const requestUrl = response.url()
      const ct = response.headers()['content-type'] || ''
      if (response.ok && !response.ok()) {
        throw new Error(`${response.status} on ${requestUrl}`)
      }

      if (ct.indexOf('text/css') > -1 || /\.css$/i.test(requestUrl)) {
        response.text().then((text) => {
          const ast = parse(text, {
            parseValue: false,
            parseRulePrelude: false
          })
          stylesheetAstObjects[requestUrl] = toPlainObject(ast)
          stylesheetContents[requestUrl] = text
        })
      }
    })
    page.on('pageerror', (error) => {
      throw error
    })


    if (cookies.length) {
      await page.setCookie(...cookies.filter(cookie => typeof cookie === 'object'))
    }

    const response = await page.goto(url, { waitUntil: 'networkidle2' })
    if (response && !response.ok()) {
      throw new Error(`${response.status} on ${url}`)
    }


    await this.makeSkeleton(page)

    const { styles, cleanedHtml, rawHtml } = await page.evaluate(() => Skeleton.getHtmlAndStyle())

    const stylesheetAstArray = styles.map((style) => {
      const ast = parse(style, {
        parseValue: false,
        parseRulePrelude: false
      })
      return toPlainObject(ast)
    })

    const cleanedCSS = await page.evaluate(async (stylesheetAstObjects, stylesheetAstArray) => { // eslint-disable-line no-shadow
      const DEAD_OBVIOUS = new Set(['*', 'body', 'html'])
      const cleanedStyles = []

      const checker = (selector) => {
        if (DEAD_OBVIOUS.has(selector)) {
          return true
        }
        if (/:-(ms|moz)-/.test(selector)) {
          return true
        }
        if (/:{1,2}(before|after)/.test(selector)) {
          return true
        }
        try {
          const keep = !!document.querySelector(selector)
          return keep
        } catch (err) {
          const exception = err.toString()
          console.log(`Unable to querySelector('${selector}') [${exception}]`, 'error') // eslint-disable-line no-console
          return false
        }
      }

      const cleaner = (ast, callback) => {
        const decisionsCache = {}

        const clean = (children, cb) => children.filter((child) => {
          if (child.type === 'Rule') {
            const values = child.prelude.value.split(',').map(x => x.trim())
            const keepValues = values.filter((selectorString) => {
              if (decisionsCache[selectorString]) {
                return decisionsCache[selectorString]
              }
              const keep = cb(selectorString)
              decisionsCache[selectorString] = keep
              return keep
            })
            if (keepValues.length) {
              // re-write the selector value
              child.prelude.value = keepValues.join(', ')
              return true
            }
            return false
          } else if (child.type === 'Atrule' && child.name === 'media') {
            // recurse
            child.block.children = clean(child.block.children, cb)
            return child.block.children.length > 0
          }
          // The default is to keep it.
          return true
        })

        ast.children = clean(ast.children, callback)
        return ast
      }

      const links = Array.from(document.querySelectorAll('link'))

      links
        .filter(link => (
          link.href &&
            (link.rel === 'stylesheet' ||
              link.href.toLowerCase().endsWith('.css')) &&
            !link.href.toLowerCase().startsWith('blob:') &&
            link.media !== 'print'
        ))
        .forEach((stylesheet) => {
          if (!stylesheetAstObjects[stylesheet.href]) {
            throw new Error(`${stylesheet.href} not in stylesheetAstObjects`)
          }
          if (!Object.keys(stylesheetAstObjects[stylesheet.href]).length) {
            // If the 'stylesheetAstObjects[stylesheet.href]' thing is an
            // empty object, simply skip this link.
            return
          }
          const ast = stylesheetAstObjects[stylesheet.href]
          cleanedStyles.push(cleaner(ast, checker))
        })
      stylesheetAstArray.forEach((ast) => {
        cleanedStyles.push(cleaner(ast, checker))
      })

      return cleanedStyles
    }, stylesheetAstObjects, stylesheetAstArray)

    const allCleanedCSS = cleanedCSS.map((ast) => {
      const cleanedAst = fromPlainObject(ast)
      return generate(cleanedAst)
    }).join('\n')

    const finalCss = collectImportantComments(allCleanedCSS)
    // finalCss = minify(finalCss).css ? `html-minifier` use `clean-css` as css minifier
    // so don't need to use another mimifier.
    let shellHtml = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Page Skeleton</title>
        <style>
          $$css$$
        </style>
      </head>
      <body>
        $$html$$
      </body>
      </html>`
    shellHtml = shellHtml
      .replace('$$css$$', finalCss)
      .replace('$$html$$', cleanedHtml)
    const result = {
      originalRoute: route,
      route: await page.evaluate('window.location.pathname'),
      html: htmlMinify(shellHtml, false),
      rawHtml: htmlMinify(rawHtml, false),
      styles
    }
    await this.closePage(page) // todo
    return Promise.resolve(result)
  }

  async renderRoutes(origin, routes = this.options.routes) {
    return Promise.all(routes.map((route) => {
      const url = `${origin}${route}`
      return this.genHtml(url, route)
    }))
  }

  async destroy() {
    const { log } = this
    if (this.pages.size) {
      const promises = []
      for (const page of this.pages) {
        promises.push(page.close())
      }
      try {
        await Promise.all(promises)
      } catch (err) {
        log(err)
      }
      this.pages = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

module.exports = Skeleton
