class AjaxCart extends HTMLElement {
  constructor() {
    super();
    this.cartDrawer = this.querySelector('cart-drawer');
    this.upsells = document.querySelector('#ajax-cart #cart-upsells-container');
    this.cartIcon = document.querySelector(".cart-link");
    this.cartIconMobile = document.querySelector(".cart-link-mobile")
    this.cartIcon.addEventListener('click', this.toggle.bind(this));
    this.cartIconMobile.addEventListener('click', this.toggle.bind(this));
    this.headerHamburger = document.querySelector(".mobile-menu-trigger");
    this.headerHamburger.addEventListener('click', this.headerClose.bind(this));
    $(document).on("click", '#checkout', this.proceedToCheckout.bind(this))
    // this.checkoutButton.addEventListener('click', this.proceedToCheckout.bind(this))
    this.bindEvents();
    this.fetchUpsells();
  }

  
  reChargeProcessCart() {
    window.location.href = '/checkout'
    return
    var token
    function get_cookie(name){ return( document.cookie.match('(^|; )'+name+'=([^;]*)')||0 )[2] }
    do { 
      token=get_cookie('cart');
    } while(token == undefined);	
    var myshopify_domain=window.shopMyshopifyDomain
    try { var ga_linker = ga.getAll()[0].get('linkerParam') } catch(err) { var ga_linker ='' }
    var checkout_url= "https://checkout.raddishkids.com/r/checkout?myshopify_domain="+myshopify_domain+"&cart_token="+token+"&"+ga_linker;
    window.location.href = '/checkout'
  }

  proceedToCheckout(event) {
    $("#checkout").addClass('loading');
    event.preventDefault();
    event.stopPropagation();
    var self = this 
    fetch("/cart.js").then(res => res.json()).then(cart => {
      const hasSubscriptionItems = cart.items.map(i => i.properties).some(p => p["subscription_hash"]);
      if(hasSubscriptionItems) {
        self.reChargeProcessCart()
      } else {
        window.location.href = "/checkout"
      }
    })
  }

  // proceedToCheckout(event) {
  //   $("#checkout").addClass('loading');
  //   const hasSubscriptionItems = CartJS.cart.items.map(i => i.properties).some(p => p["subscription_hash"]);
  //   event.preventDefault();
  //   event.stopPropagation();
  //   if(hasSubscriptionItems) {
  //     this.reChargeProcessCart()
  //   }
  // }

  fetchUpsells() {
    var self = this;
    fetch(`/?section_id=cart-upsells`).then(function(data) {
      return data.text();
    }).then(function(html) {
      const element = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector("#shopify-section-cart-upsells");
      // this.upsells.innerHTML = element.innerHTML
      $("#ajax-cart #cart-upsells-container").html(element.innerHTML);
      $("#ajax-cart #cart-upsells-container .slider").slick({
        slidesToShow: 1,
        infinite: false
      })
    })
  }

  loadCurrentCart() {
    fetch(`/?section_id=cart-upsells`).then(function(data) {
      return data.text();
    }).then(function(html) {
      const element = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector("#shopify-section-cart-upsells");
      // this.upsells.innerHTML = element.innerHTML
      $("#ajax-cart #cart-upsells-container").html(element.innerHTML);
      $("#ajax-cart #cart-upsells-container .slider").slick({
        slidesToShow: 1,
        infinite: false
      })
    })
  }
  
  bindEvents() {
    this.cartClose = this.querySelector('.cart__close');
    this.cartCloseMobile = this.querySelector('.cart__close--mobile');
    this.cartClose.addEventListener('click', this.close.bind(this));
    this.cartCloseMobile.addEventListener('click', this.close.bind(this));
    this.backdrop = this.querySelector('backdrop');
    this.backdrop.addEventListener('click', this.close.bind(this));
    this.swipeMove();
  }

  open(event) {
    this.cartDrawer.classList.add('animate', 'active');
    this.setAttribute("open", "");
    document.body.classList.add(`ajax-cart-open`);
  }

  swipeMove() {
    let startX, startY, distX, distY
    this.querySelector('cart-drawer').addEventListener('touchstart', (e) => {
      var touchobj = e.changedTouches[0];
      startX = touchobj.pageX
      startY = touchobj.pageY
    });
    this.querySelector('cart-drawer').addEventListener('touchend', (e) => {
      var touchobj = e.changedTouches[0];
      distX = touchobj.pageX - startX 
      distY = touchobj.pageY - startY;
      if(distX > 80) {
        e.preventDefault();
        this.close();
      }
    });
  }

