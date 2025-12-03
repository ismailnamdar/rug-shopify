function getImage(imageUrl, imageHolder) {
  let newImage = document.createElement('img');
  newImage.src = imageUrl;
  newImage.onload = function() {
    imageHolder.style.backgroundImage = "url('" + newImage.src + "')";
    imageHolder.setAttribute('data-bg', newImage.src);
  };
}

function resizeBackgroundImages(responsiveImages, event) {
  for (var i = 0; i < responsiveImages.length; i++) {
    const responsiveImage = responsiveImages[i];
    const windowWidth = window.innerWidth;
    const sizes = responsiveImage.getAttribute('data-sizes').split(',');
    const largeImage = responsiveImage.getAttribute('data-large_image');
    let imageLoaded = responsiveImage.getAttribute('data-loaded');
    let flag = false;

    if (responsiveImage.classList.contains('lazyloaded')) {
      for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        const image = size.split('@@@')[0];
        const mediaQuery = size.split('@@@')[1];
        const lastMediaQuery = sizes[sizes.length - 1].split('@@@')[1];

        if (event === 'resize' && (windowWidth >= lastMediaQuery || windowWidth <= mediaQuery)) {
          imageLoaded = 'false';
        }

        if (!flag) {
          if (windowWidth <= mediaQuery && imageLoaded == 'false') {
            getImage(image, responsiveImage);
            responsiveImage.setAttribute('data-loaded', true);
            flag = true;
          } else if (windowWidth >= lastMediaQuery && imageLoaded == 'false') {
            responsiveImage.setAttribute('data-loaded', true);
            getImage(largeImage, responsiveImage);
          }
        }
      }
    }
  }
}

function initResponsiveImages() {
  const eventsToListen = ['load', 'resize', 'scroll'];

  eventsToListen.forEach(function(event) {
    window.addEventListener(event, function() {
      const targetImages = document.querySelectorAll('.responsive-background-image');
      resizeBackgroundImages(targetImages, event);
    });
  });
}

