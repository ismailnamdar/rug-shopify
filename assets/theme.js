
window.slate = window.slate || {};
window.theme = window.theme || {};

/*================ Slate ================*/
/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {
  /**
   * For use when focus shifts to a container rather than a link
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects if focusing a link, just $link.focus();
   *
   * @param {JQuery} $element - The element to be acted upon
   */
  pageLinkFocus: function($element) {
    var focusClass = 'js-focus-hidden';

    $element
      .first()
      .attr('tabIndex', '-1')
      .focus()
      .addClass(focusClass)
      .one('blur', callback);

    function callback() {
      $element
        .first()
        .removeClass(focusClass)
        .removeAttr('tabindex');
    }
  },

  /**
   * If there's a hash in the url, focus the appropriate element
   */
  focusHash: function() {
    var hash = window.location.hash;

    // is there a hash in the url? is it an element on the page?
    if (hash && document.getElementById(hash.slice(1))) {
      this.pageLinkFocus($(hash));
    }
  },

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   */
  bindInPageLinks: function() {
    $('a[href*=#]').on(
      'click',
      function(evt) {
        this.pageLinkFocus($(evt.currentTarget.hash));
      }.bind(this)
    );
  },

  /**
   * Traps the focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  trapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).on(eventName, function(evt) {
      if (
        options.$container[0] !== evt.target &&
        !options.$container.has(evt.target).length
      ) {
        options.$container.focus();
      }
    });
  },

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  removeTrapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  }
};

/**
 * Cart Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Cart template.
 *
 * @namespace cart
 */

slate.cart = {
  /**
   * Browser cookies are required to use the cart. This function checks if
   * cookies are enabled in the browser.
   */
  cookiesEnabled: function() {
    var cookieEnabled = navigator.cookieEnabled;

    if (!cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
    }
    return cookieEnabled;
  }
};

/**
 * Utility helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions for dealing with arrays and objects
 *
 * @namespace utils
 */

slate.utils = {
  /**
   * Return an object from an array of objects that matches the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  findInstance: function(array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
        return array[i];
      }
    }
  },

  /**
   * Remove an object from an array of objects by matching the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  removeInstance: function(array, key, value) {
    var i = array.length;
    while (i--) {
      if (array[i][key] === value) {
        array.splice(i, 1);
        break;
      }
    }

    return array;
  },

  /**
   * _.compact from lodash
   * Remove empty/false items from array
   * Source: https://github.com/lodash/lodash/blob/master/compact.js
   *
   * @param {array} array
   */
  compact: function(array) {
    var index = -1;
    var length = array == null ? 0 : array.length;
    var resIndex = 0;
    var result = [];

    while (++index < length) {
      var value = array[index];
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  },

  /**
   * _.defaultTo from lodash
   * Checks `value` to determine whether a default value should be returned in
   * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
   * or `undefined`.
   * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
   *
   * @param {*} value - Value to check
   * @param {*} defaultValue - Default value
   * @returns {*} - Returns the resolved value
   */
  defaultTo: function(value, defaultValue) {
    return value == null || value !== value ? defaultValue : value;
  }
};

/**
 * Rich Text Editor
 * -----------------------------------------------------------------------------
 * Wrap videos in div to force responsive layout.
 *
 * @namespace rte
 */

slate.rte = {
  wrapTable: function() {
    $('.rte table').wrap('<div class="rte__table-wrapper"></div>');
  },

  iframeReset: function() {
    var $iframeVideo = $(
      '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]'
    );
    var $iframeReset = $iframeVideo.add('.rte iframe#admin_bar_iframe');

    $iframeVideo.each(function() {
      // Add wrapper to make video responsive
      $(this).wrap('<div class="rte__video-wrapper"></div>');
    });

    $iframeReset.each(function() {
      // Re-set the src attribute on each iframe after page load
      // for Chrome's "incorrect iFrame content on 'back'" bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }
};

slate.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:section:reorder', this._onReorder.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

slate.Sections.prototype = $.extend({}, slate.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (typeof constructor === 'undefined') {
      return;
    }

    var instance = $.extend(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    var instance = slate.utils.findInstance(
      this.instances,
      'id',
      evt.detail.sectionId
    );

    if (!instance) {
      return;
    }

    if (typeof instance.onUnload === 'function') {
      instance.onUnload(evt);
    }

    this.instances = slate.utils.removeInstance(
      this.instances,
      'id',
      evt.detail.sectionId
    );
  },

  _onSelect: function(evt) {
    var instance = slate.utils.findInstance(
      this.instances,
      'id',
      evt.detail.sectionId
    );

    if (instance && typeof instance.onSelect === 'function') {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    var instance = slate.utils.findInstance(
      this.instances,
      'id',
      evt.detail.sectionId
    );

    if (instance && typeof instance.onDeselect === 'function') {
      instance.onDeselect(evt);
    }
  },

  _onReorder: function(evt) {
    var instance = slate.utils.findInstance(
      this.instances,
      'id',
      evt.detail.sectionId
    );

    if (instance && typeof instance.onReorder === 'function') {
      instance.onReorder(evt);
    }
  },

  _onBlockSelect: function(evt) {
    var instance = slate.utils.findInstance(
      this.instances,
      'id',
      evt.detail.sectionId
    );

    if (instance && typeof instance.onBlockSelect === 'function') {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    var instance = slate.utils.findInstance(
      this.instances,
      'id',
      evt.detail.sectionId
    );

    if (instance && typeof instance.onBlockDeselect === 'function') {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(
      function(index, container) {
        this._createInstance(container, constructor);
      }.bind(this)
    );
  }
});

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 */

slate.Currency = (function() {
  var moneyFormat = '${{amount}}';

  /**
   * Format money values based on your shop currency settings
   * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
   * or 3.00 dollars
   * @param  {String} format - shop money_format setting
   * @return {String} value - formatted value
   */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || moneyFormat;

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = slate.utils.defaultTo(precision, 2);
      thousands = slate.utils.defaultTo(thousands, ',');
      decimal = slate.utils.defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + thousands
      );
      var centsAmount = parts[1] ? decimal + parts[1] : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', '.');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  };
})();

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

slate.Image = (function() {
  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    var match = src.match(
      /.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/
    );

    if (match) {
      return match[1];
    } else {
      return null;
    }
  }

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(
      /\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i
    );

    if (match) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    } else {
      return null;
    }
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist. Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {
  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on(
      'change',
      this._onSelectChange.bind(this)
    );
  }

  Variants.prototype = $.extend({}, Variants.prototype, {
    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = $.map(
        $(this.singleOptionSelector, this.$container),
        function(element) {
          var $element = $(element);
          var type = $element.attr('type');
          var currentOption = {};

          if (type === 'radio' || type === 'checkbox') {
            if ($element[0].checked) {
              currentOption.value = $element.val();
              currentOption.index = $element.data('index');

              return currentOption;
            } else {
              return false;
            }
          } else {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          }
        }
      );

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = slate.utils.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      if(!this.product) return null
      var variants = this.product.variants;
      var found = false;

      variants.forEach(function(variant) {
        var satisfied = true;

        selectedValues.forEach(function(option) {
          if (satisfied) {
            satisfied = option.value === variant[option.index];
          }
        });

        if (satisfied) {
          found = variant;
        }
      });

      return found || null;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};

      if (
        !variant.featured_image ||
        variantImage.src === currentVariantImage.src
      ) {
        return;
      }

      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (
        variant.price === this.currentVariant.price &&
        variant.compare_at_price === this.currentVariant.compare_at_price
      ) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description]
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        '?variant=' +
        variant.id;
      window.history.replaceState({ path: newurl }, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param  {variant} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container)[0].value = variant.id;
    }
  });

  return Variants;
})();

/*================ Sections ================*/
/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
 *
 * @namespace product
 */

theme.Product = (function() {
  var selectors = {
    addToCart: '[data-add-to-cart]',
    addToCartText: '[data-add-to-cart-text]',
    comparePrice: '[data-compare-price]',
    comparePriceText: '[data-compare-text]',
    originalSelectorId: '[data-product-select]',
    priceWrapper: '[data-price-wrapper]',
    productFeaturedImage: '[data-product-featured-image]',
    productJson: '[data-product-json]',
    productPrice: '[data-product-price]',
    productThumbs: '[data-product-single-thumbnail]',
    singleOptionSelector: '[data-single-option-selector]'
  };

  /**
   * Product section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Product(container) {
    this.$container = $(container);

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$(selectors.productJson, this.$container).html()) {
      return;
    }

    var sectionId = this.$container.attr('data-section-id');
    this.productSingleObject = JSON.parse(
      $(selectors.productJson, this.$container).html()
    );

    var options = {
      $container: this.$container,
      enableHistoryState: this.$container.data('enable-history-state') || false,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject
    };

    this.settings = {};
    this.namespace = '.product';
    this.variants = new slate.Variants(options);
    this.$featuredImage = $(selectors.productFeaturedImage, this.$container);

    this.$container.on(
      'variantChange' + this.namespace,
      this.updateAddToCartState.bind(this)
    );
    this.$container.on(
      'variantPriceChange' + this.namespace,
      this.updateProductPrices.bind(this)
    );

    if (this.$featuredImage.length > 0) {
      this.settings.imageSize = slate.Image.imageSize(
        this.$featuredImage.attr('src')
      );
      slate.Image.preload(
        this.productSingleObject.images,
        this.settings.imageSize
      );

      this.$container.on(
        'variantImageChange' + this.namespace,
        this.updateProductImage.bind(this)
      );
    }
  }

  Product.prototype = $.extend({}, Product.prototype, {
    /**
     * Updates the DOM state of the add to cart button
     *
     * @param {boolean} enabled - Decides whether cart is enabled or disabled
     * @param {string} text - Updates the text notification content of the cart
     */
    updateAddToCartState: function(evt) {
      var variant = evt.variant;

      if (variant) {
        $(selectors.priceWrapper, this.$container).removeClass('hide');
      } else {
        $(selectors.addToCart, this.$container).prop('disabled', true);
        $(selectors.addToCartText, this.$container).html(
          theme.strings.unavailable
        );
        $(selectors.priceWrapper, this.$container).addClass('hide');
        return;
      }

      if (variant.available) {
        $(selectors.addToCart, this.$container).prop('disabled', false);
        $(selectors.addToCartText, this.$container).html(
          theme.strings.addToCart
        );
      } else {
        $(selectors.addToCart, this.$container).prop('disabled', true);
        $(selectors.addToCartText, this.$container).html(theme.strings.soldOut);
      }
    },

    /**
     * Updates the DOM with specified prices
     *
     * @param {string} productPrice - The current price of the product
     * @param {string} comparePrice - The original price of the product
     */
    updateProductPrices: function(evt) {
      var variant = evt.variant;
      var $comparePrice = $(selectors.comparePrice, this.$container);
      var $compareEls = $comparePrice.add(
        selectors.comparePriceText,
        this.$container
      );

      $(selectors.productPrice, this.$container).html(
        slate.Currency.formatMoney(variant.price, theme.moneyFormat)
      );

      if (variant.compare_at_price > variant.price) {
        $comparePrice.html(
          slate.Currency.formatMoney(
            variant.compare_at_price,
            theme.moneyFormat
          )
        );
        $compareEls.removeClass('hide');
      } else {
        $comparePrice.html('');
        $compareEls.addClass('hide');
      }
    },

    /**
     * Updates the DOM with the specified image URL
     *
     * @param {string} src - Image src URL
     */
    updateProductImage: function(evt) {
      var variant = evt.variant;
      var sizedImgUrl = slate.Image.getSizedImageUrl(
        variant.featured_image.src,
        this.settings.imageSize
      );

      this.$featuredImage.attr('src', sizedImgUrl);
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
    }
  });

  return Product;
})();

