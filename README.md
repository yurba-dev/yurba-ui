# YurbaUI

Modal windows, tooltips, toasts, selects and dropdowns for Yurba.

## Connect

Add the compiled bundle to your page:

```html
<link rel="stylesheet" href="/yurba-ui.min.css">
<script src="/yurba-ui.min.js"></script>
```

Or import as an ES module:

```js
import { YurbaUI } from '/source/index.js'
```

## Build

```bash
npm install
npm run build
```

Output goes to `dist/`:

| File | Description |
|------|-------------|
| `yurba-ui.js` | JS bundle (unminified) |
| `yurba-ui.min.js` | JS bundle (minified) |
| `yurba-ui.css` | CSS bundle (unminified) |
| `yurba-ui.min.css` | CSS bundle (minified) |

## API

All components are available under `YurbaUI`:

| Name | Type | Description |
|------|------|-------------|
| `YurbaUI.Modal` | Class | Modal window |
| `YurbaUI.Toast` | Function | Toast notification |
| `YurbaUI.Tooltip` | Class | Hover tooltip |
| `YurbaUI.Select` | Class | Dropdown select |
| `YurbaUI.Dropdown` | Class | Context menu |
| `YurbaUI.Title` | Class | Title component |
| `YurbaUI.Description` | Class | Subtitle component |
| `YurbaUI.Text` | Class | Paragraph component |
| `YurbaUI.Image` | Class | Image component |
| `YurbaUI.IconButton` | Class | Vertical icon button |
| `YurbaUI.TitleIcon` | Class | Decorative header icon |
| `YurbaUI.MaterialIcon` | Class | Material Symbols wrapper |
| `YurbaUI.YurbaIcon` | Class | Yurba icon font wrapper |
| `YurbaUI.Group` | Class | Component group |

---

### Modal

```js
const modal = new YurbaUI.Modal({ size: 'large' })
modal.renderComponent(new YurbaUI.Title('Title'), 'header')
modal.renderComponent(new YurbaUI.Text('Body text'))
modal.show()
```

**Sizes:** `nano` | `small` | `default` | `medium` | `large` | `giant` | `full`

**Placements:** `body` (default) | `header` | `footer` | `controls`

**Key methods:**

| Method | Description |
|--------|-------------|
| `show()` | Show the modal |
| `hide()` | Hide without removing |
| `remove()` | Remove from DOM |
| `bind(name)` | Bind to `y-win="name"` attribute |
| `setSize(size)` | Change size at runtime |
| `setPosition(pos)` | Set screen position (used by Toast) |
| `closeOnOutsideClick()` | Close on backdrop click |
| `hideOnTimeout(ms)` | Auto-close after ms |
| `isShowed()` | Returns `true` if visible |

**DOM properties:** `modalBody`, `modalHeader`, `modalFooterBody`, `modalControls`, `modalClose`

---

### Toast

```js
const t = new YurbaUI.Toast({
    title: 'Saved successfully',
    icon: '<span class="material-symbols-rounded">check</span>',
    iconType: 'success', // success | danger | warn | info
    timeout: 3000
})
t.setPosition('top-right')
t.show()
```

`Toast` extends `Modal` — all Modal methods are available.

---

### Tooltip

```js
new YurbaUI.Tooltip(element, {
    pos: 'top', // top | bottom | left | right
    title: 'Title',
    content: 'Body text',
    icon: '<span class="material-symbols-rounded">info</span>',
    className: 'popover-info', // popover-info | popover-default | popover-danger
    delay: 150,
    offset: 5
})
```

Repositions automatically when near viewport edges.

---

### Select

**Single:**
```js
const select = new YurbaUI.Select([
    { value: 'a', label: 'Option A', icon: '🌍' },
    { value: 'b', label: 'Option B' },
], { value: 'a', placeholder: 'Choose...' })

select.onChange((value, option) => console.log(value))
container.appendChild(select.render())
```

**Multi (checkboxes):**
```js
const select = new YurbaUI.Select([
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
], { multiple: true, values: ['a', 'b'] })

select.onChange((values, options) => console.log(values)) // ['a', 'b']
container.appendChild(select.render())
```

**Settings:** `value` (single) | `values[]` (multiple) | `placeholder` | `multiple`

**Methods:** `render()`, `getValue()` → string or string[], `setValue(value | value[])`, `onChange(cb)`

---

### Dropdown

**Items mode:**
```js
const dropdown = new YurbaUI.Dropdown([
    { label: 'Edit',   icon: '<span class="material-symbols-rounded">edit</span>' },
    { label: 'Share',  icon: '<span class="material-symbols-rounded">share</span>' },
    { separator: true },
    { label: 'Delete', icon: '<span class="material-symbols-rounded">delete</span>',
      className: 'text-danger', onClick: () => {} },
], { trigger: '<span class="material-symbols-rounded">more_vert</span>' })
container.appendChild(dropdown.render())
```

**Custom content mode** (notifications, user panels, etc.):
```js
const panel = document.createElement('div')

const dropdown = new YurbaUI.Dropdown([], {
    trigger: '<span class="material-symbols-rounded">notifications</span>',
    content: panel, // HTMLElement or HTML string
    onOpen: (menu) => { /* lazy load data */ },
    onClose: () => {},
})

dropdown.render()

// DOM event alternative to onOpen:
dropdown.menu.addEventListener('yurba-dropdown:open', () => {})
container.appendChild(dropdown.el)
```

**Methods:** `render()` → sets `.menu` and `.el` properties
