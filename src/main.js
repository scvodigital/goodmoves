import "@babel/polyfill";
// import { default as Headroom } from 'headroom.js';
import * as mdc from 'material-components-web';
import { ComponentsInitialiser } from '../node_modules/@scvo/common/old/components-initialiser';
import { Auth } from '../node_modules/@scvo/common/old/firebase-auth';
import * as cookieInfoScript from '../node_modules/@scvo/common/old/cookie-info-script';

window.firebase = firebase;

export class Goodmoves {
  constructor(firebaseConfig) {
    this.setupGaLinkEvents();

    this.firebaseConfig = firebaseConfig;
    this.auth = new Auth(this.firebaseConfig, '/upgrade-token?token={idToken}', 'gm_cookie');

    this.displayMode = null;
    this.displayModes = [
      { name: 'mobile', min: 0, max: 599 },
      { name: 'tablet', min: 600, max: 959 },
      { name: 'desktop', min: 960, max: 20000 }
    ];

    this.maps = {};

    this.ie = navigator.appName.indexOf('Microsoft') > -1 || navigator.userAgent.indexOf('Trident') > -1;
    this.occasionalDrawers = Array.from(document.querySelectorAll('.mdc-drawer--occasional')).map(el => {
      return {
        element: el,
        mdc: null
      };
    });

    $(window).on('resize', () => {
      this.windowResized();
    });
    this.windowResized();

    this.componentsInitialiser = new ComponentsInitialiser({
      themes: {
        primary: {
          background: '#B6497D',
          text: '#ffffff'
        },
        secondary: {
          background: '#e0e0e0',
          text: '#000000'
        },
        success: {
          background: '#679c54',
          text: '#000000'
        },
        warning: {
          background: '#A95E1E',
          text: '#ffffff'
        },
        error: {
          background: '#A9201E',
          text: '#ffffff'
        }
      },
      displayModes: this.displayModes
    });
    this.componentsInitialiser.initialise();

    // Headroom
    // var header = document.querySelector("header.top-bar-stuck");
    // this.headroom  = new Headroom(header, {
    //   "offset": 176,
    //   "tolerance": 5
    // });
    // this.headroom.init();

    const ci = new cookieinfo();
    ci.options.message = "We use cookies to track anonymous usage statistics and do not collect any personal information that can be used to identify you. By continuing to visit this site you agree to our use of cookies.";
    ci.options.fontFamily = "'Ingra',Helvetica,Arial,sans-serif";
    ci.options.bg = "#fff";
    ci.options.link = "#B6497D";
    ci.options.divlink = "#fff";
    ci.options.divlinkbg = "#B6497D";
    ci.options.position = "bottom";
    ci.options.acceptOnScroll = "true";
    ci.options.moreinfo = "/cookies";
    ci.options.cookie = "CookieInfoScript";
    ci.options.textAlign = "left";
    ci.run();
  }

  windowResized() {
    var width = $(window).width();
    var newDisplayMode = null;
    this.displayModes.forEach(function(mode) {
      if (width >= mode.min && width < mode.max) {
        newDisplayMode = mode.name;
      }
    });
    if (newDisplayMode !== this.displayMode) {
      this.displayMode = newDisplayMode;
      this.displayModeChanged();
    }
    this.fie();
  }

  displayModeChanged() {
    // console.log('Display Mode:', this.displayMode);

    this.occasionalDrawers.forEach(od => {
      var menuButton = $(od.element).data('menu-button');
      if (this.displayMode === 'desktop') {
        if (od.mdc) {
          od.mdc.destroy();
        }
        $(od.element).removeClass('mdc-drawer--modal');
        $(menuButton).off('click');
      } else {
        $(od.element).addClass('mdc-drawer--modal');
        od.mdc = mdc.drawer.MDCDrawer.attachTo(od.element);
        $(menuButton).on('click', () => { od.mdc.open = !od.mdc.open; });
      }
    });
  }

  fie() {
    if (!this.ie) return;
    $('.mdc-drawer--occasional .mdc-drawer__drawer').each(function(i, o) {
      var $o = $(o);
      var parentHeight = $o.parent().height();
      $o.css('height', parentHeight);
    });
  }

  setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; secure";
  }

  getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

  disable(elements, disable) {
    disable = typeof disable === 'undefined' ? true : disable;
    for (var e = 0; e < elements.length; ++e) {
      var element = elements[e];
      var opacity = disable ? 0.5 : 1;
      $(element).prop('disabled', disable).css('opacity', opacity);
    }
  }

  snackbarShow(options) {
    console.log('DEPRECATED SNACKBARSHOW CALLED:', arguments);
  }

  popupPagerPage(pager, direction) {
    var currentPage = $(pager).find('.map-content:visible');
    var nextPage = currentPage;
    if (direction === 'next') {
      var nextElement = currentPage.next();
      if (!nextElement || nextElement.length === 0) {
        nextPage = $(pager).children().first();
      } else {
        nextPage = nextElement;
      }
    } else if (direction === 'back') {
      var prevElement = currentPage.prev();
      if (!prevElement || prevElement.length === 0) {
        nextPage = $(pager).children().last();
      } else {
        nextPage = prevElement;
      }
    }
    currentPage.hide();
    nextPage.show();
  }

  setupGaLinkEvents() {
    $('a[data-ga-link-event]').on('mouseup', function(event) {
      if (typeof ga !== 'function' || typeof gtag !== 'function') {
        console.log('No GA');
        return;
      }
      var id = $(this).data('ga-link-event');
      gtag('event', 'document_hit', {
        'event_category': 'goodmoves-vacancy',
        'event_label': id,
        'hit_type': 'banner-clicked'
      });
      gtag('event', 'document_hit', {
        'sf_type': 'Vacancy__c',
        'id': id,
        'title': 'Banner',
        'hit_type': 'banner-clicked'
      });
      console.log('Banner click tracked', id, gtag);
    });
  }
}