/**
 * FAQs Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
 *
 * @namespace faqs
 */

theme.FAQs = (function() {
  function FAQs(container) {
    this.$container = $(container);
  }

  FAQs.prototype = $.extend({}, FAQs.prototype, {
    onBlockSelect: function() {
      // $(this).css('background-color', 'green');
      // console.log($(this).find('question div').text());
      // $(this).find('.answer').show().addClass('expanded');
      $('.answer').each(function() {
        $(this)
          .show()
          .addClass('expanded')
          .closest('.q-a')
          .find('span')
          .addClass('open');
      });
    }
  });
  return FAQs;
})();

/*================ Templates ================*/
/**
 * Customer Addresses Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Customer Addresses
 * template.
 *
 * @namespace customerAddresses
 */

theme.customerAddresses = (function() {
  var $newAddressForm = $('#AddressNewForm');

  if (!$newAddressForm.length) {
    return;
  }

  // Initialize observers on address selectors, defined in shopify_common.js
  if (Shopify) {
    new Shopify.CountryProvinceSelector(
      'AddressCountryNew',
      'AddressProvinceNew',
      {
        hideElement: 'AddressProvinceContainerNew'
      }
    );
  }

  // Initialize each edit form's country/province selector
  $('.address-country-option').each(function() {
    var formId = $(this).data('form-id');
    var countrySelector = 'AddressCountry_' + formId;
    var provinceSelector = 'AddressProvince_' + formId;
    var containerSelector = 'AddressProvinceContainer_' + formId;

    new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
      hideElement: containerSelector
    });
  });

  // Toggle new/edit address forms
  $('.address-new-toggle').on('click', function() {
    $newAddressForm.toggleClass('hide');
  });

  $('.address-edit-toggle').on('click', function() {
    var formId = $(this).data('form-id');
    $('#EditAddress_' + formId).toggleClass('hide');
  });

  $('.address-delete').on('click', function() {
    var $el = $(this);
    var formId = $el.data('form-id');
    var confirmMessage = $el.data('confirm-message');
    if (
      confirm(confirmMessage || 'Are you sure you wish to delete this address?')
    ) {
      Shopify.postLink('/account/addresses/' + formId, {
        parameters: { _method: 'delete' }
      });
    }
  });
})();