(function() {
  var $doc = $(document);
  var $win = $(window);
  var $headerWrapper = $('#shopify-section-header');
  var $header = $headerWrapper.find('.site-header');
  var $promoBar = $headerWrapper.find('.promo-bar');

  const shareData = {
    title: 'MDN',
    text: 'Learn web development on MDN!',
    url: 'https://developer.mozilla.org',
  };

  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // if (iOS) {
  //   $('body').addClass('iOS');
  // }

  var currnetUrl = window.location.href;

  $('.dropdown .dropdown__inner li:not(.view-all)').each(function() {
    var $link = $(this).find('a');
    var tag = $link.data('tag');
    if (currnetUrl.includes(tag) && tag != '') {
      $(this)
        .addClass('current')
        .closest('.dropdown')
        .addClass('dropdown--selected')
        .find('.dropdown__trigger span')
        .text($link.text());
    }
  });

  $doc
    .on('click', '.dropdown li:not(.view-all) .js-tag-trigger', function(e) {
      e.preventDefault();
      var newUrl = '';
      var dataTag = $(this).data('tag');
      var blogUrl = $(this).data('blog-url');
      newUrl = blogUrl + dataTag;
      filterByTag(newUrl, $(this), false);
    })
    .on('click', '.dropdown .clear, .view-all a', function(e) {
      e.preventDefault();
      var newUrl = '';
      var blogUrl = $(this).data('blog-url');
      newUrl = blogUrl;
      filterByTag(newUrl, $(this), true);
    })
    .on('focus blur', '.dropdown form input', function(e) {
      $(this)
        .closest('.dropdown')
        .toggleClass('focused', $(this).is(':focus'));
    })
    .on('click', '.link-copy', function(e) {
      e.preventDefault();
      var $siteHeader = $('.site-header');
      saveClipBoard();
      $('.link-copy .tooltip')
        .css({
          top: $siteHeader.position().top + $siteHeader.height(),
        })
        .fadeIn()
        .delay(1500)
        .fadeOut();
    })
    .on('mouseup', function(e) {
      e.preventDefault();

      clickOutsideDropdown($('.dropdown.expanded, .dropdown.expanded .dropdown-trigger'), e);
    })
    .on('click', '.dropdown__trigger span', function(e) {
      e.preventDefault();
      toggleDropdown($(this));
    });

  function filterByTag(newUrl, $this, clear) {
    $this
      .closest('.shopify-section')
      .siblings()
      .find('.current a')
      .each(function() {
        if ($(this).data('tag')) {
          newUrl = newUrl + '+' + $(this).data('tag');
        }
      });
    if (
      clear &&
      $this
        .closest('.shopify-section')
        .siblings()
        .find('.current a').length == 0
    ) {
      newUrl = newUrl.replace('tagged/', '');
    }
    newUrl = newUrl.replace('/+', '/');
    window.location.href = newUrl;
  }

  function clickOutsideDropdown($container, e) {
    if (!$container.is(e.target) && $container.has(e.target).length === 0) {
      $('.dropdown .dropdown__trigger').each(function() {
        $(this)
          .next()
          .slideUp()
          .closest('.dropdown')
          .removeClass('expanded');
      });
    }
  }

  function toggleDropdown($this) {
    $this
      .parent()
      .next()
      .slideToggle(300)
      .closest('.dropdown')
      .toggleClass('expanded');
  }

  function saveClipBoard() {
    var $hiddenField = document.createElement('input'),
      url = window.location.href;

    document.body.appendChild($hiddenField);
    $hiddenField.value = url;
    $hiddenField.select();
    var success = document.execCommand('copy');
    document.body.removeChild($hiddenField);

    return success;
  }

  let originalBarHeight = 0;
  let originalBarHeightMinus = 0;

  function stickyHeader() {
    originalBarHeight = $('.promo-bar .promo-content').outerHeight();

    $headerWrapper.addClass('sticky');
    $headerWrapper.height(originalBarHeight + $header.height());
    if ($win.scrollTop() > 20) {
      $headerWrapper.addClass('resize');
    } else {
      $headerWrapper.removeClass('resize');
    }
  }

  $win.on('load resize', function() {
    stickyHeader();
  });

  $win.on('load resize', function() {
    originalBarHeight = $('.promo-bar .promo-content').outerHeight() + 'px';
    originalBarHeightMinus = '-' + $('.promo-bar .promo-content').outerHeight() + 'px';
  });

  $('.press-wrapper').on('click', '.load-more a', function(e) {
    e.preventDefault();
    var $this = $(this);
    var link = $this.attr('href');
    var $pressListing = $('.press-listing');
    $this.parent().addClass('loading');
    $.ajax({
      url: link,
    }).done(function(data) {
      var $html = $(data);
      $this.parent().remove();
      $pressListing.find('.left-side').append($html.find('.press-listing .left-side .article-row').prop('outerHTML'));
      if ($html.find('.load-more').length) {
        $pressListing.find('.left-side').append($html.find('.load-more')[0].outerHTML);
      }
    });
  });

  // Step animation
  $(window).on('scroll', function() {
    var scrollTop = $(window).scrollTop() + $('.site-header').height();

    $('.step-row .step__num').each(function() {
      var $this = $(this);
      var itemOffset = $this.offset().top;
      var $stepRow = $this.closest('.step-row');
      if (itemOffset <= scrollTop + 20) {
        $this.addClass('load');
        if ($stepRow.next()) {
          $stepRow
            .next()
            .find('.step__num')
            .addClass('visible');
        }
      } else {
        $this.removeClass('load');
        if ($stepRow.next()) {
          $stepRow
            .next()
            .find('.step__num')
            .removeClass('visible');
        }
      }
    });
  });

  initResponsiveImages();
})();

if ($('.list-recipes').length) {
  $('.list-recipes').slick({
    slidesToShow: 4,
    slidesToScroll: 4,
    dots: true,
    arrows: true,
    prevArrow: $('.section-homeschooling-slider .ico-arrow-prev'),
    nextArrow: $('.section-homeschooling-slider .ico-arrow-next'),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  });
}

if ($('.section-bonus-bites .section__cols').length) {
  $(window).on('load resize', function() {
    if ($(window).width() < 1024) {
      $('.section-bonus-bites .section__cols:not(.slick-slider)').slick({
        slidesToShow: 2,
        slidesToScroll: 2,
        dots: true,
        arrows: false,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            },
          },
        ],
      });
    } else {
      $('.section-bonus-bites .section__cols.slick-slider').slick('unslick');
    }
  });
}

