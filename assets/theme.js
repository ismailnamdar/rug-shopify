const theme = {
    config: {
        rtl: true
    }
}

theme.HoverButton = (function () {
class HoverButton {
    constructor(container) {
    this.container = container;
    }

    get btnFill() {
    return this.container.querySelector('[data-fill]');
    }

    load() {
    if (theme.config.isTouch || document.body.getAttribute('data-button-hover') === 'none') return;

    this.container.addEventListener('mouseenter', this.onEnterHandler.bind(this));
    this.container.addEventListener('mouseleave', this.onLeaveHandler.bind(this));
    }

    onEnterHandler() {
    if (this.btnFill) {
        Motion.animate(this.btnFill, { y: ['76%', '0%'] }, { duration: 0.6 });
    }
    }

    onLeaveHandler() {
    if (this.btnFill) {
        Motion.animate(this.btnFill, { y: '-76%' }, { duration: 0.6 });
    }
    }

    unload() {
    // todo
    }
}

return HoverButton;
})();

class HoverButton extends HTMLButtonElement {
  constructor() {
    super();
    
    this.hoverButton = new theme.HoverButton(this);
    this.hoverButton.load();

    if (this.type === 'submit' && this.form) {
      this.form.addEventListener('submit', () => this.setAttribute('aria-busy', 'true'));
    }
    window.addEventListener('pageshow', () => this.removeAttribute('aria-busy'));

    Motion.inView(this, this.init.bind(this));
  }

  static get observedAttributes() {
    return ['aria-busy'];
  }

  get contentElement() {
    return this._contentElement = this._contentElement || this.querySelector('.btn-text');
  }

  get animationElement() {
    return this._animationElement = this._animationElement || document.createRange().createContextualFragment(`
      <span class="btn-loader">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `).firstElementChild;
  }

  get controlledElement() {
    return this.hasAttribute('aria-controls') ? document.getElementById(this.getAttribute('aria-controls')) : null;
  }

  init() {
    this.append(this.animationElement);
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === 'true') {
      Motion.timeline([
        [this.contentElement, { opacity: 0 }, { duration: 0.15 }],
        [this.animationElement, { opacity: 1 }, { duration: 0.15 }]
      ]);
      Motion.animate(this.animationElement.children, { transform: ['scale(1.6)', 'scale(0.6)'] }, { duration: 0.35, delay: Motion.stagger(0.35 / 2), direction: 'alternate', repeat: Infinity });
    }
    else {
      Motion.timeline([
        [this.animationElement, { opacity: 0 }, { duration: 0.15 }],
        [this.contentElement, { opacity: 1 }, { duration: 0.15 }]
      ]);
    }
  }
}
customElements.define('hover-button', HoverButton, { extends: 'button' });

class MarqueeElement extends HTMLElement {
  constructor() {
    super();

    // if (theme.config.motionReduced) return;

    // if (!theme.config.isTouch || Shopify.designMode) {
    //   Motion.inView(this, this.init.bind(this), { margin: '200px 0px 200px 0px' });
    // }
    // else {
      this.init.bind(this);
      this.init();
    // }
  }

  get childElement() {
    return this.firstElementChild;
  }

  get speed() {
    return this.hasAttribute('data-speed') ? parseInt(this.getAttribute('data-speed')) : 16;
  }

  get maximum() {
    return this.hasAttribute('data-maximum') ? parseInt(this.getAttribute('data-maximum')) : Math.ceil(this.parentWidth / this.childElementWidth) + 2;
  }

  get direction() {
    return this.hasAttribute('data-direction') ? this.getAttribute('data-direction') : 'left';
  }

  get parallax() {
    return this.hasAttribute('data-parallax') ? parseFloat(this.getAttribute('data-parallax')) : false;
  }

  get parentWidth() {
    return this.getWidth(this);
  }

  get childElementWidth() {
    return this.getWidth(this.childElement);
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    if (this.childElementCount === 1) {
      this.childElement.classList.add('animated');

      const maximum = this.maximum;
      for (let index = 0; index < maximum; index++) {
        this.clone = this.childElement.cloneNode(true);
        this.clone.setAttribute('aria-hidden', 'true');
        this.clone.querySelectorAll('button, [href]').forEach((el) => {
          el.setAttribute('tabindex', '-1');
        });
        this.appendChild(this.clone);
        this.clone.querySelectorAll('.media').forEach((media) => media.classList.remove('loading'));
      }

      this.style.setProperty('--duration', `${(33 - this.speed) * Math.min(2.5, Math.ceil(this.childElementWidth / this.parentWidth))}s`);
    }

    if (this.parallax) {
      let translate = this.parallax * 100 / (1 + this.parallax);
      if (this.direction === 'right') {
        translate = translate * -1;
      }
      if (theme.config.rtl) {
        translate = translate * -1;
      }

      Motion.scroll(
        Motion.animate(this, { transform: [`translateX(${translate}%)`, `translateX(0)`] }, { easing: 'linear' }),
        { target: this, offset: ['start end', 'end start'] }
      );
    }
    else {
      // pause when out of view
      const observer = new IntersectionObserver((entries, _observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.classList.remove('paused');
          }
          else {
            this.classList.add('paused');
          }
        });
      }, { rootMargin: '0px 0px 50px 0px' });
      observer.observe(this);
    }
  }

  getWidth(element) {
    const rect = element.getBoundingClientRect();
    return rect.right - rect.left;
  }
}
customElements.define('marquee-element', MarqueeElement);