/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Password template.
 *
 * @namespace password
 */

theme.customerLogin = (function() {
  var config = {
    recoverPasswordForm: '#RecoverPassword',
    hideRecoverPasswordLink: '#HideRecoverPasswordLink'
  };

  if (!$(config.recoverPasswordForm).length) {
    return;
  }

  checkUrlHash();
  resetPasswordSuccess();

  $(config.recoverPasswordForm).on('click', onShowHidePasswordForm);
  $(config.hideRecoverPasswordLink).on('click', onShowHidePasswordForm);

  function onShowHidePasswordForm(evt) {
    evt.preventDefault();
    toggleRecoverPasswordForm();
  }

  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  /**
   *  Show/Hide recover password form
   */
  function toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('hide');
    $('#CustomerLoginForm').toggleClass('hide');
  }

  /**
   *  Show reset password success message
   */
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess').removeClass('hide');
  }
})();

$(document).ready(function() {
  var is_Mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  var is_iOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);

  console.log(is_Mac, is_iOS);

  if (is_Mac || is_iOS) document.body.className += ' ios';

  var sections = new slate.Sections();
  sections.register('product', theme.Product);
  sections.register('faqs', theme.FAQs);

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  // Wrap videos in div to force responsive layout.
  slate.rte.wrapTable();
  slate.rte.iframeReset();

  // Apply a specific class to the html element for browser support of cookies.
  if (slate.cart.cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace(
      'supports-no-cookies',
      'supports-cookies'
    );
  }

  $('.close-bar').click(function() {
    $('.promo-bar').addClass('collapsed');
  });

  $('.mobile-menu-trigger').click(function() {
    $('.mobile-menu').addClass('open');
    $('body, html').addClass('locked');
  });
  $('.mobile-menu .close-nav').click(function() {
    $('.mobile-menu').removeClass('open');
    $('body, html').removeClass('locked');
  });
  $('.trigger-secondary').click(function(e) {
    e.preventDefault();

    $(this)
      .parent()
      .next()
      .toggleClass('secondary-links-active');
  });

  $(document).on('touchstart', function() {
    documentClick = true;
  });
  $(document).on('touchmove', function() {
    documentClick = false;
  });

  $(document).on('click touchend', function(event) {
    if (event.type == 'click') documentClick = true;
    if (documentClick) {
      if (
        !$(event.target).closest('.mobile-menu-content').length &&
        !$(event.target)
          .closest('a')
          .hasClass('mobile-menu-trigger')
      ) {
        if ($('.mobile-menu').hasClass('open')) {
          $('.mobile-menu').removeClass('open');
          $('body,html').removeClass('locked');
        }
      }
    }
  });

  $(document).on('click', function(event) {
    if (
      !$(event.target).closest('.mobile-menu-content').length &&
      !$(event.target)
        .closest('a')
        .hasClass('mobile-menu-trigger')
    ) {
      if ($('.mobile-menu').hasClass('open')) {
        $('.mobile-menu').removeClass('open');
        $('body,html').removeClass('locked');
      }
    }
  });
});

