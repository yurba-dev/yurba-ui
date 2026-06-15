const tabBtns = document.querySelectorAll('.tab-btn')
const tabPanels = document.querySelectorAll('.tab-panel')

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'))
        tabPanels.forEach(p => p.classList.remove('active'))
        btn.classList.add('active')
        document.getElementById(btn.dataset.tab).classList.add('active')
    })
})

const logEl = document.getElementById('log')
function log(msg) {
    const line = document.createElement('div')
    line.className = 'line'
    const t = new Date().toLocaleTimeString('en', { hour12: false })
    line.innerHTML = `<span class="t">${t}</span>${msg}`
    logEl.appendChild(line)
    logEl.scrollTop = logEl.scrollHeight
}

const basicModal = new YurbaUI.Modal()
basicModal.renderComponent(new YurbaUI.Title('Hello World'))
basicModal.renderComponent(new YurbaUI.Description('A simple modal window'))
basicModal.renderComponent(new YurbaUI.Text(
    'This is the body text rendered via <b>YurbaUI.Text</b>. ' +
    'You can put any HTML content here.'
))
document.getElementById('btn-basic').addEventListener('click', () => {
    basicModal.show()
    log('basicModal.show()')
})

const footerModal = new YurbaUI.Modal()
footerModal.renderComponent(new YurbaUI.Title('With footer'))
footerModal.renderComponent(new YurbaUI.Text('This modal has an action bar at the bottom.'))
footerModal.renderComponent(new YurbaUI.IconButton(
    { icon: '<span class="material-symbols-rounded">close</span>', name: 'Dismiss' },
    () => { footerModal.hide(); log('footerModal.hide()') }
), 'footer')
document.getElementById('btn-footer').addEventListener('click', () => {
    footerModal.show()
    log('footerModal.show()')
})

const outsideModal = new YurbaUI.Modal()
outsideModal.renderComponent(new YurbaUI.Title('Click outside to close'))
outsideModal.renderComponent(new YurbaUI.Text('Click anywhere outside this window to dismiss it.'))
outsideModal.closeOnOutsideClick()
document.getElementById('btn-outside').addEventListener('click', () => {
    outsideModal.show()
    log('outsideModal.show()')
})

const sizes = ['nano', 'small', 'default', 'medium', 'large', 'giant', 'full']
let currentSize = 'default'
const sizeModal = new YurbaUI.Modal()
sizeModal.renderComponent(new YurbaUI.Title('Sizes'))
const sizePicker = document.createElement('div')
sizePicker.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:4px 0'
sizes.forEach(s => {
    const chip = document.createElement('button')
    chip.textContent = s
    chip.dataset.size = s
    chip.style.cssText = `all:unset;cursor:pointer;font-size:13px;font-weight:500;padding:6px 14px;border-radius:20px;border:1.5px solid #e5e5ea;background:${s === currentSize ? '#0071e3' : '#fff'};color:${s === currentSize ? '#fff' : '#1d1d1f'};transition:.15s`
    chip.addEventListener('click', () => {
        sizeModal.setSize(s)
        currentSize = s
        sizePicker.querySelectorAll('button').forEach(b => {
            const a = b.dataset.size === s
            b.style.background = a ? '#0071e3' : '#fff'
            b.style.color = a ? '#fff' : '#1d1d1f'
            b.style.borderColor = a ? '#0071e3' : '#e5e5ea'
        })
        log(`sizeModal.setSize('${s}')`)
    })
    sizePicker.appendChild(chip)
})
const sizeBodyComp = new YurbaUI.Text('')
sizeModal.renderComponent(sizeBodyComp)
sizeBodyComp.el.replaceWith(sizePicker)
document.getElementById('btn-sizes').addEventListener('click', () => {
    sizeModal.show()
    log('sizeModal.show()')
})

const boundModal = new YurbaUI.Modal()
boundModal.renderComponent(new YurbaUI.Title('Bound modal'))
boundModal.renderComponent(new YurbaUI.Text('Opened via <code>y-win="bound-modal"</code> attribute.'))
boundModal.bind('bound-modal')

document.getElementById('btn-toast-default').addEventListener('click', () => {
    const t = new YurbaUI.Toast({ title: 'Notification' })
    t.setPosition('top-right'); t.show()
    log('new YurbaUI.Toast — default')
})
document.getElementById('btn-toast-success').addEventListener('click', () => {
    const t = new YurbaUI.Toast({ title: 'Saved successfully', icon: '<span class="material-symbols-rounded">check</span>', iconType: 'success' })
    t.setPosition('top-right'); t.show()
    log('new YurbaUI.Toast — success')
})
document.getElementById('btn-toast-danger').addEventListener('click', () => {
    const t = new YurbaUI.Toast({ title: 'Something went wrong', icon: '<span class="material-symbols-rounded">exclamation</span>', iconType: 'danger' })
    t.setPosition('top-right'); t.show()
    log('new YurbaUI.Toast — danger')
})
document.getElementById('btn-toast-warn').addEventListener('click', () => {
    const t = new YurbaUI.Toast({ title: 'Check your input', icon: '<span class="material-symbols-rounded">exclamation</span>', iconType: 'warn' })
    t.setPosition('top-right'); t.show()
    log('new YurbaUI.Toast — warn')
})

