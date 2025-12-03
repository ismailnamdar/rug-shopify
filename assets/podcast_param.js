//alert(window.location.href)
var url = window.location.href;
var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

// we'll store the parameters here
var obj = {};
var msg = '';
var left_msg = '';
var right_top = '';
if (queryString) {
  // stuff after # is not part of query string, so get rid of it
  queryString = queryString.split('#')[0];
  var arr = queryString.split('&');
  for (var i = 0; i < arr.length; i++) {
    // separate the keys and the values
    var a = arr[i].split('=');

    // set parameter name and value (use 'true' if empty)
    var paramName = a[0];
    var paramValue = typeof a[1] === 'undefined' ? true : a[1];

    // (optional) keep case consistent
    paramName = paramName.toLowerCase();
    if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

    // we're dealing with a string
    if (!obj[paramName]) {
      // if it doesn't exist, create property
      obj[paramName] = paramValue;
    } else if (obj[paramName] && typeof obj[paramName] === 'string') {
      // if property does exist and it's a string, convert it to an array
      obj[paramName] = [obj[paramName]];
      obj[paramName].push(paramValue);
    } else {
      // otherwise add the property
      obj[paramName].push(paramValue);
    }
  }

  if (obj['m']) {
    switch (obj['m']) {
      case 'longshort':
        // code block
        left_msg = 'Welcome Longest Shortest Time Listeners!';
        right_top = 'Exclusive Offer:';
        msg =
          '<span class="text-style-2">Save $15</span> on a 6 Month Membership with <br /><span class="text-style-2">Code LONGSHORT.</span>';
        break;
      case 'brains':
        // code block
        left_msg = 'Welcome Brains On Listeners!';
        right_top = 'Exclusive Offer:';
        msg = '<span class="text-style-2">Save $15</span> on a 6 Month Membership with <br /><span class="text-style-2">Code BRAINS</span>';
        break;
      case 'boden':
        // code block
        left_msg = 'Welcome Boden Customers!';
        right_top = 'Exclusive Offer:';
        msg = '<span class="text-style-2">Save $15</span> on a 6 Month Membership with <br /><span class="text-style-2">Code BODEN</span>';
        break;
      case 'fabkids':
        // code block
        left_msg = 'Welcome FabKids Customers!';
        right_top = 'Exclusive Offer:';
        msg =
          '<span class="text-style-2">Save $15</span> on a 6 Month Membership with <br /><span class="text-style-2">Code FABKIDS</span>';
        break;
      case 'boom':
        // code block
        left_msg = 'Welcome Smash Boom Best Listeners!';
        right_top = 'Exclusive Offer:';
        msg = '<span class="text-style-2">Save $15</span> on a 6 Month Membership with <br /><span class="text-style-2">Code BOOM</span>';
        break;
      case 'splendid':
        // code block
        left_msg = 'Welcome Splendid Table Listeners!';
        right_top = 'Exclusive Offer:';
        msg =
          '<span class="text-style-2">Save $15</span> on a 6 Month Membership with <br /><span class="text-style-2">Code SPLENDID</span>';
        break;
      case 'sporkful':
        // code block
        left_msg = 'Welcome Sporkful Listeners!';
        right_top = 'Exclusive Offer:';
        msg =
          '<span class="text-style-2">Save $15</span> on a 6 Month Membership with <br /><span class="text-style-2">Code SPORKFUL</span>';
        break;
      case '15off':
        // code block
        left_msg = 'Welcome USPS Visitors!';
        right_top = 'Exclusive Offer:';
        msg = '<span class="text-style-2">Save $15</span> on a 6 Month Membership with <br /><span class="text-style-2">Code 15OFF</span>';
        break;
      case 'ttd':
        // code block
        left_msg = 'Welcome Homeschooler!';
        right_top = 'Exclusive Offer:';
        msg =
          '<span class="text-style-2">Save $15</span> on a six month membership with <br /><span class="text-style-2">promo code: TTD</span>';
        break;
      case 'ghc':
        // code block
        left_msg = 'Welcome Homeschooler!';
        right_top = 'Exclusive Offer:';
        msg =
          '<span class="text-style-2">Save $15</span> on a six month membership with <br /><span class="text-style-2">promo code: GHC</span>';
        break;
      //default:
      // code block
    }

    //alert(msg)
    var podcast_container = document.getElementById('podcast');
    podcast_container.innerHTML =
      '<div class="lil_banner mask">' +
      '<div class="left">' +
      '<div class="Welcome-Boden-Custom">' +
      left_msg +
      '</div>' +
      '</div>' +
      '<div class="right">' +
      '<div class="Exclusive-Offer-Sav">' +
      '<div class="text-style-1">' +
      right_top +
      '</div>' +
      msg +
      '</div>' +
      '</div>' +
      '</div>';
    //podcast_container.innerHTML = '<div id="podcast" style="padding:20px;text-align:center;background:'+bgcolor+';height:100px;font-weight:bold;">'+msg+'</div>';
  }
}
