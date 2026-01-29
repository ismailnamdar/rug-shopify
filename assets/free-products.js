document.addEventListener("DOMContentLoaded", async () => {
  window.checkToClearCart = async function (cartObj) {
    const freeVariants = [
      // Free Custom Gift Box
      51251607863617,
      // FREE Design Concierge Team
      51251475611969,
      // Premium Quality Inspection Team
      51252103938369,
      // FREE Non Slip Backing
      51252413104449,
      // FREE Color Matching
      51266493251905,
    ];
  
    const cart = cartObj;
  
    const hasTrigger = cart.items.some(item => !freeVariants.includes(item.variant_id))
    const freeItemsInCart = cart.items.filter(item =>
      freeVariants.includes(item.variant_id)
    );
    const idsInCart = cart.items.map(item => item.variant_id);
    const freeItemsNotInCart = freeVariants.filter(id =>
      !idsInCart.includes(id)
    );
  
    const itemsToAdd = freeItemsNotInCart
      .filter(variantId =>
        !cart.items.some(item => item.variant_id === variantId)
      )
      .map(variantId => ({
        id: variantId,
        quantity: 1
      }));
  
    // REMOVE free products if trigger removed
    if (!hasTrigger && freeItemsInCart.length > 0) {
      for (const item of freeItemsInCart) {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.key,
            quantity: 0
          })
        });
      }
    }
  
    const cartUpdated = await fetch('/cart.js').then(r => r.json());
    window.refreshCart(cartUpdated, 0, false);
  }
  window.checkFreeProducts = async function (forceAdd, cartObj) {
    const freeVariants = [
      // Free Custom Gift Box
      51251607863617,
      // FREE Design Concierge Team
      51251475611969,
      // Premium Quality Inspection Team
      51252103938369,
      // FREE Non Slip Backing
      51252413104449,
      // FREE Color Matching
      51266493251905,
    ];
  
    const cart = cartObj || await fetch('/cart.js').then(r => r.json());
  
    const hasTrigger = cart.items.some(item => !freeVariants.includes(item.variant_id))
    const freeItemsInCart = cart.items.filter(item =>
      freeVariants.includes(item.variant_id)
    );
    const idsInCart = cart.items.map(item => item.variant_id);
    const freeItemsNotInCart = freeVariants.filter(id =>
      !idsInCart.includes(id)
    );
  
    const itemsToAdd = freeItemsNotInCart
      .filter(variantId =>
        !cart.items.some(item => item.variant_id === variantId)
      )
      .map(variantId => ({
        id: variantId,
        quantity: 1
      }));
  
    if (forceAdd || (hasTrigger && itemsToAdd.length)) {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAdd })
      });
    }
  
    // REMOVE free products if trigger removed
    if (!hasTrigger && freeItemsInCart.length > 0) {
      for (const item of freeItemsInCart) {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.key,
            quantity: 0
          })
        });
      }
    }
  
    const cartUpdated = await fetch('/cart.js').then(r => r.json());
    
    if (!forceAdd) {
      window.refreshCart(cartUpdated, 0, false);
    }
  }
});