  toggle(event) {
    event.preventDefault();
    event.stopPropagation();
    return this.hasAttribute("open") ? this.close() : this.open();
  }

  headerClose(event) {
    if(document.body.classList.contains(`ajax-cart-open`)) {
      event.stopPropagation();
      event.preventDefault();
      this.close();
    }
  }

  getSectionInnerHTML(html, selector) {
    console.log('selector 1', selector)
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  close() {
    this.removeAttribute("open", "");
    document.body.classList.remove(`ajax-cart-open`);
    document.body.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden-tablet');
  }

  // Only needed if wishlist present
  initializeWishlistButtons() {
    if("_swat" in window) {  _swat.initializeActionButtons("#shopify-section-ajax-cart") }
  }

  renderContents(parsedState, openCart = true) {
    this.getSectionsToRender().forEach((section => {
      var sectionToUpdate = document.getElementById(section.id);
      if(parsedState.sections[section.id]) {
        if(sectionToUpdate) sectionToUpdate.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector); 
      }
    }));
    if(openCart) {
      setTimeout(() => {
        this.initializeWishlistButtons();
        this.open();
      }, 100);
    }
    this.bindEvents();
  }

  getSectionsToRender() {
    return [
      {
        id: 'ajax-cart',
        selector: `#ajax-cart`,
      }
    ];
  }
}

customElements.define('ajax-cart', AjaxCart);

class CartNote extends HTMLElement {
  constructor() {
    super();
    console.log('cart note init')
    this.noteContainer = this.querySelector('#Cart-note');
    this.noteContainer.addEventListener('keyup', this.updateCount.bind(this));
    this.bindEvents();
  }
  
  bindEvents() {
    this.querySelector(".gift-note-close").addEventListener('click', this.closeGiftNote.bind(this))
    this.querySelector("#button-cancel-note").addEventListener('click', this.closeGiftNote.bind(this))
    this.querySelector("#button-save-note").addEventListener('click', this.saveGiftNote.bind(this))
    document.querySelectorAll("#gift-message-edit").forEach(el => {
      el.addEventListener('click', this.openGiftNote.bind(this))
    });
    document.querySelectorAll(".gift-message-button").forEach(el => {
      el.addEventListener('click', this.openGiftNote.bind(this))
    });
    document.querySelectorAll("#gift-message-delete").forEach(el => {
      el.addEventListener('click', this.deleteNote.bind(this))
    });
    // editButton.addEventListener('click', this.openGiftNote.bind(this))
    // addButton.addEventListener('click', this.openGiftNote.bind(this))
    // deleteButton.addEventListener('click', this.deleteNote.bind(this))

  }
  
  deleteNote(event) {
    this.noteContainer.value = "";
    this.saveGiftNote();
  }

  updateCount(event) {
    document.querySelector('[for="Cart-note"]').innerHTML = `Your Message (${event.target.value.length}/255)`;
  }

  openGiftNote(event) {
    console.log('opening gift note')
    document.querySelector('cart-drawer').classList.add(`gift-note-open`);
  }

  closeGiftNote(event){
    document.querySelector('cart-drawer').classList.remove(`gift-note-open`);
  }

  getSectionsToRender() {
    return [
      {
        id: 'shopify-section-ajax-cart',
        section: 'ajax-cart',
        selector: '#cart .message-container'
      }
    ];
  }

  getSectionInnerHTML(html, selector) {
    console.log('selector 2', selector)
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  saveGiftNote(event){
    console.log('save gift note called event')
    this.closeGiftNote();
    const body = JSON.stringify(
      { 
        note: this.noteContainer.value,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname
      });
    fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }})
    .then((response) => {
      return response.text();
    })
    .then(state => {
      const parsedState = JSON.parse(state);
      this.getSectionsToRender().forEach((section => {
        const elementToReplace =
          document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
        elementToReplace.innerHTML =
          this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

        const step4Container = $("#step-4-summary .message-container");
        if(step4Container.length) {
          step4Container.html(this.getSectionInnerHTML(parsedState.sections[section.section], section.selector))
        }
      }));
      console.log('success')
      this.bindEvents();
    });

    document.querySelectorAll('#Cart-note').forEach(el => {
      el.value = this.noteContainer.value
    })
  }
}

customElements.define('cart-note', CartNote);


