(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['boomsvgloader'], factory);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.boomsvgloader = factory();
  }
}(this, function() {
  'use strict';
  function load(url) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", url, true);
    ajax.send();
    ajax.onload = function(e) {
      var div = document.createElement("div");
      div.style.cssText = 'border: 0; clip: rect(0 0 0 0); height: 0; overflow: hidden; padding: 0; position: absolute; width: 0;';
      div.innerHTML = ajax.responseText;
      document.body.insertBefore(div, document.body.childNodes[0]);
    };
  }
  return {
    load: load
  };
}));