boxSlider();

function boxSlider() {
  $('.box-slider').slick({
    dots: true,
    arrows: true,
    infinite: true
  });
}

$(window).on('shopify:section:load', function(){
  boxSlider();

  sliderTestimonials();
});


$(window).on('shopify:section:select', function(){
  sliderTestimonials();
  kitSlider();
});


function sliderTestimonials() {
  $('.slider-testimonials .slider__slides').slick({
    dots: true,
    arrows: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    accessibility: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          arrows: false
        }
      }
    ]
  });
}

sliderTestimonials();

function sliderImages() {
  $(window).on('load resize', function() {
    if ($(window).width() < 768) {
      $('.slick-images').slick({
        dots: true,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        accessibility: false,
        responsive: [
          {
            breakpoint: 9999,
            settings: "unslick"
          },
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              infinite: true,
              dots: true
            }
          }
        ]
      });
    }
  });
}

sliderImages();

$('.testimonials-slider').slick({
  dots: false,
  arrows: true,
  infinite: true,
  slidesToShow: 5,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  responsive: [
    {
      breakpoint: 800,
      settings: {
        slidesToShow: 3
      }
    },
    {
      breakpoint: 600,
      settings: 'unslick'
    }
  ]
});

$(window).on('load resize', function() {
  if ($(window).width() < 768) {
    $('.slider-benefits:not(.slick-slider)').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: true,
      arrows: false
    });

    $('.slider-testimonials .slider__slides.slick-slider:not(.filtered)')
      .addClass('filtered')
      .slick('slickFilter', function() {
        return parseInt($(this).data('slick-index')) < 3;
      });

    // $(window).scrollTop(0);
  } else {
    $('.slider-benefits.slick-slider').slick('unslick');

    $('.slider-testimonials .slider__slides.slick-slider.filtered')
      .removeClass('filtered')
      .slick('slickUnfilter');
  }
});