new YurbaUI.Tooltip(document.getElementById('tt-top'), { pos: 'top', title: 'Tooltip', content: 'Positioned on top' })
new YurbaUI.Tooltip(document.getElementById('tt-bottom'), { pos: 'bottom', title: 'Tooltip', content: 'Positioned on bottom' })
new YurbaUI.Tooltip(document.getElementById('tt-left'), { pos: 'left', title: 'Tooltip', content: 'Positioned on left' })
new YurbaUI.Tooltip(document.getElementById('tt-right'), { pos: 'right', title: 'Tooltip', content: 'Positioned on right' })
new YurbaUI.Tooltip(document.getElementById('tt-icon'), {
    pos: 'top', title: 'With icon', content: 'This tooltip has an icon',
    icon: '<span class="material-symbols-rounded">info</span>'
})
new YurbaUI.Tooltip(document.getElementById('tt-class-info'), { pos: 'top', title: 'Info', content: 'className: popover-info', className: 'popover-info' })
new YurbaUI.Tooltip(document.getElementById('tt-class-default'), { pos: 'top', title: 'Default', content: 'className: popover-default', className: 'popover-default' })
new YurbaUI.Tooltip(document.getElementById('tt-class-danger'), { pos: 'top', title: 'Danger', content: 'className: popover-danger', className: 'popover-danger' })

const demoSelect = new YurbaUI.Select([
    { value: 'apple',  label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
])
demoSelect.onChange((value) => log(`select → '${value}'`))
document.getElementById('demo-select').appendChild(demoSelect.render())

const demoSelectIcons = new YurbaUI.Select([
    { value: 'public',  label: 'Public',  icon: '🌍' },
    { value: 'friends', label: 'Friends', icon: '👥' },
    { value: 'private', label: 'Only me', icon: '🔒' },
], { value: 'public' })
demoSelectIcons.onChange((value) => log(`select (icons) → '${value}'`))
document.getElementById('demo-select-icons').appendChild(demoSelectIcons.render())

const demoSelectMulti = new YurbaUI.Select([
    { value: 'read',   label: 'Read' },
    { value: 'write',  label: 'Write' },
    { value: 'delete', label: 'Delete' },
    { value: 'admin',  label: 'Admin' },
], { multiple: true, values: ['read', 'write'] })
demoSelectMulti.onChange((values) => log(`select (multi) → [${values.join(', ')}]`))
document.getElementById('demo-select-multi').appendChild(demoSelectMulti.render())

const demoSelectScroll = new YurbaUI.Select(
    Array.from({ length: 20 }, (_, i) => ({ value: `opt${i}`, label: `Option ${i + 1}` })),
    { multiple: true }
)
document.getElementById('demo-select-scroll').appendChild(demoSelectScroll.render())

const demoDropdown = new YurbaUI.Dropdown([
    { label: 'Edit',  icon: '<span class="material-symbols-rounded">edit</span>' },
    { label: 'Share', icon: '<span class="material-symbols-rounded">share</span>' },
    { separator: true },
    { label: 'Delete', icon: '<span class="material-symbols-rounded">delete</span>', className: 'text-danger', onClick: () => log('Delete clicked') },
], { trigger: '<span class="material-symbols-rounded">more_vert</span>' })
document.getElementById('demo-dropdown').appendChild(demoDropdown.render())

const demoDropdownNested = new YurbaUI.Dropdown([
    { label: 'Edit',   icon: '<span class="material-symbols-rounded">edit</span>',   onClick: () => log('Edit') },
    { label: 'Rename', icon: '<span class="material-symbols-rounded">edit_note</span>', onClick: () => log('Rename') },
    {
        label: 'Share',
        icon: '<span class="material-symbols-rounded">share</span>',
        children: [
            { label: 'Copy link',    icon: '<span class="material-symbols-rounded">link</span>',    onClick: () => log('Copy link') },
            { label: 'Copy embed',   icon: '<span class="material-symbols-rounded">code</span>',   onClick: () => log('Copy embed') },
            {
                label: 'Send to',
                icon: '<span class="material-symbols-rounded">send</span>',
                children: [
                    { label: 'Message', icon: '<span class="material-symbols-rounded">chat</span>',  onClick: () => log('Send → Message') },
                    { label: 'Email',   icon: '<span class="material-symbols-rounded">mail</span>',  onClick: () => log('Send → Email') },
                ],
            },
        ],
    },
    { separator: true },
    { label: 'Delete', icon: '<span class="material-symbols-rounded">delete</span>', className: 'text-danger', onClick: () => log('Delete') },
], { trigger: '<span class="material-symbols-rounded">more_vert</span>' })
document.getElementById('demo-dropdown-nested').appendChild(demoDropdownNested.render())

const demoDropdownPanel = document.createElement('div')
demoDropdownPanel.style.cssText = 'padding:12px 14px;width:200px'
demoDropdownPanel.innerHTML = '<p style="margin:0;font-weight:600;font-size:14px">Notifications</p>'
const demoDropdownCustom = new YurbaUI.Dropdown([], {
    trigger: '<span class="material-symbols-rounded">notifications</span>',
    content: demoDropdownPanel,
    onOpen: () => {
        log('dropdown (custom) → opened')
        demoDropdownPanel.innerHTML = '<p style="margin:0;font-weight:600;font-size:14px">Notifications</p><p style="margin:8px 0 0;opacity:.5;font-size:13px">No new notifications</p>'
    },
})
demoDropdownCustom.render()
demoDropdownCustom.menu.addEventListener('yurba-dropdown:open', () => {})
document.getElementById('demo-dropdown-custom').appendChild(demoDropdownCustom.el)