$('.js-tab-link a').on('click', function(e) {
  e.preventDefault();

  var $this = $(this);
  var $target = $(this.hash);

  var $otherTabs = $this.closest('.section__body').find('.js-tab');
  var $otherLinks = $this.closest('.section__body').find('.js-tab-link');

  $otherTabs.removeClass('is-active');
  $otherLinks.removeClass('is-active');

  $this
    .closest('li')
    .add($target)
    .addClass('is-active');
});

if (isMobile()) {
  mobileMenuBack($('.js-menu-back'));
  expandDropdown($('.js-nav-expander'), 'active-dropdown');
}

/**
 * remove Section from DOM
 * @param  {jQuery selector} $section
 * @return {Void}
 */
function removeSection($section) {
  $section.closest('.shopify-section').remove();
}

/**
 * [mobileMenuBack description]
 * @param  {[type]} $backButton [description]
 * @return {[type]}             [description]
 */
function mobileMenuBack($backButton) {
  $backButton.on('click', function(event) {
    event.preventDefault();

    const $this = $(this);

    $this.closest('.secondary-links').removeClass('secondary-links-active');
  });

  $('.js-trigger-mobile-nav').on('click', function(event) {
    if ($(event.target).is("span")) return;

    event.preventDefault();
    if(!$(event.target).is("a") && !$(event.target).is("button") && !$(event.target).is("path") && !$(event.target).is("svg")) {
      event.stopPropagation();
      window.location.href = $(this).attr('href');
    } else {
      const $this = $(this);
      const $dropdown = $this.closest('li').find('.secondary-links');
      $dropdown.addClass('secondary-links-active');
    }
  });
}

/**
 * [expandDropdown description]
 * @param  {[type]} $trigger [description]
 * @return {[type]}          [description]
 */
function expandDropdown($trigger, activeClass) {
  $trigger.each(function(argument) {
    const $this = $(this);
    const $dropdown = $this.closest('li').find('.site-nav__submenu');

    $this.on('click', function(event) {
      event.preventDefault();
      $dropdown.add($this).toggleClass(activeClass);
    });

    $trigger.add($dropdown).on('click', function(event) {
      event.stopPropagation();
    });
  });

  $(document).on('click', function() {
    $('.' + activeClass).removeClass(activeClass);
  });
}

function isMobile() {
  return (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  );
}

$('.nav-plans').on('click', 'a', function(event) {
  const $this = $(this);
  const $targetPlan = $($this.attr('href'));

  $this
    .closest('li')
    .addClass('is-current')
    .siblings()
    .removeClass('is-current');

  $targetPlan
    .addClass('is-current')
    .siblings()
    .removeClass('is-current');

  event.preventDefault();
});

setTimeout(function() {
  $(document).ready(function() {
    $('.js-video-play').magnificPopup({
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,

      fixedContentPos: false,
    });
  });

  $('.js-video-mp4-play').magnificPopup({
    type: 'inline',
    callbacks: {
      open: function() {
        $('html').css('margin-right', 0);
        // Play video on open:
        // $(this.content).find('video')[0].play();
      },
      close: function() {
        // Reset video on close:
        // $(this.content).find('video')[0].load();
      },
    },
  });
}, 1200);

const $win = $(window);

const $slidersCalendar = $('.js-slider-calendars');
$slidersCalendar.each(function() {
  const $sliderCalendar = $(this);

  $sliderCalendar.slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    arrows: false,
    fade: true,
    infinite: true,
    speed: 300,
    autoplay: true,
    autoplaySpeed: 3000,
  });
});

/**
 * check url for parametter
 * @param  {String} parametter                        [parametter to search for]
 * @param  {jQuery selector} $parametterSectionTrue   [section that we show if searched parameter is found]
 * @param  {jQuery selector} $parametterSectionFalse  [section that we hide if searched parameter is found]
 * @return {void}
 */
function checkForParams(parametter) {
  const searchParams = new URLSearchParams(window.location.search);
  const param = searchParams.get(parametter);

  return param;
}

