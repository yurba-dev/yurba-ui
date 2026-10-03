var __yurbaui__ = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
  function componentProperties(el) {
    return {
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
    };
  }

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
      const prop = componentProperties(this.el)[name];
      if (prop == void 0) error(`Unknown property "${name}"`, "component");
      if (typeof prop == "function") {
        prop(value);
      } else {
        prop[value]();
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
    const prefix = type == "component" ? "Component error" : "Error";
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
  function hasDuplicates(arr) {
    return new Set(arr).size != arr.length;
  }

  // source/components/Modal/index.js
  var yWinBound = false;
  function bindYWinOpeners() {
    if (yWinBound) return;
    yWinBound = true;
    document.addEventListener("click", (event) => {
      const element = event.target instanceof Element ? event.target.closest("[y-win]") : null;
      if (!element) return;
      const id = element.getAttribute("y-win");
      if (id in modals) {
        modals[id].show();
      } else {
        warn(`The "${id}" modal window was not found. It has either been deleted or has not yet been created. Ignoring...`);
      }
    });
  }
  var _Modal_instances, initModal_fn, fitViewport_fn, bindSheetDrag_fn, mount_fn, isTopLayer_fn, inLaterLayer_fn, unbindHandlers_fn, focusables_fn, focusFirst_fn, trapFocus_fn, unlist_fn, startHideTimer_fn, clearHideTimer_fn, fireClose_fn, dismiss_fn, bindUpdates_fn;
  var _Modal = class _Modal {
    constructor(properties = {}) {
      __privateAdd(this, _Modal_instances);
      const size = "size" in properties ? properties.size : "default";
      this.size = size;
      this.compact = properties.compact ?? false;
      this.sheet = properties.sheet ?? this.compact;
      this.properties = properties;
      this.mounted = false;
      this.modeless = properties.modeless ?? false;
      this.outsideClickEnabled = !this.modeless && (properties.closeOnOutsideClick ?? true);
      this.onClose = properties.onClose ?? null;
      this.renderQueue = [];
      this.setupHooks = [];
      if (Array.isArray(properties.components)) {
        properties.components.forEach((component) => this.renderQueue.push({ component: component.content, placement: component.area }));
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
      this.removeTimer = null;
      this.positionClasses = [];
      bindYWinOpeners();
    }
    renderComponent(component, customPlacement) {
      this.renderQueue.push({ component, placement: customPlacement });
      if (this.mounted) {
        return __privateMethod(this, _Modal_instances, mount_fn).call(this, component, customPlacement);
      }
      if (component instanceof HTMLElement) return component;
      if (!(component instanceof BaseComponent)) {
        error("The component must inherit from BaseComponent or be an HTMLElement", "component");
      }
      if (customPlacement) component.placement = customPlacement;
      return component.render();
    }
    addSetupHook(hook) {
      this.setupHooks.push(hook);
      if (this.mounted) hook(this.modal);
    }
    bind(name) {
      modals[name] = this;
      this.name = name;
    }
    show() {
      const wasShowed = this.showed;
      clearTimeout(this.removeTimer);
      this.removeTimer = null;
      if (!UIElements.includes(this)) UIElements.push(this);
      __privateMethod(this, _Modal_instances, unbindHandlers_fn).call(this);
      __privateMethod(this, _Modal_instances, initModal_fn).call(this);
      __privateMethod(this, _Modal_instances, bindUpdates_fn).call(this);
      this.showed = true;
      if (this.type == "modal") this.modal.setAttribute("data-layer", "");
      const modal = this.modal;
      void modal.offsetWidth;
      requestAnimationFrame(() => {
        if (this.showed && modal) modal.classList.remove("is-hidden");
      });
      if (this.type == "modal" && !this.modeless) {
        document.body.style.overflow = "hidden";
      }
      if (this.sheet) __privateMethod(this, _Modal_instances, fitViewport_fn).call(this, true);
      if (this.outsideClickEnabled) {
        setTimeout(() => {
          if (!this.showed || this.outsideClickHandler) return;
          this.outsideClickHandler = (event) => {
            if (!this.modal || event.closesPopup) return;
            const inAnotherModal = UIElements.some((el) => el != this && el.modal && el.modal.contains(event.target));
            if (inAnotherModal || __privateMethod(this, _Modal_instances, inLaterLayer_fn).call(this, event.target)) return;
            if (event.target == this.modal || !this.modal.contains(event.target)) __privateMethod(this, _Modal_instances, dismiss_fn).call(this);
          };
          document.addEventListener("click", this.outsideClickHandler);
        }, 0);
      }
      if (this.type == "modal") {
        if (!wasShowed) this._prevFocus = document.activeElement;
        this.keyHandler = (event) => {
          if (event.defaultPrevented) return;
          if (!__privateMethod(this, _Modal_instances, isTopLayer_fn).call(this)) return;
          if (event.key == "Escape") {
            event.preventDefault();
            __privateMethod(this, _Modal_instances, dismiss_fn).call(this);
          } else if (event.key == "Tab") {
            __privateMethod(this, _Modal_instances, trapFocus_fn).call(this, event);
          }
        };
        document.addEventListener("keydown", this.keyHandler);
        setTimeout(() => __privateMethod(this, _Modal_instances, focusFirst_fn).call(this), 50);
      }
    }
    hide() {
      if (!this.mounted) return;
      __privateMethod(this, _Modal_instances, bindUpdates_fn).call(this);
      this.showed = false;
      this.modal.classList.add("is-hidden");
      this.modal.removeAttribute("data-layer");
      if (this.type == "modal") {
        const anyModalOpen = UIElements.some((element) => element != this && element.showed && element.type == "modal" && !element.modeless);
        if (!anyModalOpen) document.body.style.overflow = "";
      }
      __privateMethod(this, _Modal_instances, unbindHandlers_fn).call(this);
      if (this.sheet) __privateMethod(this, _Modal_instances, fitViewport_fn).call(this, false);
      if (this._prevFocus && typeof this._prevFocus.focus == "function") {
        const prev = this._prevFocus;
        this._prevFocus = null;
        setTimeout(() => {
          if (document.body.contains(prev)) prev.focus();
        }, 0);
      }
      clearTimeout(this.removeTimer);
      this.removeTimer = setTimeout(() => {
        this.removeTimer = null;
        if (this.showed || !this.mounted || !this.modal) return;
        this.modal.remove();
        this.modal = null;
        this.mounted = false;
        __privateMethod(this, _Modal_instances, unlist_fn).call(this);
      }, 300);
    }
    remove() {
      clearTimeout(this.removeTimer);
      this.removeTimer = null;
      __privateMethod(this, _Modal_instances, clearHideTimer_fn).call(this);
      __privateMethod(this, _Modal_instances, unbindHandlers_fn).call(this);
      if (this.sheet) __privateMethod(this, _Modal_instances, fitViewport_fn).call(this, false);
      if (this.mounted && this.modal) this.modal.remove();
      const wasShowed = this.showed;
      this.showed = false;
      if (wasShowed && this.type == "modal") {
        const anyModalOpen = UIElements.some((element) => element != this && element.showed && element.type == "modal" && !element.modeless);
        if (!anyModalOpen) document.body.style.overflow = "";
      }
      this.modal = null;
      this.mounted = false;
      __privateMethod(this, _Modal_instances, unlist_fn).call(this);
    }
    hideOnTimeout(time = 0, properties = {}) {
      this.hideDelay = time;
      __privateMethod(this, _Modal_instances, startHideTimer_fn).call(this);
      if (!properties.notHideWhenHovered || !this.modal || this.hoverBoundModal == this.modal) return;
      const modal = this.modal;
      this.hoverBoundModal = modal;
      modal.addEventListener("mouseover", () => __privateMethod(this, _Modal_instances, clearHideTimer_fn).call(this));
      modal.addEventListener("mouseout", (event) => {
        if (!modal.contains(event.relatedTarget)) __privateMethod(this, _Modal_instances, startHideTimer_fn).call(this);
      });
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
    setPosition(position) {
      __privateMethod(this, _Modal_instances, initModal_fn).call(this);
      const positions = {
        right: "y-win__pos-right",
        center: "y-win__pos-center",
        left: "y-win__pos-left",
        bottom: "y-win__pos-bottom",
        top: "y-win__pos-top"
      };
      position.split("-").map((part) => part.trim()).forEach((part) => {
        if (!(part in positions)) return;
        this.modal.classList.add(positions[part]);
        if (!this.positionClasses.includes(positions[part])) this.positionClasses.push(positions[part]);
      });
    }
    isPopup() {
      return this.type == "popup";
    }
    isToast() {
      return this.type == "toast";
    }
    isShowed() {
      return this.showed;
    }
  };
  _Modal_instances = new WeakSet();
  initModal_fn = function() {
    if (this.mounted) return;
    this.modal = document.createElement("div");
    this.modal.classList.add("y-win__wrapper", "is-hidden", this.size, ...this.positionClasses);
    if (this.compact) this.modal.classList.add("compact");
    if (this.sheet) this.modal.classList.add("sheet");
    if (this.modeless) this.modal.classList.add("modeless");
    const icons = { ..._Modal.icons, ...this.properties.icons };
    this.modal.innerHTML = `
            <div class="y-win" role="dialog" aria-modal="true" tabindex="-1">
                ${this.sheet ? '<div class="y-win__handle" aria-hidden="true"></div>' : ""}
                <div class="y-win__header">
                    <div class="y-win__header-body"></div>
                    <div class="y-win__header-actions">
                        <div class="y-win__controls"></div>
                        <button type="button" class="y-win__close" aria-label="${_Modal.labels.close}">
                            ${icons.close}
                        </button>
                    </div>
                </div>
                <div class="y-win__body"></div>
                <div class="y-win__footer-wrapper">
                    <div class="y-win__footer"></div>
                </div>
            </div>
        `;
    if ("parent" in this.properties) {
      if (this.properties.parent instanceof HTMLElement) {
        this.properties.parent.appendChild(this.modal);
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
    this.modalClose = this.modal.querySelector(".y-win__close");
    this.modalClose.addEventListener("click", () => __privateMethod(this, _Modal_instances, dismiss_fn).call(this));
    if (this.sheet) __privateMethod(this, _Modal_instances, bindSheetDrag_fn).call(this);
    this.mounted = true;
    this.setupHooks.forEach((hook) => hook(this.modal));
    this.renderQueue.forEach(({ component, placement }) => __privateMethod(this, _Modal_instances, mount_fn).call(this, component, placement));
  };
  // Android Chrome overlays the keyboard without resizing
  fitViewport_fn = function(on) {
    const viewport = window.visualViewport;
    if (!viewport) return;
    if (!on) {
      if (this.viewportHandler) {
        viewport.removeEventListener("resize", this.viewportHandler);
        viewport.removeEventListener("scroll", this.viewportHandler);
        this.viewportHandler = null;
      }
      return;
    }
    if (this.viewportHandler) return;
    this.viewportHandler = () => {
      if (!this.modal) return;
      const phone = window.matchMedia("(max-width: 768px)").matches;
      this.modal.style.height = phone ? viewport.height + "px" : "";
      this.modal.style.top = phone ? viewport.offsetTop + "px" : "";
    };
    viewport.addEventListener("resize", this.viewportHandler);
    viewport.addEventListener("scroll", this.viewportHandler);
    this.viewportHandler();
  };
  bindSheetDrag_fn = function() {
    const modal = this;
    const win = this.modal.querySelector(".y-win");
    let startY = null;
    let delta = 0;
    function start(event) {
      if (!window.matchMedia("(max-width: 768px)").matches) return;
      startY = event.touches[0].clientY;
      delta = 0;
      win.style.transition = "none";
    }
    function move(event) {
      if (startY == null) return;
      delta = Math.max(0, event.touches[0].clientY - startY);
      win.style.translate = `0 ${delta}px`;
    }
    function end() {
      var _a;
      if (startY == null) return;
      startY = null;
      win.style.transition = "";
      win.style.translate = "";
      if (delta > 80) __privateMethod(_a = modal, _Modal_instances, dismiss_fn).call(_a);
    }
    this.modal.querySelectorAll(".y-win__handle, .y-win__header").forEach((grip) => grip.addEventListener("touchstart", start, { passive: true }));
    win.addEventListener("touchmove", move, { passive: true });
    win.addEventListener("touchend", end);
    win.addEventListener("touchcancel", end);
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
    const element = component.render();
    placements[component.placement].appendChild(element);
    return element;
  };
  isTopLayer_fn = function() {
    const layers = document.querySelectorAll("body > [data-layer]");
    return layers[layers.length - 1] == this.modal;
  };
  inLaterLayer_fn = function(target) {
    const top2 = target instanceof Node && [...document.body.children].find((child) => child.contains(target));
    return !!top2 && top2 != this.modal && !!(this.modal.compareDocumentPosition(top2) & Node.DOCUMENT_POSITION_FOLLOWING);
  };
  unbindHandlers_fn = function() {
    if (this.outsideClickHandler) {
      document.removeEventListener("click", this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
    if (this.keyHandler) {
      document.removeEventListener("keydown", this.keyHandler);
      this.keyHandler = null;
    }
  };
  focusables_fn = function() {
    if (!this.modal) return [];
    const sel = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.modal.querySelectorAll(sel)).filter((el) => el.offsetParent != null);
  };
  focusFirst_fn = function() {
    if (!this.showed || !this.modal || this.modal.contains(document.activeElement)) return;
    const autofocus = this.modal.querySelector("[autofocus]");
    const win = this.modal.querySelector(".y-win");
    (autofocus ?? win ?? this.modal).focus();
  };
  trapFocus_fn = function(event) {
    const list = __privateMethod(this, _Modal_instances, focusables_fn).call(this);
    if (list.length == 0) return;
    const first = list[0], last = list[list.length - 1];
    const active = document.activeElement;
    const loose = !this.modal.contains(active) || active.classList.contains("y-win");
    if (event.shiftKey && (loose || active == first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (loose || active == last)) {
      event.preventDefault();
      first.focus();
    }
  };
  unlist_fn = function() {
    const index = UIElements.indexOf(this);
    if (index != -1) UIElements.splice(index, 1);
  };
  startHideTimer_fn = function() {
    __privateMethod(this, _Modal_instances, clearHideTimer_fn).call(this);
    this.hideTimeout = setTimeout(() => this.hide(), this.hideDelay);
  };
  clearHideTimer_fn = function() {
    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
  };
  fireClose_fn = function() {
    if (this.onClose) this.onClose();
  };
  dismiss_fn = function() {
    this.hide();
    __privateMethod(this, _Modal_instances, fireClose_fn).call(this);
  };
  bindUpdates_fn = function() {
    if (this.modalHeader.childNodes.length == 0) {
      this.modalHeader.classList.add("y-win__header-empty");
    } else {
      this.modalHeader.classList.remove("y-win__header-empty");
    }
  };
  __publicField(_Modal, "labels", { close: "Close" });
  __publicField(_Modal, "icons", { close: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' });
  var Modal = _Modal;

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
  function toastStack() {
    let stack = document.querySelector("body > .y-win__toasts");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "y-win__toasts";
    }
    if (document.body.lastElementChild != stack) document.body.appendChild(stack);
    return stack;
  }
  var Toast = class extends Modal {
    constructor(properties = {}) {
      super({ ...properties, closeOnOutsideClick: properties.closeOnOutsideClick ?? false });
      this.type = "toast";
      this.timeout = properties.timeout ?? 2e3;
      this.stacked = !("parent" in properties);
      this.addSetupHook((modal) => {
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
      if (this.stacked) this.properties.parent = toastStack();
      super.show();
      this.hideOnTimeout(this.timeout, { notHideWhenHovered: true });
    }
  };

  // source/helpers/menu.js
  var openMenus = /* @__PURE__ */ new Set();
  function menuOpened(entry, from) {
    openMenus.forEach((menu) => {
      if (menu != entry && !menu.holds(from)) menu.close();
    });
    openMenus.add(entry);
  }
  function menuClosed(entry) {
    openMenus.delete(entry);
  }
  function fitMenu(menu) {
    const pad = 8;
    menu.classList.remove("is-scrollable");
    menu.style.maxHeight = "";
    if (menu.offsetHeight > window.innerHeight - pad * 2) menu.classList.add("is-scrollable");
  }
  function refitMenu(item) {
    const pad = 8;
    const menu = item.closest(".y-context-menu, .y-dropdown__menu:not(.y-dropdown__submenu)");
    if (!menu) return;
    const rect = menu.getBoundingClientRect();
    if (rect.bottom <= window.innerHeight - pad) return;
    menu.classList.add("is-scrollable");
    menu.style.maxHeight = Math.max(window.innerHeight - pad - rect.top, 0) + "px";
  }
  function anchorFixed(trigger, menu, align = "left") {
    const pad = 8;
    const gap = 4;
    fitMenu(menu);
    const tRect = trigger.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let left = align == "right" ? tRect.right - mw : tRect.left;
    if (left + mw > window.innerWidth - pad) left = window.innerWidth - mw - pad;
    if (left < pad) left = pad;
    let top2 = tRect.bottom + gap;
    if (top2 + mh > window.innerHeight - pad) {
      const above = tRect.top - gap - mh;
      top2 = above >= pad ? above : Math.max(pad, window.innerHeight - mh - pad);
    }
    menu.style.left = left + "px";
    menu.style.top = top2 + "px";
  }
  function repositionSubmenu(trigger, submenu) {
    submenu.classList.remove("y-dropdown__submenu--inline");
    submenu.style.top = "";
    submenu.style.bottom = "";
    submenu.style.left = "";
    submenu.style.right = "";
    const pad = 8;
    const tRect = trigger.getBoundingClientRect();
    const mRect = submenu.getBoundingClientRect();
    const inline = !!trigger.closest(".y-dropdown__menu.is-scrollable, .y-context-menu.is-scrollable") || tRect.right + mRect.width > window.innerWidth - pad && tRect.left - mRect.width < pad;
    submenu.classList.toggle("y-dropdown__submenu--inline", inline);
    if (inline) return;
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
  var menuIcons = { arrow: "\u203A", check: '<span class="material-symbols-rounded">check</span>' };
  function checkMark(html) {
    const box = document.createElement("span");
    box.innerHTML = String(html).trim();
    const mark = box.childNodes.length == 1 && box.firstChild instanceof Element ? box.firstChild : box;
    mark.classList.add("y-dropdown__item-check");
    return mark.outerHTML;
  }
  function itemRow(item, parent = false, icons = menuIcons) {
    const btn = document.createElement("button");
    btn.className = "y-dropdown__item" + (parent ? " y-dropdown__item--has-children" : "") + (item.active ? " is-active" : "");
    btn.type = "button";
    if (item.className) btn.classList.add(...item.className.split(" ").filter(Boolean));
    const end = parent ? `<span class="y-dropdown__item-arrow">${icons.arrow}</span>` : item.active ? checkMark(icons.check) : "";
    btn.innerHTML = `${item.icon ? '<span class="y-dropdown__item-icon">' + item.icon + "</span>" : ""}<span class="y-dropdown__item-label">${item.label}</span>${end}`;
    return btn;
  }
  function releaseSubmenus(menu) {
    menu.querySelectorAll(".y-dropdown__submenu").forEach((submenu) => {
      submenu.classList.add("is-hidden");
      if (!submenu.yCleanup) return;
      submenu.yCleanup();
      submenu.yCleanup = null;
      submenu.replaceChildren();
    });
  }
  function tidyItems(items) {
    return items.filter((item, i) => !item.separator || i > 0 && i < items.length - 1 && !items[i - 1].separator && !items.slice(i + 1).every((next) => next.separator));
  }
  function buildMenuItems(items, container, onCloseAll, icons = menuIcons) {
    tidyItems(items).forEach((item) => {
      if (item.separator) {
        const sep = document.createElement("div");
        sep.className = "y-dropdown__separator";
        container.appendChild(sep);
        return;
      }
      const filled = typeof item.children == "function";
      const hasChildren = filled || Array.isArray(item.children) && item.children.length > 0;
      const hasSubmenu = item.submenu != null;
      const isParent = hasChildren || hasSubmenu;
      const btn = itemRow(isParent ? { ...item, active: false } : item, isParent, icons);
      if (item.onClick && !isParent) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!item.keepOpen) onCloseAll();
          item.onClick(e);
        });
      }
      if (isParent) {
        let showSub = function() {
          var _a;
          clearTimeout(hideTimer);
          (_a = submenu.yFill) == null ? void 0 : _a.call(submenu);
          repositionSubmenu(btn, submenu);
          submenu.classList.remove("is-hidden");
          if (submenu.classList.contains("y-dropdown__submenu--inline")) refitMenu(btn);
        }, hideSub = function() {
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => submenu.classList.add("is-hidden"), 80);
        }, keepSub = function() {
          clearTimeout(hideTimer);
        }, byMouse = function(fn) {
          return (e) => {
            if (e.pointerType == "mouse") fn();
          };
        };
        const wrapper = document.createElement("div");
        wrapper.className = "y-dropdown__item-wrapper";
        const submenu = document.createElement("div");
        submenu.className = "y-dropdown__menu y-dropdown__submenu is-hidden";
        if (filled) {
          submenu.yFill = () => {
            if (submenu.yCleanup) return;
            submenu.yCleanup = item.children((list) => {
              submenu.replaceChildren();
              buildMenuItems(list, submenu, onCloseAll, icons);
            }) ?? (() => {
            });
          };
        } else if (hasChildren) {
          buildMenuItems(item.children, submenu, onCloseAll, icons);
        } else if (item.submenu instanceof HTMLElement) {
          submenu.appendChild(item.submenu);
        } else {
          submenu.innerHTML = String(item.submenu);
        }
        let hideTimer = null;
        btn.addEventListener("pointerenter", byMouse(showSub));
        btn.addEventListener("pointerleave", byMouse(hideSub));
        submenu.addEventListener("pointerenter", byMouse(keepSub));
        submenu.addEventListener("pointerleave", byMouse(hideSub));
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (e.pointerType == "mouse") return showSub();
          if (submenu.classList.contains("is-hidden")) {
            container.querySelectorAll(":scope > .y-dropdown__item-wrapper > .y-dropdown__submenu").forEach((s) => s != submenu && s.classList.add("is-hidden"));
            showSub();
          } else {
            clearTimeout(hideTimer);
            submenu.classList.add("is-hidden");
          }
        });
        wrapper.appendChild(btn);
        wrapper.appendChild(submenu);
        container.appendChild(wrapper);
      } else {
        container.appendChild(btn);
      }
    });
  }

  // source/components/Dropdown/sheet.js
  function openSheet(items, { trigger = null, at = null, onClose = null, icons = menuIcons } = {}) {
    var _a;
    const layer = document.createElement("div");
    const panel = document.createElement("div");
    panel.className = "y-sheet__panel";
    panel.setAttribute("role", "menu");
    const cleanups = [];
    let open = true;
    const box = trigger == null ? void 0 : trigger.getBoundingClientRect();
    const seen = ((_a = window.visualViewport) == null ? void 0 : _a.height) ?? window.innerHeight;
    const middle = at ?? (box ? box.top + box.height / 2 : 0);
    const top2 = middle < seen / 2;
    layer.className = "y-sheet " + (top2 ? "y-sheet--top" : "y-sheet--bottom");
    function close() {
      if (!open) return;
      open = false;
      document.removeEventListener("keydown", onKey, true);
      cleanups.splice(0).forEach((fn) => fn());
      layer.classList.remove("y-sheet--open");
      setTimeout(() => layer.remove(), 250);
      if (onClose) onClose(panel);
    }
    function onKey(e) {
      if (e.key != "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      close();
    }
    function build(list, container) {
      tidyItems(list).forEach((item) => {
        if (item.separator) {
          const sep = document.createElement("div");
          sep.className = "y-dropdown__separator";
          container.appendChild(sep);
          return;
        }
        const nested = item.children != null && (typeof item.children == "function" || item.children.length > 0);
        if (nested || item.submenu != null) return group(item, container);
        const row = itemRow(item, false, icons);
        row.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!item.keepOpen) close();
          if (item.onClick) item.onClick(e);
        });
        container.appendChild(row);
      });
    }
    function group(item, container) {
      const head = itemRow({ ...item, active: false }, true, icons);
      const body = document.createElement("div");
      body.className = "y-sheet__group";
      let cleanup = null;
      function set(list) {
        body.replaceChildren();
        build(list, body);
      }
      function collapse() {
        head.classList.remove("y-dropdown__item--open");
        cleanup == null ? void 0 : cleanup();
        cleanup = null;
        body.replaceChildren();
      }
      function expand() {
        head.classList.add("y-dropdown__item--open");
        if (item.submenu instanceof HTMLElement) return body.appendChild(item.submenu);
        if (item.submenu != null) {
          body.innerHTML = String(item.submenu);
          return;
        }
        if (typeof item.children != "function") return set(item.children);
        const own = item.children(set) ?? (() => {
        });
        cleanup = own;
        cleanups.push(() => own == cleanup && own());
      }
      head.addEventListener("click", (e) => {
        e.stopPropagation();
        head.classList.contains("y-dropdown__item--open") ? collapse() : expand();
      });
      container.append(head, body);
      if (item.expanded) expand();
    }
    function bindSwipe() {
      let startY = null;
      let delta = 0;
      panel.addEventListener("touchstart", (e) => {
        startY = e.touches[0].clientY;
        delta = 0;
      }, { passive: true });
      panel.addEventListener("touchmove", (e) => {
        if (startY == null) return;
        const y = e.touches[0].clientY;
        const toward = top2 ? startY - y : y - startY;
        const edge = top2 ? panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1 : panel.scrollTop <= 0;
        if (!edge || toward < 0) startY = y;
        delta = edge ? Math.max(0, toward) : 0;
        panel.style.transition = delta ? "none" : "";
        panel.style.transform = delta ? `translateY(${top2 ? -delta : delta}px)` : "";
      }, { passive: true });
      function end() {
        if (startY == null) return;
        startY = null;
        panel.style.transition = "";
        panel.style.transform = "";
        if (delta > 80) close();
      }
      panel.addEventListener("touchend", end);
      panel.addEventListener("touchcancel", end);
      panel.addEventListener("click", (e) => {
        if (delta < 8) return;
        e.preventDefault();
        e.stopPropagation();
      }, true);
    }
    build(items, panel);
    bindSwipe();
    layer.appendChild(panel);
    layer.addEventListener("click", (e) => {
      if (e.target == layer) close();
    });
    document.addEventListener("keydown", onKey, true);
    function onOutside(e) {
      if (panel.contains(e.target) || (trigger == null ? void 0 : trigger.contains(e.target))) return;
      close();
    }
    setTimeout(() => {
      if (open) document.addEventListener("click", onOutside, true);
    }, 0);
    cleanups.push(() => document.removeEventListener("click", onOutside, true));
    const host = trigger == null ? void 0 : trigger.closest(".y-win__wrapper");
    if (host) {
      const watch = new MutationObserver(() => {
        if (host.classList.contains("is-hidden") || !host.isConnected) close();
      });
      watch.observe(host, { attributes: true, attributeFilter: ["class"] });
      cleanups.push(() => watch.disconnect());
    }
    document.body.appendChild(layer);
    setTimeout(() => {
      if (open) layer.classList.add("y-sheet--open");
    }, 20);
    return { panel, close, isOpen: () => open };
  }

  // source/components/Tooltip/index.js
  var tooltipId = 0;
  var _Tooltip_instances, listen_fn, markup_fn, asSheet_fn, showSheet_fn, place_fn, unmount_fn;
  var Tooltip = class {
    constructor(target, properties = {}) {
      __privateAdd(this, _Tooltip_instances);
      this.target = target;
      this.props = {
        pos: properties.pos || "top",
        title: properties.title || "",
        content: properties.content || "",
        icon: properties.icon || null,
        className: properties.className || null,
        delay: properties.delay ?? 150,
        offset: properties.offset ?? 5,
        when: properties.when || null,
        trigger: properties.trigger || "hover",
        // One opened by a click is a sheet on a phone, as menus are
        sheet: properties.sheet ?? true
      };
      this.tooltip = null;
      this.sheet = null;
      this.showTimeout = null;
      this.hideTimeout = null;
      this.removeTimeout = null;
      this.mounted = false;
      this.visible = false;
      this.id = `y-tooltip-${++tooltipId}`;
      this.init();
    }
    init() {
      this._onScroll = (e) => {
        var _a;
        if (!((_a = this.tooltip) == null ? void 0 : _a.contains(e.target))) this.hide();
      };
      this._onPointer = () => {
        if (!this.target.isConnected) this.hide();
      };
      this._onResize = () => {
        if (this.visible && this.tooltip) __privateMethod(this, _Tooltip_instances, place_fn).call(this);
      };
      if (this.props.trigger == "click") {
        this._onClick = () => {
          if (this.visible) this.hide();
          else this.show();
        };
        this._onOutside = (e) => {
          var _a;
          if (!this.target.contains(e.target) && !((_a = this.tooltip) == null ? void 0 : _a.contains(e.target))) this.hide();
        };
        this._onKey = (e) => {
          if (e.key == "Escape") this.hide();
        };
        this.target.addEventListener("click", this._onClick);
        return;
      }
      this._onEnter = (e) => {
        if (e.pointerType != "touch") this.scheduleShow();
      };
      this._onFocus = () => {
        if (this.target.matches(":focus-visible, :has(:focus-visible)")) this.scheduleShow();
      };
      this._onHide = () => this.scheduleHide();
      this.target.addEventListener("pointerenter", this._onEnter);
      this.target.addEventListener("pointerleave", this._onHide);
      this.target.addEventListener("focusin", this._onFocus);
      this.target.addEventListener("focusout", this._onHide);
    }
    createTooltip() {
      if (this.mounted) return;
      const tooltip = document.createElement("div");
      tooltip.classList.add("y-tooltip", "is-hidden");
      tooltip.id = this.id;
      tooltip.setAttribute("role", "tooltip");
      if (!this.props.title) tooltip.classList.add("y-tooltip--plain");
      if (this.props.className) tooltip.classList.add(...this.props.className.split(" ").filter(Boolean));
      tooltip.innerHTML = __privateMethod(this, _Tooltip_instances, markup_fn).call(this);
      document.body.appendChild(tooltip);
      tooltip.addEventListener("mouseenter", () => this.clearHide());
      tooltip.addEventListener("mouseleave", () => this.scheduleHide());
      this.tooltip = tooltip;
      this.mounted = true;
      if (!this.target.hasAttribute("aria-describedby")) this.target.setAttribute("aria-describedby", this.id);
    }
    scheduleShow() {
      if (this.props.when && !this.props.when()) return;
      this.clearHide();
      this.clearShow();
      this.showTimeout = setTimeout(() => this.show(), this.props.delay);
    }
    scheduleHide() {
      this.clearShow();
      this.clearHide();
      this.hideTimeout = setTimeout(() => this.hide(), this.props.delay);
    }
    clearShow() {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
    }
    clearHide() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    }
    show() {
      if (!this.target.isConnected) return this.hide();
      if (__privateMethod(this, _Tooltip_instances, asSheet_fn).call(this)) return __privateMethod(this, _Tooltip_instances, showSheet_fn).call(this);
      clearTimeout(this.removeTimeout);
      this.createTooltip();
      __privateMethod(this, _Tooltip_instances, listen_fn).call(this, true);
      this.visible = true;
      __privateMethod(this, _Tooltip_instances, place_fn).call(this);
      void this.tooltip.offsetWidth;
      requestAnimationFrame(() => {
        if (this.tooltip && this.visible) this.tooltip.classList.remove("is-hidden");
      });
    }
    // New title, icon or content for a tooltip that may be open right now
    update(properties = {}) {
      for (const key of ["title", "icon", "content"]) {
        if (properties[key] != void 0) this.props[key] = properties[key];
      }
      if (!this.tooltip) return;
      const content = typeof this.props.content == "function" ? this.props.content() : this.props.content;
      this.tooltip.querySelector(".y-tooltip__content").innerHTML = content;
      const title = this.tooltip.querySelector(".y-tooltip__title");
      if (title) title.innerHTML = this.props.title;
      const icon = this.tooltip.querySelector(".y-tooltip__icon");
      if (icon && this.props.icon) icon.innerHTML = this.props.icon;
      if (this.visible && !this.sheet) __privateMethod(this, _Tooltip_instances, place_fn).call(this);
    }
    hide() {
      this.clearShow();
      this.visible = false;
      if (this.sheet) return this.sheet.close();
      if (!this.tooltip) return;
      __privateMethod(this, _Tooltip_instances, listen_fn).call(this, false);
      this.tooltip.classList.add("is-hidden");
      clearTimeout(this.removeTimeout);
      this.removeTimeout = setTimeout(() => __privateMethod(this, _Tooltip_instances, unmount_fn).call(this), 300);
    }
    destroy() {
      var _a;
      this.clearShow();
      this.clearHide();
      clearTimeout(this.removeTimeout);
      __privateMethod(this, _Tooltip_instances, listen_fn).call(this, false);
      this.target.removeEventListener("click", this._onClick);
      this.target.removeEventListener("pointerenter", this._onEnter);
      this.target.removeEventListener("pointerleave", this._onHide);
      this.target.removeEventListener("focusin", this._onFocus);
      this.target.removeEventListener("focusout", this._onHide);
      (_a = this.sheet) == null ? void 0 : _a.close();
      if (this.tooltip) this.tooltip.classList.add("is-hidden");
      __privateMethod(this, _Tooltip_instances, unmount_fn).call(this);
    }
  };
  _Tooltip_instances = new WeakSet();
  listen_fn = function(on) {
    const method = on ? "addEventListener" : "removeEventListener";
    window[method]("scroll", this._onScroll, true);
    window[method]("resize", this._onResize);
    document[method]("pointerover", this._onPointer);
    if (this.props.trigger == "click") {
      document[method]("pointerdown", this._onOutside, true);
      document[method]("keydown", this._onKey);
    }
  };
  markup_fn = function() {
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
    const content = typeof this.props.content == "function" ? this.props.content() : this.props.content;
    return `
            ${header}
            <div class="y-tooltip__content">${content}</div>
        `;
  };
  asSheet_fn = function() {
    return this.props.trigger == "click" && this.props.sheet && window.matchMedia("(max-width: 768px)").matches;
  };
  showSheet_fn = function() {
    if (this.sheet) return;
    const box = document.createElement("div");
    box.className = ["y-tooltip", "y-tooltip--sheet", this.props.className].filter(Boolean).join(" ");
    box.innerHTML = __privateMethod(this, _Tooltip_instances, markup_fn).call(this);
    const sheet = openSheet([], {
      trigger: this.target,
      onClose: () => {
        if (this.sheet != sheet) return;
        this.sheet = null;
        this.tooltip = null;
        this.mounted = false;
        this.visible = false;
      }
    });
    sheet.panel.setAttribute("role", "dialog");
    sheet.panel.appendChild(box);
    this.sheet = sheet;
    this.tooltip = box;
    this.mounted = true;
    this.visible = true;
  };
  place_fn = function() {
    const offset2 = this.props.offset;
    const rect = this.target.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let pos = this.props.pos;
    if (pos == "top" && rect.top < tooltipRect.height + offset2) pos = "bottom";
    if (pos == "bottom" && rect.bottom + tooltipRect.height + offset2 > window.innerHeight) pos = "top";
    if (pos == "left" && rect.left < tooltipRect.width + offset2) pos = "right";
    if (pos == "right" && rect.right + tooltipRect.width + offset2 > window.innerWidth) pos = "left";
    let top2 = 0;
    let left = 0;
    switch (pos) {
      case "top":
        top2 = rect.top - tooltipRect.height - offset2;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom":
        top2 = rect.bottom + offset2;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case "left":
        top2 = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - offset2;
        break;
      case "right":
        top2 = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + offset2;
        break;
    }
    const pad = 8;
    if (left < pad) left = pad;
    if (left + tooltipRect.width > window.innerWidth - pad) left = window.innerWidth - tooltipRect.width - pad;
    if (top2 < pad) top2 = pad;
    if (top2 + tooltipRect.height > window.innerHeight - pad) top2 = window.innerHeight - tooltipRect.height - pad;
    this.tooltip.style.top = `${top2 + window.scrollY}px`;
    this.tooltip.style.left = `${left + window.scrollX}px`;
  };
  unmount_fn = function() {
    if (!this.tooltip || !this.tooltip.classList.contains("is-hidden")) return;
    this.tooltip.remove();
    this.tooltip = null;
    this.mounted = false;
    if (this.target.getAttribute("aria-describedby") == this.id) this.target.removeAttribute("aria-describedby");
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
    constructor(options2 = {}, cb = () => {
    }) {
      super();
      this.el = document.createElement("button");
      this.el.type = "button";
      this.el.classList.add("y-win__icon-vbutton");
      this.el.innerHTML = `
            <div class="y-win__icon-vbutton__icon">${options2.icon ?? ""}</div>
            ${"name" in options2 ? `<span class="y-win__icon-vbutton__name">${options2.name}</span>` : ""}
        `;
      if (!("name" in options2)) {
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
      this.el.translate = false;
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

  // source/components/Select/index.js
  var htmlEntities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => htmlEntities[c]);
  }
  var _SelectComponent = class _SelectComponent extends BaseComponent {
    constructor(options2 = [], properties = {}) {
      var _a;
      super();
      this._options = options2;
      this._icons = properties.icons ?? null;
      this._multiple = properties.multiple ?? false;
      this._placeholder = properties.placeholder ?? _SelectComponent.labels.placeholder;
      this._html = properties.html ?? true;
      this._changeHandlers = [];
      this.placement = "body";
      this._menuMounted = false;
      this._menu = null;
      this._trigger = null;
      this._entry = { holds: (node) => {
        var _a2;
        return node instanceof Node && !!((_a2 = this._menu) == null ? void 0 : _a2.contains(node));
      }, close: () => this._close() };
      if (this._multiple) {
        this._values = Array.isArray(properties.values) ? [...properties.values] : [];
      } else {
        this._value = properties.value ?? (((_a = options2[0]) == null ? void 0 : _a.value) ?? null);
      }
    }
    render() {
      const el = document.createElement("div");
      el.className = "y-select";
      this._trigger = document.createElement("button");
      this._trigger.className = "y-select__trigger";
      this._trigger.type = "button";
      this._trigger.setAttribute("aria-haspopup", "listbox");
      this._trigger.setAttribute("aria-expanded", "false");
      this._syncTrigger();
      this._trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        this._initMenu();
        const closing = !this._menu.classList.contains("is-hidden");
        this._close();
        if (!closing) this._open();
      });
      el.appendChild(this._trigger);
      this.el = el;
      return el;
    }
    _initMenu() {
      if (this._menuMounted) return;
      this._menu = document.createElement("div");
      this._menu.className = "y-select__menu is-hidden";
      this._menu.setAttribute("role", "listbox");
      if (this._multiple) this._menu.setAttribute("aria-multiselectable", "true");
      this._renderMenu();
      document.body.appendChild(this._menu);
      this._menuMounted = true;
    }
    _items() {
      return this._menu ? Array.from(this._menu.querySelectorAll(".y-select__item")) : [];
    }
    _open() {
      if (document.body.lastElementChild != this._menu) document.body.appendChild(this._menu);
      menuOpened(this._entry, this._trigger);
      anchorFixed(this._trigger, this._menu, "left");
      this._menu.classList.remove("is-hidden");
      this._trigger.classList.add("is-open");
      this._trigger.setAttribute("aria-expanded", "true");
      this._outsideHandler = (e) => {
        if (!this.el.contains(e.target) && !this._menu.contains(e.target)) this._close();
      };
      this._scrollHandler = (e) => {
        if (e.target instanceof Node && this._menu.contains(e.target)) return;
        this._close();
      };
      this._keyHandler = (e) => {
        const list2 = this._items();
        const idx = list2.indexOf(document.activeElement);
        if (e.key == "Escape" || e.key == "Tab") {
          if (e.key == "Escape") {
            e.preventDefault();
            e.stopPropagation();
          }
          const inside = idx != -1;
          this._close();
          if (inside || e.key == "Escape") this._trigger.focus();
          if (inside && e.key == "Tab") e.preventDefault();
          return;
        }
        if (list2.length == 0) return;
        if (e.key == "ArrowDown") {
          e.preventDefault();
          (list2[idx + 1] || list2[0]).focus();
        } else if (e.key == "ArrowUp") {
          e.preventDefault();
          (list2[idx - 1] || list2[list2.length - 1]).focus();
        } else if (e.key == "Home") {
          e.preventDefault();
          list2[0].focus();
        } else if (e.key == "End") {
          e.preventDefault();
          list2[list2.length - 1].focus();
        }
      };
      this._resizeHandler = () => this._close();
      document.addEventListener("click", this._outsideHandler);
      window.addEventListener("scroll", this._scrollHandler, true);
      window.addEventListener("resize", this._resizeHandler);
      document.addEventListener("keydown", this._keyHandler, true);
      const list = this._items();
      const active = list.find((i) => i.classList.contains("is-active")) || list[0];
      if (active) active.focus({ preventScroll: true });
    }
    _close() {
      if (this._outsideHandler) {
        document.removeEventListener("click", this._outsideHandler);
        this._outsideHandler = null;
      }
      if (this._scrollHandler) {
        window.removeEventListener("scroll", this._scrollHandler, true);
        this._scrollHandler = null;
      }
      if (this._resizeHandler) {
        window.removeEventListener("resize", this._resizeHandler);
        this._resizeHandler = null;
      }
      if (this._keyHandler) {
        document.removeEventListener("keydown", this._keyHandler, true);
        this._keyHandler = null;
      }
      menuClosed(this._entry);
      if (!this._menu) return;
      this._menu.classList.add("is-hidden");
      this._trigger.classList.remove("is-open");
      this._trigger.setAttribute("aria-expanded", "false");
    }
    _iconSet() {
      return { ..._SelectComponent.icons, ...this._icons };
    }
    _label(text) {
      return this._html ? text : escapeHtml(text);
    }
    _syncTrigger() {
      if (!this._trigger) return;
      const arrow = `<span class="y-select__arrow">${this._iconSet().arrow}</span>`;
      if (this._multiple) {
        const selected = this._options.filter((o) => this._values.includes(o.value));
        let inner;
        if (selected.length == 0) {
          inner = `<span class="y-select__placeholder">${this._placeholder}</span>`;
        } else if (selected.length <= 2) {
          inner = selected.map(
            (o) => `${o.icon ? '<span class="y-select__item-icon">' + o.icon + "</span>" : ""}<span>${this._label(o.label)}</span>`
          ).join('<span class="y-select__multi-sep">,</span>');
        } else {
          inner = `<span>${escapeHtml(_SelectComponent.labels.selected(selected.length))}</span>`;
        }
        this._trigger.innerHTML = `<span class="y-select__label">${inner}</span>${arrow}`;
        return;
      }
      const opt = this._options.find((o) => o.value == this._value);
      const label = opt ? `${opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : ""}<span>${this._label(opt.label)}</span>` : `<span class="y-select__placeholder">${this._placeholder}</span>`;
      this._trigger.innerHTML = `<span class="y-select__label">${label}</span>${arrow}`;
    }
    _renderMenu() {
      var _a;
      if (!this._menu) return;
      const focused = this._items().indexOf(document.activeElement);
      this._menu.innerHTML = "";
      const icons = this._iconSet();
      this._options.forEach((opt) => {
        const isActive = this._multiple ? this._values.includes(opt.value) : opt.value == this._value;
        const item = document.createElement("button");
        item.className = "y-select__item" + (isActive ? " is-active" : "");
        item.type = "button";
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", isActive ? "true" : "false");
        const icon = opt.icon ? '<span class="y-select__item-icon">' + opt.icon + "</span>" : "";
        if (this._multiple) {
          item.innerHTML = `<span class="y-select__check">${isActive ? icons.check : ""}</span>${icon}<span>${this._label(opt.label)}</span>`;
        } else {
          item.innerHTML = `${icon}<span>${this._label(opt.label)}</span>`;
        }
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this._multiple) {
            const idx = this._values.indexOf(opt.value);
            if (idx == -1) this._values.push(opt.value);
            else this._values.splice(idx, 1);
            this._syncTrigger();
            this._renderMenu();
            const selected = this._options.filter((o) => this._values.includes(o.value));
            this._changeHandlers.forEach((cb) => cb([...this._values], selected));
            this._emitChange({ values: [...this._values], options: selected });
          } else {
            const hadFocus = this._menu.contains(document.activeElement);
            this._value = opt.value;
            this._syncTrigger();
            this._renderMenu();
            this._close();
            if (hadFocus) this._trigger.focus({ preventScroll: true });
            this._changeHandlers.forEach((cb) => cb(opt.value, opt));
            this._emitChange({ value: opt.value, option: opt });
          }
        });
        this._menu.appendChild(item);
      });
      if (focused != -1) (_a = this._items()[focused]) == null ? void 0 : _a.focus({ preventScroll: true });
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
    // Options that change after rendering; the value stays if it is still among them
    setOptions(options2, value = this._value) {
      var _a;
      this._options = options2;
      if (!this._multiple) this._value = options2.some((o) => o.value == value) ? value : ((_a = options2[0]) == null ? void 0 : _a.value) ?? null;
      this._syncTrigger();
      if (this._menuMounted) this._renderMenu();
      return this;
    }
    // Takes over a native <select> the page already reads and fills: it stays in place, hidden, as the value the
    // page sees and the "change" it listens to, and this one shows and picks it. Options the page rewrites and
    // values it sets itself are followed.
    static from(select, properties = {}) {
      if (!select) return null;
      if (select._yurbaSelect) return select._yurbaSelect;
      const read = () => Array.from(select.options).map((o) => ({ value: o.value, label: o.textContent }));
      const native = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
      const nativeIndex = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "selectedIndex");
      const ui = new _SelectComponent(read(), { html: false, value: select.value, ...properties });
      const el = ui.render();
      el.classList.add("y-select--wide");
      const host = select.closest(".y-input") ?? select;
      host.style.display = "none";
      host.after(el);
      select._yurbaSelect = ui;
      ui.onChange((value) => {
        native.set.call(select, value);
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      new MutationObserver(() => ui.setOptions(read(), native.get.call(select))).observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["selected", "value", "label"] });
      Object.defineProperty(select, "value", {
        configurable: true,
        get() {
          return native.get.call(this);
        },
        set(value) {
          native.set.call(this, value);
          ui.setValue(native.get.call(this));
        }
      });
      Object.defineProperty(select, "selectedIndex", {
        configurable: true,
        get() {
          return nativeIndex.get.call(this);
        },
        set(index) {
          nativeIndex.set.call(this, index);
          ui.setValue(native.get.call(this));
        }
      });
      return ui;
    }
    _emitChange(detail) {
      if (!this.el) return;
      this.el.dispatchEvent(new CustomEvent("yurba-select:change", { detail, bubbles: true }));
    }
    onChange(cb) {
      this._changeHandlers.push(cb);
      return this;
    }
    destroy() {
      this._close();
      if (this._menu) this._menu.remove();
      if (this.el) this.el.remove();
      this._menu = null;
      this._menuMounted = false;
    }
  };
  // The page sets these in its own language
  __publicField(_SelectComponent, "labels", { placeholder: "Select...", selected: (count) => `${count} selected` });
  // An empty check keeps the tick drawn in CSS
  __publicField(_SelectComponent, "icons", { arrow: '<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>', check: "" });
  var SelectComponent = _SelectComponent;

  // source/components/Dropdown/index.js
  var _DropdownComponent = class _DropdownComponent extends BaseComponent {
    constructor(items = [], properties = {}) {
      super();
      this._items = items;
      this._icons = properties.icons ?? null;
      this._content = properties.content ?? null;
      if (!properties.trigger) error("Dropdown requires a trigger: pass trigger: '<html>' in options");
      this._triggerContent = properties.trigger;
      this._onOpen = properties.onOpen ?? null;
      this._onClose = properties.onClose ?? null;
      this._align = properties.align ?? "left";
      this._matchWidth = properties.matchWidth ?? false;
      this._triggerClass = properties.triggerClass ?? null;
      this._keepMounted = properties.keepMounted ?? false;
      this.placement = "body";
      this._menuMounted = false;
      this._menu = null;
    }
    render() {
      const dropdown = this;
      const external = this._triggerContent instanceof HTMLElement;
      const el = external ? this._triggerContent : document.createElement("div");
      if (!external) el.className = "y-dropdown";
      const trigger = external ? el : document.createElement("button");
      if (!external) {
        trigger.className = "y-dropdown__trigger";
        trigger.type = "button";
        trigger.innerHTML = this._triggerContent;
      }
      if (this._triggerClass) trigger.classList.add(...this._triggerClass.split(" ").filter(Boolean));
      trigger.setAttribute("aria-haspopup", "true");
      trigger.setAttribute("aria-expanded", "false");
      function menuItems() {
        return typeof dropdown._items == "function" ? dropdown._items() : dropdown._items;
      }
      function isOpen() {
        return dropdown._menu && !dropdown._menu.classList.contains("is-hidden");
      }
      function unbindGlobal() {
        if (dropdown._keyHandler) {
          document.removeEventListener("keydown", dropdown._keyHandler, true);
          dropdown._keyHandler = null;
        }
        if (dropdown._outsideHandler) {
          document.removeEventListener("click", dropdown._outsideHandler);
          dropdown._outsideHandler = null;
        }
        if (dropdown._scrollHandler) {
          window.removeEventListener("scroll", dropdown._scrollHandler, true);
          dropdown._scrollHandler = null;
        }
      }
      function closeRoot() {
        if (!isOpen()) return;
        menuClosed(dropdown._opened);
        unbindGlobal();
        trigger.setAttribute("aria-expanded", "false");
        const menu = dropdown._menu;
        menu.classList.add("is-hidden");
        releaseSubmenus(menu);
        menu.dispatchEvent(new CustomEvent("yurba-dropdown:close", { bubbles: true }));
        if (dropdown._onClose) dropdown._onClose(menu);
        if (dropdown._keepMounted) return;
        setTimeout(() => {
          if (dropdown._menu == menu && menu.classList.contains("is-hidden")) {
            menu.remove();
            dropdown._menu = null;
            dropdown._menuMounted = false;
          }
        }, 300);
      }
      function initMenu() {
        if (dropdown._menuMounted) return;
        const menu = document.createElement("div");
        menu.className = "y-dropdown__menu is-hidden";
        menu.setAttribute("tabindex", "-1");
        dropdown._menu = menu;
        if (dropdown._content != null) {
          if (dropdown._content instanceof HTMLElement) {
            menu.appendChild(dropdown._content);
          } else if (typeof dropdown._content == "string") {
            menu.innerHTML = dropdown._content;
          }
        } else {
          buildMenuItems(menuItems(), menu, closeRoot, { ..._DropdownComponent.icons, ...dropdown._icons });
        }
        document.body.appendChild(menu);
        dropdown._menuMounted = true;
      }
      function visibleItems() {
        return Array.from(dropdown._menu.querySelectorAll(".y-dropdown__item")).filter((i) => i.offsetParent != null);
      }
      function open() {
        initMenu();
        const menu = dropdown._menu;
        dropdown._opened = { holds: (node) => {
          var _a;
          return node instanceof Node && !!((_a = dropdown._menu) == null ? void 0 : _a.contains(node));
        }, close: closeRoot };
        menuOpened(dropdown._opened, trigger);
        unbindGlobal();
        dropdown._outsideHandler = (e) => {
          if (!el.contains(e.target) && !menu.contains(e.target)) closeRoot();
        };
        dropdown._scrollHandler = (e) => {
          if (e.target instanceof Node && menu.contains(e.target)) return;
          closeRoot();
        };
        document.addEventListener("click", dropdown._outsideHandler);
        window.addEventListener("scroll", dropdown._scrollHandler, true);
        if (document.body.lastElementChild != menu) document.body.appendChild(menu);
        if (dropdown._matchWidth) menu.style.minWidth = trigger.offsetWidth + "px";
        anchorFixed(trigger, menu, dropdown._align);
        menu.classList.remove("is-hidden");
        trigger.setAttribute("aria-expanded", "true");
        menu.dispatchEvent(new CustomEvent("yurba-dropdown:open", { bubbles: true }));
        if (dropdown._onOpen) dropdown._onOpen(menu);
        dropdown._keyHandler = (e) => {
          if (e.key == "Escape") {
            e.preventDefault();
            e.stopPropagation();
            closeRoot();
            trigger.focus();
            return;
          }
          if (e.key == "Tab" && dropdown._content == null && menu.contains(document.activeElement)) {
            e.preventDefault();
            closeRoot();
            trigger.focus();
            return;
          }
          const list = visibleItems();
          if (list.length == 0) return;
          const idx = list.indexOf(document.activeElement);
          if (e.key == "ArrowDown") {
            e.preventDefault();
            (list[idx + 1] || list[0]).focus();
          } else if (e.key == "ArrowUp") {
            e.preventDefault();
            (list[idx - 1] || list[list.length - 1]).focus();
          } else if (e.key == "Home") {
            e.preventDefault();
            list[0].focus();
          } else if (e.key == "End") {
            e.preventDefault();
            list[list.length - 1].focus();
          }
        };
        document.addEventListener("keydown", dropdown._keyHandler, true);
        setTimeout(() => {
          if (!isOpen()) return;
          const list = visibleItems();
          (list[0] || menu).focus();
        }, 0);
      }
      function asSheet() {
        return dropdown._content == null && window.matchMedia("(max-width: 768px)").matches;
      }
      function toggleSheet() {
        var _a;
        if ((_a = dropdown._sheet) == null ? void 0 : _a.isOpen()) return dropdown._sheet.close();
        trigger.setAttribute("aria-expanded", "true");
        const entry = { holds: (node) => {
          var _a2;
          return node instanceof Node && !!((_a2 = dropdown._sheet) == null ? void 0 : _a2.panel.contains(node));
        }, close: () => {
          var _a2;
          return (_a2 = dropdown._sheet) == null ? void 0 : _a2.close();
        } };
        menuOpened(entry, trigger);
        dropdown._sheet = openSheet(menuItems(), {
          trigger,
          icons: { ..._DropdownComponent.icons, ...dropdown._icons },
          onClose: (panel) => {
            menuClosed(entry);
            trigger.setAttribute("aria-expanded", "false");
            if (dropdown._onClose) dropdown._onClose(panel);
          }
        });
        if (dropdown._onOpen) dropdown._onOpen(dropdown._sheet.panel);
      }
      function onTriggerClick(e) {
        e.stopPropagation();
        if (asSheet()) return toggleSheet();
        if (isOpen()) closeRoot();
        else open();
      }
      if (this._triggerClick) this._triggerEl.removeEventListener("click", this._triggerClick);
      trigger.addEventListener("click", onTriggerClick);
      this._triggerEl = trigger;
      this._triggerClick = onTriggerClick;
      if (!external) el.appendChild(trigger);
      if (this._keepMounted) initMenu();
      this._unbindGlobal = unbindGlobal;
      this.close = function close() {
        var _a;
        closeRoot();
        if ((_a = dropdown._sheet) == null ? void 0 : _a.isOpen()) dropdown._sheet.close();
      };
      this.el = el;
      this.menu = this._menu;
      return el;
    }
    destroy() {
      var _a;
      if (this._unbindGlobal) this._unbindGlobal();
      if (this._opened) menuClosed(this._opened);
      if (this._menu) this._menu.remove();
      if ((_a = this._sheet) == null ? void 0 : _a.isOpen()) this._sheet.close();
      if (this._triggerClick) {
        this._triggerEl.removeEventListener("click", this._triggerClick);
        this._triggerEl.setAttribute("aria-expanded", "false");
        this._triggerClick = null;
      }
      if (this.el && !(this._triggerContent instanceof HTMLElement)) this.el.remove();
      this._menu = null;
      this._menuMounted = false;
    }
  };
  __publicField(_DropdownComponent, "icons", menuIcons);
  var DropdownComponent = _DropdownComponent;

  // source/components/ContextMenu/index.js
  var _ContextMenuComponent = class _ContextMenuComponent extends BaseComponent {
    static closeAll() {
      _ContextMenuComponent._open.forEach((menu) => menu.close());
    }
    // For a menu made at the moment it opens: open(e) builds and opens it, and a long press works as on bind()
    static attach(target, open) {
      _ContextMenuComponent.enableLongPress();
      target.classList.add(_ContextMenuComponent.TARGET);
      target.addEventListener("contextmenu", (e) => {
        if (open(e) == false) return;
        e.preventDefault();
      });
    }
    // A phone sends no contextmenu for a long press on text (Android starts a selection, iOS never sends one), so
    // on a touch screen the press itself becomes one, inside anything marked with TARGET. Pages with their own
    // contextmenu listener mark their element too
    static enableLongPress() {
      if (_ContextMenuComponent._touch) return;
      _ContextMenuComponent._touch = true;
      const HOLD = 450;
      const SLOP = 10;
      let timer = 0;
      let start = null;
      let pressedAt = 0;
      let fired = false;
      function release() {
        setTimeout(() => document.documentElement.classList.remove("y-touch-hold"), 50);
      }
      function cancel() {
        clearTimeout(timer);
        timer = 0;
        start = null;
      }
      document.addEventListener("touchstart", (e) => {
        cancel();
        if (e.touches.length != 1) return;
        const target = e.target instanceof Element ? e.target.closest("." + _ContextMenuComponent.TARGET) : null;
        if (!target) return;
        const touch2 = e.touches[0];
        start = { x: touch2.clientX, y: touch2.clientY, node: e.target };
        timer = setTimeout(() => {
          var _a, _b;
          const at = start;
          cancel();
          if (!(at == null ? void 0 : at.node.isConnected)) return;
          pressedAt = Date.now();
          fired = true;
          document.documentElement.classList.add("y-touch-hold");
          (_a = getSelection()) == null ? void 0 : _a.removeAllRanges();
          (_b = navigator.vibrate) == null ? void 0 : _b.call(navigator, 10);
          at.node.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: at.x, clientY: at.y }));
        }, HOLD);
      }, { passive: true });
      document.addEventListener("touchmove", (e) => {
        const touch2 = e.touches[0];
        if (start && touch2 && Math.hypot(touch2.clientX - start.x, touch2.clientY - start.y) > SLOP) cancel();
      }, { passive: true });
      document.addEventListener("touchend", (e) => {
        if (fired) e.preventDefault();
        fired = false;
        cancel();
        release();
      });
      document.addEventListener("selectionchange", () => {
        var _a;
        if (document.documentElement.classList.contains("y-touch-hold")) (_a = getSelection()) == null ? void 0 : _a.removeAllRanges();
      });
      document.addEventListener("touchcancel", () => {
        fired = false;
        cancel();
        release();
      });
      document.addEventListener("contextmenu", (e) => {
        if (e.isTrusted && Date.now() - pressedAt < 1e3) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }, true);
    }
    constructor(items = [], properties = {}) {
      super();
      this._items = items;
      this._icons = properties.icons ?? null;
      this._onOpen = properties.onOpen ?? null;
      this._onClose = properties.onClose ?? null;
      this._asSheet = properties.sheet ?? true;
      this._sheet = null;
      this._menu = null;
      this._target = null;
      this._companions = [];
      this._listenTimer = null;
      this._closing = null;
      this._entry = { holds: (node) => this._inside(node), close: () => this.close() };
      this.placement = "body";
    }
    keepWith(element) {
      if (element && !this._companions.includes(element)) this._companions.push(element);
      return this;
    }
    _inside(node) {
      var _a;
      return node instanceof Node && (((_a = this._menu) == null ? void 0 : _a.contains(node)) || this._companions.some((c) => c.contains(node)));
    }
    bind(target) {
      let targets;
      if (typeof target == "string") {
        targets = [...document.querySelectorAll(target)];
      } else if (target instanceof NodeList || Array.isArray(target)) {
        targets = [...target];
      } else {
        targets = [target];
      }
      _ContextMenuComponent.enableLongPress();
      targets.forEach((t) => {
        var _a;
        (_a = t.classList) == null ? void 0 : _a.add(_ContextMenuComponent.TARGET);
        t.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.open(e.clientX, e.clientY, t);
        });
      });
      return this;
    }
    open(x, y, target = null) {
      this.close();
      this._finishClose();
      const from = target ?? document.elementFromPoint(x, y);
      menuOpened(this._entry, from);
      if (this._asSheet && window.matchMedia("(max-width: 768px)").matches) return this._openSheet(y, target, from);
      const menu = document.createElement("div");
      menu.className = "y-context-menu is-hidden";
      buildMenuItems(this._items, menu, () => this.close(), { ..._ContextMenuComponent.icons, ...this._icons });
      document.body.appendChild(menu);
      this._menu = menu;
      _ContextMenuComponent._open.add(this);
      this._target = target;
      this._companions = [];
      if (this._onOpen) this._onOpen(menu, target);
      this._position(menu, x, y);
      requestAnimationFrame(() => {
        if (this._menu == menu) menu.classList.remove("is-hidden");
      });
      this._onOutside = (e) => {
        if (!this._inside(e.target)) this.close();
      };
      this._onKey = (e) => {
        if (e.key != "Escape") return;
        e.preventDefault();
        e.stopPropagation();
        this.close();
      };
      this._onScroll = (e) => {
        if (this._inside(e.target)) return;
        this.close();
      };
      this._listenTimer = setTimeout(() => {
        this._listenTimer = null;
        document.addEventListener("click", this._onOutside);
        document.addEventListener("contextmenu", this._onOutside);
        document.addEventListener("keydown", this._onKey, true);
        window.addEventListener("scroll", this._onScroll, true);
      }, 0);
      return menu;
    }
    _openSheet(y, target, from) {
      _ContextMenuComponent._open.add(this);
      this._target = target;
      this._companions = [];
      const sheet = openSheet(this._items, {
        trigger: from instanceof Element ? from : null,
        at: y,
        icons: { ..._ContextMenuComponent.icons, ...this._icons },
        onClose: () => {
          if (this._sheet != sheet) return;
          _ContextMenuComponent._open.delete(this);
          menuClosed(this._entry);
          this._sheet = null;
          this._menu = null;
          this._target = null;
          if (this._onClose) this._onClose(target);
        }
      });
      this._sheet = sheet;
      this._menu = sheet.panel;
      if (this._onOpen) this._onOpen(sheet.panel, target);
      return sheet.panel;
    }
    close() {
      if (this._sheet) return this._sheet.close();
      if (!this._menu) return;
      clearTimeout(this._listenTimer);
      this._listenTimer = null;
      document.removeEventListener("click", this._onOutside);
      document.removeEventListener("contextmenu", this._onOutside);
      document.removeEventListener("keydown", this._onKey, true);
      window.removeEventListener("scroll", this._onScroll, true);
      const menu = this._menu;
      const target = this._target;
      _ContextMenuComponent._open.delete(this);
      menuClosed(this._entry);
      this._menu = null;
      this._target = null;
      menu.classList.add("is-hidden");
      this._closing = { menu, target, timer: setTimeout(() => this._finishClose(), 300) };
    }
    _finishClose() {
      if (!this._closing) return;
      const { menu, target, timer } = this._closing;
      this._closing = null;
      clearTimeout(timer);
      if (menu.parentNode) menu.remove();
      if (this._onClose) this._onClose(target);
    }
    _position(menu, x, y) {
      const pad = 8;
      fitMenu(menu);
      const mw = menu.offsetWidth;
      const mh = menu.offsetHeight;
      let left = x;
      let top2 = y;
      if (left + mw > window.innerWidth - pad) left = x - mw;
      if (left < pad) left = pad;
      if (top2 + mh > window.innerHeight - pad) top2 = y - mh;
      if (top2 < pad) top2 = pad;
      menu.style.left = left + "px";
      menu.style.top = top2 + "px";
    }
    isOpen() {
      return this._menu != null;
    }
  };
  __publicField(_ContextMenuComponent, "icons", menuIcons);
  __publicField(_ContextMenuComponent, "_open", /* @__PURE__ */ new Set());
  __publicField(_ContextMenuComponent, "TARGET", "y-context-target");
  __publicField(_ContextMenuComponent, "_touch", false);
  var ContextMenuComponent = _ContextMenuComponent;

  // source/components/Readmore/index.js
  var instances = /* @__PURE__ */ new WeakMap();
  var Readmore = class {
    constructor(target, options2 = {}) {
      this._el = typeof target == "string" ? document.querySelector(target) : target;
      this._collapsedHeight = options2.collapsedHeight ?? 200;
      this._heightMargin = options2.heightMargin ?? 16;
      this._moreText = options2.moreText ?? "Read more";
      this._lessText = options2.lessText ?? "Read less";
      this._expanded = false;
      this._toggle = null;
      this._expandTimer = null;
      this._init();
    }
    _init() {
      var _a;
      if (!this._el) return;
      (_a = instances.get(this._el)) == null ? void 0 : _a.destroy();
      instances.set(this._el, this);
      const naturalHeight = this._el.scrollHeight;
      if (naturalHeight <= this._collapsedHeight + this._heightMargin) return;
      this._el.classList.add("y-readmore");
      this._el.style.maxHeight = this._collapsedHeight + "px";
      this._toggle = document.createElement("button");
      this._toggle.className = "y-readmore__toggle";
      this._toggle.type = "button";
      this._toggle.textContent = this._moreText;
      this._toggle.addEventListener("click", () => {
        this._expanded ? this.collapse() : this.expand();
      });
      this._el.after(this._toggle);
    }
    expand() {
      if (!this._el || !this._toggle) return;
      this._el.style.maxHeight = this._el.scrollHeight + "px";
      this._toggle.textContent = this._lessText;
      this._expanded = true;
      clearTimeout(this._expandTimer);
      this._expandTimer = setTimeout(() => {
        if (this._expanded && this._el) this._el.style.maxHeight = "none";
      }, 300);
    }
    collapse() {
      if (!this._el || !this._toggle) return;
      clearTimeout(this._expandTimer);
      if (this._el.style.maxHeight == "none") {
        this._el.style.maxHeight = this._el.scrollHeight + "px";
        void this._el.offsetHeight;
      }
      this._el.style.maxHeight = this._collapsedHeight + "px";
      this._toggle.textContent = this._moreText;
      this._expanded = false;
    }
    destroy() {
      clearTimeout(this._expandTimer);
      if (this._toggle) this._toggle.remove();
      this._toggle = null;
      this._expanded = false;
      if (!this._el) return;
      this._el.classList.remove("y-readmore");
      this._el.style.maxHeight = "";
      if (instances.get(this._el) == this) instances.delete(this._el);
    }
  };

  // source/components/Scrollbar/index.js
  var instances2 = /* @__PURE__ */ new WeakMap();
  var attached = /* @__PURE__ */ new Set();
  var autoSelectors = /* @__PURE__ */ new Set(["[data-y-scrollbar]"]);
  var observer = null;
  var MIN_OVERFLOW = 8;
  var MIN_THUMB = 32;
  var INSET = 3;
  var FADE = 400;
  function autoSelector() {
    return [...autoSelectors].join(", ");
  }
  function scan(node) {
    if (node.nodeType != 1) return;
    const selector = autoSelector();
    if (node.matches(selector)) Scrollbar.attach(node);
    node.querySelectorAll(selector).forEach((el) => Scrollbar.attach(el));
  }
  function dropDetached() {
    attached.forEach((scroller) => {
      var _a;
      if (!scroller.isConnected) (_a = instances2.get(scroller)) == null ? void 0 : _a.destroy();
    });
  }
  function observe() {
    if (observer) return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", function ready() {
        observe();
        scan(document.body);
      }, { once: true });
      return;
    }
    observer = new MutationObserver((mutations) => {
      let removed = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(scan);
        if (mutation.removedNodes.length) removed = true;
      });
      if (removed) dropDetached();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  var _Scrollbar = class _Scrollbar {
    static attach(scroller) {
      if (!scroller || scroller.nodeType != 1) return null;
      if (!scroller.hasAttribute("data-y-scrollbar")) scroller.setAttribute("data-y-scrollbar", "");
      observe();
      if (!scroller.isConnected) return null;
      return instances2.get(scroller) || new _Scrollbar(scroller);
    }
    static detach(scroller) {
      var _a;
      if (!scroller) return;
      (_a = instances2.get(scroller)) == null ? void 0 : _a.destroy();
      scroller.removeAttribute("data-y-scrollbar");
    }
    static get(scroller) {
      return instances2.get(scroller) || null;
    }
    // Attaches to every match, now and later
    static auto(selector = "") {
      selector.split(",").map((part) => part.trim()).filter(Boolean).forEach((part) => autoSelectors.add(part));
      observe();
      if (document.body) scan(document.body);
    }
    constructor(scroller) {
      this.scroller = scroller;
      this.thumb = document.createElement("div");
      this.thumb.className = "y-scrollbar";
      this.thumb.hidden = true;
      document.body.appendChild(this.thumb);
      this.listeners = new AbortController();
      this.frame = 0;
      this.hideTimer = null;
      this.hovering = false;
      this.dragging = false;
      this.overlayTop = 0;
      this.fadingUntil = 0;
      this.follow = this.follow.bind(this);
      this.show = this.show.bind(this);
      instances2.set(scroller, this);
      attached.add(scroller);
      this.bind();
    }
    bind() {
      const { scroller, thumb } = this;
      const { signal } = this.listeners;
      const self = this;
      scroller.addEventListener("scroll", this.show, { signal });
      scroller.addEventListener("mouseenter", this.show, { signal });
      thumb.addEventListener("mouseenter", function enter() {
        self.hovering = true;
        self.show();
      });
      thumb.addEventListener("mouseleave", function leave() {
        self.hovering = false;
        if (!self.isCovered()) return self.show();
        clearTimeout(self.hideTimer);
        thumb.classList.remove("is-visible");
        self.fadingUntil = performance.now() + FADE;
        self.schedule();
      });
      thumb.addEventListener("pointerdown", function down(e) {
        e.preventDefault();
        self.dragging = true;
        thumb.classList.add("is-dragging");
        thumb.setPointerCapture(e.pointerId);
        const startY = e.clientY;
        const startTop = scroller.scrollTop;
        function move(event) {
          const { scrollHeight, clientHeight } = scroller;
          const ratio = (scrollHeight - clientHeight) / Math.max(1, self.track().height - thumb.offsetHeight);
          scroller.scrollTop = startTop + (event.clientY - startY) * ratio;
        }
        function up() {
          self.dragging = false;
          thumb.classList.remove("is-dragging");
          thumb.removeEventListener("pointermove", move);
          thumb.removeEventListener("pointerup", up);
          thumb.removeEventListener("pointercancel", up);
          self.show();
        }
        thumb.addEventListener("pointermove", move);
        thumb.addEventListener("pointerup", up);
        thumb.addEventListener("pointercancel", up);
      });
    }
    destroy() {
      this.listeners.abort();
      clearTimeout(this.hideTimer);
      cancelAnimationFrame(this.frame);
      this.thumb.remove();
      instances2.delete(this.scroller);
      attached.delete(this.scroller);
    }
    // The scroller moved to another layer, e.g. into a full-screen mode
    refresh() {
      this.measureSurroundings();
      if (this.thumb.classList.contains("is-visible")) this.schedule();
    }
    // Overlays pinned over the top of the scroller, and the layer it sits in
    measureSurroundings() {
      const { scroller } = this;
      const rect = scroller.getBoundingClientRect();
      const x = rect.right - 24;
      this.overlayTop = 0;
      let y = rect.top + 1;
      while (y < rect.top + rect.height / 2) {
        const hit = document.elementFromPoint(x, y);
        if (!hit || scroller.contains(hit)) break;
        const bottom = hit.getBoundingClientRect().bottom;
        if (bottom <= y) break;
        this.overlayTop = bottom - rect.top;
        y = bottom + 1;
      }
      let layer = 0;
      for (let node = scroller; node && node != document.body; node = node.parentElement) {
        const zIndex = parseInt(getComputedStyle(node).zIndex);
        if (zIndex > layer) layer = zIndex;
      }
      this.thumb.style.zIndex = Math.max(_Scrollbar.zIndex, layer + 1);
    }
    track() {
      const { scroller } = this;
      const header = _Scrollbar.sticky ? scroller.querySelector(_Scrollbar.sticky) : null;
      const style = header ? getComputedStyle(header) : null;
      const sticky = (style == null ? void 0 : style.position) == "sticky" ? (parseFloat(style.top) || 0) + header.offsetHeight : 0;
      const offset2 = Math.max(sticky, this.overlayTop);
      return { top: offset2 + INSET, height: scroller.clientHeight - offset2 - INSET * 2 };
    }
    update() {
      var _a;
      const { scroller, thumb } = this;
      if (!scroller.isConnected) {
        thumb.hidden = true;
        return;
      }
      const { scrollHeight, clientHeight, scrollTop } = scroller;
      const { top: trackTop, height: trackHeight } = this.track();
      const shown = ((_a = scroller.checkVisibility) == null ? void 0 : _a.call(scroller, { visibilityProperty: true, opacityProperty: true })) ?? true;
      const scrolls = /auto|scroll|overlay/.test(getComputedStyle(scroller).overflowY);
      if (clientHeight == 0 || !shown || !scrolls || scroller.closest(".is-hidden") || scrollHeight - clientHeight < MIN_OVERFLOW || trackHeight < MIN_THUMB) {
        thumb.hidden = true;
        return;
      }
      const rect = scroller.getBoundingClientRect();
      if (!this.dragging && (rect.right <= 0 || rect.left >= innerWidth || this.isCovered())) {
        thumb.hidden = true;
        return;
      }
      const height = Math.min(trackHeight, Math.max(MIN_THUMB, trackHeight * clientHeight / scrollHeight));
      const max = scrollHeight - clientHeight;
      const progress = getComputedStyle(scroller).flexDirection == "column-reverse" ? 1 + scrollTop / max : scrollTop / max;
      const top2 = rect.top + trackTop + (trackHeight - height) * Math.min(1, Math.max(0, progress));
      thumb.hidden = false;
      thumb.style.height = `${height}px`;
      thumb.style.left = `${rect.right}px`;
      thumb.style.transform = `translate(calc(-100% - ${INSET}px), ${top2}px)`;
    }
    // Polled per frame: layout changes fire no event
    follow() {
      const { thumb } = this;
      this.update();
      const onScreen = thumb.classList.contains("is-visible") || performance.now() < this.fadingUntil;
      if (thumb.hidden || !onScreen) {
        this.frame = 0;
        if (thumb.hidden) {
          this.hovering = false;
          thumb.classList.remove("is-visible");
        }
        return;
      }
      this.frame = requestAnimationFrame(this.follow);
    }
    schedule() {
      if (!this.frame) this.frame = requestAnimationFrame(this.follow);
    }
    // Opening a modal can fire scroll behind it (scroll anchoring)
    isCovered() {
      const { scroller } = this;
      const rect = scroller.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.right - 24, rect.top + rect.height / 2);
      return !!hit && !scroller.contains(hit);
    }
    show() {
      const { thumb } = this;
      if (!this.hovering && !this.dragging && this.isCovered()) return;
      if (!thumb.classList.contains("is-visible")) this.measureSurroundings();
      this.schedule();
      thumb.classList.add("is-visible");
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        if (!this.scroller.isConnected) thumb.hidden = true;
        if (this.hovering || this.dragging) return;
        thumb.classList.remove("is-visible");
        this.fadingUntil = performance.now() + FADE;
      }, 1e3);
    }
  };
  // Sticky headers inside a scroller: the track starts below them
  __publicField(_Scrollbar, "sticky", "[data-y-scrollbar-sticky]");
  __publicField(_Scrollbar, "zIndex", 1e3);
  var Scrollbar = _Scrollbar;

  // source/components/PullToRefresh/index.js
  var START = 8;
  var READY = 72;
  var MAX = 120;
  var RESIST = 0.5;
  var BACK = 200;
  var BLOCKERS = [
    "input",
    "textarea",
    "select",
    '[contenteditable]:not([contenteditable="false"])',
    "canvas",
    "video",
    "iframe",
    '[data-y-pull="off"]',
    ".y-win__wrapper",
    ".y-sheet",
    ".y-dropdown__menu",
    ".y-context-menu",
    ".y-tooltip"
  ].join(", ");
  var ICON = `<svg class="y-pull__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg>`;
  var options = null;
  var indicator = null;
  var touch = null;
  var busy = false;
  var frame = 0;
  var top = 0;
  function atTop(target) {
    if (busy || !(target instanceof Element)) return false;
    const page = document.scrollingElement ?? document.documentElement;
    if (page.scrollTop > 0) return false;
    for (let el = target; el && el != page && el != document.body; el = el.parentElement) {
      if (el.scrollTop > 0) return false;
    }
    return true;
  }
  function allowed(target) {
    if (target.closest(BLOCKERS) || options.ignore && target.closest(options.ignore)) return false;
    if (document.documentElement.classList.contains("y-touch-hold")) return false;
    if (options.when && !options.when()) return false;
    if (String((getSelection == null ? void 0 : getSelection()) ?? "")) return false;
    for (let el = target; el && el != document.body; el = el.parentElement) {
      if (getComputedStyle(el).position == "fixed") return false;
    }
    return true;
  }
  function offset() {
    const value = typeof options.offset == "function" ? options.offset() : options.offset;
    return Math.max(0, Number(value) || 0);
  }
  function make() {
    if (indicator == null ? void 0 : indicator.isConnected) return indicator;
    indicator = document.createElement("div");
    indicator.className = "y-pull";
    indicator.setAttribute("aria-hidden", "true");
    indicator.innerHTML = `<div class="y-pull__badge">${ICON}</div>`;
    document.body.appendChild(indicator);
    return indicator;
  }
  function paint(distance, settle = false) {
    const el = make();
    const badge = el.firstElementChild;
    const shown = Math.min(MAX, distance);
    const progress = Math.min(1, shown / READY);
    el.classList.toggle("y-pull--back", settle);
    el.classList.toggle("y-pull--ready", shown >= READY);
    el.style.top = top + "px";
    badge.style.transform = `translate3d(-50%, ${shown - 48}px, 0)`;
    badge.style.opacity = String(Math.min(1, progress * 1.4));
    badge.firstElementChild.style.transform = `rotate(${progress * 270}deg)`;
  }
  function hide() {
    if (!indicator) return;
    paint(0, true);
    indicator.classList.remove("y-pull--busy");
    setTimeout(() => {
      if (!touch && !busy) indicator == null ? void 0 : indicator.remove();
    }, BACK);
  }
  async function refresh() {
    var _a;
    busy = true;
    paint(READY, true);
    indicator.classList.add("y-pull--busy");
    try {
      await ((_a = options.onRefresh) == null ? void 0 : _a.call(options));
    } catch {
    }
    busy = false;
    hide();
  }
  function onStart(e) {
    if (e.touches.length != 1 || !atTop(e.target)) {
      touch = null;
      return;
    }
    const point = e.touches[0];
    touch = { x: point.clientX, y: point.clientY, target: e.target, pulling: false };
  }
  function onMove(e) {
    if (!touch) return;
    if (e.touches.length != 1) return onCancel();
    const point = e.touches[0];
    const dx = point.clientX - touch.x;
    const dy = point.clientY - touch.y;
    if (!touch.pulling) {
      if (Math.abs(dx) < START && Math.abs(dy) < START) return;
      if (dy <= 0 || Math.abs(dx) > dy || !allowed(touch.target)) {
        touch = null;
        return;
      }
      touch.pulling = true;
      touch.y = point.clientY - START;
      top = offset();
    }
    const distance = (point.clientY - touch.y) * RESIST;
    if (distance <= 0) {
      touch = null;
      hide();
      return;
    }
    touch.distance = distance;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => paint(distance));
  }
  function onEnd() {
    const pulled = (touch == null ? void 0 : touch.pulling) ? touch.distance ?? 0 : 0;
    touch = null;
    cancelAnimationFrame(frame);
    if (!pulled) return;
    if (pulled >= READY) refresh();
    else hide();
  }
  function onCancel() {
    touch = null;
    cancelAnimationFrame(frame);
    hide();
  }
  var PullToRefresh = class _PullToRefresh {
    // onRefresh may return a promise: the indicator spins until it settles. offset is where it comes from under,
    // in px or as a function, such as the bottom of a fixed header; ignore and when keep it away from more places.
    static enable({ onRefresh = () => location.reload(), offset: offset2 = 0, ignore = "", when = null } = {}) {
      if (options) _PullToRefresh.disable();
      options = { onRefresh, offset: offset2, ignore, when };
      document.documentElement.classList.add("y-pull-enabled");
      document.addEventListener("touchstart", onStart, { passive: true });
      document.addEventListener("touchmove", onMove, { passive: true });
      document.addEventListener("touchend", onEnd, { passive: true });
      document.addEventListener("touchcancel", onCancel, { passive: true });
    }
    static disable() {
      if (!options) return;
      options = null;
      touch = null;
      document.documentElement.classList.remove("y-pull-enabled");
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onCancel);
      indicator == null ? void 0 : indicator.remove();
      indicator = null;
    }
    static get enabled() {
      return !!options;
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
    Group,
    Readmore,
    Scrollbar,
    PullToRefresh
  };
  return __toCommonJS(index_exports);
})();
window.YurbaUI=__yurbaui__.YurbaUI;
