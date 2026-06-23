const { build, transform } = require('esbuild')
const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, 'source')
const distDir = path.join(__dirname, 'dist')

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir)

const jsOptions = {
    entryPoints: [path.join(srcDir, 'index.js')],
    bundle: true,
    format: 'iife',
    globalName: '__yurbaui__',
    footer: { js: 'window.YurbaUI=__yurbaui__.YurbaUI;' },
    target: ['chrome80', 'firefox78', 'safari14'],
}

Promise.all([
    build({ ...jsOptions, outfile: path.join(distDir, 'yurba-ui.js'), minify: false })
        .then(() => console.log('✓  JS  →  dist/yurba-ui.js')),
    build({ ...jsOptions, outfile: path.join(distDir, 'yurba-ui.min.js'), minify: true })
        .then(() => console.log('✓  JS  →  dist/yurba-ui.min.js')),
]).catch(() => process.exit(1))

const cssOrder = [
    'components/Modal/sizes.css',
    'components/Modal/pos.css',
    'components/Tooltip/index.css',
    'components/Modal/index.css',
    'components/Group/index.css',
    'components/Image/index.css',
    'components/Description/index.css',
    'components/Text/index.css',
    'components/Title/index.css',
    'components/TitleIcon/index.css',
    'components/VIconButton/index.css',
    'components/Select/index.css',
    'components/Dropdown/index.css',
    'components/ContextMenu/index.css',
    'components/Readmore/index.css',
]

const cssBundle = cssOrder.map(file => {
    const fullPath = path.join(srcDir, file)
    if (!fs.existsSync(fullPath)) {
        console.warn(`  ⚠  Missing CSS file: ${file}`)
        return ''
    }
    return fs.readFileSync(fullPath, 'utf8')
}).join('\n\n')

fs.writeFileSync(path.join(distDir, 'yurba-ui.css'), cssBundle, 'utf8')
console.log('✓  CSS →  dist/yurba-ui.css')

transform(cssBundle, { loader: 'css', minify: true }).then(result => {
    fs.writeFileSync(path.join(distDir, 'yurba-ui.min.css'), result.code, 'utf8')
    console.log('✓  CSS →  dist/yurba-ui.min.css')
}).catch(() => process.exit(1))