console.log('before init')
class ShareTracking extends HTMLElement {
  constructor() {
    super();
    console.log('share tracking init')
    this.emailContainer = this.querySelector('#share-tracking-note');
    this.bindEvents();
  }
  
  bindEvents() {
    console.log('Binding share tracking events 1')
    this.querySelector(".share-tracking-close").addEventListener('click', this.closeShareTracking.bind(this))
    this.querySelector("#button-cancel-share-tracking").addEventListener('click', this.closeShareTracking.bind(this))
    this.querySelector("#button-save-share-tracking").addEventListener('click', this.saveShareTracking.bind(this))
    // const editButton = document.querySelector("#share-tracking-edit");
    // console.log('edit',{editButton})
    // const addButton = document.querySelector("#share-tracking-button-open");
    // const deleteButton = document.querySelector("#share-tracking-delete");
    // if(editButton) editButton.addEventListener('click', this.openShareTracking.bind(this))
    // if(addButton) addButton.addEventListener('click', this.openShareTracking.bind(this))
    // if(deleteButton) deleteButton.addEventListener('click', this.deleteShareTracking.bind(this))

    document.querySelectorAll("#share-tracking-edit").forEach(el => {
      el.addEventListener('click', this.openShareTracking.bind(this))
    });
    document.querySelectorAll("#share-tracking-button-open").forEach(el => {
      el.addEventListener('click', this.openShareTracking.bind(this))
    });
    document.querySelectorAll("#share-tracking-delete").forEach(el => {
      el.addEventListener('click', this.deleteShareTracking.bind(this))
    });
  }
  
  deleteShareTracking(event) {
    console.log('deleting tracking')
    this.emailContainer.value = ''
    this.saveShareTracking()
  }

  updateCount(event) {
    console.log('updating count')
    // document.querySelector('[for="Cart-note"]').innerHTML = `Your Message (${event.target.value.length}/255)`;
  }

  openShareTracking(event) {
    console.log('opening share tracking note')
    document.querySelector('cart-drawer').classList.add(`share-tracking-open`);
  }

  closeShareTracking(event){
    document.querySelector('cart-drawer').classList.remove(`share-tracking-open`);
  }

  getSectionsToRender() {
    return [
      {
        id: 'shopify-section-ajax-cart',
        section: 'ajax-cart',
        selector: '#cart .share-tracking-container'
      }
    ];
  }

  getSectionInnerHTML(html, selector) {
    console.log('selector 3', selector)
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  saveShareTracking(event){
    let email = this.emailContainer.value
    let self = this
    this.closeShareTracking();

    fetch("/cart.json").then(r => r.json()).then(cart => {
      let subItemIndex = cart.items.findIndex(i => i?.selling_plan_allocation?.selling_plan && i.properties?.["_subscription_hash"])
      let existingProps = cart.items[subItemIndex].properties
      const body = JSON.stringify(
        { 
          line: subItemIndex + 1,
          quantity: 1,
          properties: {
            ...(email ? {"Share tracking with": email} : {}),
            ...(existingProps?.["Gift Note"] ? {"Gift Note": existingProps?.["Gift Note"]}: {}),
            ...(existingProps?.["_plan"] ? {"_plan": existingProps?.["_plan"].toString()}: {}),
            ...(existingProps?.["_membership_timestamp"] ? {"_membership_timestamp": existingProps?.["_membership_timestamp"]}: {}),
            ...(existingProps?.["_subscription_hash"] ? {"_subscription_hash": existingProps?.["_subscription_hash"]}: {}),
            ...(existingProps?.["_landing_page"] ? {"_landing_page": existingProps?.["_landing_page"]}: {}),
            ...(existingProps?.["_gift_order"] ? {"_gift_order": existingProps?.["_gift_order"]}: {}),
          },
          sections: self.getSectionsToRender().map((section) => section.section),
          sections_url: window.location.pathname
        });
      fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then(state => {
        const parsedState = JSON.parse(state);
        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

          const step4Container = $("#step-4-summary .share-tracking-container");
          console.log(this.getSectionInnerHTML(parsedState.sections[section.section], section.selector))
          if(step4Container.length) {
            step4Container.html(this.getSectionInnerHTML(parsedState.sections[section.section], section.selector))
          }
        }));
        this.bindEvents();
      });
    })

    document.querySelectorAll('share-tracking').forEach(el => {
      el.emailContainer.value = email
    })
  }
}

customElements.define('share-tracking', ShareTracking);

console.log('after init')
