# YurbaUI

Modal windows, tooltips, toasts, selects and dropdowns for Yurba.

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
| `YurbaUI.Dropdown` | Context menu or custom panel |
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
// Modal
const modal = new YurbaUI.Modal({ size: 'large' })
modal.renderComponent(new YurbaUI.Title('Hello'))
modal.renderComponent(new YurbaUI.Text('Body text'))
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
```

See [demo](https://yurba-dev.github.io/yurba-ui/) for full documentation with parameter tables and examples for every component.
