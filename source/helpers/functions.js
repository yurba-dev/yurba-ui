import { BaseComponent, generateUniqueID } from "./lib.js"
import { globalProperties, customComponents } from "./globals.js"

export function _getCustomComponents() {
    return customComponents
}

export function _defineProperty(name, handler) {
    globalProperties[name] = handler
}

export function _CreateComponent(name = generateUniqueID(), options = {}) {
    const wrapperTag = options.wrapper ?? 'div'
    const Render = options.Render ?? (() => '')
    const CSSPath = options.CSSPath ?? false

    const customComponent = class extends BaseComponent {
        constructor(...args) {
            super()
            this.el = document.createElement(wrapperTag)
            this.id = name
            this.el.innerHTML = typeof Render === 'function' ? Render(...args) : ''
            this.useOwnComponentCSS = CSSPath
        }
    }

    customComponents[name] = customComponent
    return customComponent
}
