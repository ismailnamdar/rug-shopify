class CartUpsells {
  
  constructor() {
    this.selectors = {
      body: 'body',
      abRules: '[data-ab-rules]',
      container: '#cart-upsells'
    };
  
    this.upsellData = {
      loading: [],
      allProducts: [],
      displayedProducts: [],
      abRules: [],
      upsellsInCart: [],
      title: "We think you'll love this"
    }
    this.setupFormatters();
    this.loadAbRules.bind(this);
    this.addToCartListener.bind(this);
    this.getCartAndFilterAll.bind(this);

    // this.getUpsellsInCart();
    this.loadAbRules();
    this.bindView();
    this.addToCartListener();
  }

  refresh() {
    $(this.selectors.container).unbind()
    this.loadAbRules();
  }
  unbindView() {
    $(this.selectors.container).unbind()
  }
  bindView() {
    tinybind.bind($(this.selectors.container), this.upsellData);
  }
  setupFormatters() {
    tinybind.formatters.log = function(value) {
      // console.log(value);
      return value;
    };

    tinybind.formatters.money = function(value) {
      return (parseFloat(value) / 100).toFixed(2).toString();
    };
    
    tinybind.formatters.not = function(value) {
      return !value;
    };

    tinybind.formatters.and = function(a, b) {
      return a && b;
    };

    tinybind.formatters.eq = function(a, b) {
      return a == b;
    };

    tinybind.formatters.append = function(a, b) {
      console.log(a, b)
      return a + b;
    };

    tinybind.formatters.isUpsellInCart = function(handle) {
      return CartJS.cart.items.find(item => item.handle == handle && item.properties && item.properties['_is_upsell'])
    };
  }
  addToCartListener() {
    var self = this
    $(document).on('cart-action', function(event) {
      var cart = event.originalEvent.detail
      self.filterAll(cart)
    })
  }
  getCartAndFilterAll() {
    var self = this;
    CartJS.getCart().then(function(cart){
      self.filterAll(cart);
    });
  }
  getUpsellsInCart(cart) {
    return cart.items.map( prod => prod.variant_id);
  }
  filterAll(cart){
    self = this;
    var inCart = self.getUpsellsInCart(cart);
    self.filterAbProducts(cart.items, inCart);

  }
  filterAbProducts(items, inCart) {
    for (const abRule of this.upsellData.abRules) {
      if(items.find(item => item.handle == abRule.required)){
        if(abRule.upsell_variant_sku) {
          var productToAdd = this.upsellData.allProducts.find(prod => prod.required == abRule.required && abRule.upsell_variant_sku == prod.sku);
        } else {
          var productToAdd = this.upsellData.allProducts.find(prod => prod.required == abRule.required);
        }
        if(!this.upsellData.displayedProducts.find(prod => prod.selected_or_first_available_variant.id == productToAdd.upsell.selected_or_first_available_variant.id)) {
          if(!inCart.includes(productToAdd.upsell.selected_or_first_available_variant.id)) {
            this.upsellData.displayedProducts.push({
              ...productToAdd.upsell,
              priority: productToAdd.priority
            });
        }
        } else {
          if(inCart.includes(productToAdd.upsell.selected_or_first_available_variant.id)) {
            var index =  this.upsellData.displayedProducts.findIndex(prod => prod.handle == productToAdd.upsell.handle);
            this.upsellData.displayedProducts.splice(index, 1);
          }
        }
      }
    }
    this.upsellData.displayedProducts = this.upsellData.displayedProducts.sort((a,b) => a.priority > b.priority ? 1 : -1)
  }
  loadAbRules(target) {
    var self = this;
    this.upsellData.loading.push(1);
    console.log($(this.selectors.abRules));
    console.log($(this.selectors.abRules).html());
    const rules = JSON.parse($(this.selectors.abRules).html())
    this.upsellData.abRules = rules;
    var promiseData = rules.map((rule, index) => this.loadProduct(rule, index));

    Promise.all(promiseData).then(values => {
      for (const resolvedValue of values) {
        if(!resolvedValue) continue
        // console.log(resolvedValue);
        if(resolvedValue.upsell_variant_sku) {
          var requiredVariant = resolvedValue.upsell.variants.find(variant => variant.sku == resolvedValue.upsell_variant_sku)
          // console.log('aaaa', resolvedValue.upsell_variant_sku, requiredVariant)
          var product = {
            ...resolvedValue.upsell,
            selected_or_first_available_variant: (requiredVariant ? requiredVariant : resolvedValue.upsell.selected_or_first_available_variant)
          }
        } else {
          var product = resolvedValue.upsell;
        }
        self.upsellData.allProducts.push({
          sku: resolvedValue.upsell_variant_sku,
          upsell: product,
          required: resolvedValue.required,
          priority: resolvedValue.priority
        })
      }
      self.upsellData.loading.pop();
      self.getCartAndFilterAll();
    })
  }
  loadProduct (rule, index) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var cachedProduct = self.upsellData.allProducts.find(prod => prod.upsell.handle == rule.upsell);
      if(cachedProduct) {
        resolve({
          required: rule.required,
          upsell: cachedProduct,
          upsell_variant_sku: rule.upsell_variant_sku,
          priority: index
        });
      } else {
        if(!rule.upsell) { resolve(null); return }
        $.get('/products/' + rule.upsell + '?view=json', function(data) {
          data = self.preFormatShopifyProductData(JSON.parse(data.replace(/<!--[\s\S]*?-->/g, "")));
          resolve({
            required: rule.required,
            upsell: data,
            upsell_variant_sku: rule.upsell_variant_sku,
            priority: index
          });
        }).fail(function(error) {
          reject(error)
          self.upsellData.loadFailed = true;
        });
      }

    });
  }

  preFormatShopifyProductData (data) {
    // Remove redundant image. Ensure we have a featured image
    if (data.image) {
      data.featured_image = data.featured_image || data.image;
      delete data.image;
    }
    return data;
  }

}

window.cartUpsells = new CartUpsells();