$(window).load(function() {
  var stHeight = $('.testimonials-slider .slick-track').height();
  $('.testimonials-slider .slick-slide').css('height', stHeight + 'px');

  var stHeight1 = $('.slider-testimonials .slick-track').height();
  $('.slider-testimonials .slick-slide').css('height', stHeight1 + 'px');
});

$(window).resize(function() {
  if ($('.testimonials-slider').hasClass('slick-initialized')) {
    $('.testimonials-slider').slick('setPosition');
    var stHeight = $('.testimonials-slider .slick-track').height();
    $('.testimonials-slider .slick-slide').css('height', stHeight + 'px');
  } else {
    $('.testimonials-slider').slick({
      dots: false,
      arrows: true,
      infinite: true,
      slidesToShow: 5,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 800,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 600,
          settings: 'unslick'
        }
      ]
    });
    var stHeight = $('.testimonials-slider .slick-track').height();
    $('.testimonials-slider .slick-slide').css('height', stHeight + 'px');
  }

  if ($('.slider-testimonials .slider__slides').hasClass('slick-initialized')) {
    $('.slider-testimonials .slider__slides').on('setPosition', function() {
      $(this)
        .find('.slick-slide')
        .height('auto');
      var slickTrack = $(this).find('.slick-track');
      var slickTrackHeight = $(slickTrack).height();
      $(this)
        .find('.slick-slide')
        .css('height', slickTrackHeight + 'px');
    });
  } else {
    $('.slider-testimonials .slider__slides').slick({
      dots: true,
      arrows: true,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            arrows: false
          }
        }
      ]
    });

    $('.slider-testimonials .slider__slides').on('setPosition', function() {
      $(this)
        .find('.slick-slide')
        .height('auto');
      var slickTrack = $(this).find('.slick-track');
      var slickTrackHeight = $(slickTrack).height();
      $(this)
        .find('.slick-slide')
        .css('height', slickTrackHeight + 'px');
    });
  }
});