class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    
    this.selectedIndex = this.selectedIndex;

    // if (!theme.config.isTouch || Shopify.designMode) {
    //   Motion.inView(this, this.init.bind(this), { margin: '200px 0px 200px 0px' });
    // }
    // else {
    this.init.bind(this)
    this.init();
    // }
  }

  static get observedAttributes() {
    return ['selected-index'];
  }

  get selectedIndex() {
    return parseInt(this.getAttribute('selected-index')) || 0;
  }

  set selectedIndex(index) {
    this.setAttribute('selected-index', Math.min(Math.max(index, 0), this.items.length - 1).toString());
  }

  get items() {
    return this._items = this._items || Array.from(this.children);
  }

  get autoplay() {
    return this.hasAttribute('autoplay');
  }

  get speed() {
    return this.hasAttribute('autoplay') ? parseInt(this.getAttribute('autoplay-speed')) * 1000 : 5000;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    if (this.items.length > 1) {
      this.slider = new Flickity(this, {
        accessibility: false,
        fade: true,
        pageDots: false,
        prevNextButtons: false,
        wrapAround: true,
        rightToLeft: theme.config.rtl,
        autoPlay: this.autoplay ? this.speed : false,
        on: {
          ready: function() {
            setTimeout(() => this.element.setAttribute('loaded', ''));
          }
        }
      });
  
      this.slider.on('change', this.onChange.bind(this));
      this.addEventListener('slider:previous', () => this.slider.previous());
      this.addEventListener('slider:next', () => this.slider.next());
      this.addEventListener('slider:play', () => this.slider.playPlayer());
      this.addEventListener('slider:pause', () => this.slider.pausePlayer());
      
      if (Shopify.designMode) {
        this.addEventListener('shopify:block:select', (event) => this.slider.select(this.items.indexOf(event.target)));
      }
    }
  }

  disconnectedCallback() {
    if (this.slider) this.slider.destroy();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'selected-index' && oldValue !== null && oldValue !== newValue) {
      const focusableEvents = 'button, [href]';
      
      const fromElement = this.items[parseInt(oldValue)];
      const toElement = this.items[parseInt(newValue)];
      
      fromElement.querySelectorAll(focusableEvents).forEach((el) => {
        el.setAttribute('tabindex', '-1');
      });
      toElement.querySelectorAll(focusableEvents).forEach((el) => {
        el.removeAttribute('tabindex');
      });
    }
  }

  onChange() {
    this.selectedIndex = this.slider.selectedIndex;
    this.dispatchEvent(new CustomEvent('slider:change', { bubbles: true, detail: { currentPage: this.slider.selectedIndex } }));
  }
}
customElements.define('announcement-bar', AnnouncementBar);

class PreviousButton extends HoverButton {
  constructor() {
    super();

    this.load();
  }

  get controlledElement() {
    return this.hasAttribute('aria-controls') ? document.getElementById(this.getAttribute('aria-controls')) : null;
  }

  load() {
    this.onClickListener = this.onClick.bind(this);
    this.addEventListener('click', this.onClickListener);

    if (this.controlledElement) {
      this.updateStatusListener = this.updateStatus.bind(this);
      this.controlledElement.addEventListener('slider:previousStatus', this.updateStatusListener);
    }
  }

  unload() {
    this.removeEventListener('click', this.onClickListener);
    if (this.controlledElement) {
      this.controlledElement.removeEventListener('slider:previousStatus', this.updateStatusListener);
    }
  }

  onClick() {
    (this.controlledElement ?? this).dispatchEvent(new CustomEvent('slider:previous', { bubbles: true, cancelable: true }));
  }

  updateStatus(event) {
    switch (event.detail.status) {
      case 'hidden':
          this.hidden = true;
        break;

      case 'disabled':
        this.disabled = true;
        break;

      default:
        this.hidden = false;
        this.disabled = false;
    }
  }
}
customElements.define('previous-button', PreviousButton, { extends: 'button' });

class NextButton extends HoverButton {
  constructor() {
    super();

    this.load();
  }

  get controlledElement() {
    return this.hasAttribute('aria-controls') ? document.getElementById(this.getAttribute('aria-controls')) : null;
  }

  load() {
    this.onClickListener = this.onClick.bind(this);
    if (typeof this.addEventListener !== 'function') return;
    this.addEventListener('click', this.onClickListener);

    if (this.controlledElement) {
      this.updateStatusListener = this.updateStatus.bind(this);
      this.controlledElement.addEventListener('slider:nextStatus', this.updateStatusListener);
    }
  }

  unload() {
    this.removeEventListener('click', this.onClickListener);
    if (this.controlledElement) {
      this.controlledElement.removeEventListener('slider:nextStatus', this.updateStatusListener);
    }
  }

  onClick() {
    (this.controlledElement ?? this).dispatchEvent(new CustomEvent('slider:next', { bubbles: true, cancelable: true }));
  }

  updateStatus(event) {
    switch (event.detail.status) {
      case 'hidden':
          this.hidden = true;
        break;

      case 'disabled':
        this.disabled = true;
        break;

      default:
        this.hidden = false;
        this.disabled = false;
    }
  }
}
customElements.define('next-button', NextButton, { extends: 'button' });