const reorderSections = ($sectionFirst, $sectionSecondary) => {
  if (!$sectionFirst.length > 0 && !$sectionSecondary.length > 0) {
    return;
  }

  let parametter = checkForParams('reorder');

  if (parametter === '1') {
    $sectionSecondary.clone().insertAfter($sectionFirst);

    $sectionFirst.insertAfter($sectionSecondary);

    $sectionSecondary.remove();
  }
};

reorderSections($('.section-plans').parent(), $('.section-how-it-works').parent());

/**
 * Brands Infinite Animation
 * @type {Void}
 */
const $brandsParent = $('.js-brands-animation');
const $brands = $brandsParent.find('.brands');
const $brandInBrands = $brands.find('.brands__item');
const $window = $(window);
const windowWidth = $window.width();

/**
 * Cloning elements until page is full
 *
 * @return {Void}
 */
if (windowWidth > $brands.width()) {
  $brandInBrands.each(function() {
    const $this = $(this);
    const $clone = $this.clone();
    $clone.appendTo($brands);
    if (windowWidth < $brands.width()) {
      return false;
    }
  });
}

const animationSpeed = $brands.data('animation');

const $brandsCopy = $brands.clone().addClass('brands--copy');
$brandsCopy.appendTo($brandsParent);

const $brandsCopy2 = $brands.clone().addClass('brands--copy2');
$brandsCopy2.appendTo($brandsParent);

const animationValue = animationSpeed + 's' + ' linear infinite';

$brands.css('animation', 'mymove ' + animationValue);
$brandsCopy.css('animation', 'mymoveCopy ' + animationValue);
$brandsCopy2.css('animation', 'mymoveCopy2 ' + animationValue);

/**
 * Stats Functionality
 */
const $stats = $('.js-stats');
const $statImages = $stats.find('.stat__image');

const $firstActiveStat = $('.stat.is-active').closest('.stats__item');
$firstActiveStat.addClass('is-active');

/**
 * Stat Trigger
 *
 * @param  {Index} index
 * @return {Void}
 */
$statImages.each(function(index) {
  const $this = $(this);
  const $parent = $this.closest('.stat');

  $this.on('click', function() {
    clearInterval(animationStart);
    const $this = $(this);
    const $allStats = $this.closest('.stats').find('.stat');

    $this.addClass('wiggle-animate');

    setTimeout(function() {
      $this.removeClass('wiggle-animate');
    }, 1200);

    $allStats.each(function(index) {
      const $this = $(this);
      const $statsItem = $this.closest('.stats__item');
      $this.removeClass('is-active');
      $statsItem.removeClass('is-active');
    });

    $parent.toggleClass('is-active');
    const $statsItem = $parent.closest('.stats__item');
    $statsItem.toggleClass('is-active');
  });
});

const statsRotationSpeed = $stats.data('rotation');
const $allStats = $('.stats__item');
let index = 0;

/**
 * Start Automatic Animation
 *
 * @return {Void}
 */
const animationStart = setInterval(function() {
  $allStats.each(function() {
    const $this = $(this);
    const $childStat = $this.find('.stat');

    $this.removeClass('is-active');
    $childStat.removeClass('is-active');
  });

  const $currentElement = $allStats.eq(index);
  const $currentElementStat = $currentElement.find('.stat');
  const $currentElementImage = $currentElement.find('.stat__image');

  $currentElement.addClass('is-active');
  $currentElementStat.addClass('is-active');
  $currentElementImage.addClass('wiggle-animate');

  setTimeout(function() {
    $currentElementImage.removeClass('wiggle-animate');
  }, 1200);

  index++;

  if (index > 5) {
    index = 0;
  }
}, statsRotationSpeed * 1000);

/**
 * Reversed Parallax
 *
 * @type {Void}
 */
const $parallax = $('.js-parallax');

$window.scroll(function() {
  const scrollPositon = $window.scrollTop();

  $parallax.each(function() {
    const $this = $(this);

    if (!$this.hasClass('is-active')) {
      $this.addClass('is-active');
      const curTop = $this.css('top').split('px');
      $this.data('top', curTop[0]);
    }

    const curTopData = $this.data('top');

    $this.css({
      top: `${curTopData - scrollPositon}px`,
    });
  });
});
