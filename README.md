# YurbaUI

Modal windows, tooltips, toasts, selects, dropdowns and context menus for Yurba.

## Installation

```html
<link rel="stylesheet" href="/dist/yurba-ui.min.css">
<script src="/dist/yurba-ui.min.js"></script>
```

Or as an ES module:

```js
import { YurbaUI } from '/source/index.js'
```

## Build

```bash
npm install
npm run build
```

Output goes to `dist/`: `yurba-ui.js`, `yurba-ui.min.js`, `yurba-ui.css`, `yurba-ui.min.css`.

## Components

| Name | Description |
|---|---|
| `YurbaUI.Modal` | Modal window |
| `YurbaUI.Toast` | Toast notification (extends Modal) |
| `YurbaUI.Tooltip` | Hover tooltip |
| `YurbaUI.Select` | Dropdown select (single or multi) |
| `YurbaUI.Dropdown` | Trigger-anchored menu or custom panel (icons, separators, nested submenus) |
| `YurbaUI.ContextMenu` | Right-click menu opened at the cursor (same item model as Dropdown) |
| `YurbaUI.Readmore` | Expandable text block with "Read more / Less" toggles |
| `YurbaUI.Scrollbar` | Overlay scrollbar thumb that replaces the native one |
| `YurbaUI.PullToRefresh` | Pull down from the top to refresh, for apps and installed sites with no browser pull of their own |
| `YurbaUI.Group` | Component group |
| `YurbaUI.Title` | Title component |
| `YurbaUI.Description` | Subtitle component |
| `YurbaUI.Text` | Paragraph component |
| `YurbaUI.Image` | Image component |
| `YurbaUI.IconButton` | Vertical icon button |
| `YurbaUI.TitleIcon` | Decorative header icon |
| `YurbaUI.MaterialIcon` | Material Symbols wrapper |
| `YurbaUI.YurbaIcon` | Yurba icon font wrapper |

## Icons

Icons the library draws itself live in a static `icons` map (key -> HTML string), like `labels`. Set a key once per site; keys left out keep the default. Values are inserted as HTML as given.

```js
YurbaUI.Modal.icons.close = '<span class="material-symbols-rounded">close</span>'
YurbaUI.Dropdown.icons.check = '<span class="material-symbols-rounded">done</span>'

// One instance only
new YurbaUI.Select(options, { icons: { arrow: '<span class="material-symbols-rounded">expand_more</span>' } })
```

| Component | Key | Default |
|---|---|---|
| `Modal` | `close` | Cross SVG in the close button |
| `Select` | `arrow` | Chevron SVG in the trigger |
| `Select` | `check` | `''`: the tick drawn in CSS on a selected multi-select item |
| `Dropdown`, `ContextMenu` | `arrow` | `›` on an item with a submenu |
| `Dropdown`, `ContextMenu` | `check` | Material `check` on an `active` item |

- `Toast` uses `Modal.icons`.
- `Dropdown.icons` and `ContextMenu.icons` are one object (it also covers the mobile sheet), so set a key on either one.
- A menu `check` that is one element gets the `y-dropdown__item-check` class; anything else is wrapped in a span with it.
- `Modal`, `Toast`, `Select`, `Dropdown` and `ContextMenu` also take an `icons` option for a single instance.

## Examples

```js
// Modal - with components array
const modal = new YurbaUI.Modal({
    size: 'large',
    components: [
        { content: new YurbaUI.Title('Hello'), area: 'header' },
        { content: new YurbaUI.Text('Body text'), area: 'body' }
    ]
})

modal.show()

// Modal - using renderComponent
const modal = new YurbaUI.Modal({ size: 'large' })

modal.renderComponent(new YurbaUI.Title('Hello'), 'header')
modal.renderComponent(new YurbaUI.Text('Body text'), 'body')

modal.show()

// On a phone or tablet (up to 1280px) every modal fills the screen; a short one (a confirmation,
// a single field) passes compact: true to stay a card
const ask = new YurbaUI.Modal({ compact: true })

// Toast
new YurbaUI.Toast({ title: 'Saved', iconType: 'success', timeout: 3000 }).show()

// Select
const select = new YurbaUI.Select(
    [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }],
    { placeholder: 'Choose...' }
)
const el = select.render()
container.appendChild(el)
// Two ways to react to a user selection:
select.onChange(value => console.log(value))                 // callback API
el.addEventListener('yurba-select:change', e => console.log(e.detail.value)) // DOM event
// The event bubbles; detail is { value, option } (single) or { values, options } (multi).
// Only a user selection fires it - setValue() stays silent, like a native <select>.

// Dropdown
const dropdown = new YurbaUI.Dropdown(
    [{ label: 'Edit', icon: '...' }, { separator: true }, { label: 'Delete', className: 'text-danger' }],
    { trigger: '<span class="material-symbols-rounded">more_vert</span>' }
)
container.appendChild(dropdown.render())

// Context menu (right-click)
const menu = new YurbaUI.ContextMenu([
    { label: 'Open',   icon: '...', onClick: () => {} },
    { separator: true },
    { label: 'Delete', icon: '...', className: 'text-danger', onClick: () => {} },
])
menu.bind('#target')        // or bind(element / NodeList / array)
// menu.open(x, y)          // open manually at coordinates

// Readmore
new YurbaUI.Readmore(document.querySelector('.post-content'), {
    collapsedHeight: 200,
    heightMargin: 16,
    moreText: 'Read more',
    lessText: 'Read less',
})

// Scrollbar: the element keeps its own overflow, the native bar is hidden
YurbaUI.Scrollbar.attach(document.querySelector('.list'))
YurbaUI.Scrollbar.detach(document.querySelector('.list'))
// Every [data-y-scrollbar] and every match of the selectors, now and later
YurbaUI.Scrollbar.auto('.scrollable, .y-win__body')
// Sticky headers inside a scroller that the thumb starts below
YurbaUI.Scrollbar.sticky = '[data-y-scrollbar-sticky]'
```

Scrollbar tokens: `--y-scrollbar-color`, `--y-scrollbar-radius`, `--y-scrollbar-width`, `--y-scrollbar-width-hover`, `--y-scrollbar-opacity`, `--y-scrollbar-opacity-hover`.

```js
// Only where the browser has no pull of its own, such as an app's WebView or an installed site
YurbaUI.PullToRefresh.enable({
    onRefresh: () => location.reload(),          // may return a promise; the indicator spins until it settles
    offset: () => header.getBoundingClientRect().bottom, // where the indicator comes out from, px
    ignore: '.chat',                            // more places that never start a pull
    when: () => !player.fullscreen,             // more conditions, checked as a pull starts
})
YurbaUI.PullToRefresh.disable()
```

A pull starts only from the very top of the page and of every list the finger is in, straight down, and never in
a field, a canvas or video, a modal, a sheet, a menu, anything fixed over the page or `[data-y-pull="off"]`.
The listeners are passive and only the indicator moves. Tokens: `--y-pull-zindex`.

See [demo](https://yurba-dev.github.io/yurba-ui/) for full documentation.
