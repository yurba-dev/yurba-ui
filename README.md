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
| `YurbaUI.Group` | Component group |
| `YurbaUI.Title` | Title component |
| `YurbaUI.Description` | Subtitle component |
| `YurbaUI.Text` | Paragraph component |
| `YurbaUI.Image` | Image component |
| `YurbaUI.IconButton` | Vertical icon button |
| `YurbaUI.TitleIcon` | Decorative header icon |
| `YurbaUI.MaterialIcon` | Material Symbols wrapper |
| `YurbaUI.YurbaIcon` | Yurba icon font wrapper |

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

// Toast
new YurbaUI.Toast({ title: 'Saved', iconType: 'success', timeout: 3000 }).show()

// Select
const select = new YurbaUI.Select(
    [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }],
    { placeholder: 'Choose...' }
)
select.onChange(value => console.log(value))
container.appendChild(select.render())

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
```

See [demo](https://yurba-dev.github.io/yurba-ui/) for full documentation with parameter tables and examples for every component.
