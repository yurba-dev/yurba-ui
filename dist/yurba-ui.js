var __yurbaui__ = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // source/index.js
  var index_exports = {};
  __export(index_exports, {
    YurbaUI: () => YurbaUI
  });

  // source/helpers/elements.js
  var UIElements = [];

  // source/helpers/globals.js
  var modals = {};
  var globalProperties = {};

  // source/helpers/properties.js
  var componentProperties = (el) => ({
    avatar: {
      true: () => el.classList.add("y-win__avatar"),
      false: () => el.classList.remove("y-win__avatar")
    },
    "mini-image": () => el.classList.add("y-win__image", "y-win__mini-image"),
    "title-with-icon": () => el.classList.add("y-win__icon-title__group"),
    ...Object.fromEntries(
      Object.entries(globalProperties).map(([key, fn]) => [
        key,
        (...args) => fn(el, ...args)
      ])
    )
  });

  // source/helpers/lib.js
  var BaseComponent = class {
    constructor() {
      this.el = null;
      this.id = null;
      this.placement = "body";
      this.useOwnComponentCSS = true;
      this.subscribedProperties = {};
    }
    setProperty(name, value) {
      const props = componentProperties(this.el);
      if (value === void 0) {
        props[name]();
      } else {
        props[name][value]();
      }
      this.subscribedProperties[name] = value;
    }
    addClass(...classes) {
      this.el.classList.add(...classes);
    }
    removeClass(...classes) {
      this.el.classList.remove(...classes);
    }
    replaceClass(className, newClassName) {
      this.el.classList.remove(className);
      this.el.classList.add(newClassName);
    }
    get about() {
      return {
        name: this.constructor.name,
        el: this.el,
        placement: this.placement,
        properties: this.subscribedProperties
      };
    }
    addEvent(name, cb) {
      this.el.addEventListener(name, cb);
    }
    render() {
      let id = generateUniqueID();
      if (this.id != null) {
        id = `${this.id}_${generateUniqueID(this.id)}`;
      }
      this.el.id = id;
      return this.el;
    }
  };
  function error(text, type) {
    const prefix = type === "component" ? "Component error" : "Error";
    throw new Error(`[YURBA UI] ${prefix}: ${text}`);
  }
  function warn(text) {
    console.warn(`[YURBA UI] ${text}`);
  }
  function generateUniqueID(content) {
    if (content) {
      return btoa(content).replaceAll("=", "");
    }
    return btoa(Math.floor(Math.random() * 9999) + 1).replaceAll("=", "");
  }
  var hasDuplicates = (arr) => new Set(arr).size !== arr.length;

  // source/components/Modal/index.js
  var _Modal_instances, initModal_fn, mount_fn, fireClose_fn, bindUpdates_fn, bindYModalAttributes_fn;
  var Modal = class {
    constructor(properties = {}) {
      __privateAdd(this, _Modal_instances);
      const size = "size" in properties ? properties.size : "default";
      this.size = size;
      this._properties = properties;
      this._mounted = false;
      this._outsideClickEnabled = properties.closeOnOutsideClick ?? true;
      this._onClose = properties.onClose ?? null;
      this._renderQueue = [];
      this._setupHooks = [];
      if (Array.isArray(properties.components)) {
        properties.components.forEach((c) => this._renderQueue.push({ component: c.content, placement: c.area }));
      }
      this.modal = null;
      this.modalHeader = null;
      this.modalControls = null;
      this.modalBody = null;
      this.modalFooter = null;
      this.modalFooterBody = null;
      this.modalClose = null;
      this.type = "modal";
      this.showed = false;
      UIElements.push(this);
      __privateMethod(this, _Modal_instances, bindYModalAttributes_fn).call(this);
    }
    renderComponent(component, customPlacement) {
      this._renderQueue.push({ component, placement: customPlacement });
      if (this._mounted) {
        return __privateMethod(this, _Modal_instances, mount_fn).call(this, component, customPlacement);
      }
      if (component instanceof HTMLElement) return component;
      if (!(component instanceof BaseComponent)) {
        error("The component must inherit from BaseComponent or be an HTMLElement", "component");
      }
      if (customPlacement) component.placement = customPlacement;
      return component.render();
    }
    _addSetupHook(fn) {
      this._setupHooks.push(fn);
      if (this._mounted) fn(this.modal);
    }
    bind(name) {
      modals[name] = this;
      this.name = name;
    }
    show() {
      __privateMethod(this, _Modal_instances, initModal_fn).call(this);
      __privateMethod(this, _Modal_instances, bindUpdates_fn).call(this);
      this.showed = true;
      const modal = this.modal;
      void modal.offsetWidth;
      requestAnimationFrame(() => {
        if (this.showed && modal) modal.classList.remove("y-win__hidden");
      });
      if (this.type === "modal") {
        document.body.style.overflow = "hidden";
      }
      if (this._outsideClickEnabled) {
        setTimeout(() => {
          this._outsideClickHandler = (e) => {
            if (e.target === this.modal || !this.modal.contains(e.target)) {
              this.hide();
              __privateMethod(this, _Modal_instances, fireClose_fn).call(this);
            }
          };
          document.addEventListener("click", this._outsideClickHandler);
        }, 0);
      }
    }
    hide() {
      if (!this._mounted) return;
      __privateMethod(this, _Modal_instances, bindUpdates_fn).call(this);
      this.showed = false;
      this.modal.classList.add("y-win__hidden");
      if (this.type === "modal") {
        const anyModalOpen = UIElements.some((e) => e !== this && e.showed && e.type === "modal");
        if (!anyModalOpen) document.body.style.overflow = "";
      }
      if (this._outsideClickHandler) {
        document.removeEventListener("click", this._outsideClickHandler);
        this._outsideClickHandler = null;
      }
      setTimeout(() => {
        if (this._mounted && this.modal && this.modal.classList.contains("y-win__hidden")) {
          this.modal.remove();
          this.modal = null;
          this._mounted = false;
        }
      }, 300);
    }
    remove() {
      const idx = UIElements.indexOf(this);
      if (idx !== -1) {
        UIElements.splice(idx, 1);
        if (this._mounted && this.modal) {
          this.modal.remove();
        }
      }
    }
    hideOnTimeout(time = 0, properties = {}) {
      this._hideDelay = time;
      this._hideTimeout = null;
      const startTimer = () => {
        this._hideTimeout = setTimeout(() => this.hide(), this._hideDelay);
      };
      const clearTimer = () => {
        if (this._hideTimeout) {
          clearTimeout(this._hideTimeout);
          this._hideTimeout = null;
        }
      };
      startTimer();
      if (properties.notHideWhenHovered) {
        this.modal.addEventListener("mouseover", () => clearTimer());
        this.modal.addEventListener("mouseout", (e) => {
          if (!this.modal.contains(e.relatedTarget)) startTimer();
        });
      }
    }
    setSize(size) {
      __privateMethod(this, _Modal_instances, initModal_fn).call(this);
      const sizes = ["full", "giant", "large", "medium", "default", "small", "nano"];
      if (sizes.includes(size)) {
        this.modal.classList.remove(this.size);
        this.size = size;
        this.modal.classList.add(size);
      } else {
        error(`Resize error: Can't find size "${size}" in list of the allowed sizes: ${sizes.join(", ")}`);
      }
    }
    setPosition(pos) {
      __privateMethod(this, _Modal_instances, initModal_fn).call(this);
      const positions = {
        right: "y-win__pos-right",
        center: "y-win__pos-center",
        left: "y-win__pos-left",
        bottom: "y-win__pos-bottom",
        top: "y-win__pos-top"
      };
      pos.split("-").map((p) => p.trim()).forEach((p) => {
        if (p in positions) this.modal.classList.add(positions[p]);
      });
    }
    isPopup() {
      return this.type === "popup";
    }
    isToast() {
      return this.type === "toast";
    }
    isShowed() {
      return this.showed;
    }
  };
  _Modal_instances = new WeakSet();
  initModal_fn = function() {
    if (this._mounted) return;
    this.modal = document.createElement("div");
    this.modal.classList.add("y-win__wrapper", "y-win__hidden", this.size);
    this.modal.innerHTML = `
            <div class="y-win">
                <div class="y-win__header">
                    <div class="y-win__header-body"></div>
                    <div class="y-win__header-actions">
                        <div class="y-win__controls"></div>
                        <button class="y-win__close" id="close" aria-label="Close">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="y-win__body"></div>
                <div class="y-win__footer-wrapper">
                    <div class="y-win__footer"></div>
                </div>
            </div>
        `;
    if ("parent" in this._properties) {
      if (this._properties.parent instanceof HTMLElement) {
        this._properties.parent.appendChild(this.modal);
      } else {
        error("properties.parent must be an HTML element");
      }
    } else {
      document.body.appendChild(this.modal);
    }
    this.modalHeader = this.modal.querySelector(".y-win__header-body");
    this.modalControls = this.modal.querySelector(".y-win__controls");
    this.modalBody = this.modal.querySelector(".y-win__body");
    this.modalFooter = this.modal.querySelector(".y-win__footer-wrapper");
    this.modalFooterBody = this.modal.querySelector(".y-win__footer");
    this.modalClose = this.modal.querySelector("#close");
    this.modalClose.addEventListener("click", () => {
      this.hide();
      __privateMethod(this, _Modal_instances, fireClose_fn).call(this);
    });
    this._mounted = true;
    this._setupHooks.forEach((fn) => fn(this.modal));
    this._renderQueue.forEach(({ component, placement }) => __privateMethod(this, _Modal_instances, mount_fn).call(this, component, placement));
  };
  mount_fn = function(component, customPlacement) {
    const placements = {
      body: this.modalBody,
      header: this.modalHeader,
      footer: this.modalFooterBody,
      controls: this.modalControls
    };
    if (component instanceof HTMLElement) {
      const target = placements[customPlacement ?? "body"];
      target.appendChild(component);
      return component;
    }
    if (!(component instanceof BaseComponent)) {
      error("The component must inherit from BaseComponent or be an HTMLElement", "component");
    }
    if (customPlacement) component.placement = customPlacement;
    const el = component.render();
    placements[component.placement].appendChild(el);
    return el;
  };
  fireClose_fn = function() {
    if (this._onClose) this._onClose();
  };
  bindUpdates_fn = function() {
    if (this.modalHeader.childNodes.length === 0) {
      this.modalHeader.classList.add("y-win__header-empty");
    } else {
      this.modalHeader.classList.remove("y-win__header-empty");
    }
  };
  bindYModalAttributes_fn = function() {
    document.querySelectorAll("[y-win]").forEach((e) => {
      const ID = e.getAttribute("y-win");
      e.addEventListener("click", () => {
        if (ID in modals) {
          modals[ID].show();
        } else {
          warn(`The "${ID}" modal window was not found. It has either been deleted or has not yet been created. Ignoring...`);
        }
      });
    });
  };

  // source/components/Title/index.js
  var TitleComponent = class extends BaseComponent {
    constructor(title) {
      super();
      this.el = document.createElement("div");
      this.el.classList.add("y-win__title");
      this.el.innerHTML = title;
      this.placement = "header";
    }
  };

  // source/components/TitleIcon/index.js
  var TitleIconComponent = class extends BaseComponent {
    constructor(object = {}) {
      super();
      const icon = object.icon ?? "";
      const type = object.type ?? "default";
      this.el = document.createElement("span");
      this.el.classList.add("y-win__title-icon", type);
      this.el.innerHTML = icon;
      this.placement = "header";
    }
  };

  // source/components/Group/index.js
  var Group = class {
    constructor(...components) {
      return new GroupComponent(...components);
    }
  };
  var GroupComponent = class extends BaseComponent {
    constructor(...elements) {
      super();
      this.components = [];
      this.el = document.createElement("div");
      this.el.classList.add("y-win__group");
      this.placement = "body";
      if (elements.length > 0) {
        if (hasDuplicates(elements)) {
          warn("One of the groups contains duplicate elements. Duplicates will be ignored...");
        }
        this.components = [...new Set(elements)];
        this.components.forEach((e, index) => {
          if (e instanceof BaseComponent) {
            this.el.appendChild(e.render());
          } else {
            error(`Element number ${index} is not a component. A group can only accept components`);
          }
        });
      }
    }
    add(component) {
      if (!(component instanceof BaseComponent)) {
        error("A group can only accept components");
      }
      this.el.appendChild(component.render());
      this.components.push(component);
    }
    addClass(...classNames) {
      if (classNames.length > 0) this.el.classList.add(...classNames);
    }
  };

  // source/components/Toast/index.js
  var Toast = class extends Modal {
    constructor(properties = {}) {
      super();
      this.type = "toast";
      this._timeout = properties.timeout ?? 2e3;
      this._addSetupHook((modal) => {
        modal.setAttribute("type", "toast");
        modal.style.setProperty("--y-win-body-padding", "5px 10px 15px 15px");
        modal.style.setProperty("--y-win-header-padding", "10px");
      });
      const title = new TitleComponent(properties.title ?? "Untitled");
      if (properties.icon) {
        const icon = new TitleIconComponent({ icon: properties.icon, type: properties.iconType });
        const titleGroup = new Group(icon, title);
        titleGroup.setProperty("title-with-icon");
        this.renderComponent(titleGroup, "header");
      } else {
        this.renderComponent(title, "header");
      }
    }
    show() {
      super.show();
      this.hideOnTimeout(this._timeout, { notHideWhenHovered: true });
    }
  };

  // source/components/Tooltip/index.js
  var Tooltip = class {
    constructor(target, properties = {}) {
      this.target = target;
      this.props = {
        pos: properties.pos || "top",
        title: properties.title || "",
        content: properties.content || "",
        icon: properties.icon || null,
        className: properties.className || null,
        delay: properties.delay || 150,
        offset: properties.offset || 5
      };
      this.tooltip = null;
      this.showTimeout = null;
      this.hideTimeout = null;
      this._mounted = false;
      this._init();
    }
    _init() {
      this.target.addEventListener("mouseenter", () => this._scheduleShow());
      this.target.addEventListener("mouseleave", () => this._scheduleHide());
    }
    _createTooltip() {
      if (this._mounted) return;
      const tooltip = document.createElement("div");
      tooltip.classList.add("y-tooltip", "y-win__hidden");
      if (this.props.className) tooltip.classList.add(...this.props.className.split(" ").filter(Boolean));
      let header = "";
      if (this.props.title) {
        if (this.props.icon instanceof BaseComponent) {
          this.props.icon = this.props.icon.el.outerHTML;
        }
        header = `
                <div class="y-tooltip__header">
                    ${this.props.icon ? `<span class="y-tooltip__icon">${this.props.icon}</span>` : ""}
                    <span class="y-tooltip__title">${this.props.title}</span>
                </div>
            `;
      }
      tooltip.innerHTML = `
            ${header}
            <div class="y-tooltip__content">${this.props.content}</div>
        `;
      document.body.appendChild(tooltip);
      tooltip.addEventListener("mouseenter", () => this._clearHide());
      tooltip.addEventListener("mouseleave", () => this._scheduleHide());
      this.tooltip = tooltip;
      this._mounted = true;
    }
    _scheduleShow() {
      this._clearHide();
      this.showTimeout = setTimeout(() => this.show(), this.props.delay);
    }
    _scheduleHide() {
      this._clearShow();
      this.hideTimeout = setTimeout(() => this.hide(), this.props.delay);
    }
    _clearShow() {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
    }
    _clearHide() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    }
    show() {
      this._createTooltip();
      const offset = this.props.offset;
      const rect = this.target.getBoundingClientRect();
      const tRect = this.tooltip.getBoundingClientRect();
      let pos = this.props.pos;
      if (pos === "top" && rect.top < tRect.height + offset) pos = "bottom";
      if (pos === "bottom" && rect.bottom + tRect.height + offset > window.innerHeight) pos = "top";
      if (pos === "left" && rect.left < tRect.width + offset) pos = "right";
      if (pos === "right" && rect.right + tRect.width + offset > window.innerWidth) pos = "left";
      let top = 0;
      let left = 0;
      switch (pos) {
        case "top":
          top = rect.top - tRect.height - offset;
          left = rect.left + rect.width / 2 - tRect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2 - tRect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tRect.height / 2;
          left = rect.left - tRect.width - offset;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tRect.height / 2;
          left = rect.right + offset;
          break;
      }
      const pad = 8;
      if (left < pad) left = pad;
      if (left + tRect.width > window.innerWidth - pad) left = window.innerWidth - tRect.width - pad;
      if (top < pad) top = pad;
      if (top + tRect.height > window.innerHeight - pad) top = window.innerHeight - tRect.height - pad;
      this.tooltip.style.top = `${top + window.scrollY}px`;
      this.tooltip.style.left = `${left + window.scrollX}px`;
      void this.tooltip.offsetWidth;
      requestAnimationFrame(() => {
        if (this.tooltip) this.tooltip.classList.remove("y-win__hidden");
      });
    }
    hide() {
      if (!this.tooltip) return;
      this.tooltip.classList.add("y-win__hidden");
      setTimeout(() => {
        if (this.tooltip && this.tooltip.classList.contains("y-win__hidden")) {
          this.tooltip.remove();
          this._mounted = false;
        }
      }, 300);
    }
  };

  // source/components/Description/index.js
  var DescriptionComponent = class extends BaseComponent {
    constructor(text) {
      super();
      this.el = document.createElement("div");
      this.el.classList.add("y-win__desc");
      this.el.innerHTML = text;
      this.placement = "header";
    }
  };

  // source/components/Text/index.js
  var TextComponent = class extends BaseComponent {
    constructor(text) {
      super();
      this.el = document.createElement("p");
      this.el.classList.add("y-win__text");
      this.el.innerHTML = text;
      this.placement = "body";
    }
  };

  // source/components/Image/index.js
  var ImageComponent = class extends BaseComponent {
    constructor(url) {
      super();
      this.el = document.createElement("img");
      this.el.classList.add("y-win__image");
      this.el.src = url;
      this.placement = "body";
    }
  };

  // source/components/VIconButton/index.js
  var VIconButtonComponent = class extends BaseComponent {
    constructor(options = {}, cb = () => {
    }) {
      super();
      this.el = document.createElement("button");
      this.el.classList.add("y-win__icon-vbutton");
      this.el.innerHTML = `
            <div class="y-win__icon-vbutton__icon">${options.icon ?? ""}</div>
            ${"name" in options ? `<span class="y-win__icon-vbutton__name">${options.name}</span>` : ""}
        `;
      if (!("name" in options)) {
        this.el.classList.add("only-icon");
      }
      this.placement = "body";
      this.el.addEventListener("click", () => cb());
    }
  };

  // source/components/MaterialIcon/index.js
  var MaterialIconComponent = class extends BaseComponent {
    constructor(name) {
      super();
      this.el = document.createElement("span");
      this.el.classList.add("material-symbols-rounded");
      this.el.textContent = name;
      this.placement = "body";
    }
  };

  // source/components/YurbaIcon/index.js
  var YurbaIconComponent = class extends BaseComponent {
    constructor(name) {
      super();
      this.el = document.createElement("span");
      this.el.className = `yrb yrb-${name}`;
      this.placement = "body";
    }
  };

  // source/helpers/menu.js
  function anchorFixed(trigger, menu, align = "left") {
    const pad = 8;
    const gap = 4;
    const tRect = trigger.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let left = align === "right" ? tRect.right - mw : tRect.left;
    if (left + mw > window.innerWidth - pad) left = window.innerWidth - mw - pad;
    if (left < pad) left = pad;
    let top = tRect.bottom + gap;
    if (top + mh > window.innerHeight - pad) {
      const above = tRect.top - gap - mh;
      top = above >= pad ? above : Math.max(pad, window.innerHeight - mh - pad);
    }
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }
  function repositionSubmenu(trigger, submenu) {
    submenu.style.top = "";
    submenu.style.bottom = "";
    submenu.style.left = "";
    submenu.style.right = "";
    const pad = 8;
    const tRect = trigger.getBoundingClientRect();
    const mRect = submenu.getBoundingClientRect();
    if (tRect.right + mRect.width > window.innerWidth - pad) {
      submenu.style.left = "auto";
      submenu.style.right = "100%";
    } else {
      submenu.style.left = "100%";
      submenu.style.right = "auto";
    }
    if (tRect.top + mRect.height > window.innerHeight - pad) {
      submenu.style.top = "auto";
      submenu.style.bottom = "0";
    } else {
      submenu.style.top = "0";
      submenu.style.bottom = "auto";
    }
  }
  function buildMenuItems(items, container, onCloseAll) {
    items.forEach((item) => {
      if (item.separator) {
        const sep = document.createElement("div");
        sep.className = "y-dropdown__separator";
        container.appendChild(sep);
        return;
      }
      const hasChildren = Array.isArray(item.children) && item.children.length > 0;
      const hasSubmenu = item.submenu != null;
      const isParent = hasChildren || hasSubmenu;
      const btn = document.createElement("button");
      btn.className = "y-dropdown__item" + (isParent ? " y-dropdown__item--has-children" : "");
      btn.type = "button";
      if (item.className) btn.classList.add(...item.className.split(" ").filter(Boolean));
      btn.innerHTML = `${item.icon ? '<span class="y-dropdown__item-icon">' + item.icon + "</span>" : ""}<span class="y-dropdown__item-label">${item.label}</span>${isParent ? '<span class="y-dropdown__item-arrow">\u203A</span>' : ""}`;
      if (item.onClick) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          onCloseAll();
          item.onClick(e);
        });
      }
      if (isParent) {
        const wrapper = document.createElement("div");
        wrapper.className = "y-dropdown__item-wrapper";
        const submenu = document.createElement("div");
        submenu.className = "y-dropdown__menu y-dropdown__submenu y-win__hidden";
        if (hasChildren) {
          buildMenuItems(item.children, submenu, onCloseAll);
        } else if (item.submenu instanceof HTMLElement) {
          submenu.appendChild(item.submenu);
        } else {
          submenu.innerHTML = String(item.submenu);
        }
        let hideTimer = null;
        const showSub = () => {
          clearTimeout(hideTimer);
          repositionSubmenu(btn, submenu);
          submenu.classList.remove("y-win__hidden");
        };
        const hideSub = () => {
          hideTimer = setTimeout(() => submenu.classList.add("y-win__hidden"), 80);
        };
        btn.addEventListener("mouseenter", showSub);
        btn.addEventListener("mouseleave", hideSub);
        submenu.addEventListener("mouseenter", () => clearTimeout(hideTimer));
        submenu.addEventListener("mouseleave", hideSub);
        wrapper.appendChild(btn);
        wrapper.appendChild(submenu);
        container.appendChild(wrapper);
      } else {
        container.appendChild(btn);
      }
    });
  }

  // source/components/Select/index.js
  var SelectComponent = class extends BaseComponent {
    constructor(options = [], properties = {}) {
      var _a;
      super();
      this._options = options;
      this._multiple = properties.multiple ?? false;
      this._placeholder = properties.placeholder ?? "Select...";
      this._changeHandlers = [];
      this.placement = "body";
      this._menuMounted = false;
      this._menu = null;
      this._trigger = null;
      if (this._multiple) {
        this._values = Array.isArray(properties.values) ? [...properties.values] : [];
      } else {
        this._value = properties.value ?? (((_a = options[0]) == null ? void 0 : _a.value) ?? null);
      }
    }
    render() {
      const el = document.createElement("div");
      el.className = "y-select";
      this._trigger = document.createElement("button");
      this._trigger.className = "y-select__trigger";
      this._trigger.type = "button";
      this._syncTrigger();
      const initMenu = () => {
        if (this._menuMounted) return;
        this._menu = document.createElement("div");
        this._menu.className = "y-select__menu y-select__menu--portal y-win__hidden";
        this._renderMenu();
        document.addEventListener("click", (e) => {
          if (!el.contains(e.target) && !this._menu.contains(e.target)) {
            this._menu.classList.add("y-win__hidden");
          }
        });
        const reflow = () => {
          if (!this._menu.classList.contains("y-win__hidden")) this._reposition();
        };
        window.addEventListener("scroll", reflow, true);
        window.addEventListener("resize", reflow);
        document.body.appendChild(this._menu);
        this._menuMounted = true;
      };
      this._trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        initMenu();
        const closing = !this._menu.classList.contains("y-win__hidden");
        this._menu.classList.add("y-win__hidden");
        if (!closing) {
          this._reposition();
          this._menu.classList.remove("y-win__hidden");
        } else {
          setTimeout(() => {
            if (this._menu && this._menu.classList.contains("y-win__hidden") && this._menu.parentNode) {
              this._menu.remove();
              this._menuMounted = false;
            }
          }, 300);
        }
      });
      el.appendChild(this._trigger);
      this.el = el;
      return el;
    }
    _reposition() {
      if (!this._menu) return;
      this._menu.style.minWidth = this._trigger.getBoundingClientRect().width + "px";
      anchorFixed(this._trigger, this._menu, "left");
    }
    _syncTrigger() {
      if (!this._trigger) return;
      const arrow = `<span class="y-select__arrow"><svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
      if (this._multiple) {
        const selected = this._options.filter((o) => this._values.includes(o.value));
        let inner;
        if (selected.length === 0) {
          inner = `<span class="y-select__placeholder">${this._placeholder}</span>`;
        } else if (selected.length <= 2) {
          inner = selected.map(
            (o) => `${o.icon ? '<span class="y-select__item-icon">' + o.icon + "</span>" : ""}<span>${o.label}</span>`
          ).join('<span class="y-select__multi-sep">,</span>');
        } else {
          inner = `<span>${selected.length} selected</span>`;
        }
        this._trigger.innerHTML = `<span class="y-select__label">${inner}</span>${arrow}`;
        return;
      }
      const opt = this._options.find((o) => o.value === this._value);
      const label = opt ? `${opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""}<span>${opt.label}</span>` : `<span class="y-select__placeholder">${this._placeholder}</span>`;
      this._trigger.innerHTML = `<span class="y-select__label">${label}</span>${arrow}`;
    }
    _renderMenu() {
      if (!this._menu) return;
      this._menu.innerHTML = "";
      this._options.forEach((opt) => {
        const isActive = this._multiple ? this._values.includes(opt.value) : opt.value === this._value;
        const item = document.createElement("button");
        item.className = "y-select__item" + (isActive ? " y-select__item--active" : "");
        item.type = "button";
        if (this._multiple) {
          item.innerHTML = `<span class="y-select__check"></span>${opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""}<span>${opt.label}</span>`;
        } else {
          item.innerHTML = `${opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""}<span>${opt.label}</span>`;
        }
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this._multiple) {
            const idx = this._values.indexOf(opt.value);
            if (idx === -1) this._values.push(opt.value);
            else this._values.splice(idx, 1);
            this._syncTrigger();
            this._renderMenu();
            this._changeHandlers.forEach((cb) => cb([...this._values], this._options.filter((o) => this._values.includes(o.value))));
          } else {
            this._value = opt.value;
            this._syncTrigger();
            this._renderMenu();
            this._menu.classList.add("y-win__hidden");
            this._changeHandlers.forEach((cb) => cb(opt.value, opt));
            setTimeout(() => {
              if (this._menu && this._menu.classList.contains("y-win__hidden") && this._menu.parentNode) {
                this._menu.remove();
                this._menuMounted = false;
              }
            }, 300);
          }
        });
        this._menu.appendChild(item);
      });
    }
    getValue() {
      return this._multiple ? [...this._values] : this._value;
    }
    setValue(value) {
      if (this._multiple) {
        this._values = Array.isArray(value) ? [...value] : [value];
      } else {
        this._value = value;
      }
      this._syncTrigger();
      if (this._menuMounted) this._renderMenu();
      return this;
    }
    onChange(cb) {
      this._changeHandlers.push(cb);
      return this;
    }
  };

  // source/components/Dropdown/index.js
  var DropdownComponent = class extends BaseComponent {
    constructor(items = [], properties = {}) {
      super();
      this._items = items;
      this._content = properties.content ?? null;
      if (!properties.trigger) error("Dropdown requires a trigger \u2014 pass trigger: '<html>' in options");
      this._triggerContent = properties.trigger;
      this._onOpen = properties.onOpen ?? null;
      this._onClose = properties.onClose ?? null;
      this._align = properties.align ?? "left";
      this._triggerClass = properties.triggerClass ?? null;
      this.placement = "body";
      this._menuMounted = false;
      this._menu = null;
    }
    render() {
      const el = document.createElement("div");
      el.className = "y-dropdown";
      const trigger = document.createElement("button");
      trigger.className = "y-dropdown__trigger";
      if (this._triggerClass) trigger.classList.add(...this._triggerClass.split(" ").filter(Boolean));
      trigger.type = "button";
      trigger.innerHTML = this._triggerContent;
      const isOpen = () => this._menu && !this._menu.classList.contains("y-win__hidden");
      const closeRoot = () => {
        if (!this._menu) return;
        this._menu.classList.add("y-win__hidden");
        this._menu.querySelectorAll(".y-dropdown__submenu").forEach((s) => s.classList.add("y-win__hidden"));
        this._menu.dispatchEvent(new CustomEvent("yurba-dropdown:close", { bubbles: true }));
        if (this._onClose) this._onClose(this._menu);
        setTimeout(() => {
          if (this._menu && this._menu.classList.contains("y-win__hidden") && this._menu.parentNode) {
            this._menu.remove();
            this._menuMounted = false;
          }
        }, 300);
      };
      const initMenu = () => {
        if (this._menuMounted) return;
        this._menu = document.createElement("div");
        this._menu.className = "y-dropdown__menu y-dropdown__menu--portal y-win__hidden";
        if (this._content !== null) {
          if (this._content instanceof HTMLElement) {
            this._menu.appendChild(this._content);
          } else if (typeof this._content === "string") {
            this._menu.innerHTML = this._content;
          }
        } else {
          buildMenuItems(this._items, this._menu, closeRoot);
        }
        document.body.appendChild(this._menu);
        document.addEventListener("click", (e) => {
          if (!el.contains(e.target) && !this._menu.contains(e.target)) closeRoot();
        });
        const reflow = () => {
          if (isOpen()) anchorFixed(trigger, this._menu, this._align);
        };
        window.addEventListener("scroll", reflow, true);
        window.addEventListener("resize", reflow);
        this._menuMounted = true;
      };
      const open = () => {
        initMenu();
        anchorFixed(trigger, this._menu, this._align);
        this._menu.classList.remove("y-win__hidden");
        this._menu.dispatchEvent(new CustomEvent("yurba-dropdown:open", { bubbles: true }));
        if (this._onOpen) this._onOpen(this._menu);
      };
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isOpen()) closeRoot();
        else open();
      });
      el.appendChild(trigger);
      this.el = el;
      this.menu = this._menu;
      return el;
    }
  };

  // source/components/ContextMenu/index.js
  var ContextMenuComponent = class extends BaseComponent {
    constructor(items = [], properties = {}) {
      super();
      this._items = items;
      this._onOpen = properties.onOpen ?? null;
      this._onClose = properties.onClose ?? null;
      this._menu = null;
      this._target = null;
      this.placement = "body";
    }
    bind(target) {
      let targets;
      if (typeof target === "string") {
        targets = [...document.querySelectorAll(target)];
      } else if (target instanceof NodeList || Array.isArray(target)) {
        targets = [...target];
      } else {
        targets = [target];
      }
      targets.forEach((t) => {
        t.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.open(e.clientX, e.clientY, t);
        });
      });
      return this;
    }
    open(x, y, target = null) {
      this.close();
      const menu = document.createElement("div");
      menu.className = "y-context-menu y-win__hidden";
      buildMenuItems(this._items, menu, () => this.close());
      document.body.appendChild(menu);
      this._menu = menu;
      this._target = target;
      this._position(menu, x, y);
      requestAnimationFrame(() => menu.classList.remove("y-win__hidden"));
      this._onOutside = (e) => {
        if (!menu.contains(e.target)) this.close();
      };
      this._onKey = (e) => {
        if (e.key === "Escape") this.close();
      };
      this._onScroll = () => this.close();
      setTimeout(() => {
        document.addEventListener("click", this._onOutside);
        document.addEventListener("contextmenu", this._onOutside);
        document.addEventListener("keydown", this._onKey);
        window.addEventListener("scroll", this._onScroll, true);
      }, 0);
      if (this._onOpen) this._onOpen(menu, target);
      return menu;
    }
    close() {
      if (!this._menu) return;
      document.removeEventListener("click", this._onOutside);
      document.removeEventListener("contextmenu", this._onOutside);
      document.removeEventListener("keydown", this._onKey);
      window.removeEventListener("scroll", this._onScroll, true);
      const menu = this._menu;
      const target = this._target;
      this._menu = null;
      this._target = null;
      menu.classList.add("y-win__hidden");
      setTimeout(() => {
        if (menu.parentNode) menu.remove();
        if (this._onClose) this._onClose(target);
      }, 300);
    }
    _position(menu, x, y) {
      const pad = 8;
      const mw = menu.offsetWidth;
      const mh = menu.offsetHeight;
      let left = x;
      let top = y;
      if (left + mw > window.innerWidth - pad) left = x - mw;
      if (left < pad) left = pad;
      if (top + mh > window.innerHeight - pad) top = y - mh;
      if (top < pad) top = pad;
      menu.style.left = left + "px";
      menu.style.top = top + "px";
    }
    isOpen() {
      return this._menu !== null;
    }
  };

  // source/index.js
  var YurbaUI = {
    Modal,
    Select: SelectComponent,
    Dropdown: DropdownComponent,
    ContextMenu: ContextMenuComponent,
    Tooltip,
    Toast,
    Title: TitleComponent,
    Description: DescriptionComponent,
    Text: TextComponent,
    Image: ImageComponent,
    IconButton: VIconButtonComponent,
    TitleIcon: TitleIconComponent,
    MaterialIcon: MaterialIconComponent,
    YurbaIcon: YurbaIconComponent,
    Group
  };
  return __toCommonJS(index_exports);
})();
window.YurbaUI=__yurbaui__.YurbaUI;
