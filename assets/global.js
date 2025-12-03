function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.ajaxCart = document.querySelector('ajax-cart');
    }

    onSubmitHandler(evt) {
      const fromBuilder = evt.target.closest("#step-4-upsells") !== null
      evt.preventDefault();
      // evt.stopPropagation();
      const submitButton = this.querySelector('[type="submit"]');
      if (submitButton.classList.contains('loading')) return; 

      this.handleErrorMessage();
      // this.ajaxCart.setActiveElement(document.activeElement);

      submitButton.setAttribute('aria-disabled', true);
      submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');

      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      const serializedForm = serializeForm(this.form)
      config.body = JSON.stringify({
        ...JSON.parse(serializedForm),
        sections: this.ajaxCart.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      });
      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            return;
          }

          this.ajaxCart.fetchUpsells();
          if(!fromBuilder) {
            this.ajaxCart.renderContents(response, true);
          } else {
            this.ajaxCart.renderContents(response, false);
            theme.SubscriptionBuilder.insertCartIntoSummary()
            $("#step-4-upsells").addClass("hidden")
          }

          var currVal = $("#cart-icon-bubble-mobile span").text();
          var newVal = response.sku.indexOf('RADPLUS') > -1 ? 1 : parseInt(currVal) + parseInt(JSON.parse(serializedForm).quantity || 1);
          $("#cart-icon-bubble-mobile span").text(newVal);
          $("#cart-icon-bubble span").text(newVal)

          // $("#cart-icon-bubble-mobile span")
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('loading');
          submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}


const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);

  for (const key of formData.keys()) {
    const regex = /(?:^(properties\[))(.*?)(?:\]$)/;

    if (regex.test(key)) {
      obj.properties = obj.properties || {};
      obj.properties[regex.exec(key)[2]] = formData.get(key);
    } else {
      obj[key] = formData.get(key);
    }
  }

  return JSON.stringify(obj);
};