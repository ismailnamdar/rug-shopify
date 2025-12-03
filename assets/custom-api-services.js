var apiServices = (function () {
  var userSubscriptions = null;
  var physicalSubShopifyProductIds = [6753835614367,6753835712671,6753835778207,6753835843743,6753835909279,6753835974815,6753836040351,6753836073119,6753836138655,6753836204191,6753836302495,6753836335263,6753836368031,6753836433567,6753836466335,6753836597407];
  var API_URL = "https://nw4o549lvf.execute-api.us-east-1.amazonaws.com/test";

  function getSubscriptions(email) {
    var subscriptionUrl = API_URL + "/subscriptions";
    return fetch(subscriptionUrl, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email }) })
    .then(res => res.json())
  }

  function isPhysicalSubscriptionOwner(subs) {
    var subscriptions = subs || [];
    var isPhysicalOwner = false;

    for (var i = 0; i < subscriptions.length; i++) {
      var subscription = subscriptions[i];

      if (physicalSubShopifyProductIds.includes(subscription.shopify_product_id)) {
        isPhysicalOwner = subscription.status === 'ACTIVE';
      }
      if (isPhysicalOwner) break;
    }

    return isPhysicalOwner;
  }

  function goToJoin() {
    window.location.href = "https://www.raddishkids.com/pages/join";
  }
  
  function goToRadPlus() {
    window.location.href = "https://plus.raddishkids.com/";
  }

  async function goToCheckout(customerEmail, productTitle) {
    if (customerEmail.length === 0) {
      goToRadPlus();
      return;
    }

    // Fetch user subscriptions
    if (userSubscriptions == null) {
      var subsResponse = await getSubscriptions(customerEmail);
      userSubscriptions = subsResponse.subscriptions || [];
    }
    var isPhysicalSubscriptionOwnerUser = isPhysicalSubscriptionOwner(userSubscriptions);

    if (!isPhysicalSubscriptionOwnerUser) {
      goToJoin();
      return;
    }

    var rechargeItem = {
      "charge_interval_frequency": 1,
      "order_interval_frequency": 1,
      "order_interval_unit": "month",
      "product_id": "7157590556831",
      "quantity": 1,
      "taxable": "True",
      "variant_id": window.dev ? "40707586818223" : "41393224974495"
    };

    var body = {
      lineItems: [rechargeItem],
      email: customerEmail,
    };

    var checkoutRes = await fetch(API_URL + '/recharge/checkout', {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((res) => res.json());

    var checkoutUrl = 'https://checkout.raddishkids.com/r/checkout/' + checkoutRes.checkout.token + '?myshopify_domain=raddish-kids.myshopify.com&email=' + customerEmail;
    window.location.href = checkoutUrl;
  }

  return {
    goToCheckout: goToCheckout,
    getSubscriptions: getSubscriptions,
  }
})();
window.apiServices = apiServices;