// The MIT License (MIT)

// copyright (c) 2017-present, @ElemeFE

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

const defaultOptions = {
  // ['spin', 'chiaroscuro', 'shine'],
  loading: 'shine',
  text: {
    color: '#EEEEEE'
  },
  image: {
    // `rect` | `circle`
    shape: 'rect',
    color: '#EFEFEF',
    shapeOpposite: []
  },
  cookies: [],
  button: {
    color: '#EFEFEF',
    excludes: []
  },
  svg: {
    // or transparent
    color: '#EFEFEF',
    // circle | rect
    shape: 'circle',
    shapeOpposite: []
  },
  pseudo: {
    // or transparent
    color: '#EFEFEF',
    // circle | rect
    shape: 'circle',
    shapeOpposite: []
  },
  device: 'iPhone 6',
  minify: {
    minifyCSS: { level: 2 },
    removeComments: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: false
  },
  defer: 5000,
  excludes: [],
  remove: [],
  hide: [],
  grayBlock: [],
  headless: true,
  h5Only: false,
  // or 'vw|vh|vmin|vmax'
  cssUnit: 'rem',
  decimal: 1
}

const htmlBeautifyConfig = {
  indent_size: 2,
  html: {
    end_with_newline: true,
    js: {
      indent_size: 2
    },
    css: {
      indent_size: 2
    }
  },
  css: {
    indent_size: 1
  },
  js: {
    'preserve-newlines': true
  }
}

module.exports = {
  htmlBeautifyConfig,
  defaultOptions,
}