// product page sliders

// $('.thumbnails div a').click(function(evt){
//   evt.preventDefault();
// });

// Auto change image on thumbnail next/prev
// $('.thumbnails').on('beforeChange', function(event, slick, currentSlide, nextSlide){
//   $('#ProductPhotoImg').attr('src', $('.slick-slide[data-slick-index="' + nextSlide + '"] a').attr('href'));
// });

$(window).resize(function() {
  $('.thumbnails').slick('setPosition');
});

$('.featured.has-thumbnails').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  // asNavFor: '.thumbnails',
  adaptiveHeight: true,
  responsive: [
    {
      breakpoint: 801,
      settings: {
        fade: false
      }
    }
  ]
});

$('.thumbnails').slick({
  vertical: true,
  slidesToShow: 4,
  slidesToScroll: 1,
  // arrows: true,
  asNavFor: '.featured',
  // dots: true,
  // centerMode: true,
  focusOnSelect: true
});

$('.browse-by-category').click(function() {
  if ($(this).hasClass('open')) {
    $(this)
      .find('ul')
      .slideToggle('fast')
      .closest('.browse-by-category')
      .removeClass('open');
  } else {
    $(this)
      .addClass('open')
      .find('ul')
      .slideToggle('fast');
  }
});

$(document).ready(function() {
  attachClickEvent();
  if ($('body').hasClass('template-blog')) {
    attachBlogClickEvent();
  }
});

// Collections page - ajaxify collections listing
var pInfScrLoading = false;
var pInfScrDelay = 250;
function updateProductListing(href) {
  pInfScrNode = $('.product-listing');
  pInfScrURL = href;
  if (pInfScrNode.length > 0) {
    $.ajax({
      type: 'GET',
      url: pInfScrURL,
      beforeSend: function() {
        pInfScrLoading = true;
        pInfScrNode
          .clone()
          .empty()
          .insertAfter(pInfScrNode)
          .append(
            '<img src="https://cdn.shopify.com/s/files/1/0300/1545/files/loading.gif?v=1614303491" />'
          );
        pInfScrNode.hide();
      },
      success: function(data) {
        // remove loading feedback
        pInfScrNode.next().remove();
        pInfScrNode.remove();
        var filteredData = $(data).find('.product-listing');
        console.log(filteredData);
        $('.collection-section').html(filteredData);
        // filteredData.insertBefore( $("#product-list-foot") );
        pInfScrLoading = false;
      },
      dataType: 'html'
    });
  }
}

