function submitNewsletterAjax(email, callback) {
  $.ajax({
    url: 'https://a.klaviyo.com/ajax/subscriptions/subscribe',
    type: 'POST',
    data: 'g=' + window.newsletterListID + '&email=' + email
  }).always(function(e) {
    callback(e);
  });
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function bit_test(num, bit) {
  return ((num >> bit) % 2 != 0)
}

function initializeNewsletter(){
  try {
    var utm_source = getParameterByName('utm_source');
    var utm_medium = getParameterByName('utm_medium');
    var utm_campaign = getParameterByName('utm_campaign');
    var ad_id = getParameterByName('ad_id');
    var adset_id = getParameterByName('adset_id');
    var campaign_id = getParameterByName('campaign_id');
    var ad_name = getParameterByName('ad_name');
    var adset_name = getParameterByName('adset_name');
    var campaign_name = getParameterByName('campaign_name');
    var raw_qs = encodeURI((location.pathname + location.search).substr(1));
    
    localStorage.setItem("utm_source", encodeURI(utm_source));
    localStorage.setItem("utm_medium", encodeURI(utm_medium));
    localStorage.setItem("utm_campaign", encodeURI(utm_campaign));
    localStorage.setItem("ad_id", encodeURI(ad_id));
    localStorage.setItem("adset_id", encodeURI(adset_id));
    localStorage.setItem("campaign_id", encodeURI(campaign_id));
    localStorage.setItem("ad_name", encodeURI(ad_name));
    localStorage.setItem("adset_name", encodeURI(adset_name));
    localStorage.setItem("campaign_name", encodeURI(campaign_name));
    if (!localStorage.getItem("ref_site")) {
      localStorage.setItem("ref_site", encodeURI(document.referrer));
    }
    localStorage.setItem("raw_qs", raw_qs);
    console.log("wrote utm");
  } catch (ee) {
    console.log(ee);
  }
  
  var cc = getParameterByName("cc");
  var product = getParameterByName("f");
  if (cc && localStorage) {
    localStorage.setItem("cc", JSON.stringify({
      value: cc,
      product: product,
      timestamp: new Date().getTime()
    }));
  }
  if (!cc || cc === null) {
    var ONE_DAY = 60 * 60 * 24 * 1000;
    var ccValue1 = JSON.parse(localStorage.getItem("cc"));
    if (ccValue1 && (new Date().getTime() - ccValue1.timestamp) > ONE_DAY) {
      localStorage.removeItem("cc");
    }
  }
  if (localStorage) {
    var itemCount = $("a.appendCC").length;
    console.log("mod3: " + (itemCount % 3 === 0).toString());
    console.log("mod4: " + (itemCount % 4 === 0).toString());
    $("a.appendCC").each(function() {
      //debugger;
      console.log("found '" + $(this).attr("href") + "'");
      if (localStorage.getItem("cc")) {
        var ccValue = JSON.parse(localStorage.getItem("cc"));
        var $this = $(this);
        var _href = $this.attr("href");
        //debugger;
        if ((getParameterByName("f") === null || getParameterByName("f") === "0") && (ccValue.product === "0" || ccValue.product === "15")) {
          $this.attr("href", _href + '?coupon_code=' + ccValue.value);
        } else {
          if (parseInt(ccValue.product) >= 1 && parseInt(ccValue.product) <= 15) {
            if (itemCount % 3 === 0) {
              // Three products displayed (1mo/6mo/12mo)
              if (bit_test(ccValue.product, 0) === true && $this.hasClass("item1")) {
                $this.attr("href", _href + '?coupon_code=' + ccValue.value);
              }
              if (bit_test(ccValue.product, 2) === true && $this.hasClass("item2")) {
                $this.attr("href", _href + '?coupon_code=' + ccValue.value);
              }
              if (bit_test(ccValue.product, 3) === true && $this.hasClass("item3")) {
                $this.attr("href", _href + '?coupon_code=' + ccValue.value);
              }
            } else if (itemCount % 4 === 0) {
              // Four products displayed (1mo/3mo/6mo/12mo)
              if (bit_test(ccValue.product, 0) === true && $this.hasClass("item1")) {
                $this.attr("href", _href + '?coupon_code=' + ccValue.value);
              }
              if (bit_test(ccValue.product, 1) === true && $this.hasClass("item2")) {
                $this.attr("href", _href + '?coupon_code=' + ccValue.value);
              }
              if (bit_test(ccValue.product, 2) === true && $this.hasClass("item3")) {
                $this.attr("href", _href + '?coupon_code=' + ccValue.value);
              }
              if (bit_test(ccValue.product, 3) === true && $this.hasClass("item4")) {
                $this.attr("href", _href + '?coupon_code=' + ccValue.value);
              }
            }
          } else {
            console.log("out of range");
          }
        }
      }
    });
  }
}

function submitNewsletter(){
  try {
    var uu_email = encodeURI($("#mce-EMAIL").val());
    var uu_source = localStorage.getItem("utm_source");
    var uu_medium = localStorage.getItem("utm_medium");
    var uu_campaign = localStorage.getItem("utm_campaign");
    
    var uu_ad_id = localStorage.getItem("ad_id");
    var uu_adset_id = localStorage.getItem("adset_id");
    var uu_campaign_id = localStorage.getItem("campaign_id");
    var uu_ad_name = localStorage.getItem("ad_name");
    var uu_adset_name = localStorage.getItem("adset_name");
    var uu_campaign_name = localStorage.getItem("campaign_name");
    
    var uu_lead = 1;
    
    if ($("#mce-EMAIL.desktopEmail").is(":visible")) {
      uu_lead = 2;
    } else if ($("#mce-EMAIL.mobileEmail").is(":visible")) {
      uu_lead = 1;
    } else if ($("#mce-EMAIL.footerEmail").is(":visible")) {
      uu_lead = 3;
    } else {
      uu_lead = 4;
    }
    
    var uu_device = 2;
    var isMobile = window.matchMedia("only screen and (max-width: 760px)");
    
    if (isMobile.matches) {
      uu_device = 1;
    }
    
    var apiUrl = 'https://raddishweb.azurewebsites.net/api/tracking'; //?email='+uu_email+'&form='+uu_lead+'&device='+uu_device+'&utm_source='+uu_source+'&utm_medium='+uu_medium+'&utm_campaign='+uu_campaign;
    
    //$.post(apiUrl);
    var uuParams = {
      email: uu_email,
      utm_source: uu_source,
      utm_medium: uu_medium,
      utm_campaign: uu_campaign,
      form: uu_lead,
      device: uu_device,
      ad_id: uu_ad_id,
      adset_id: uu_adset_id,
      campaign_id: uu_campaign_id,
      ref_site: localStorage.getItem("ref_site") ? localStorage.getItem("ref_site") : null,
      ad_name: uu_ad_name,
      adset_name: uu_adset_name,
      campaign_name: uu_campaign_name,
      qs: localStorage.getItem("raw_qs")
    };
    
    $.ajax({
      url: apiUrl,
      type: "POST",
      data: JSON.stringify(uuParams),
      contentType: "application/json; charset=utf-8"
    });
    
    localStorage.removeItem("ref_site");
    
    console.log('Raddish lead recorded!');
    console.log(uuParams);
  } catch (uuEx) {
    console.log(uuEx);
  }
  
  if ("gtag" in window) {
    gtag('event', 'conversion', {
      'send_to': 'AW-978268597/1Zo8CPuxtoUBELXjvNID'
    });
  }
}

(function($) {
  initializeNewsletter();
  $('.subscribe-form, #mc-embedded-subscribe-form').on('submit', function(e) {
    e.preventDefault();
    var $this = $(this);
    var email = $this.find('[name="EMAIL"]').val();
    submitNewsletterAjax(email, function(e){
      console.log(e);
      submitNewsletter();
      $this.find('.success-response').show();
    })
  })
})(jQuery);