function attachClickEvent() {
  $(
    '.template-collection .browse-by-category li.collection a'
  ).click(function (e) {
    var href = $(this).attr('href');
    e.stopPropagation();
    updateProductListing(href);
    if ($('.browse-by-category').hasClass('open')) {
      $('.browse-by-category')
        .find('ul')
        .slideToggle('fast')
        .closest('.browse-by-category')
        .removeClass('open');
    }
    return false;
  });

  $('.featured-categories .collection').click(function(f) {
    var href = $(this).attr('href');
    f.stopPropagation();
    updateProductListing(href);
    return false;
  });
}

function getParam(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

$(document).ready(function() {
  if ($('body').hasClass('template-collection')) {
    var href = getParam('cat');
    if (href == false) {
      // Get window location in order to add functionality dependable on page reload.
      // href = 'shop';
      href = window.location.href;
    }
    updateProductListing(href);
  }
});

// Join Page - Plan Switcher
$('.plan-heading').click(function() {
  if (
    $(this)
      .closest('.plan')
      .hasClass('selected')
  ) {
  } else {
    $('.plan').each(function() {
      $(this).removeClass('selected');
    });
    $(this)
      .closest('.plan')
      .addClass('selected');
  }
  if ($('.plans').data('count') == 4) {
    if ($(window).width() < 941) {
      return false;
    }
  } else {
    if ($(window).width() < 776) {
      return false;
    }
  }
});

// Raddish in the Classroom - FAQ

$('.q-a .question').click(function() {
  console.log('click');

  if (
    $(this)
      .closest('.q-a')
      .find('.answer')
      .hasClass('expanded')
  ) {
    $(this)
      .closest('.q-a')
      .find('.answer')
      .removeClass('expanded')
      .slideToggle()
      .closest('.q-a')
      .find('span')
      .removeClass('open');
  } else {
    $('.answer').each(function() {
      if ($(this).hasClass('expanded')) {
        $(this)
          .slideToggle()
          .removeClass('expanded')
          .closest('.q-a')
          .find('span')
          .removeClass('open');
      }
    });
    $(this)
      .find('span')
      .addClass('open')
      .closest('.q-a')
      .find('.answer')
      .slideToggle()
      .addClass('expanded');
  }
});

// Raddish FAQs
function topFunction() {
  $('body,html').animate(
    {
      scrollTop: $('h1').offset().top
    },
    400
  );
  return false;
}

// Cart - Auto-update on input change
$('input[type="number"]').change(function() {
  $('input.update-cart').trigger('click');
});

// Blog
$('.monthly-kits h2, .categories h2').click(function() {
  $(this)
    .closest('div')
    .toggleClass('visible');
});

var pInfScrLoading = false;
var pInfScrDelay = 250;
function updateBlogListing() {
  pInfScrNode = $('.more').last();
  pInfScrURL = $('.more a')
    .last()
    .attr('href');
  if (pInfScrNode.length > 0 && pInfScrNode.css('display') != 'none') {
    $.ajax({
      type: 'GET',
      url: pInfScrURL,
      beforeSend: function() {
        pInfScrLoading = true;
        pInfScrNode
          .clone()
          .empty()
          .insertAfter(pInfScrNode)
          .append(
            '<img src="https://cdn.shopify.com/s/files/1/0300/1545/files/loading.gif?v=1614303491" />'
          );
        pInfScrNode.hide();
      },
      success: function(data) {
        // remove loading feedback
        pInfScrNode.next().remove();
        pInfScrNode.remove();
        var filteredData = $(data).find('.content-table');
        filteredData.insertBefore($('#blog-list-foot'));
        pInfScrLoading = false;
        attachBlogClickEvent();
      },
      dataType: 'html'
    });
  }
}

function attachBlogClickEvent() {
  var href = $('.more a')
    .last()
    .attr('href');
  if (href.indexOf('?page=') < 1) {
    $('.more').hide();
  }
  $('.more a').click(function(e) {
    e.stopPropagation();
    updateBlogListing();
    return false;
  });
}

// Fancybox on FAQ images
$(".answer.rte a[href*='cdn']").fancybox({
  mobile: {
    clickSlide: function(current, event) {
      return current.type === '' ? 'toggleControls' : 'close';
    }
  }
});

$().fancybox({
  selector: '[data-fancybox="gallery"]',
  loop: true
});

// Popup
$(document).ready(
  function() {
    //   var cookie = parseInt($('#popup .cookie').text());
    //   /*HC-popup based on URL-12 Dec'17*/
    //   if (window.innerWidth > 600 && window.innerHeight > 600) {
    //     if(typeof Cookies.get('raddish-cookie') === "undefined"&& !location.search.includes("l=n")){
    //       Cookies.set('raddish-cookie', 'saved', { expires: cookie });
    //       $('.open-popup').click();
    //       var popupInstance = $.fancybox.getInstance();
    //       $('.no-thanks').click(function(){
    //         popupInstance.close();
    //       });
    //     }
    //   } else {/*HC-popup based on URL-12 Dec'17*/
    //     if(typeof Cookies.get('raddish-cookie') === "undefined"&& !location.search.includes("l=n")){
    //       Cookies.set('raddish-cookie', 'saved', { expires: cookie });
    //       $('#mobile-popup').slideToggle();
    //     }
    //   }
  } //Old pop up logic
);

function openOFormFromSaveToday() {
  ga('send', 'event', 'LeadForm', 'openedFromBadge', '#LeadFormO');
  openOriginalLeadForm();
}

function openOriginalLeadForm() {
  if (window.innerWidth > 600 && window.innerHeight > 600) {
    $('.open-popup').click();
    var popupInstance = $.fancybox.getInstance();
    $('.no-thanks').click(function() {
      popupInstance.close();
    });
  } else {
    /*HC-popup based on URL-12 Dec'17*/
    $('#mobile-popup').slideToggle();
  }
}

$('#mobile-popup .fancybox-close-small').click(function() {
  $('#mobile-popup').slideToggle();
});

function footerCallbackFunction(resp) {
  if (resp.result === 'success') {
    $('#mce-error-response').hide();
    $('.success-response').show();
    fbq('track', 'Lead', {
      content_name: 'footer_ns'
    });
  } else {
    $('.success-response').hide();
    $('#mce-error-response')
      .text(resp.message)
      .show();
  }
}

function callbackFunction(resp) {
  var popupInstance = $.fancybox.getInstance();
  if (resp.result === 'success') {
    ga('send', 'event', 'LeadForm', 'SubmitLeadForm'); // Send this action back to GA and GO.
    Cookies.set('alreadyEnrolled', 'true');
    document.getElementById('persistent-badge').style.visibility = 'hidden';
    fbq('track', 'Lead', {
      content_name: 'popup'
    });
    if (window.innerWidth > 600 && window.innerHeight > 600) {
      popupInstance.close();
      jquery2('#LeadFormTY').bsModal('show');
      $('.btn').click(function() {
        $.fancybox.close();
      });
    } else {
      $('#mobile-popup').slideToggle();
      jquery2('#LeadFormTY').bsModal('show');
    }
  } else {
    var errorMessage = resp.msg;
    if (errorMessage === '0 - Please enter a value')
      errorMessage = 'Please enter a valid email address.';

    if (window.innerWidth > 600 && window.innerHeight > 600) {
      $('#mce-popup-error-response')
        .text(errorMessage)
        .show();
    } else {
      $('#mce-mobile-error-response')
        .text(errorMessage)
        .show();
    }
  }
}

$('.search-toggle').click(function(e) {
  e.preventDefault();
  $('#search-box').slideToggle();
  return false;
});


document.addEventListener("DOMContentLoaded", function() {
  const passwordlessLoginContainer = $(".rc-login--body")

  if(passwordlessLoginContainer.length) {
    passwordlessLoginContainer.append(`<div class="rc-login-links"><a href="/account/login#recover"> Reset Password</a> <span> | </span> <a target="_blank" href="https://raddishkids.zendesk.com/hc/en-us/articles/6159727761427-I-am-having-trouble-acccessing-my-account-"> Need help? </a> </div>`)
  }
})