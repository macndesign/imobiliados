/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */

/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint browser:true */
/*global google */

/**
 * @name InfoBoxOptions
 * @class This class represents the optional parameter passed to the {@link InfoBox} constructor.
 * @property {string|Node} content The content of the InfoBox (plain text or an HTML DOM node).
 * @property {boolean} [disableAutoPan=false] Disable auto-pan on <tt>open</tt>.
 * @property {number} maxWidth The maximum width (in pixels) of the InfoBox. Set to 0 if no maximum.
 * @property {Size} pixelOffset The offset (in pixels) from the top left corner of the InfoBox
 *  (or the bottom left corner if the <code>alignBottom</code> property is <code>true</code>)
 *  to the map pixel corresponding to <tt>position</tt>.
 * @property {LatLng} position The geographic location at which to display the InfoBox.
 * @property {number} zIndex The CSS z-index style value for the InfoBox.
 *  Note: This value overrides a zIndex setting specified in the <tt>boxStyle</tt> property.
 * @property {string} [boxClass="infoBox"] The name of the CSS class defining the styles for the InfoBox container.
 * @property {Object} [boxStyle] An object literal whose properties define specific CSS
 *  style values to be applied to the InfoBox. Style values defined here override those that may
 *  be defined in the <code>boxClass</code> style sheet. If this property is changed after the
 *  InfoBox has been created, all previously set styles (except those defined in the style sheet)
 *  are removed from the InfoBox before the new style values are applied.
 * @property {string} closeBoxMargin The CSS margin style value for the close box.
 *  The default is "2px" (a 2-pixel margin on all sides).
 * @property {string} closeBoxURL The URL of the image representing the close box.
 *  Note: The default is the URL for Google's standard close box.
 *  Set this property to "" if no close box is required.
 * @property {Size} infoBoxClearance Minimum offset (in pixels) from the InfoBox to the
 *  map edge after an auto-pan.
 * @property {boolean} [isHidden=false] Hide the InfoBox on <tt>open</tt>.
 *  [Deprecated in favor of the <tt>visible</tt> property.]
 * @property {boolean} [visible=true] Show the InfoBox on <tt>open</tt>.
 * @property {boolean} alignBottom Align the bottom left corner of the InfoBox to the <code>position</code>
 *  location (default is <tt>false</tt> which means that the top left corner of the InfoBox is aligned).
 * @property {string} pane The pane where the InfoBox is to appear (default is "floatPane").
 *  Set the pane to "mapPane" if the InfoBox is being used as a map label.
 *  Valid pane names are the property names for the <tt>google.maps.MapPanes</tt> object.
 * @property {boolean} enableEventPropagation Propagate mousedown, mousemove, mouseover, mouseout,
 *  mouseup, click, dblclick, touchstart, touchend, touchmove, and contextmenu events in the InfoBox
 *  (default is <tt>false</tt> to mimic the behavior of a <tt>google.maps.InfoWindow</tt>). Set
 *  this property to <tt>true</tt> if the InfoBox is being used as a map label.
 */

/**
 * Creates an InfoBox with the options specified in {@link InfoBoxOptions}.
 *  Call <tt>InfoBox.open</tt> to add the box to the map.
 * @constructor
 * @param {InfoBoxOptions} [opt_opts]
 */
function InfoBox(opt_opts) {

  opt_opts = opt_opts || {};

  google.maps.OverlayView.apply(this, arguments);

  // Standard options (in common with google.maps.InfoWindow):
  //
  this.content_ = opt_opts.content || "";
  this.disableAutoPan_ = opt_opts.disableAutoPan || false;
  this.maxWidth_ = opt_opts.maxWidth || 0;
  this.pixelOffset_ = opt_opts.pixelOffset || new google.maps.Size(0, 0);
  this.position_ = opt_opts.position || new google.maps.LatLng(0, 0);
  this.zIndex_ = opt_opts.zIndex || null;

  // Additional options (unique to InfoBox):
  //
  this.boxClass_ = opt_opts.boxClass || "infoBox";
  this.boxStyle_ = opt_opts.boxStyle || {};
  this.closeBoxMargin_ = opt_opts.closeBoxMargin || "2px";
  this.closeBoxURL_ = opt_opts.closeBoxURL || "http://www.google.com/intl/en_us/mapfiles/close.gif";
  if (opt_opts.closeBoxURL === "") {
    this.closeBoxURL_ = "";
  }
  this.infoBoxClearance_ = opt_opts.infoBoxClearance || new google.maps.Size(1, 1);

  if (typeof opt_opts.visible === "undefined") {
    if (typeof opt_opts.isHidden === "undefined") {
      opt_opts.visible = true;
    } else {
      opt_opts.visible = !opt_opts.isHidden;
    }
  }
  this.isHidden_ = !opt_opts.visible;

  this.alignBottom_ = opt_opts.alignBottom || false;
  this.pane_ = opt_opts.pane || "floatPane";
  this.enableEventPropagation_ = opt_opts.enableEventPropagation || false;

  this.div_ = null;
  this.closeListener_ = null;
  this.moveListener_ = null;
  this.contextListener_ = null;
  this.eventListeners_ = null;
  this.fixedWidthSet_ = null;
}

/* InfoBox extends OverlayView in the Google Maps API v3.
 */
InfoBox.prototype = new google.maps.OverlayView();

/**
 * Creates the DIV representing the InfoBox.
 * @private
 */
InfoBox.prototype.createInfoBoxDiv_ = function () {

  var i;
  var events;
  var bw;
  var me = this;

  // This handler prevents an event in the InfoBox from being passed on to the map.
  //
  var cancelHandler = function (e) {
    e.cancelBubble = true;
    if (e.stopPropagation) {
      e.stopPropagation();
    }
  };

  // This handler ignores the current event in the InfoBox and conditionally prevents
  // the event from being passed on to the map. It is used for the contextmenu event.
  //
  var ignoreHandler = function (e) {

    e.returnValue = false;

    if (e.preventDefault) {

      e.preventDefault();
    }

    if (!me.enableEventPropagation_) {

      cancelHandler(e);
    }
  };

  if (!this.div_) {

    this.div_ = document.createElement("div");

    this.setBoxStyle_();

    if (typeof this.content_.nodeType === "undefined") {
      this.div_.innerHTML = this.getCloseBoxImg_() + this.content_;
    } else {
      this.div_.innerHTML = this.getCloseBoxImg_();
      this.div_.appendChild(this.content_);
    }

    // Add the InfoBox DIV to the DOM
    this.getPanes()[this.pane_].appendChild(this.div_);

    this.addClickHandler_();

    if (this.div_.style.width) {

      this.fixedWidthSet_ = true;

    } else {

      if (this.maxWidth_ !== 0 && this.div_.offsetWidth > this.maxWidth_) {

        this.div_.style.width = this.maxWidth_;
        this.div_.style.overflow = "auto";
        this.fixedWidthSet_ = true;

      } else { // The following code is needed to overcome problems with MSIE

        bw = this.getBoxWidths_();

        this.div_.style.width = (this.div_.offsetWidth - bw.left - bw.right) + "px";
        this.fixedWidthSet_ = false;
      }
    }

    this.panBox_(this.disableAutoPan_);

    if (!this.enableEventPropagation_) {

      this.eventListeners_ = [];

      // Cancel event propagation.
      //
      // Note: mousemove not included (to resolve Issue 152)
      events = ["mousedown", "mouseover", "mouseout", "mouseup",
      "click", "dblclick", "touchstart", "touchend", "touchmove"];

      for (i = 0; i < events.length; i++) {

        this.eventListeners_.push(google.maps.event.addDomListener(this.div_, events[i], cancelHandler));
      }
      
      // Workaround for Google bug that causes the cursor to change to a pointer
      // when the mouse moves over a marker underneath InfoBox.
      this.eventListeners_.push(google.maps.event.addDomListener(this.div_, "mouseover", function (e) {
        this.style.cursor = "default";
      }));
    }

    this.contextListener_ = google.maps.event.addDomListener(this.div_, "contextmenu", ignoreHandler);

    /**
     * This event is fired when the DIV containing the InfoBox's content is attached to the DOM.
     * @name InfoBox#domready
     * @event
     */
    google.maps.event.trigger(this, "domready");
  }
};

/**
 * Returns the HTML <IMG> tag for the close box.
 * @private
 */
InfoBox.prototype.getCloseBoxImg_ = function () {

  var img = "";

  if (this.closeBoxURL_ !== "") {

    img  = "<img";
    img += " src='" + this.closeBoxURL_ + "'";
    img += " align=right"; // Do this because Opera chokes on style='float: right;'
    img += " style='";
    img += " position: relative;"; // Required by MSIE
    img += " cursor: pointer;";
    img += " margin: " + this.closeBoxMargin_ + ";";
    img += "'>";
  }

  return img;
};

/**
 * Adds the click handler to the InfoBox close box.
 * @private
 */
InfoBox.prototype.addClickHandler_ = function () {

  var closeBox;

  if (this.closeBoxURL_ !== "") {

    closeBox = this.div_.firstChild;
    this.closeListener_ = google.maps.event.addDomListener(closeBox, "click", this.getCloseClickHandler_());

  } else {

    this.closeListener_ = null;
  }
};

/**
 * Returns the function to call when the user clicks the close box of an InfoBox.
 * @private
 */
InfoBox.prototype.getCloseClickHandler_ = function () {

  var me = this;

  return function (e) {

    // 1.0.3 fix: Always prevent propagation of a close box click to the map:
    e.cancelBubble = true;

    if (e.stopPropagation) {

      e.stopPropagation();
    }

    /**
     * This event is fired when the InfoBox's close box is clicked.
     * @name InfoBox#closeclick
     * @event
     */
    google.maps.event.trigger(me, "closeclick");

    me.close();
  };
};

/**
 * Pans the map so that the InfoBox appears entirely within the map's visible area.
 * @private
 */
InfoBox.prototype.panBox_ = function (disablePan) {

  var map;
  var bounds;
  var xOffset = 0, yOffset = 0;

  if (!disablePan) {

    map = this.getMap();

    if (map instanceof google.maps.Map) { // Only pan if attached to map, not panorama

      if (!map.getBounds().contains(this.position_)) {
      // Marker not in visible area of map, so set center
      // of map to the marker position first.
        map.setCenter(this.position_);
      }

      bounds = map.getBounds();

      var mapDiv = map.getDiv();
      var mapWidth = mapDiv.offsetWidth;
      var mapHeight = mapDiv.offsetHeight;
      var iwOffsetX = this.pixelOffset_.width;
      var iwOffsetY = this.pixelOffset_.height;
      var iwWidth = this.div_.offsetWidth;
      var iwHeight = this.div_.offsetHeight;
      var padX = this.infoBoxClearance_.width;
      var padY = this.infoBoxClearance_.height;
      var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.position_);

      if (pixPosition.x < (-iwOffsetX + padX)) {
        xOffset = pixPosition.x + iwOffsetX - padX;
      } else if ((pixPosition.x + iwWidth + iwOffsetX + padX) > mapWidth) {
        xOffset = pixPosition.x + iwWidth + iwOffsetX + padX - mapWidth;
      }
      if (this.alignBottom_) {
        if (pixPosition.y < (-iwOffsetY + padY + iwHeight)) {
          yOffset = pixPosition.y + iwOffsetY - padY - iwHeight;
        } else if ((pixPosition.y + iwOffsetY + padY) > mapHeight) {
          yOffset = pixPosition.y + iwOffsetY + padY - mapHeight;
        }
      } else {
        if (pixPosition.y < (-iwOffsetY + padY)) {
          yOffset = pixPosition.y + iwOffsetY - padY;
        } else if ((pixPosition.y + iwHeight + iwOffsetY + padY) > mapHeight) {
          yOffset = pixPosition.y + iwHeight + iwOffsetY + padY - mapHeight;
        }
      }

      if (!(xOffset === 0 && yOffset === 0)) {

        // Move the map to the shifted center.
        //
        var c = map.getCenter();
        map.panBy(xOffset, yOffset);
      }
    }
  }
};

/**
 * Sets the style of the InfoBox by setting the style sheet and applying
 * other specific styles requested.
 * @private
 */
InfoBox.prototype.setBoxStyle_ = function () {

  var i, boxStyle;

  if (this.div_) {

    // Apply style values from the style sheet defined in the boxClass parameter:
    this.div_.className = this.boxClass_;

    // Clear existing inline style values:
    this.div_.style.cssText = "";

    // Apply style values defined in the boxStyle parameter:
    boxStyle = this.boxStyle_;
    for (i in boxStyle) {

      if (boxStyle.hasOwnProperty(i)) {

        this.div_.style[i] = boxStyle[i];
      }
    }

    // Fix for iOS disappearing InfoBox problem.
    // See http://stackoverflow.com/questions/9229535/google-maps-markers-disappear-at-certain-zoom-level-only-on-iphone-ipad
    this.div_.style.WebkitTransform = "translateZ(0)";

    // Fix up opacity style for benefit of MSIE:
    //
    if (typeof this.div_.style.opacity !== "undefined" && this.div_.style.opacity !== "") {
      // See http://www.quirksmode.org/css/opacity.html
      this.div_.style.MsFilter = "\"progid:DXImageTransform.Microsoft.Alpha(Opacity=" + (this.div_.style.opacity * 100) + ")\"";
      this.div_.style.filter = "alpha(opacity=" + (this.div_.style.opacity * 100) + ")";
    }

    // Apply required styles:
    //
    this.div_.style.position = "absolute";
    this.div_.style.visibility = 'hidden';
    if (this.zIndex_ !== null) {

      this.div_.style.zIndex = this.zIndex_;
    }
  }
};

/**
 * Get the widths of the borders of the InfoBox.
 * @private
 * @return {Object} widths object (top, bottom left, right)
 */
InfoBox.prototype.getBoxWidths_ = function () {

  var computedStyle;
  var bw = {top: 0, bottom: 0, left: 0, right: 0};
  var box = this.div_;

  if (document.defaultView && document.defaultView.getComputedStyle) {

    computedStyle = box.ownerDocument.defaultView.getComputedStyle(box, "");

    if (computedStyle) {

      // The computed styles are always in pixel units (good!)
      bw.top = parseInt(computedStyle.borderTopWidth, 10) || 0;
      bw.bottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
      bw.left = parseInt(computedStyle.borderLeftWidth, 10) || 0;
      bw.right = parseInt(computedStyle.borderRightWidth, 10) || 0;
    }

  } else if (document.documentElement.currentStyle) { // MSIE

    if (box.currentStyle) {

      // The current styles may not be in pixel units, but assume they are (bad!)
      bw.top = parseInt(box.currentStyle.borderTopWidth, 10) || 0;
      bw.bottom = parseInt(box.currentStyle.borderBottomWidth, 10) || 0;
      bw.left = parseInt(box.currentStyle.borderLeftWidth, 10) || 0;
      bw.right = parseInt(box.currentStyle.borderRightWidth, 10) || 0;
    }
  }

  return bw;
};

/**
 * Invoked when <tt>close</tt> is called. Do not call it directly.
 */
InfoBox.prototype.onRemove = function () {

  if (this.div_) {

    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};

/**
 * Draws the InfoBox based on the current map projection and zoom level.
 */
InfoBox.prototype.draw = function () {

  this.createInfoBoxDiv_();

  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.position_);

  this.div_.style.left = (pixPosition.x + this.pixelOffset_.width) + "px";
  
  if (this.alignBottom_) {
    this.div_.style.bottom = -(pixPosition.y + this.pixelOffset_.height) + "px";
  } else {
    this.div_.style.top = (pixPosition.y + this.pixelOffset_.height) + "px";
  }

  if (this.isHidden_) {

    this.div_.style.visibility = "hidden";

  } else {

    this.div_.style.visibility = "visible";
  }
};

/**
 * Sets the options for the InfoBox. Note that changes to the <tt>maxWidth</tt>,
 *  <tt>closeBoxMargin</tt>, <tt>closeBoxURL</tt>, and <tt>enableEventPropagation</tt>
 *  properties have no affect until the current InfoBox is <tt>close</tt>d and a new one
 *  is <tt>open</tt>ed.
 * @param {InfoBoxOptions} opt_opts
 */
InfoBox.prototype.setOptions = function (opt_opts) {
  if (typeof opt_opts.boxClass !== "undefined") { // Must be first

    this.boxClass_ = opt_opts.boxClass;
    this.setBoxStyle_();
  }
  if (typeof opt_opts.boxStyle !== "undefined") { // Must be second

    this.boxStyle_ = opt_opts.boxStyle;
    this.setBoxStyle_();
  }
  if (typeof opt_opts.content !== "undefined") {

    this.setContent(opt_opts.content);
  }
  if (typeof opt_opts.disableAutoPan !== "undefined") {

    this.disableAutoPan_ = opt_opts.disableAutoPan;
  }
  if (typeof opt_opts.maxWidth !== "undefined") {

    this.maxWidth_ = opt_opts.maxWidth;
  }
  if (typeof opt_opts.pixelOffset !== "undefined") {

    this.pixelOffset_ = opt_opts.pixelOffset;
  }
  if (typeof opt_opts.alignBottom !== "undefined") {

    this.alignBottom_ = opt_opts.alignBottom;
  }
  if (typeof opt_opts.position !== "undefined") {

    this.setPosition(opt_opts.position);
  }
  if (typeof opt_opts.zIndex !== "undefined") {

    this.setZIndex(opt_opts.zIndex);
  }
  if (typeof opt_opts.closeBoxMargin !== "undefined") {

    this.closeBoxMargin_ = opt_opts.closeBoxMargin;
  }
  if (typeof opt_opts.closeBoxURL !== "undefined") {

    this.closeBoxURL_ = opt_opts.closeBoxURL;
  }
  if (typeof opt_opts.infoBoxClearance !== "undefined") {

    this.infoBoxClearance_ = opt_opts.infoBoxClearance;
  }
  if (typeof opt_opts.isHidden !== "undefined") {

    this.isHidden_ = opt_opts.isHidden;
  }
  if (typeof opt_opts.visible !== "undefined") {

    this.isHidden_ = !opt_opts.visible;
  }
  if (typeof opt_opts.enableEventPropagation !== "undefined") {

    this.enableEventPropagation_ = opt_opts.enableEventPropagation;
  }

  if (this.div_) {

    this.draw();
  }
};

/**
 * Sets the content of the InfoBox.
 *  The content can be plain text or an HTML DOM node.
 * @param {string|Node} content
 */
InfoBox.prototype.setContent = function (content) {
  this.content_ = content;

  if (this.div_) {

    if (this.closeListener_) {

      google.maps.event.removeListener(this.closeListener_);
      this.closeListener_ = null;
    }

    // Odd code required to make things work with MSIE.
    //
    if (!this.fixedWidthSet_) {

      this.div_.style.width = "";
    }

    if (typeof content.nodeType === "undefined") {
      this.div_.innerHTML = this.getCloseBoxImg_() + content;
    } else {
      this.div_.innerHTML = this.getCloseBoxImg_();
      this.div_.appendChild(content);
    }

    // Perverse code required to make things work with MSIE.
    // (Ensures the close box does, in fact, float to the right.)
    //
    if (!this.fixedWidthSet_) {
      this.div_.style.width = this.div_.offsetWidth + "px";
      if (typeof content.nodeType === "undefined") {
        this.div_.innerHTML = this.getCloseBoxImg_() + content;
      } else {
        this.div_.innerHTML = this.getCloseBoxImg_();
        this.div_.appendChild(content);
      }
    }

    this.addClickHandler_();
  }

  /**
   * This event is fired when the content of the InfoBox changes.
   * @name InfoBox#content_changed
   * @event
   */
  google.maps.event.trigger(this, "content_changed");
};

/**
 * Sets the geographic location of the InfoBox.
 * @param {LatLng} latlng
 */
InfoBox.prototype.setPosition = function (latlng) {

  this.position_ = latlng;

  if (this.div_) {

    this.draw();
  }

  /**
   * This event is fired when the position of the InfoBox changes.
   * @name InfoBox#position_changed
   * @event
   */
  google.maps.event.trigger(this, "position_changed");
};

/**
 * Sets the zIndex style for the InfoBox.
 * @param {number} index
 */
InfoBox.prototype.setZIndex = function (index) {

  this.zIndex_ = index;

  if (this.div_) {

    this.div_.style.zIndex = index;
  }

  /**
   * This event is fired when the zIndex of the InfoBox changes.
   * @name InfoBox#zindex_changed
   * @event
   */
  google.maps.event.trigger(this, "zindex_changed");
};

/**
 * Sets the visibility of the InfoBox.
 * @param {boolean} isVisible
 */
InfoBox.prototype.setVisible = function (isVisible) {

  this.isHidden_ = !isVisible;
  if (this.div_) {
    this.div_.style.visibility = (this.isHidden_ ? "hidden" : "visible");
  }
};

/**
 * Returns the content of the InfoBox.
 * @returns {string}
 */
InfoBox.prototype.getContent = function () {

  return this.content_;
};

/**
 * Returns the geographic location of the InfoBox.
 * @returns {LatLng}
 */
InfoBox.prototype.getPosition = function () {

  return this.position_;
};

/**
 * Returns the zIndex for the InfoBox.
 * @returns {number}
 */
InfoBox.prototype.getZIndex = function () {

  return this.zIndex_;
};

/**
 * Returns a flag indicating whether the InfoBox is visible.
 * @returns {boolean}
 */
InfoBox.prototype.getVisible = function () {

  var isVisible;

  if ((typeof this.getMap() === "undefined") || (this.getMap() === null)) {
    isVisible = false;
  } else {
    isVisible = !this.isHidden_;
  }
  return isVisible;
};

/**
 * Shows the InfoBox. [Deprecated; use <tt>setVisible</tt> instead.]
 */
InfoBox.prototype.show = function () {

  this.isHidden_ = false;
  if (this.div_) {
    this.div_.style.visibility = "visible";
  }
};

/**
 * Hides the InfoBox. [Deprecated; use <tt>setVisible</tt> instead.]
 */
InfoBox.prototype.hide = function () {

  this.isHidden_ = true;
  if (this.div_) {
    this.div_.style.visibility = "hidden";
  }
};

/**
 * Adds the InfoBox to the specified map or Street View panorama. If <tt>anchor</tt>
 *  (usually a <tt>google.maps.Marker</tt>) is specified, the position
 *  of the InfoBox is set to the position of the <tt>anchor</tt>. If the
 *  anchor is dragged to a new location, the InfoBox moves as well.
 * @param {Map|StreetViewPanorama} map
 * @param {MVCObject} [anchor]
 */
InfoBox.prototype.open = function (map, anchor) {

  var me = this;

  if (anchor) {

    this.position_ = anchor.getPosition();
    this.moveListener_ = google.maps.event.addListener(anchor, "position_changed", function () {
      me.setPosition(this.getPosition());
    });
  }

  this.setMap(map);

  if (this.div_) {

    this.panBox_();
  }
};

/**
 * Removes the InfoBox from the map.
 */
InfoBox.prototype.close = function () {

  var i;

  if (this.closeListener_) {

    google.maps.event.removeListener(this.closeListener_);
    this.closeListener_ = null;
  }

  if (this.eventListeners_) {
    
    for (i = 0; i < this.eventListeners_.length; i++) {

      google.maps.event.removeListener(this.eventListeners_[i]);
    }
    this.eventListeners_ = null;
  }

  if (this.moveListener_) {

    google.maps.event.removeListener(this.moveListener_);
    this.moveListener_ = null;
  }

  if (this.contextListener_) {

    google.maps.event.removeListener(this.contextListener_);
    this.contextListener_ = null;
  }

  this.setMap(null);
};
// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3_3.js
// ==/ClosureCompiler==

/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A Marker Clusterer that clusters markers.
 *
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>=} opt_markers Optional markers to add to
 *   the cluster.
 * @param {Object=} opt_options support the following options:
 *     'gridSize': (number) The grid size of a cluster in pixels.
 *     'maxZoom': (number) The maximum zoom level that a marker can be part of a
 *                cluster.
 *     'zoomOnClick': (boolean) Whether the default behaviour of clicking on a
 *                    cluster is to zoom into it.
 *     'averageCenter': (boolean) Wether the center of each cluster should be
 *                      the average of all markers in the cluster.
 *     'minimumClusterSize': (number) The minimum number of markers to be in a
 *                           cluster before the markers are hidden and a count
 *                           is shown.
 *     'styles': (object) An object that has style properties:
 *       'url': (string) The image url.
 *       'height': (number) The image height.
 *       'width': (number) The image width.
 *       'anchor': (Array) The anchor position of the label text.
 *       'textColor': (string) The text color.
 *       'textSize': (number) The text size.
 *       'backgroundPosition': (string) The position of the backgound x, y.
 * @constructor
 * @extends google.maps.OverlayView
 */
function MarkerClusterer(map, opt_markers, opt_options) {
  // MarkerClusterer implements google.maps.OverlayView interface. We use the
  // extend function to extend MarkerClusterer with google.maps.OverlayView
  // because it might not always be available when the code is defined so we
  // look for it at the last possible moment. If it doesn't exist now then
  // there is no point going ahead :)
  this.extend(MarkerClusterer, google.maps.OverlayView);
  this.map_ = map;

  /**
   * @type {Array.<google.maps.Marker>}
   * @private
   */
  this.markers_ = [];

  /**
   *  @type {Array.<Cluster>}
   */
  this.clusters_ = [];

  this.sizes = [53, 56, 66, 78, 90];

  /**
   * @private
   */
  this.styles_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.ready_ = false;

  var options = opt_options || {};

  /**
   * @type {number}
   * @private
   */
  this.gridSize_ = options['gridSize'] || 60;

  /**
   * @private
   */
  this.minClusterSize_ = options['minimumClusterSize'] || 2;


  /**
   * @type {?number}
   * @private
   */
  this.maxZoom_ = options['maxZoom'] || null;

  this.styles_ = options['styles'] || [];

  /**
   * @type {string}
   * @private
   */
  this.imagePath_ = options['imagePath'] ||
      this.MARKER_CLUSTER_IMAGE_PATH_;

  /**
   * @type {string}
   * @private
   */
  this.imageExtension_ = options['imageExtension'] ||
      this.MARKER_CLUSTER_IMAGE_EXTENSION_;

  /**
   * @type {boolean}
   * @private
   */
  this.zoomOnClick_ = true;

  if (options['zoomOnClick'] != undefined) {
    this.zoomOnClick_ = options['zoomOnClick'];
  }

  /**
   * @type {boolean}
   * @private
   */
  this.averageCenter_ = false;

  if (options['averageCenter'] != undefined) {
    this.averageCenter_ = options['averageCenter'];
  }

  this.setupStyles_();

  this.setMap(map);

  /**
   * @type {number}
   * @private
   */
  this.prevZoom_ = this.map_.getZoom();

  // Add the map event listeners
  var that = this;
  google.maps.event.addListener(this.map_, 'zoom_changed', function() {
    // Determines map type and prevent illegal zoom levels
    var zoom = that.map_.getZoom();
    var minZoom = that.map_.minZoom || 0;
    var maxZoom = Math.min(that.map_.maxZoom || 100,
                         that.map_.mapTypes[that.map_.getMapTypeId()].maxZoom);
    zoom = Math.min(Math.max(zoom,minZoom),maxZoom);

    if (that.prevZoom_ != zoom) {
      that.prevZoom_ = zoom;
      that.resetViewport();
    }
  });

  google.maps.event.addListener(this.map_, 'idle', function() {
    that.redraw();
  });

  // Finally, add the markers
  if (opt_markers && (opt_markers.length || Object.keys(opt_markers).length)) {
    this.addMarkers(opt_markers, false);
  }
}


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ =
    'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/' +
    'images/m';


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';


/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
  this.setReady_(true);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() {};

/**
 * Sets up the styles object.
 *
 * @private
 */
MarkerClusterer.prototype.setupStyles_ = function() {
  if (this.styles_.length) {
    return;
  }

  for (var i = 0, size; size = this.sizes[i]; i++) {
    this.styles_.push({
      url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
      height: size,
      width: size
    });
  }
};

/**
 *  Fit the map to the bounds of the markers in the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function() {
  var markers = this.getMarkers();
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }

  this.map_.fitBounds(bounds);
};


/**
 *  Sets the styles.
 *
 *  @param {Object} styles The style to set.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
  this.styles_ = styles;
};


/**
 *  Gets the styles.
 *
 *  @return {Object} The styles object.
 */
MarkerClusterer.prototype.getStyles = function() {
  return this.styles_;
};


/**
 * Whether zoom on click is set.
 *
 * @return {boolean} True if zoomOnClick_ is set.
 */
MarkerClusterer.prototype.isZoomOnClick = function() {
  return this.zoomOnClick_;
};

/**
 * Whether average center is set.
 *
 * @return {boolean} True if averageCenter_ is set.
 */
MarkerClusterer.prototype.isAverageCenter = function() {
  return this.averageCenter_;
};


/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The markers.
 */
MarkerClusterer.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 *  Returns the number of markers in the clusterer
 *
 *  @return {Number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
  return this.markers_.length;
};


/**
 *  Sets the max zoom for the clusterer.
 *
 *  @param {number} maxZoom The max zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
  this.maxZoom_ = maxZoom;
};


/**
 *  Gets the max zoom for the clusterer.
 *
 *  @return {number} The max zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
  return this.maxZoom_;
};


/**
 *  The function for calculating the cluster icon image.
 *
 *  @param {Array.<google.maps.Marker>} markers The markers in the clusterer.
 *  @param {number} numStyles The number of styles available.
 *  @return {Object} A object properties: 'text' (string) and 'index' (number).
 *  @private
 */
MarkerClusterer.prototype.calculator_ = function(markers, numStyles) {
  var index = 0;
  var count = markers.length;
  var dv = count;
  while (dv !== 0) {
    dv = parseInt(dv / 10, 10);
    index++;
  }

  index = Math.min(index, numStyles);
  return {
    text: count,
    index: index
  };
};


/**
 * Set the calculator function.
 *
 * @param {function(Array, number)} calculator The function to set as the
 *     calculator. The function should return a object properties:
 *     'text' (string) and 'index' (number).
 *
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
  this.calculator_ = calculator;
};


/**
 * Get the calculator function.
 *
 * @return {function(Array, number)} the calculator function.
 */
MarkerClusterer.prototype.getCalculator = function() {
  return this.calculator_;
};


/**
 * Add an array of markers to the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
  if (markers.length) {
    for (var i = 0, marker; marker = markers[i]; i++) {
      this.pushMarkerTo_(marker);
    }
  } else if (Object.keys(markers).length) {
    for (var marker in markers) {
      this.pushMarkerTo_(markers[marker]);
    }
  }
  if (!opt_nodraw) {
    this.redraw();
  }
};


/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
  marker.isAdded = false;
  if (marker['draggable']) {
    // If the marker is draggable add a listener so we update the clusters on
    // the drag end.
    var that = this;
    google.maps.event.addListener(marker, 'dragend', function() {
      marker.isAdded = false;
      that.repaint();
    });
  }
  this.markers_.push(marker);
};


/**
 * Adds a marker to the clusterer and redraws if needed.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
  this.pushMarkerTo_(marker);
  if (!opt_nodraw) {
    this.redraw();
  }
};


/**
 * Removes a marker and returns true if removed, false if not
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 * @private
 */
MarkerClusterer.prototype.removeMarker_ = function(marker) {
  var index = -1;
  if (this.markers_.indexOf) {
    index = this.markers_.indexOf(marker);
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        index = i;
        break;
      }
    }
  }

  if (index == -1) {
    // Marker is not in our list of markers.
    return false;
  }

  marker.setMap(null);

  this.markers_.splice(index, 1);

  return true;
};


/**
 * Remove a marker from the cluster.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 * @return {boolean} True if the marker was removed.
 */
MarkerClusterer.prototype.removeMarker = function(marker, opt_nodraw) {
  var removed = this.removeMarker_(marker);

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  } else {
   return false;
  }
};


/**
 * Removes an array of markers from the cluster.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 */
MarkerClusterer.prototype.removeMarkers = function(markers, opt_nodraw) {
  var removed = false;

  for (var i = 0, marker; marker = markers[i]; i++) {
    var r = this.removeMarker_(marker);
    removed = removed || r;
  }

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  }
};


/**
 * Sets the clusterer's ready state.
 *
 * @param {boolean} ready The state.
 * @private
 */
MarkerClusterer.prototype.setReady_ = function(ready) {
  if (!this.ready_) {
    this.ready_ = ready;
    this.createClusters_();
  }
};


/**
 * Returns the number of clusters in the clusterer.
 *
 * @return {number} The number of clusters.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
  return this.clusters_.length;
};


/**
 * Returns the google map that the clusterer is associated with.
 *
 * @return {google.maps.Map} The map.
 */
MarkerClusterer.prototype.getMap = function() {
  return this.map_;
};


/**
 * Sets the google map that the clusterer is associated with.
 *
 * @param {google.maps.Map} map The map.
 */
MarkerClusterer.prototype.setMap = function(map) {
  this.map_ = map;
};


/**
 * Returns the size of the grid.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
  return this.gridSize_;
};


/**
 * Sets the size of the grid.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(size) {
  this.gridSize_ = size;
};


/**
 * Returns the min cluster size.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getMinClusterSize = function() {
  return this.minClusterSize_;
};

/**
 * Sets the min cluster size.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setMinClusterSize = function(size) {
  this.minClusterSize_ = size;
};


/**
 * Extends a bounds object by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
  var projection = this.getProjection();

  // Turn the bounds into latlng.
  var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
      bounds.getNorthEast().lng());
  var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
      bounds.getSouthWest().lng());

  // Convert the points to pixels and the extend out by the grid size.
  var trPix = projection.fromLatLngToDivPixel(tr);
  trPix.x += this.gridSize_;
  trPix.y -= this.gridSize_;

  var blPix = projection.fromLatLngToDivPixel(bl);
  blPix.x -= this.gridSize_;
  blPix.y += this.gridSize_;

  // Convert the pixel points back to LatLng
  var ne = projection.fromDivPixelToLatLng(trPix);
  var sw = projection.fromDivPixelToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
};


/**
 * Determins if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 * @private
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
  return bounds.contains(marker.getPosition());
};


/**
 * Clears all clusters and markers from the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
  this.resetViewport(true);

  // Set the markers a empty array.
  this.markers_ = [];
};


/**
 * Clears all existing clusters and recreates them.
 * @param {boolean} opt_hide To also hide the marker.
 */
MarkerClusterer.prototype.resetViewport = function(opt_hide) {
  // Remove all the clusters
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    cluster.remove();
  }

  // Reset the markers to not be added and to be invisible.
  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    marker.isAdded = false;
    if (opt_hide) {
      marker.setMap(null);
    }
  }

  this.clusters_ = [];
};

/**
 *
 */
MarkerClusterer.prototype.repaint = function() {
  var oldClusters = this.clusters_.slice();
  this.clusters_.length = 0;
  this.resetViewport();
  this.redraw();

  // Remove the old clusters.
  // Do it in a timeout so the other clusters have been drawn first.
  window.setTimeout(function() {
    for (var i = 0, cluster; cluster = oldClusters[i]; i++) {
      cluster.remove();
    }
  }, 0);
};


/**
 * Redraws the clusters.
 */
MarkerClusterer.prototype.redraw = function() {
  this.createClusters_();
};


/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
MarkerClusterer.prototype.distanceBetweenPoints_ = function(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};


/**
 * Add a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
  var distance = 40000; // Some large number
  var clusterToAddTo = null;
  var pos = marker.getPosition();
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    var center = cluster.getCenter();
    if (center) {
      var d = this.distanceBetweenPoints_(center, marker.getPosition());
      if (d < distance) {
        distance = d;
        clusterToAddTo = cluster;
      }
    }
  }

  if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
    clusterToAddTo.addMarker(marker);
  } else {
    var cluster = new Cluster(this);
    cluster.addMarker(marker);
    this.clusters_.push(cluster);
  }
};


/**
 * Creates the clusters.
 *
 * @private
 */
MarkerClusterer.prototype.createClusters_ = function() {
  if (!this.ready_) {
    return;
  }

  // Get our current map view bounds.
  // Create a new bounds object so we don't affect the map.
  var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
      this.map_.getBounds().getNorthEast());
  var bounds = this.getExtendedBounds(mapBounds);

  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
      this.addToClosestCluster_(marker);
    }
  }
};


/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(markerClusterer) {
  this.markerClusterer_ = markerClusterer;
  this.map_ = markerClusterer.getMap();
  this.gridSize_ = markerClusterer.getGridSize();
  this.minClusterSize_ = markerClusterer.getMinClusterSize();
  this.averageCenter_ = markerClusterer.isAverageCenter();
  this.center_ = null;
  this.markers_ = [];
  this.bounds_ = null;
  this.clusterIcon_ = new ClusterIcon(this, markerClusterer.getStyles(),
      markerClusterer.getGridSize());
}

/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
  if (this.markers_.indexOf) {
    return this.markers_.indexOf(marker) != -1;
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
  if (this.isMarkerAlreadyAdded(marker)) {
    return false;
  }

  if (!this.center_) {
    this.center_ = marker.getPosition();
    this.calculateBounds_();
  } else {
    if (this.averageCenter_) {
      var l = this.markers_.length + 1;
      var lat = (this.center_.lat() * (l-1) + marker.getPosition().lat()) / l;
      var lng = (this.center_.lng() * (l-1) + marker.getPosition().lng()) / l;
      this.center_ = new google.maps.LatLng(lat, lng);
      this.calculateBounds_();
    }
  }

  marker.isAdded = true;
  this.markers_.push(marker);

  var len = this.markers_.length;
  if (len < this.minClusterSize_ && marker.getMap() != this.map_) {
    // Min cluster size not reached so show the marker.
    marker.setMap(this.map_);
  }

  if (len == this.minClusterSize_) {
    // Hide the markers that were showing.
    for (var i = 0; i < len; i++) {
      this.markers_[i].setMap(null);
    }
  }

  if (len >= this.minClusterSize_) {
    marker.setMap(null);
  }

  this.updateIcon();
  return true;
};


/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getMarkerClusterer = function() {
  return this.markerClusterer_;
};


/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  var markers = this.getMarkers();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }
  return bounds;
};


/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
  this.clusterIcon_.remove();
  this.markers_.length = 0;
  delete this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {number} The cluster center.
 */
Cluster.prototype.getSize = function() {
  return this.markers_.length;
};


/**
 * Returns the center of the cluster.
 *
 * @return {Array.<google.maps.Marker>} The cluster center.
 */
Cluster.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
  return this.center_;
};


/**
 * Calculated the extended bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};


/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
  return this.bounds_.contains(marker.getPosition());
};


/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
  return this.map_;
};


/**
 * Updates the cluster icon
 */
Cluster.prototype.updateIcon = function() {
  var zoom = this.map_.getZoom();
  var mz = this.markerClusterer_.getMaxZoom();

  if (mz && zoom > mz) {
    // The zoom is greater than our max zoom so show all the markers in cluster.
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
      marker.setMap(this.map_);
    }
    return;
  }

  if (this.markers_.length < this.minClusterSize_) {
    // Min cluster size not yet reached.
    this.clusterIcon_.hide();
    return;
  }

  var numStyles = this.markerClusterer_.getStyles().length;
  var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
  this.clusterIcon_.setCenter(this.center_);
  this.clusterIcon_.setSums(sums);
  this.clusterIcon_.show();
};


/**
 * A cluster icon
 *
 * @param {Cluster} cluster The cluster to be associated with.
 * @param {Object} styles An object that has style properties:
 *     'url': (string) The image url.
 *     'height': (number) The image height.
 *     'width': (number) The image width.
 *     'anchor': (Array) The anchor position of the label text.
 *     'textColor': (string) The text color.
 *     'textSize': (number) The text size.
 *     'backgroundPosition: (string) The background postition x, y.
 * @param {number=} opt_padding Optional padding to apply to the cluster icon.
 * @constructor
 * @extends google.maps.OverlayView
 * @ignore
 */
function ClusterIcon(cluster, styles, opt_padding) {
  cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);

  this.styles_ = styles;
  this.padding_ = opt_padding || 0;
  this.cluster_ = cluster;
  this.center_ = null;
  this.map_ = cluster.getMap();
  this.div_ = null;
  this.sums_ = null;
  this.visible_ = false;

  this.setMap(this.map_);
}


/**
 * Triggers the clusterclick event and zoom's if the option is set.
 */
ClusterIcon.prototype.triggerClusterClick = function() {
  var markerClusterer = this.cluster_.getMarkerClusterer();

  // Trigger the clusterclick event.
  google.maps.event.trigger(markerClusterer, 'clusterclick', this.cluster_);

  if (markerClusterer.isZoomOnClick()) {
    // Zoom into the cluster.
    this.map_.fitBounds(this.cluster_.getBounds());
  }
};


/**
 * Adding the cluster icon to the dom.
 * @ignore
 */
ClusterIcon.prototype.onAdd = function() {
  this.div_ = document.createElement('DIV');
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    this.div_.innerHTML = this.sums_.text;
  }

  var panes = this.getPanes();
  panes.overlayMouseTarget.appendChild(this.div_);

  var that = this;
  google.maps.event.addDomListener(this.div_, 'click', function() {
    that.triggerClusterClick();
  });
};


/**
 * Returns the position to place the div dending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 * @private
 */
ClusterIcon.prototype.getPosFromLatLng_ = function(latlng) {
  var pos = this.getProjection().fromLatLngToDivPixel(latlng);
  pos.x -= parseInt(this.width_ / 2, 10);
  pos.y -= parseInt(this.height_ / 2, 10);
  return pos;
};


/**
 * Draw the icon.
 * @ignore
 */
ClusterIcon.prototype.draw = function() {
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.top = pos.y + 'px';
    this.div_.style.left = pos.x + 'px';
  }
};


/**
 * Hide the icon.
 */
ClusterIcon.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.display = 'none';
  }
  this.visible_ = false;
};


/**
 * Position and show the icon.
 */
ClusterIcon.prototype.show = function() {
  if (this.div_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    this.div_.style.display = '';
  }
  this.visible_ = true;
};


/**
 * Remove the icon from the map
 */
ClusterIcon.prototype.remove = function() {
  this.setMap(null);
};


/**
 * Implementation of the onRemove interface.
 * @ignore
 */
ClusterIcon.prototype.onRemove = function() {
  if (this.div_ && this.div_.parentNode) {
    this.hide();
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};


/**
 * Set the sums of the icon.
 *
 * @param {Object} sums The sums containing:
 *   'text': (string) The text to display in the icon.
 *   'index': (number) The style index of the icon.
 */
ClusterIcon.prototype.setSums = function(sums) {
  this.sums_ = sums;
  this.text_ = sums.text;
  this.index_ = sums.index;
  if (this.div_) {
    this.div_.innerHTML = sums.text;
  }

  this.useStyle();
};


/**
 * Sets the icon to the the styles.
 */
ClusterIcon.prototype.useStyle = function() {
  var index = Math.max(0, this.sums_.index - 1);
  index = Math.min(this.styles_.length - 1, index);
  var style = this.styles_[index];
  this.url_ = style['url'];
  this.height_ = style['height'];
  this.width_ = style['width'];
  this.textColor_ = style['textColor'];
  this.anchor_ = style['anchor'];
  this.textSize_ = style['textSize'];
  this.backgroundPosition_ = style['backgroundPosition'];
};


/**
 * Sets the center of the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function(center) {
  this.center_ = center;
};


/**
 * Create the css text based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position.
 * @return {string} The css style text.
 */
ClusterIcon.prototype.createCss = function(pos) {
  var style = [];
  style.push('background-image:url(' + this.url_ + ');');
  var backgroundPosition = this.backgroundPosition_ ? this.backgroundPosition_ : '0 0';
  style.push('background-position:' + backgroundPosition + ';');

  if (typeof this.anchor_ === 'object') {
    if (typeof this.anchor_[0] === 'number' && this.anchor_[0] > 0 &&
        this.anchor_[0] < this.height_) {
      style.push('height:' + (this.height_ - this.anchor_[0]) +
          'px; padding-top:' + this.anchor_[0] + 'px;');
    } else {
      style.push('height:' + this.height_ + 'px; line-height:' + this.height_ +
          'px;');
    }
    if (typeof this.anchor_[1] === 'number' && this.anchor_[1] > 0 &&
        this.anchor_[1] < this.width_) {
      style.push('width:' + (this.width_ - this.anchor_[1]) +
          'px; padding-left:' + this.anchor_[1] + 'px;');
    } else {
      style.push('width:' + this.width_ + 'px; text-align:center;');
    }
  } else {
    style.push('height:' + this.height_ + 'px; line-height:' +
        this.height_ + 'px; width:' + this.width_ + 'px; text-align:center;');
  }

  var txtColor = this.textColor_ ? this.textColor_ : 'black';
  var txtSize = this.textSize_ ? this.textSize_ : 11;

  style.push('cursor:pointer; top:' + pos.y + 'px; left:' +
      pos.x + 'px; color:' + txtColor + '; position:absolute; font-size:' +
      txtSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
  return style.join('');
};


// Export Symbols for Closure
// If you are not going to compile with closure then you can remove the
// code below.
window['MarkerClusterer'] = MarkerClusterer;
MarkerClusterer.prototype['addMarker'] = MarkerClusterer.prototype.addMarker;
MarkerClusterer.prototype['addMarkers'] = MarkerClusterer.prototype.addMarkers;
MarkerClusterer.prototype['clearMarkers'] =
    MarkerClusterer.prototype.clearMarkers;
MarkerClusterer.prototype['fitMapToMarkers'] =
    MarkerClusterer.prototype.fitMapToMarkers;
MarkerClusterer.prototype['getCalculator'] =
    MarkerClusterer.prototype.getCalculator;
MarkerClusterer.prototype['getGridSize'] =
    MarkerClusterer.prototype.getGridSize;
MarkerClusterer.prototype['getExtendedBounds'] =
    MarkerClusterer.prototype.getExtendedBounds;
MarkerClusterer.prototype['getMap'] = MarkerClusterer.prototype.getMap;
MarkerClusterer.prototype['getMarkers'] = MarkerClusterer.prototype.getMarkers;
MarkerClusterer.prototype['getMaxZoom'] = MarkerClusterer.prototype.getMaxZoom;
MarkerClusterer.prototype['getStyles'] = MarkerClusterer.prototype.getStyles;
MarkerClusterer.prototype['getTotalClusters'] =
    MarkerClusterer.prototype.getTotalClusters;
MarkerClusterer.prototype['getTotalMarkers'] =
    MarkerClusterer.prototype.getTotalMarkers;
MarkerClusterer.prototype['redraw'] = MarkerClusterer.prototype.redraw;
MarkerClusterer.prototype['removeMarker'] =
    MarkerClusterer.prototype.removeMarker;
MarkerClusterer.prototype['removeMarkers'] =
    MarkerClusterer.prototype.removeMarkers;
MarkerClusterer.prototype['resetViewport'] =
    MarkerClusterer.prototype.resetViewport;
MarkerClusterer.prototype['repaint'] =
    MarkerClusterer.prototype.repaint;
MarkerClusterer.prototype['setCalculator'] =
    MarkerClusterer.prototype.setCalculator;
MarkerClusterer.prototype['setGridSize'] =
    MarkerClusterer.prototype.setGridSize;
MarkerClusterer.prototype['setMaxZoom'] =
    MarkerClusterer.prototype.setMaxZoom;
MarkerClusterer.prototype['onAdd'] = MarkerClusterer.prototype.onAdd;
MarkerClusterer.prototype['draw'] = MarkerClusterer.prototype.draw;

Cluster.prototype['getCenter'] = Cluster.prototype.getCenter;
Cluster.prototype['getSize'] = Cluster.prototype.getSize;
Cluster.prototype['getMarkers'] = Cluster.prototype.getMarkers;

ClusterIcon.prototype['onAdd'] = ClusterIcon.prototype.onAdd;
ClusterIcon.prototype['draw'] = ClusterIcon.prototype.draw;
ClusterIcon.prototype['onRemove'] = ClusterIcon.prototype.onRemove;

Object.keys = Object.keys || function(o) {  
    var result = [];  
    for(var name in o) {  
        if (o.hasOwnProperty(name))  
          result.push(name);  
    }  
    return result;  
};
/*!
 * Custom maps v3
 */

var map;
var idInfoBoxAberto;
var infoBox = [];
var markers = [];

function initialize() {	
	var latlng = new google.maps.LatLng(-18.8800397, -47.05878999999999);
	
    var options = {
        zoom: 5,
		center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("mapa"), options);
}

initialize();

function abrirInfoBox(id, marker) {
	if (typeof(idInfoBoxAberto) == 'number' && typeof(infoBox[idInfoBoxAberto]) == 'object') {
		infoBox[idInfoBoxAberto].close();
	}

	infoBox[id].open(map, marker);
	idInfoBoxAberto = id;
}

var url_json = '/imoveis-json/';

function carregarPontos() {
	
	$.getJSON(url_json, function(pontos) {
		
		var latlngbounds = new google.maps.LatLngBounds();
		
		$.each(pontos, function(index, ponto) {
			
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(ponto.Latitude, ponto.Longitude),
				title: "Mobiliados"
				// icon: '/static/img/marker.png'
			});
			
			var myOptions = {
				content: "<p>" + ponto.Descricao + "</p>",
				pixelOffset: new google.maps.Size(-150, 0),
				infoBoxClearance: new google.maps.Size(1, 1)
        	};

			infoBox[ponto.Id] = new InfoBox(myOptions);
			infoBox[ponto.Id].marker = marker;
			
			infoBox[ponto.Id].listener = google.maps.event.addListener(marker, 'click', function (e) {
				abrirInfoBox(ponto.Id, marker);
			});
			
			markers.push(marker);
			
			latlngbounds.extend(marker.position);
			
		});
		
		var markerCluster = new MarkerClusterer(map, markers);
		
		map.fitBounds(latlngbounds);
		
	});
	
}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(a){a=a||{};google.maps.OverlayView.apply(this,arguments);this.content_=a.content||"";this.disableAutoPan_=a.disableAutoPan||false;this.maxWidth_=a.maxWidth||0;this.pixelOffset_=a.pixelOffset||new google.maps.Size(0,0);this.position_=a.position||new google.maps.LatLng(0,0);this.zIndex_=a.zIndex||null;this.boxClass_=a.boxClass||"infoBox";this.boxStyle_=a.boxStyle||{};this.closeBoxMargin_=a.closeBoxMargin||"2px";this.closeBoxURL_=a.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(a.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=a.infoBoxClearance||new google.maps.Size(1,1);if(typeof a.visible==="undefined"){if(typeof a.isHidden==="undefined"){a.visible=true}else{a.visible=!a.isHidden}}this.isHidden_=!a.visible;this.alignBottom_=a.alignBottom||false;this.pane_=a.pane||"floatPane";this.enableEventPropagation_=a.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var b;var a;var f;var c=this;var d=function(g){g.cancelBubble=true;if(g.stopPropagation){g.stopPropagation()}};var e=function(g){g.returnValue=false;if(g.preventDefault){g.preventDefault()}if(!c.enableEventPropagation_){d(g)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{f=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-f.left-f.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];a=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(b=0;b<a.length;b++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,a[b],d))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(g){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",e);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var a="";if(this.closeBoxURL_!==""){a="<img";a+=" src='"+this.closeBoxURL_+"'";a+=" align=right";a+=" style='";a+=" position: relative;";a+=" cursor: pointer;";a+=" margin: "+this.closeBoxMargin_+";";a+="'>"}return a};InfoBox.prototype.addClickHandler_=function(){var a;if(this.closeBoxURL_!==""){a=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(a,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var a=this;return function(b){b.cancelBubble=true;if(b.stopPropagation){b.stopPropagation()}google.maps.event.trigger(a,"closeclick");a.close()}};InfoBox.prototype.panBox_=function(o){var d;var b;var m=0,i=0;if(!o){d=this.getMap();if(d instanceof google.maps.Map){if(!d.getBounds().contains(this.position_)){d.setCenter(this.position_)}b=d.getBounds();var q=d.getDiv();var j=q.offsetWidth;var l=q.offsetHeight;var f=this.pixelOffset_.width;var e=this.pixelOffset_.height;var k=this.div_.offsetWidth;var p=this.div_.offsetHeight;var h=this.infoBoxClearance_.width;var g=this.infoBoxClearance_.height;var a=this.getProjection().fromLatLngToContainerPixel(this.position_);if(a.x<(-f+h)){m=a.x+f-h}else{if((a.x+k+f+h)>j){m=a.x+k+f+h-j}}if(this.alignBottom_){if(a.y<(-e+g+p)){i=a.y+e-g-p}else{if((a.y+e+g)>l){i=a.y+e+g-l}}}else{if(a.y<(-e+g)){i=a.y+e-g}else{if((a.y+p+e+g)>l){i=a.y+p+e+g-l}}}if(!(m===0&&i===0)){var n=d.getCenter();d.panBy(m,i)}}}};InfoBox.prototype.setBoxStyle_=function(){var a,b;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";b=this.boxStyle_;for(a in b){if(b.hasOwnProperty(a)){this.div_.style[a]=b[a]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var a;var c={top:0,bottom:0,left:0,right:0};var b=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){a=b.ownerDocument.defaultView.getComputedStyle(b,"");if(a){c.top=parseInt(a.borderTopWidth,10)||0;c.bottom=parseInt(a.borderBottomWidth,10)||0;c.left=parseInt(a.borderLeftWidth,10)||0;c.right=parseInt(a.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(b.currentStyle){c.top=parseInt(b.currentStyle.borderTopWidth,10)||0;c.bottom=parseInt(b.currentStyle.borderBottomWidth,10)||0;c.left=parseInt(b.currentStyle.borderLeftWidth,10)||0;c.right=parseInt(b.currentStyle.borderRightWidth,10)||0}}}return c};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var a=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(a.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(a.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(a.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(a){if(typeof a.boxClass!=="undefined"){this.boxClass_=a.boxClass;this.setBoxStyle_()}if(typeof a.boxStyle!=="undefined"){this.boxStyle_=a.boxStyle;this.setBoxStyle_()}if(typeof a.content!=="undefined"){this.setContent(a.content)}if(typeof a.disableAutoPan!=="undefined"){this.disableAutoPan_=a.disableAutoPan}if(typeof a.maxWidth!=="undefined"){this.maxWidth_=a.maxWidth}if(typeof a.pixelOffset!=="undefined"){this.pixelOffset_=a.pixelOffset}if(typeof a.alignBottom!=="undefined"){this.alignBottom_=a.alignBottom}if(typeof a.position!=="undefined"){this.setPosition(a.position)}if(typeof a.zIndex!=="undefined"){this.setZIndex(a.zIndex)}if(typeof a.closeBoxMargin!=="undefined"){this.closeBoxMargin_=a.closeBoxMargin}if(typeof a.closeBoxURL!=="undefined"){this.closeBoxURL_=a.closeBoxURL}if(typeof a.infoBoxClearance!=="undefined"){this.infoBoxClearance_=a.infoBoxClearance}if(typeof a.isHidden!=="undefined"){this.isHidden_=a.isHidden}if(typeof a.visible!=="undefined"){this.isHidden_=!a.visible}if(typeof a.enableEventPropagation!=="undefined"){this.enableEventPropagation_=a.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(a){this.content_=a;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(a){this.position_=a;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(a){this.zIndex_=a;if(this.div_){this.div_.style.zIndex=a}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(a){this.isHidden_=!a;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var a;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){a=false}else{a=!this.isHidden_}return a};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(c,a){var b=this;if(a){this.position_=a.getPosition();this.moveListener_=google.maps.event.addListener(a,"position_changed",function(){b.setPosition(this.getPosition())})}this.setMap(c);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var a;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(a=0;a<this.eventListeners_.length;a++){google.maps.event.removeListener(this.eventListeners_[a])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(e,a,d){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=e;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var b=d||{};this.gridSize_=b.gridSize||60;this.minClusterSize_=b.minimumClusterSize||2;this.maxZoom_=b.maxZoom||null;this.styles_=b.styles||[];this.imagePath_=b.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=b.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(b.zoomOnClick!=undefined){this.zoomOnClick_=b.zoomOnClick}this.averageCenter_=false;if(b.averageCenter!=undefined){this.averageCenter_=b.averageCenter}this.setupStyles_();this.setMap(e);this.prevZoom_=this.map_.getZoom();var c=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var g=c.map_.getZoom();var h=c.map_.minZoom||0;var f=Math.min(c.map_.maxZoom||100,c.map_.mapTypes[c.map_.getMapTypeId()].maxZoom);g=Math.min(Math.max(g,h),f);if(c.prevZoom_!=g){c.prevZoom_=g;c.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){c.redraw()});if(a&&(a.length||Object.keys(a).length)){this.addMarkers(a,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(b,a){return(function(c){for(var d in c.prototype){this.prototype[d]=c.prototype[d]}return this}).apply(b,[a])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var b=0,a;a=this.sizes[b];b++){this.styles_.push({url:this.imagePath_+(b+1)+"."+this.imageExtension_,height:a,width:a})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var d=this.getMarkers();var c=new google.maps.LatLngBounds();for(var b=0,a;a=d[b];b++){c.extend(a.getPosition())}this.map_.fitBounds(c)};MarkerClusterer.prototype.setStyles=function(a){this.styles_=a};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(a){this.maxZoom_=a};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(e,d){var a=0;var c=e.length;var b=c;while(b!==0){b=parseInt(b/10,10);a++}a=Math.min(a,d);return{text:c,index:a}};MarkerClusterer.prototype.setCalculator=function(a){this.calculator_=a};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(d,c){if(d.length){for(var b=0,a;a=d[b];b++){this.pushMarkerTo_(a)}}else{if(Object.keys(d).length){for(var a in d){this.pushMarkerTo_(d[a])}}}if(!c){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(a){a.isAdded=false;if(a.draggable){var b=this;google.maps.event.addListener(a,"dragend",function(){a.isAdded=false;b.repaint()})}this.markers_.push(a)};MarkerClusterer.prototype.addMarker=function(a,b){this.pushMarkerTo_(a);if(!b){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(b){var c=-1;if(this.markers_.indexOf){c=this.markers_.indexOf(b)}else{for(var d=0,a;a=this.markers_[d];d++){if(a==b){c=d;break}}}if(c==-1){return false}b.setMap(null);this.markers_.splice(c,1);return true};MarkerClusterer.prototype.removeMarker=function(a,b){var c=this.removeMarker_(a);if(!b&&c){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(f,c){var e=false;for(var b=0,a;a=f[b];b++){var d=this.removeMarker_(a);e=e||d}if(!c&&e){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(a){if(!this.ready_){this.ready_=a;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(a){this.map_=a};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(a){this.gridSize_=a};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(a){this.minClusterSize_=a};MarkerClusterer.prototype.getExtendedBounds=function(e){var c=this.getProjection();var f=new google.maps.LatLng(e.getNorthEast().lat(),e.getNorthEast().lng());var h=new google.maps.LatLng(e.getSouthWest().lat(),e.getSouthWest().lng());var d=c.fromLatLngToDivPixel(f);d.x+=this.gridSize_;d.y-=this.gridSize_;var b=c.fromLatLngToDivPixel(h);b.x-=this.gridSize_;b.y+=this.gridSize_;var g=c.fromDivPixelToLatLng(d);var a=c.fromDivPixelToLatLng(b);e.extend(g);e.extend(a);return e};MarkerClusterer.prototype.isMarkerInBounds_=function(a,b){return b.contains(a.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(d){for(var c=0,a;a=this.clusters_[c];c++){a.remove()}for(var c=0,b;b=this.markers_[c];c++){b.isAdded=false;if(d){b.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var a=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var c=0,b;b=a[c];c++){b.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(j,h){if(!j||!h){return 0}var g=6371;var e=(h.lat()-j.lat())*Math.PI/180;var f=(h.lng()-j.lng())*Math.PI/180;var b=Math.sin(e/2)*Math.sin(e/2)+Math.cos(j.lat()*Math.PI/180)*Math.cos(h.lat()*Math.PI/180)*Math.sin(f/2)*Math.sin(f/2);var k=2*Math.atan2(Math.sqrt(b),Math.sqrt(1-b));var i=g*k;return i};MarkerClusterer.prototype.addToClosestCluster_=function(c){var j=40000;var f=null;var h=c.getPosition();for(var e=0,b;b=this.clusters_[e];e++){var a=b.getCenter();if(a){var g=this.distanceBetweenPoints_(a,c.getPosition());if(g<j){j=g;f=b}}}if(f&&f.isMarkerInClusterBounds(c)){f.addMarker(c)}else{var b=new Cluster(this);b.addMarker(c);this.clusters_.push(b)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var b=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var d=this.getExtendedBounds(b);for(var c=0,a;a=this.markers_[c];c++){if(!a.isAdded&&this.isMarkerInBounds_(a,d)){this.addToClosestCluster_(a)}}};function Cluster(a){this.markerClusterer_=a;this.map_=a.getMap();this.gridSize_=a.getGridSize();this.minClusterSize_=a.getMinClusterSize();this.averageCenter_=a.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,a.getStyles(),a.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(b){if(this.markers_.indexOf){return this.markers_.indexOf(b)!=-1}else{for(var c=0,a;a=this.markers_[c];c++){if(a==b){return true}}}return false};Cluster.prototype.addMarker=function(c){if(this.isMarkerAlreadyAdded(c)){return false}if(!this.center_){this.center_=c.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var b=this.markers_.length+1;var f=(this.center_.lat()*(b-1)+c.getPosition().lat())/b;var d=(this.center_.lng()*(b-1)+c.getPosition().lng())/b;this.center_=new google.maps.LatLng(f,d);this.calculateBounds_()}}c.isAdded=true;this.markers_.push(c);var a=this.markers_.length;if(a<this.minClusterSize_&&c.getMap()!=this.map_){c.setMap(this.map_)}if(a==this.minClusterSize_){for(var e=0;e<a;e++){this.markers_[e].setMap(null)}}if(a>=this.minClusterSize_){c.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var c=new google.maps.LatLngBounds(this.center_,this.center_);var d=this.getMarkers();for(var b=0,a;a=d[b];b++){c.extend(a.getPosition())}return c};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(a)};Cluster.prototype.isMarkerInClusterBounds=function(a){return this.bounds_.contains(a.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var e=this.map_.getZoom();var f=this.markerClusterer_.getMaxZoom();if(f&&e>f){for(var c=0,a;a=this.markers_[c];c++){a.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var d=this.markerClusterer_.getStyles().length;var b=this.markerClusterer_.getCalculator()(this.markers_,d);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(b);this.clusterIcon_.show()};function ClusterIcon(a,c,b){a.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=c;this.padding_=b||0;this.cluster_=a;this.center_=null;this.map_=a.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var a=this.cluster_.getMarkerClusterer();google.maps.event.trigger(a,"clusterclick",this.cluster_);if(a.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var c=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(c);this.div_.innerHTML=this.sums_.text}var a=this.getPanes();a.overlayMouseTarget.appendChild(this.div_);var b=this;google.maps.event.addDomListener(this.div_,"click",function(){b.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(b){var a=this.getProjection().fromLatLngToDivPixel(b);a.x-=parseInt(this.width_/2,10);a.y-=parseInt(this.height_/2,10);return a};ClusterIcon.prototype.draw=function(){if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.top=a.y+"px";this.div_.style.left=a.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(a){this.sums_=a;this.text_=a.text;this.index_=a.index;if(this.div_){this.div_.innerHTML=a.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var a=Math.max(0,this.sums_.index-1);a=Math.min(this.styles_.length-1,a);var b=this.styles_[a];this.url_=b.url;this.height_=b.height;this.width_=b.width;this.textColor_=b.textColor;this.anchor_=b.anchor;this.textSize_=b.textSize;this.backgroundPosition_=b.backgroundPosition};ClusterIcon.prototype.setCenter=function(a){this.center_=a};ClusterIcon.prototype.createCss=function(e){var d=[];d.push("background-image:url("+this.url_+");");var b=this.backgroundPosition_?this.backgroundPosition_:"0 0";d.push("background-position:"+b+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){d.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{d.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){d.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{d.push("width:"+this.width_+"px; text-align:center;")}}else{d.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var a=this.textColor_?this.textColor_:"black";var c=this.textSize_?this.textSize_:11;d.push("cursor:pointer; top:"+e.y+"px; left:"+e.x+"px; color:"+a+"; position:absolute; font-size:"+c+"px; font-family:Arial,sans-serif; font-weight:bold");return d.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(c){var a=[];for(var b in c){if(c.hasOwnProperty(b)){a.push(b)}}return a};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var b=new google.maps.LatLng(-18.8800397,-47.05878999999999);var a={zoom:5,center:b,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),a)}initialize();function abrirInfoBox(b,a){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[b].open(map,a);idInfoBoxAberto=b}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(c){var b=new google.maps.LatLngBounds();$.each(c,function(f,g){var e=new google.maps.Marker({position:new google.maps.LatLng(g.Latitude,g.Longitude),title:"Mobiliados"});var d={content:"<p>"+g.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[g.Id]=new InfoBox(d);infoBox[g.Id].marker=e;infoBox[g.Id].listener=google.maps.event.addListener(e,"click",function(h){abrirInfoBox(g.Id,e)});markers.push(e);b.extend(e.position)});var a=new MarkerClusterer(map,markers);map.fitBounds(b)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(b){b=b||{};google.maps.OverlayView.apply(this,arguments);this.content_=b.content||"";this.disableAutoPan_=b.disableAutoPan||false;this.maxWidth_=b.maxWidth||0;this.pixelOffset_=b.pixelOffset||new google.maps.Size(0,0);this.position_=b.position||new google.maps.LatLng(0,0);this.zIndex_=b.zIndex||null;this.boxClass_=b.boxClass||"infoBox";this.boxStyle_=b.boxStyle||{};this.closeBoxMargin_=b.closeBoxMargin||"2px";this.closeBoxURL_=b.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(b.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=b.infoBoxClearance||new google.maps.Size(1,1);if(typeof b.visible==="undefined"){if(typeof b.isHidden==="undefined"){b.visible=true}else{b.visible=!b.isHidden}}this.isHidden_=!b.visible;this.alignBottom_=b.alignBottom||false;this.pane_=b.pane||"floatPane";this.enableEventPropagation_=b.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var g;var h;var i;var l=this;var k=function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}};var j=function(a){a.returnValue=false;if(a.preventDefault){a.preventDefault()}if(!l.enableEventPropagation_){k(a)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{i=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-i.left-i.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];h=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(g=0;g<h.length;g++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,h[g],k))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(a){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",j);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var b="";if(this.closeBoxURL_!==""){b="<img";b+=" src='"+this.closeBoxURL_+"'";b+=" align=right";b+=" style='";b+=" position: relative;";b+=" cursor: pointer;";b+=" margin: "+this.closeBoxMargin_+";";b+="'>"}return b};InfoBox.prototype.addClickHandler_=function(){var b;if(this.closeBoxURL_!==""){b=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(b,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var b=this;return function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}google.maps.event.trigger(b,"closeclick");b.close()}};InfoBox.prototype.panBox_=function(s){var D;var E;var u=0,y=0;if(!s){D=this.getMap();if(D instanceof google.maps.Map){if(!D.getBounds().contains(this.position_)){D.setCenter(this.position_)}E=D.getBounds();var c=D.getDiv();var x=c.offsetWidth;var v=c.offsetHeight;var B=this.pixelOffset_.width;var C=this.pixelOffset_.height;var w=this.div_.offsetWidth;var r=this.div_.offsetHeight;var z=this.infoBoxClearance_.width;var A=this.infoBoxClearance_.height;var F=this.getProjection().fromLatLngToContainerPixel(this.position_);if(F.x<(-B+z)){u=F.x+B-z}else{if((F.x+w+B+z)>x){u=F.x+w+B+z-x}}if(this.alignBottom_){if(F.y<(-C+A+r)){y=F.y+C-A-r}else{if((F.y+C+A)>v){y=F.y+C+A-v}}}else{if(F.y<(-C+A)){y=F.y+C-A}else{if((F.y+r+C+A)>v){y=F.y+r+C+A-v}}}if(!(u===0&&y===0)){var t=D.getCenter();D.panBy(u,y)}}}};InfoBox.prototype.setBoxStyle_=function(){var d,c;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";c=this.boxStyle_;for(d in c){if(c.hasOwnProperty(d)){this.div_.style[d]=c[d]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var e;var f={top:0,bottom:0,left:0,right:0};var d=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){e=d.ownerDocument.defaultView.getComputedStyle(d,"");if(e){f.top=parseInt(e.borderTopWidth,10)||0;f.bottom=parseInt(e.borderBottomWidth,10)||0;f.left=parseInt(e.borderLeftWidth,10)||0;f.right=parseInt(e.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(d.currentStyle){f.top=parseInt(d.currentStyle.borderTopWidth,10)||0;f.bottom=parseInt(d.currentStyle.borderBottomWidth,10)||0;f.left=parseInt(d.currentStyle.borderLeftWidth,10)||0;f.right=parseInt(d.currentStyle.borderRightWidth,10)||0}}}return f};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var b=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(b.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(b.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(b.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(b){if(typeof b.boxClass!=="undefined"){this.boxClass_=b.boxClass;this.setBoxStyle_()}if(typeof b.boxStyle!=="undefined"){this.boxStyle_=b.boxStyle;this.setBoxStyle_()}if(typeof b.content!=="undefined"){this.setContent(b.content)}if(typeof b.disableAutoPan!=="undefined"){this.disableAutoPan_=b.disableAutoPan}if(typeof b.maxWidth!=="undefined"){this.maxWidth_=b.maxWidth}if(typeof b.pixelOffset!=="undefined"){this.pixelOffset_=b.pixelOffset}if(typeof b.alignBottom!=="undefined"){this.alignBottom_=b.alignBottom}if(typeof b.position!=="undefined"){this.setPosition(b.position)}if(typeof b.zIndex!=="undefined"){this.setZIndex(b.zIndex)}if(typeof b.closeBoxMargin!=="undefined"){this.closeBoxMargin_=b.closeBoxMargin}if(typeof b.closeBoxURL!=="undefined"){this.closeBoxURL_=b.closeBoxURL}if(typeof b.infoBoxClearance!=="undefined"){this.infoBoxClearance_=b.infoBoxClearance}if(typeof b.isHidden!=="undefined"){this.isHidden_=b.isHidden}if(typeof b.visible!=="undefined"){this.isHidden_=!b.visible}if(typeof b.enableEventPropagation!=="undefined"){this.enableEventPropagation_=b.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(b){this.content_=b;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(b){this.position_=b;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(b){this.zIndex_=b;if(this.div_){this.div_.style.zIndex=b}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(b){this.isHidden_=!b;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var b;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){b=false}else{b=!this.isHidden_}return b};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(f,e){var d=this;if(e){this.position_=e.getPosition();this.moveListener_=google.maps.event.addListener(e,"position_changed",function(){d.setPosition(this.getPosition())})}this.setMap(f);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var b;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(b=0;b<this.eventListeners_.length;b++){google.maps.event.removeListener(this.eventListeners_[b])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(h,g,i){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=h;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var f=i||{};this.gridSize_=f.gridSize||60;this.minClusterSize_=f.minimumClusterSize||2;this.maxZoom_=f.maxZoom||null;this.styles_=f.styles||[];this.imagePath_=f.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=f.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(f.zoomOnClick!=undefined){this.zoomOnClick_=f.zoomOnClick}this.averageCenter_=false;if(f.averageCenter!=undefined){this.averageCenter_=f.averageCenter}this.setupStyles_();this.setMap(h);this.prevZoom_=this.map_.getZoom();var j=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var b=j.map_.getZoom();var a=j.map_.minZoom||0;var c=Math.min(j.map_.maxZoom||100,j.map_.mapTypes[j.map_.getMapTypeId()].maxZoom);b=Math.min(Math.max(b,a),c);if(j.prevZoom_!=b){j.prevZoom_=b;j.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){j.redraw()});if(g&&(g.length||Object.keys(g).length)){this.addMarkers(g,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(c,d){return(function(b){for(var a in b.prototype){this.prototype[a]=b.prototype[a]}return this}).apply(c,[d])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var c=0,d;d=this.sizes[c];c++){this.styles_.push({url:this.imagePath_+(c+1)+"."+this.imageExtension_,height:d,width:d})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var g=this.getMarkers();var h=new google.maps.LatLngBounds();for(var e=0,f;f=g[e];e++){h.extend(f.getPosition())}this.map_.fitBounds(h)};MarkerClusterer.prototype.setStyles=function(b){this.styles_=b};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(b){this.maxZoom_=b};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(h,i){var g=0;var j=h.length;var f=j;while(f!==0){f=parseInt(f/10,10);g++}g=Math.min(g,i);return{text:j,index:g}};MarkerClusterer.prototype.setCalculator=function(b){this.calculator_=b};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(g,h){if(g.length){for(var e=0,f;f=g[e];e++){this.pushMarkerTo_(f)}}else{if(Object.keys(g).length){for(var f in g){this.pushMarkerTo_(g[f])}}}if(!h){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(d){d.isAdded=false;if(d.draggable){var c=this;google.maps.event.addListener(d,"dragend",function(){d.isAdded=false;c.repaint()})}this.markers_.push(d)};MarkerClusterer.prototype.addMarker=function(d,c){this.pushMarkerTo_(d);if(!c){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(e){var h=-1;if(this.markers_.indexOf){h=this.markers_.indexOf(e)}else{for(var g=0,f;f=this.markers_[g];g++){if(f==e){h=g;break}}}if(h==-1){return false}e.setMap(null);this.markers_.splice(h,1);return true};MarkerClusterer.prototype.removeMarker=function(e,d){var f=this.removeMarker_(e);if(!d&&f){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(i,l){var j=false;for(var g=0,h;h=i[g];g++){var k=this.removeMarker_(h);j=j||k}if(!l&&j){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(b){if(!this.ready_){this.ready_=b;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(b){this.map_=b};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(b){this.gridSize_=b};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(b){this.minClusterSize_=b};MarkerClusterer.prototype.getExtendedBounds=function(n){var p=this.getProjection();var m=new google.maps.LatLng(n.getNorthEast().lat(),n.getNorthEast().lng());var k=new google.maps.LatLng(n.getSouthWest().lat(),n.getSouthWest().lng());var o=p.fromLatLngToDivPixel(m);o.x+=this.gridSize_;o.y-=this.gridSize_;var i=p.fromLatLngToDivPixel(k);i.x-=this.gridSize_;i.y+=this.gridSize_;var l=p.fromDivPixelToLatLng(o);var j=p.fromDivPixelToLatLng(i);n.extend(l);n.extend(j);return n};MarkerClusterer.prototype.isMarkerInBounds_=function(d,c){return c.contains(d.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(g){for(var h=0,f;f=this.clusters_[h];h++){f.remove()}for(var h=0,e;e=this.markers_[h];h++){e.isAdded=false;if(g){e.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var b=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var d=0,a;a=b[d];d++){a.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(d,m){if(!d||!m){return 0}var n=6371;var p=(m.lat()-d.lat())*Math.PI/180;var o=(m.lng()-d.lng())*Math.PI/180;var a=Math.sin(p/2)*Math.sin(p/2)+Math.cos(d.lat()*Math.PI/180)*Math.cos(m.lat()*Math.PI/180)*Math.sin(o/2)*Math.sin(o/2);var c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));var l=n*c;return l};MarkerClusterer.prototype.addToClosestCluster_=function(p){var k=40000;var n=null;var l=p.getPosition();for(var o=0,d;d=this.clusters_[o];o++){var i=d.getCenter();if(i){var m=this.distanceBetweenPoints_(i,p.getPosition());if(m<k){k=m;n=d}}}if(n&&n.isMarkerInClusterBounds(p)){n.addMarker(p)}else{var d=new Cluster(this);d.addMarker(p);this.clusters_.push(d)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var e=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var g=this.getExtendedBounds(e);for(var h=0,f;f=this.markers_[h];h++){if(!f.isAdded&&this.isMarkerInBounds_(f,g)){this.addToClosestCluster_(f)}}};function Cluster(b){this.markerClusterer_=b;this.map_=b.getMap();this.gridSize_=b.getGridSize();this.minClusterSize_=b.getMinClusterSize();this.averageCenter_=b.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,b.getStyles(),b.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(d){if(this.markers_.indexOf){return this.markers_.indexOf(d)!=-1}else{for(var f=0,e;e=this.markers_[f];f++){if(e==d){return true}}}return false};Cluster.prototype.addMarker=function(l){if(this.isMarkerAlreadyAdded(l)){return false}if(!this.center_){this.center_=l.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var g=this.markers_.length+1;var i=(this.center_.lat()*(g-1)+l.getPosition().lat())/g;var k=(this.center_.lng()*(g-1)+l.getPosition().lng())/g;this.center_=new google.maps.LatLng(i,k);this.calculateBounds_()}}l.isAdded=true;this.markers_.push(l);var h=this.markers_.length;if(h<this.minClusterSize_&&l.getMap()!=this.map_){l.setMap(this.map_)}if(h==this.minClusterSize_){for(var j=0;j<h;j++){this.markers_[j].setMap(null)}}if(h>=this.minClusterSize_){l.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var h=new google.maps.LatLngBounds(this.center_,this.center_);var g=this.getMarkers();for(var e=0,f;f=g[e];e++){h.extend(f.getPosition())}return h};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var b=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(b)};Cluster.prototype.isMarkerInClusterBounds=function(b){return this.bounds_.contains(b.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var j=this.map_.getZoom();var i=this.markerClusterer_.getMaxZoom();if(i&&j>i){for(var l=0,h;h=this.markers_[l];l++){h.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var k=this.markerClusterer_.getStyles().length;var g=this.markerClusterer_.getCalculator()(this.markers_,k);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(g);this.clusterIcon_.show()};function ClusterIcon(e,f,d){e.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=f;this.padding_=d||0;this.cluster_=e;this.center_=null;this.map_=e.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var b=this.cluster_.getMarkerClusterer();google.maps.event.trigger(b,"clusterclick",this.cluster_);if(b.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var f=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(f);this.div_.innerHTML=this.sums_.text}var e=this.getPanes();e.overlayMouseTarget.appendChild(this.div_);var d=this;google.maps.event.addDomListener(this.div_,"click",function(){d.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(c){var d=this.getProjection().fromLatLngToDivPixel(c);d.x-=parseInt(this.width_/2,10);d.y-=parseInt(this.height_/2,10);return d};ClusterIcon.prototype.draw=function(){if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.top=b.y+"px";this.div_.style.left=b.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(b){this.sums_=b;this.text_=b.text;this.index_=b.index;if(this.div_){this.div_.innerHTML=b.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var d=Math.max(0,this.sums_.index-1);d=Math.min(this.styles_.length-1,d);var c=this.styles_[d];this.url_=c.url;this.height_=c.height;this.width_=c.width;this.textColor_=c.textColor;this.anchor_=c.anchor;this.textSize_=c.textSize;this.backgroundPosition_=c.backgroundPosition};ClusterIcon.prototype.setCenter=function(b){this.center_=b};ClusterIcon.prototype.createCss=function(h){var i=[];i.push("background-image:url("+this.url_+");");var f=this.backgroundPosition_?this.backgroundPosition_:"0 0";i.push("background-position:"+f+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){i.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{i.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){i.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{i.push("width:"+this.width_+"px; text-align:center;")}}else{i.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var g=this.textColor_?this.textColor_:"black";var j=this.textSize_?this.textSize_:11;i.push("cursor:pointer; top:"+h.y+"px; left:"+h.x+"px; color:"+g+"; position:absolute; font-size:"+j+"px; font-family:Arial,sans-serif; font-weight:bold");return i.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(f){var e=[];for(var d in f){if(f.hasOwnProperty(d)){e.push(d)}}return e};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var c=new google.maps.LatLng(-18.8800397,-47.05878999999999);var d={zoom:5,center:c,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),d)}initialize();function abrirInfoBox(c,d){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[c].open(map,d);idInfoBoxAberto=c}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(f){var d=new google.maps.LatLngBounds();$.each(f,function(b,a){var c=new google.maps.Marker({position:new google.maps.LatLng(a.Latitude,a.Longitude),title:"Mobiliados"});var h={content:"<p>"+a.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[a.Id]=new InfoBox(h);infoBox[a.Id].marker=c;infoBox[a.Id].listener=google.maps.event.addListener(c,"click",function(g){abrirInfoBox(a.Id,c)});markers.push(c);d.extend(c.position)});var e=new MarkerClusterer(map,markers);map.fitBounds(d)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(a){a=a||{};google.maps.OverlayView.apply(this,arguments);this.content_=a.content||"";this.disableAutoPan_=a.disableAutoPan||false;this.maxWidth_=a.maxWidth||0;this.pixelOffset_=a.pixelOffset||new google.maps.Size(0,0);this.position_=a.position||new google.maps.LatLng(0,0);this.zIndex_=a.zIndex||null;this.boxClass_=a.boxClass||"infoBox";this.boxStyle_=a.boxStyle||{};this.closeBoxMargin_=a.closeBoxMargin||"2px";this.closeBoxURL_=a.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(a.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=a.infoBoxClearance||new google.maps.Size(1,1);if(typeof a.visible==="undefined"){if(typeof a.isHidden==="undefined"){a.visible=true}else{a.visible=!a.isHidden}}this.isHidden_=!a.visible;this.alignBottom_=a.alignBottom||false;this.pane_=a.pane||"floatPane";this.enableEventPropagation_=a.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var f;var e;var d;var a=this;var b=function(g){g.cancelBubble=true;if(g.stopPropagation){g.stopPropagation()}};var c=function(g){g.returnValue=false;if(g.preventDefault){g.preventDefault()}if(!a.enableEventPropagation_){b(g)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{d=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-d.left-d.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];e=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(f=0;f<e.length;f++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,e[f],b))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(g){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",c);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var a="";if(this.closeBoxURL_!==""){a="<img";a+=" src='"+this.closeBoxURL_+"'";a+=" align=right";a+=" style='";a+=" position: relative;";a+=" cursor: pointer;";a+=" margin: "+this.closeBoxMargin_+";";a+="'>"}return a};InfoBox.prototype.addClickHandler_=function(){var a;if(this.closeBoxURL_!==""){a=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(a,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var a=this;return function(b){b.cancelBubble=true;if(b.stopPropagation){b.stopPropagation()}google.maps.event.trigger(a,"closeclick");a.close()}};InfoBox.prototype.panBox_=function(q){var b;var p;var m=0,i=0;if(!q){b=this.getMap();if(b instanceof google.maps.Map){if(!b.getBounds().contains(this.position_)){b.setCenter(this.position_)}p=b.getBounds();var h=b.getDiv();var j=h.offsetWidth;var l=h.offsetHeight;var e=this.pixelOffset_.width;var d=this.pixelOffset_.height;var k=this.div_.offsetWidth;var a=this.div_.offsetHeight;var g=this.infoBoxClearance_.width;var f=this.infoBoxClearance_.height;var o=this.getProjection().fromLatLngToContainerPixel(this.position_);if(o.x<(-e+g)){m=o.x+e-g}else{if((o.x+k+e+g)>j){m=o.x+k+e+g-j}}if(this.alignBottom_){if(o.y<(-d+f+a)){i=o.y+d-f-a}else{if((o.y+d+f)>l){i=o.y+d+f-l}}}else{if(o.y<(-d+f)){i=o.y+d-f}else{if((o.y+a+d+f)>l){i=o.y+a+d+f-l}}}if(!(m===0&&i===0)){var n=b.getCenter();b.panBy(m,i)}}}};InfoBox.prototype.setBoxStyle_=function(){var a,b;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";b=this.boxStyle_;for(a in b){if(b.hasOwnProperty(a)){this.div_.style[a]=b[a]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var b;var a={top:0,bottom:0,left:0,right:0};var c=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){b=c.ownerDocument.defaultView.getComputedStyle(c,"");if(b){a.top=parseInt(b.borderTopWidth,10)||0;a.bottom=parseInt(b.borderBottomWidth,10)||0;a.left=parseInt(b.borderLeftWidth,10)||0;a.right=parseInt(b.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(c.currentStyle){a.top=parseInt(c.currentStyle.borderTopWidth,10)||0;a.bottom=parseInt(c.currentStyle.borderBottomWidth,10)||0;a.left=parseInt(c.currentStyle.borderLeftWidth,10)||0;a.right=parseInt(c.currentStyle.borderRightWidth,10)||0}}}return a};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var a=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(a.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(a.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(a.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(a){if(typeof a.boxClass!=="undefined"){this.boxClass_=a.boxClass;this.setBoxStyle_()}if(typeof a.boxStyle!=="undefined"){this.boxStyle_=a.boxStyle;this.setBoxStyle_()}if(typeof a.content!=="undefined"){this.setContent(a.content)}if(typeof a.disableAutoPan!=="undefined"){this.disableAutoPan_=a.disableAutoPan}if(typeof a.maxWidth!=="undefined"){this.maxWidth_=a.maxWidth}if(typeof a.pixelOffset!=="undefined"){this.pixelOffset_=a.pixelOffset}if(typeof a.alignBottom!=="undefined"){this.alignBottom_=a.alignBottom}if(typeof a.position!=="undefined"){this.setPosition(a.position)}if(typeof a.zIndex!=="undefined"){this.setZIndex(a.zIndex)}if(typeof a.closeBoxMargin!=="undefined"){this.closeBoxMargin_=a.closeBoxMargin}if(typeof a.closeBoxURL!=="undefined"){this.closeBoxURL_=a.closeBoxURL}if(typeof a.infoBoxClearance!=="undefined"){this.infoBoxClearance_=a.infoBoxClearance}if(typeof a.isHidden!=="undefined"){this.isHidden_=a.isHidden}if(typeof a.visible!=="undefined"){this.isHidden_=!a.visible}if(typeof a.enableEventPropagation!=="undefined"){this.enableEventPropagation_=a.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(a){this.content_=a;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(a){this.position_=a;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(a){this.zIndex_=a;if(this.div_){this.div_.style.zIndex=a}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(a){this.isHidden_=!a;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var a;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){a=false}else{a=!this.isHidden_}return a};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(a,b){var c=this;if(b){this.position_=b.getPosition();this.moveListener_=google.maps.event.addListener(b,"position_changed",function(){c.setPosition(this.getPosition())})}this.setMap(a);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var a;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(a=0;a<this.eventListeners_.length;a++){google.maps.event.removeListener(this.eventListeners_[a])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(c,d,b){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=c;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var e=b||{};this.gridSize_=e.gridSize||60;this.minClusterSize_=e.minimumClusterSize||2;this.maxZoom_=e.maxZoom||null;this.styles_=e.styles||[];this.imagePath_=e.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=e.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(e.zoomOnClick!=undefined){this.zoomOnClick_=e.zoomOnClick}this.averageCenter_=false;if(e.averageCenter!=undefined){this.averageCenter_=e.averageCenter}this.setupStyles_();this.setMap(c);this.prevZoom_=this.map_.getZoom();var a=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var f=a.map_.getZoom();var g=a.map_.minZoom||0;var h=Math.min(a.map_.maxZoom||100,a.map_.mapTypes[a.map_.getMapTypeId()].maxZoom);f=Math.min(Math.max(f,g),h);if(a.prevZoom_!=f){a.prevZoom_=f;a.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){a.redraw()});if(d&&(d.length||Object.keys(d).length)){this.addMarkers(d,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(b,a){return(function(c){for(var d in c.prototype){this.prototype[d]=c.prototype[d]}return this}).apply(b,[a])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var b=0,a;a=this.sizes[b];b++){this.styles_.push({url:this.imagePath_+(b+1)+"."+this.imageExtension_,height:a,width:a})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var b=this.getMarkers();var a=new google.maps.LatLngBounds();for(var d=0,c;c=b[d];d++){a.extend(c.getPosition())}this.map_.fitBounds(a)};MarkerClusterer.prototype.setStyles=function(a){this.styles_=a};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(a){this.maxZoom_=a};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(c,b){var d=0;var a=c.length;var e=a;while(e!==0){e=parseInt(e/10,10);d++}d=Math.min(d,b);return{text:a,index:d}};MarkerClusterer.prototype.setCalculator=function(a){this.calculator_=a};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(b,a){if(b.length){for(var d=0,c;c=b[d];d++){this.pushMarkerTo_(c)}}else{if(Object.keys(b).length){for(var c in b){this.pushMarkerTo_(b[c])}}}if(!a){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(a){a.isAdded=false;if(a.draggable){var b=this;google.maps.event.addListener(a,"dragend",function(){a.isAdded=false;b.repaint()})}this.markers_.push(a)};MarkerClusterer.prototype.addMarker=function(a,b){this.pushMarkerTo_(a);if(!b){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(d){var a=-1;if(this.markers_.indexOf){a=this.markers_.indexOf(d)}else{for(var b=0,c;c=this.markers_[b];b++){if(c==d){a=b;break}}}if(a==-1){return false}d.setMap(null);this.markers_.splice(a,1);return true};MarkerClusterer.prototype.removeMarker=function(b,c){var a=this.removeMarker_(b);if(!c&&a){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(d,a){var c=false;for(var f=0,e;e=d[f];f++){var b=this.removeMarker_(e);c=c||b}if(!a&&c){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(a){if(!this.ready_){this.ready_=a;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(a){this.map_=a};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(a){this.gridSize_=a};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(a){this.minClusterSize_=a};MarkerClusterer.prototype.getExtendedBounds=function(h){var f=this.getProjection();var a=new google.maps.LatLng(h.getNorthEast().lat(),h.getNorthEast().lng());var c=new google.maps.LatLng(h.getSouthWest().lat(),h.getSouthWest().lng());var g=f.fromLatLngToDivPixel(a);g.x+=this.gridSize_;g.y-=this.gridSize_;var e=f.fromLatLngToDivPixel(c);e.x-=this.gridSize_;e.y+=this.gridSize_;var b=f.fromDivPixelToLatLng(g);var d=f.fromDivPixelToLatLng(e);h.extend(b);h.extend(d);return h};MarkerClusterer.prototype.isMarkerInBounds_=function(a,b){return b.contains(a.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(b){for(var a=0,c;c=this.clusters_[a];a++){c.remove()}for(var a=0,d;d=this.markers_[a];a++){d.isAdded=false;if(b){d.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var a=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var c=0,b;b=a[c];c++){b.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(i,b){if(!i||!b){return 0}var k=6371;var g=(b.lat()-i.lat())*Math.PI/180;var h=(b.lng()-i.lng())*Math.PI/180;var f=Math.sin(g/2)*Math.sin(g/2)+Math.cos(i.lat()*Math.PI/180)*Math.cos(b.lat()*Math.PI/180)*Math.sin(h/2)*Math.sin(h/2);var j=2*Math.atan2(Math.sqrt(f),Math.sqrt(1-f));var e=k*j;return e};MarkerClusterer.prototype.addToClosestCluster_=function(f){var c=40000;var j=null;var b=f.getPosition();for(var h=0,g;g=this.clusters_[h];h++){var e=g.getCenter();if(e){var a=this.distanceBetweenPoints_(e,f.getPosition());if(a<c){c=a;j=g}}}if(j&&j.isMarkerInClusterBounds(f)){j.addMarker(f)}else{var g=new Cluster(this);g.addMarker(f);this.clusters_.push(g)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var d=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var b=this.getExtendedBounds(d);for(var a=0,c;c=this.markers_[a];a++){if(!c.isAdded&&this.isMarkerInBounds_(c,b)){this.addToClosestCluster_(c)}}};function Cluster(a){this.markerClusterer_=a;this.map_=a.getMap();this.gridSize_=a.getGridSize();this.minClusterSize_=a.getMinClusterSize();this.averageCenter_=a.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,a.getStyles(),a.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(c){if(this.markers_.indexOf){return this.markers_.indexOf(c)!=-1}else{for(var a=0,b;b=this.markers_[a];a++){if(b==c){return true}}}return false};Cluster.prototype.addMarker=function(a){if(this.isMarkerAlreadyAdded(a)){return false}if(!this.center_){this.center_=a.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var f=this.markers_.length+1;var d=(this.center_.lat()*(f-1)+a.getPosition().lat())/f;var b=(this.center_.lng()*(f-1)+a.getPosition().lng())/f;this.center_=new google.maps.LatLng(d,b);this.calculateBounds_()}}a.isAdded=true;this.markers_.push(a);var e=this.markers_.length;if(e<this.minClusterSize_&&a.getMap()!=this.map_){a.setMap(this.map_)}if(e==this.minClusterSize_){for(var c=0;c<e;c++){this.markers_[c].setMap(null)}}if(e>=this.minClusterSize_){a.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);var b=this.getMarkers();for(var d=0,c;c=b[d];d++){a.extend(c.getPosition())}return a};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(a)};Cluster.prototype.isMarkerInClusterBounds=function(a){return this.bounds_.contains(a.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var c=this.map_.getZoom();var d=this.markerClusterer_.getMaxZoom();if(d&&c>d){for(var a=0,e;e=this.markers_[a];a++){e.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var b=this.markerClusterer_.getStyles().length;var f=this.markerClusterer_.getCalculator()(this.markers_,b);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(f);this.clusterIcon_.show()};function ClusterIcon(b,a,c){b.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=a;this.padding_=c||0;this.cluster_=b;this.center_=null;this.map_=b.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var a=this.cluster_.getMarkerClusterer();google.maps.event.trigger(a,"clusterclick",this.cluster_);if(a.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.innerHTML=this.sums_.text}var b=this.getPanes();b.overlayMouseTarget.appendChild(this.div_);var c=this;google.maps.event.addDomListener(this.div_,"click",function(){c.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(b){var a=this.getProjection().fromLatLngToDivPixel(b);a.x-=parseInt(this.width_/2,10);a.y-=parseInt(this.height_/2,10);return a};ClusterIcon.prototype.draw=function(){if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.top=a.y+"px";this.div_.style.left=a.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(a){this.sums_=a;this.text_=a.text;this.index_=a.index;if(this.div_){this.div_.innerHTML=a.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var a=Math.max(0,this.sums_.index-1);a=Math.min(this.styles_.length-1,a);var b=this.styles_[a];this.url_=b.url;this.height_=b.height;this.width_=b.width;this.textColor_=b.textColor;this.anchor_=b.anchor;this.textSize_=b.textSize;this.backgroundPosition_=b.backgroundPosition};ClusterIcon.prototype.setCenter=function(a){this.center_=a};ClusterIcon.prototype.createCss=function(c){var b=[];b.push("background-image:url("+this.url_+");");var e=this.backgroundPosition_?this.backgroundPosition_:"0 0";b.push("background-position:"+e+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){b.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{b.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){b.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{b.push("width:"+this.width_+"px; text-align:center;")}}else{b.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var d=this.textColor_?this.textColor_:"black";var a=this.textSize_?this.textSize_:11;b.push("cursor:pointer; top:"+c.y+"px; left:"+c.x+"px; color:"+d+"; position:absolute; font-size:"+a+"px; font-family:Arial,sans-serif; font-weight:bold");return b.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(a){var b=[];for(var c in a){if(a.hasOwnProperty(c)){b.push(c)}}return b};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var b=new google.maps.LatLng(-18.8800397,-47.05878999999999);var a={zoom:5,center:b,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),a)}initialize();function abrirInfoBox(b,a){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[b].open(map,a);idInfoBoxAberto=b}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(a){var c=new google.maps.LatLngBounds();$.each(a,function(d,e){var g=new google.maps.Marker({position:new google.maps.LatLng(e.Latitude,e.Longitude),title:"Mobiliados"});var f={content:"<p>"+e.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[e.Id]=new InfoBox(f);infoBox[e.Id].marker=g;infoBox[e.Id].listener=google.maps.event.addListener(g,"click",function(h){abrirInfoBox(e.Id,g)});markers.push(g);c.extend(g.position)});var b=new MarkerClusterer(map,markers);map.fitBounds(c)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(b){b=b||{};google.maps.OverlayView.apply(this,arguments);this.content_=b.content||"";this.disableAutoPan_=b.disableAutoPan||false;this.maxWidth_=b.maxWidth||0;this.pixelOffset_=b.pixelOffset||new google.maps.Size(0,0);this.position_=b.position||new google.maps.LatLng(0,0);this.zIndex_=b.zIndex||null;this.boxClass_=b.boxClass||"infoBox";this.boxStyle_=b.boxStyle||{};this.closeBoxMargin_=b.closeBoxMargin||"2px";this.closeBoxURL_=b.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(b.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=b.infoBoxClearance||new google.maps.Size(1,1);if(typeof b.visible==="undefined"){if(typeof b.isHidden==="undefined"){b.visible=true}else{b.visible=!b.isHidden}}this.isHidden_=!b.visible;this.alignBottom_=b.alignBottom||false;this.pane_=b.pane||"floatPane";this.enableEventPropagation_=b.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var i;var j;var k;var h=this;var g=function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}};var l=function(a){a.returnValue=false;if(a.preventDefault){a.preventDefault()}if(!h.enableEventPropagation_){g(a)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{k=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-k.left-k.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];j=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(i=0;i<j.length;i++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,j[i],g))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(a){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",l);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var b="";if(this.closeBoxURL_!==""){b="<img";b+=" src='"+this.closeBoxURL_+"'";b+=" align=right";b+=" style='";b+=" position: relative;";b+=" cursor: pointer;";b+=" margin: "+this.closeBoxMargin_+";";b+="'>"}return b};InfoBox.prototype.addClickHandler_=function(){var b;if(this.closeBoxURL_!==""){b=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(b,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var b=this;return function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}google.maps.event.trigger(b,"closeclick");b.close()}};InfoBox.prototype.panBox_=function(c){var E;var r;var u=0,y=0;if(!c){E=this.getMap();if(E instanceof google.maps.Map){if(!E.getBounds().contains(this.position_)){E.setCenter(this.position_)}r=E.getBounds();var z=E.getDiv();var x=z.offsetWidth;var v=z.offsetHeight;var C=this.pixelOffset_.width;var D=this.pixelOffset_.height;var w=this.div_.offsetWidth;var F=this.div_.offsetHeight;var A=this.infoBoxClearance_.width;var B=this.infoBoxClearance_.height;var s=this.getProjection().fromLatLngToContainerPixel(this.position_);if(s.x<(-C+A)){u=s.x+C-A}else{if((s.x+w+C+A)>x){u=s.x+w+C+A-x}}if(this.alignBottom_){if(s.y<(-D+B+F)){y=s.y+D-B-F}else{if((s.y+D+B)>v){y=s.y+D+B-v}}}else{if(s.y<(-D+B)){y=s.y+D-B}else{if((s.y+F+D+B)>v){y=s.y+F+D+B-v}}}if(!(u===0&&y===0)){var t=E.getCenter();E.panBy(u,y)}}}};InfoBox.prototype.setBoxStyle_=function(){var d,c;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";c=this.boxStyle_;for(d in c){if(c.hasOwnProperty(d)){this.div_.style[d]=c[d]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var d;var e={top:0,bottom:0,left:0,right:0};var f=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){d=f.ownerDocument.defaultView.getComputedStyle(f,"");if(d){e.top=parseInt(d.borderTopWidth,10)||0;e.bottom=parseInt(d.borderBottomWidth,10)||0;e.left=parseInt(d.borderLeftWidth,10)||0;e.right=parseInt(d.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(f.currentStyle){e.top=parseInt(f.currentStyle.borderTopWidth,10)||0;e.bottom=parseInt(f.currentStyle.borderBottomWidth,10)||0;e.left=parseInt(f.currentStyle.borderLeftWidth,10)||0;e.right=parseInt(f.currentStyle.borderRightWidth,10)||0}}}return e};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var b=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(b.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(b.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(b.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(b){if(typeof b.boxClass!=="undefined"){this.boxClass_=b.boxClass;this.setBoxStyle_()}if(typeof b.boxStyle!=="undefined"){this.boxStyle_=b.boxStyle;this.setBoxStyle_()}if(typeof b.content!=="undefined"){this.setContent(b.content)}if(typeof b.disableAutoPan!=="undefined"){this.disableAutoPan_=b.disableAutoPan}if(typeof b.maxWidth!=="undefined"){this.maxWidth_=b.maxWidth}if(typeof b.pixelOffset!=="undefined"){this.pixelOffset_=b.pixelOffset}if(typeof b.alignBottom!=="undefined"){this.alignBottom_=b.alignBottom}if(typeof b.position!=="undefined"){this.setPosition(b.position)}if(typeof b.zIndex!=="undefined"){this.setZIndex(b.zIndex)}if(typeof b.closeBoxMargin!=="undefined"){this.closeBoxMargin_=b.closeBoxMargin}if(typeof b.closeBoxURL!=="undefined"){this.closeBoxURL_=b.closeBoxURL}if(typeof b.infoBoxClearance!=="undefined"){this.infoBoxClearance_=b.infoBoxClearance}if(typeof b.isHidden!=="undefined"){this.isHidden_=b.isHidden}if(typeof b.visible!=="undefined"){this.isHidden_=!b.visible}if(typeof b.enableEventPropagation!=="undefined"){this.enableEventPropagation_=b.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(b){this.content_=b;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(b){this.position_=b;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(b){this.zIndex_=b;if(this.div_){this.div_.style.zIndex=b}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(b){this.isHidden_=!b;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var b;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){b=false}else{b=!this.isHidden_}return b};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(e,d){var f=this;if(d){this.position_=d.getPosition();this.moveListener_=google.maps.event.addListener(d,"position_changed",function(){f.setPosition(this.getPosition())})}this.setMap(e);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var b;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(b=0;b<this.eventListeners_.length;b++){google.maps.event.removeListener(this.eventListeners_[b])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(j,i,f){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=j;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var h=f||{};this.gridSize_=h.gridSize||60;this.minClusterSize_=h.minimumClusterSize||2;this.maxZoom_=h.maxZoom||null;this.styles_=h.styles||[];this.imagePath_=h.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=h.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(h.zoomOnClick!=undefined){this.zoomOnClick_=h.zoomOnClick}this.averageCenter_=false;if(h.averageCenter!=undefined){this.averageCenter_=h.averageCenter}this.setupStyles_();this.setMap(j);this.prevZoom_=this.map_.getZoom();var g=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var c=g.map_.getZoom();var b=g.map_.minZoom||0;var a=Math.min(g.map_.maxZoom||100,g.map_.mapTypes[g.map_.getMapTypeId()].maxZoom);c=Math.min(Math.max(c,b),a);if(g.prevZoom_!=c){g.prevZoom_=c;g.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){g.redraw()});if(i&&(i.length||Object.keys(i).length)){this.addMarkers(i,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(c,d){return(function(b){for(var a in b.prototype){this.prototype[a]=b.prototype[a]}return this}).apply(c,[d])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var c=0,d;d=this.sizes[c];c++){this.styles_.push({url:this.imagePath_+(c+1)+"."+this.imageExtension_,height:d,width:d})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var e=this.getMarkers();var f=new google.maps.LatLngBounds();for(var g=0,h;h=e[g];g++){f.extend(h.getPosition())}this.map_.fitBounds(f)};MarkerClusterer.prototype.setStyles=function(b){this.styles_=b};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(b){this.maxZoom_=b};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(j,f){var i=0;var g=j.length;var h=g;while(h!==0){h=parseInt(h/10,10);i++}i=Math.min(i,f);return{text:g,index:i}};MarkerClusterer.prototype.setCalculator=function(b){this.calculator_=b};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(e,f){if(e.length){for(var g=0,h;h=e[g];g++){this.pushMarkerTo_(h)}}else{if(Object.keys(e).length){for(var h in e){this.pushMarkerTo_(e[h])}}}if(!f){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(d){d.isAdded=false;if(d.draggable){var c=this;google.maps.event.addListener(d,"dragend",function(){d.isAdded=false;c.repaint()})}this.markers_.push(d)};MarkerClusterer.prototype.addMarker=function(d,c){this.pushMarkerTo_(d);if(!c){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(g){var f=-1;if(this.markers_.indexOf){f=this.markers_.indexOf(g)}else{for(var e=0,h;h=this.markers_[e];e++){if(h==g){f=e;break}}}if(f==-1){return false}g.setMap(null);this.markers_.splice(f,1);return true};MarkerClusterer.prototype.removeMarker=function(d,f){var e=this.removeMarker_(d);if(!f&&e){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(k,h){var l=false;for(var i=0,j;j=k[i];i++){var g=this.removeMarker_(j);l=l||g}if(!h&&l){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(b){if(!this.ready_){this.ready_=b;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(b){this.map_=b};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(b){this.gridSize_=b};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(b){this.minClusterSize_=b};MarkerClusterer.prototype.getExtendedBounds=function(k){var m=this.getProjection();var j=new google.maps.LatLng(k.getNorthEast().lat(),k.getNorthEast().lng());var p=new google.maps.LatLng(k.getSouthWest().lat(),k.getSouthWest().lng());var l=m.fromLatLngToDivPixel(j);l.x+=this.gridSize_;l.y-=this.gridSize_;var n=m.fromLatLngToDivPixel(p);n.x-=this.gridSize_;n.y+=this.gridSize_;var i=m.fromDivPixelToLatLng(l);var o=m.fromDivPixelToLatLng(n);k.extend(i);k.extend(o);return k};MarkerClusterer.prototype.isMarkerInBounds_=function(d,c){return c.contains(d.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(e){for(var f=0,h;h=this.clusters_[f];f++){h.remove()}for(var f=0,g;g=this.markers_[f];f++){g.isAdded=false;if(e){g.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var b=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var d=0,a;a=b[d];d++){a.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(l,a){if(!l||!a){return 0}var c=6371;var n=(a.lat()-l.lat())*Math.PI/180;var m=(a.lng()-l.lng())*Math.PI/180;var o=Math.sin(n/2)*Math.sin(n/2)+Math.cos(l.lat()*Math.PI/180)*Math.cos(a.lat()*Math.PI/180)*Math.sin(m/2)*Math.sin(m/2);var d=2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o));var p=c*d;return p};MarkerClusterer.prototype.addToClosestCluster_=function(n){var p=40000;var k=null;var d=n.getPosition();for(var l=0,m;m=this.clusters_[l];l++){var o=m.getCenter();if(o){var i=this.distanceBetweenPoints_(o,n.getPosition());if(i<p){p=i;k=m}}}if(k&&k.isMarkerInClusterBounds(n)){k.addMarker(n)}else{var m=new Cluster(this);m.addMarker(n);this.clusters_.push(m)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var g=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var e=this.getExtendedBounds(g);for(var f=0,h;h=this.markers_[f];f++){if(!h.isAdded&&this.isMarkerInBounds_(h,e)){this.addToClosestCluster_(h)}}};function Cluster(b){this.markerClusterer_=b;this.map_=b.getMap();this.gridSize_=b.getGridSize();this.minClusterSize_=b.getMinClusterSize();this.averageCenter_=b.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,b.getStyles(),b.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(f){if(this.markers_.indexOf){return this.markers_.indexOf(f)!=-1}else{for(var e=0,d;d=this.markers_[e];e++){if(d==f){return true}}}return false};Cluster.prototype.addMarker=function(h){if(this.isMarkerAlreadyAdded(h)){return false}if(!this.center_){this.center_=h.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var i=this.markers_.length+1;var k=(this.center_.lat()*(i-1)+h.getPosition().lat())/i;var g=(this.center_.lng()*(i-1)+h.getPosition().lng())/i;this.center_=new google.maps.LatLng(k,g);this.calculateBounds_()}}h.isAdded=true;this.markers_.push(h);var j=this.markers_.length;if(j<this.minClusterSize_&&h.getMap()!=this.map_){h.setMap(this.map_)}if(j==this.minClusterSize_){for(var l=0;l<j;l++){this.markers_[l].setMap(null)}}if(j>=this.minClusterSize_){h.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var f=new google.maps.LatLngBounds(this.center_,this.center_);var e=this.getMarkers();for(var g=0,h;h=e[g];g++){f.extend(h.getPosition())}return f};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var b=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(b)};Cluster.prototype.isMarkerInClusterBounds=function(b){return this.bounds_.contains(b.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var l=this.map_.getZoom();var k=this.markerClusterer_.getMaxZoom();if(k&&l>k){for(var h=0,j;j=this.markers_[h];h++){j.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var g=this.markerClusterer_.getStyles().length;var i=this.markerClusterer_.getCalculator()(this.markers_,g);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(i);this.clusterIcon_.show()};function ClusterIcon(d,e,f){d.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=e;this.padding_=f||0;this.cluster_=d;this.center_=null;this.map_=d.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var b=this.cluster_.getMarkerClusterer();google.maps.event.trigger(b,"clusterclick",this.cluster_);if(b.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var e=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(e);this.div_.innerHTML=this.sums_.text}var d=this.getPanes();d.overlayMouseTarget.appendChild(this.div_);var f=this;google.maps.event.addDomListener(this.div_,"click",function(){f.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(c){var d=this.getProjection().fromLatLngToDivPixel(c);d.x-=parseInt(this.width_/2,10);d.y-=parseInt(this.height_/2,10);return d};ClusterIcon.prototype.draw=function(){if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.top=b.y+"px";this.div_.style.left=b.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(b){this.sums_=b;this.text_=b.text;this.index_=b.index;if(this.div_){this.div_.innerHTML=b.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var d=Math.max(0,this.sums_.index-1);d=Math.min(this.styles_.length-1,d);var c=this.styles_[d];this.url_=c.url;this.height_=c.height;this.width_=c.width;this.textColor_=c.textColor;this.anchor_=c.anchor;this.textSize_=c.textSize;this.backgroundPosition_=c.backgroundPosition};ClusterIcon.prototype.setCenter=function(b){this.center_=b};ClusterIcon.prototype.createCss=function(j){var f=[];f.push("background-image:url("+this.url_+");");var h=this.backgroundPosition_?this.backgroundPosition_:"0 0";f.push("background-position:"+h+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){f.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{f.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){f.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{f.push("width:"+this.width_+"px; text-align:center;")}}else{f.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var i=this.textColor_?this.textColor_:"black";var g=this.textSize_?this.textSize_:11;f.push("cursor:pointer; top:"+j.y+"px; left:"+j.x+"px; color:"+i+"; position:absolute; font-size:"+g+"px; font-family:Arial,sans-serif; font-weight:bold");return f.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(e){var d=[];for(var f in e){if(e.hasOwnProperty(f)){d.push(f)}}return d};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var c=new google.maps.LatLng(-18.8800397,-47.05878999999999);var d={zoom:5,center:c,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),d)}initialize();function abrirInfoBox(c,d){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[c].open(map,d);idInfoBoxAberto=c}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(e){var f=new google.maps.LatLngBounds();$.each(e,function(h,c){var a=new google.maps.Marker({position:new google.maps.LatLng(c.Latitude,c.Longitude),title:"Mobiliados"});var b={content:"<p>"+c.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[c.Id]=new InfoBox(b);infoBox[c.Id].marker=a;infoBox[c.Id].listener=google.maps.event.addListener(a,"click",function(g){abrirInfoBox(c.Id,a)});markers.push(a);f.extend(a.position)});var d=new MarkerClusterer(map,markers);map.fitBounds(f)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(a){a=a||{};google.maps.OverlayView.apply(this,arguments);this.content_=a.content||"";this.disableAutoPan_=a.disableAutoPan||false;this.maxWidth_=a.maxWidth||0;this.pixelOffset_=a.pixelOffset||new google.maps.Size(0,0);this.position_=a.position||new google.maps.LatLng(0,0);this.zIndex_=a.zIndex||null;this.boxClass_=a.boxClass||"infoBox";this.boxStyle_=a.boxStyle||{};this.closeBoxMargin_=a.closeBoxMargin||"2px";this.closeBoxURL_=a.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(a.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=a.infoBoxClearance||new google.maps.Size(1,1);if(typeof a.visible==="undefined"){if(typeof a.isHidden==="undefined"){a.visible=true}else{a.visible=!a.isHidden}}this.isHidden_=!a.visible;this.alignBottom_=a.alignBottom||false;this.pane_=a.pane||"floatPane";this.enableEventPropagation_=a.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var d;var c;var b;var e=this;var f=function(g){g.cancelBubble=true;if(g.stopPropagation){g.stopPropagation()}};var a=function(g){g.returnValue=false;if(g.preventDefault){g.preventDefault()}if(!e.enableEventPropagation_){f(g)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{b=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-b.left-b.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];c=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(d=0;d<c.length;d++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,c[d],f))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(g){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",a);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var a="";if(this.closeBoxURL_!==""){a="<img";a+=" src='"+this.closeBoxURL_+"'";a+=" align=right";a+=" style='";a+=" position: relative;";a+=" cursor: pointer;";a+=" margin: "+this.closeBoxMargin_+";";a+="'>"}return a};InfoBox.prototype.addClickHandler_=function(){var a;if(this.closeBoxURL_!==""){a=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(a,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var a=this;return function(b){b.cancelBubble=true;if(b.stopPropagation){b.stopPropagation()}google.maps.event.trigger(a,"closeclick");a.close()}};InfoBox.prototype.panBox_=function(g){var q;var b;var m=0,i=0;if(!g){q=this.getMap();if(q instanceof google.maps.Map){if(!q.getBounds().contains(this.position_)){q.setCenter(this.position_)}b=q.getBounds();var h=q.getDiv();var j=h.offsetWidth;var l=h.offsetHeight;var d=this.pixelOffset_.width;var a=this.pixelOffset_.height;var k=this.div_.offsetWidth;var o=this.div_.offsetHeight;var f=this.infoBoxClearance_.width;var e=this.infoBoxClearance_.height;var p=this.getProjection().fromLatLngToContainerPixel(this.position_);if(p.x<(-d+f)){m=p.x+d-f}else{if((p.x+k+d+f)>j){m=p.x+k+d+f-j}}if(this.alignBottom_){if(p.y<(-a+e+o)){i=p.y+a-e-o}else{if((p.y+a+e)>l){i=p.y+a+e-l}}}else{if(p.y<(-a+e)){i=p.y+a-e}else{if((p.y+o+a+e)>l){i=p.y+o+a+e-l}}}if(!(m===0&&i===0)){var n=q.getCenter();q.panBy(m,i)}}}};InfoBox.prototype.setBoxStyle_=function(){var a,b;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";b=this.boxStyle_;for(a in b){if(b.hasOwnProperty(a)){this.div_.style[a]=b[a]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var c;var b={top:0,bottom:0,left:0,right:0};var a=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){c=a.ownerDocument.defaultView.getComputedStyle(a,"");if(c){b.top=parseInt(c.borderTopWidth,10)||0;b.bottom=parseInt(c.borderBottomWidth,10)||0;b.left=parseInt(c.borderLeftWidth,10)||0;b.right=parseInt(c.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(a.currentStyle){b.top=parseInt(a.currentStyle.borderTopWidth,10)||0;b.bottom=parseInt(a.currentStyle.borderBottomWidth,10)||0;b.left=parseInt(a.currentStyle.borderLeftWidth,10)||0;b.right=parseInt(a.currentStyle.borderRightWidth,10)||0}}}return b};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var a=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(a.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(a.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(a.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(a){if(typeof a.boxClass!=="undefined"){this.boxClass_=a.boxClass;this.setBoxStyle_()}if(typeof a.boxStyle!=="undefined"){this.boxStyle_=a.boxStyle;this.setBoxStyle_()}if(typeof a.content!=="undefined"){this.setContent(a.content)}if(typeof a.disableAutoPan!=="undefined"){this.disableAutoPan_=a.disableAutoPan}if(typeof a.maxWidth!=="undefined"){this.maxWidth_=a.maxWidth}if(typeof a.pixelOffset!=="undefined"){this.pixelOffset_=a.pixelOffset}if(typeof a.alignBottom!=="undefined"){this.alignBottom_=a.alignBottom}if(typeof a.position!=="undefined"){this.setPosition(a.position)}if(typeof a.zIndex!=="undefined"){this.setZIndex(a.zIndex)}if(typeof a.closeBoxMargin!=="undefined"){this.closeBoxMargin_=a.closeBoxMargin}if(typeof a.closeBoxURL!=="undefined"){this.closeBoxURL_=a.closeBoxURL}if(typeof a.infoBoxClearance!=="undefined"){this.infoBoxClearance_=a.infoBoxClearance}if(typeof a.isHidden!=="undefined"){this.isHidden_=a.isHidden}if(typeof a.visible!=="undefined"){this.isHidden_=!a.visible}if(typeof a.enableEventPropagation!=="undefined"){this.enableEventPropagation_=a.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(a){this.content_=a;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(a){this.position_=a;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(a){this.zIndex_=a;if(this.div_){this.div_.style.zIndex=a}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(a){this.isHidden_=!a;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var a;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){a=false}else{a=!this.isHidden_}return a};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(b,c){var a=this;if(c){this.position_=c.getPosition();this.moveListener_=google.maps.event.addListener(c,"position_changed",function(){a.setPosition(this.getPosition())})}this.setMap(b);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var a;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(a=0;a<this.eventListeners_.length;a++){google.maps.event.removeListener(this.eventListeners_[a])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(a,b,e){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=a;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var c=e||{};this.gridSize_=c.gridSize||60;this.minClusterSize_=c.minimumClusterSize||2;this.maxZoom_=c.maxZoom||null;this.styles_=c.styles||[];this.imagePath_=c.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=c.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(c.zoomOnClick!=undefined){this.zoomOnClick_=c.zoomOnClick}this.averageCenter_=false;if(c.averageCenter!=undefined){this.averageCenter_=c.averageCenter}this.setupStyles_();this.setMap(a);this.prevZoom_=this.map_.getZoom();var d=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var h=d.map_.getZoom();var f=d.map_.minZoom||0;var g=Math.min(d.map_.maxZoom||100,d.map_.mapTypes[d.map_.getMapTypeId()].maxZoom);h=Math.min(Math.max(h,f),g);if(d.prevZoom_!=h){d.prevZoom_=h;d.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){d.redraw()});if(b&&(b.length||Object.keys(b).length)){this.addMarkers(b,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(b,a){return(function(c){for(var d in c.prototype){this.prototype[d]=c.prototype[d]}return this}).apply(b,[a])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var b=0,a;a=this.sizes[b];b++){this.styles_.push({url:this.imagePath_+(b+1)+"."+this.imageExtension_,height:a,width:a})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var d=this.getMarkers();var c=new google.maps.LatLngBounds();for(var b=0,a;a=d[b];b++){c.extend(a.getPosition())}this.map_.fitBounds(c)};MarkerClusterer.prototype.setStyles=function(a){this.styles_=a};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(a){this.maxZoom_=a};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(a,e){var b=0;var d=a.length;var c=d;while(c!==0){c=parseInt(c/10,10);b++}b=Math.min(b,e);return{text:d,index:b}};MarkerClusterer.prototype.setCalculator=function(a){this.calculator_=a};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(d,c){if(d.length){for(var b=0,a;a=d[b];b++){this.pushMarkerTo_(a)}}else{if(Object.keys(d).length){for(var a in d){this.pushMarkerTo_(d[a])}}}if(!c){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(a){a.isAdded=false;if(a.draggable){var b=this;google.maps.event.addListener(a,"dragend",function(){a.isAdded=false;b.repaint()})}this.markers_.push(a)};MarkerClusterer.prototype.addMarker=function(a,b){this.pushMarkerTo_(a);if(!b){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(b){var c=-1;if(this.markers_.indexOf){c=this.markers_.indexOf(b)}else{for(var d=0,a;a=this.markers_[d];d++){if(a==b){c=d;break}}}if(c==-1){return false}b.setMap(null);this.markers_.splice(c,1);return true};MarkerClusterer.prototype.removeMarker=function(c,a){var b=this.removeMarker_(c);if(!a&&b){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(b,e){var a=false;for(var d=0,c;c=b[d];d++){var f=this.removeMarker_(c);a=a||f}if(!e&&a){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(a){if(!this.ready_){this.ready_=a;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(a){this.map_=a};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(a){this.gridSize_=a};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(a){this.minClusterSize_=a};MarkerClusterer.prototype.getExtendedBounds=function(c){var a=this.getProjection();var d=new google.maps.LatLng(c.getNorthEast().lat(),c.getNorthEast().lng());var f=new google.maps.LatLng(c.getSouthWest().lat(),c.getSouthWest().lng());var b=a.fromLatLngToDivPixel(d);b.x+=this.gridSize_;b.y-=this.gridSize_;var h=a.fromLatLngToDivPixel(f);h.x-=this.gridSize_;h.y+=this.gridSize_;var e=a.fromDivPixelToLatLng(b);var g=a.fromDivPixelToLatLng(h);c.extend(e);c.extend(g);return c};MarkerClusterer.prototype.isMarkerInBounds_=function(a,b){return b.contains(a.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(d){for(var c=0,a;a=this.clusters_[c];c++){a.remove()}for(var c=0,b;b=this.markers_[c];c++){b.isAdded=false;if(d){b.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var a=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var c=0,b;b=a[c];c++){b.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(f,e){if(!f||!e){return 0}var k=6371;var j=(e.lat()-f.lat())*Math.PI/180;var b=(e.lng()-f.lng())*Math.PI/180;var i=Math.sin(j/2)*Math.sin(j/2)+Math.cos(f.lat()*Math.PI/180)*Math.cos(e.lat()*Math.PI/180)*Math.sin(b/2)*Math.sin(b/2);var h=2*Math.atan2(Math.sqrt(i),Math.sqrt(1-i));var g=k*h;return g};MarkerClusterer.prototype.addToClosestCluster_=function(j){var f=40000;var c=null;var h=j.getPosition();for(var b=0,a;a=this.clusters_[b];b++){var g=a.getCenter();if(g){var e=this.distanceBetweenPoints_(g,j.getPosition());if(e<f){f=e;c=a}}}if(c&&c.isMarkerInClusterBounds(j)){c.addMarker(j)}else{var a=new Cluster(this);a.addMarker(j);this.clusters_.push(a)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var b=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var d=this.getExtendedBounds(b);for(var c=0,a;a=this.markers_[c];c++){if(!a.isAdded&&this.isMarkerInBounds_(a,d)){this.addToClosestCluster_(a)}}};function Cluster(a){this.markerClusterer_=a;this.map_=a.getMap();this.gridSize_=a.getGridSize();this.minClusterSize_=a.getMinClusterSize();this.averageCenter_=a.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,a.getStyles(),a.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(a){if(this.markers_.indexOf){return this.markers_.indexOf(a)!=-1}else{for(var b=0,c;c=this.markers_[b];b++){if(c==a){return true}}}return false};Cluster.prototype.addMarker=function(e){if(this.isMarkerAlreadyAdded(e)){return false}if(!this.center_){this.center_=e.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var d=this.markers_.length+1;var b=(this.center_.lat()*(d-1)+e.getPosition().lat())/d;var f=(this.center_.lng()*(d-1)+e.getPosition().lng())/d;this.center_=new google.maps.LatLng(b,f);this.calculateBounds_()}}e.isAdded=true;this.markers_.push(e);var c=this.markers_.length;if(c<this.minClusterSize_&&e.getMap()!=this.map_){e.setMap(this.map_)}if(c==this.minClusterSize_){for(var a=0;a<c;a++){this.markers_[a].setMap(null)}}if(c>=this.minClusterSize_){e.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var c=new google.maps.LatLngBounds(this.center_,this.center_);var d=this.getMarkers();for(var b=0,a;a=d[b];b++){c.extend(a.getPosition())}return c};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(a)};Cluster.prototype.isMarkerInClusterBounds=function(a){return this.bounds_.contains(a.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var a=this.map_.getZoom();var b=this.markerClusterer_.getMaxZoom();if(b&&a>b){for(var e=0,c;c=this.markers_[e];e++){c.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var f=this.markerClusterer_.getStyles().length;var d=this.markerClusterer_.getCalculator()(this.markers_,f);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(d);this.clusterIcon_.show()};function ClusterIcon(c,b,a){c.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=b;this.padding_=a||0;this.cluster_=c;this.center_=null;this.map_=c.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var a=this.cluster_.getMarkerClusterer();google.maps.event.trigger(a,"clusterclick",this.cluster_);if(a.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.innerHTML=this.sums_.text}var c=this.getPanes();c.overlayMouseTarget.appendChild(this.div_);var a=this;google.maps.event.addDomListener(this.div_,"click",function(){a.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(b){var a=this.getProjection().fromLatLngToDivPixel(b);a.x-=parseInt(this.width_/2,10);a.y-=parseInt(this.height_/2,10);return a};ClusterIcon.prototype.draw=function(){if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.top=a.y+"px";this.div_.style.left=a.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(a){this.sums_=a;this.text_=a.text;this.index_=a.index;if(this.div_){this.div_.innerHTML=a.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var a=Math.max(0,this.sums_.index-1);a=Math.min(this.styles_.length-1,a);var b=this.styles_[a];this.url_=b.url;this.height_=b.height;this.width_=b.width;this.textColor_=b.textColor;this.anchor_=b.anchor;this.textSize_=b.textSize;this.backgroundPosition_=b.backgroundPosition};ClusterIcon.prototype.setCenter=function(a){this.center_=a};ClusterIcon.prototype.createCss=function(a){var e=[];e.push("background-image:url("+this.url_+");");var c=this.backgroundPosition_?this.backgroundPosition_:"0 0";e.push("background-position:"+c+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){e.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{e.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){e.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{e.push("width:"+this.width_+"px; text-align:center;")}}else{e.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var b=this.textColor_?this.textColor_:"black";var d=this.textSize_?this.textSize_:11;e.push("cursor:pointer; top:"+a.y+"px; left:"+a.x+"px; color:"+b+"; position:absolute; font-size:"+d+"px; font-family:Arial,sans-serif; font-weight:bold");return e.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(b){var c=[];for(var a in b){if(b.hasOwnProperty(a)){c.push(a)}}return c};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var b=new google.maps.LatLng(-18.8800397,-47.05878999999999);var a={zoom:5,center:b,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),a)}initialize();function abrirInfoBox(b,a){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[b].open(map,a);idInfoBoxAberto=b}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(b){var a=new google.maps.LatLngBounds();$.each(b,function(f,g){var e=new google.maps.Marker({position:new google.maps.LatLng(g.Latitude,g.Longitude),title:"Mobiliados"});var d={content:"<p>"+g.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[g.Id]=new InfoBox(d);infoBox[g.Id].marker=e;infoBox[g.Id].listener=google.maps.event.addListener(e,"click",function(h){abrirInfoBox(g.Id,e)});markers.push(e);a.extend(e.position)});var c=new MarkerClusterer(map,markers);map.fitBounds(a)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(b){b=b||{};google.maps.OverlayView.apply(this,arguments);this.content_=b.content||"";this.disableAutoPan_=b.disableAutoPan||false;this.maxWidth_=b.maxWidth||0;this.pixelOffset_=b.pixelOffset||new google.maps.Size(0,0);this.position_=b.position||new google.maps.LatLng(0,0);this.zIndex_=b.zIndex||null;this.boxClass_=b.boxClass||"infoBox";this.boxStyle_=b.boxStyle||{};this.closeBoxMargin_=b.closeBoxMargin||"2px";this.closeBoxURL_=b.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(b.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=b.infoBoxClearance||new google.maps.Size(1,1);if(typeof b.visible==="undefined"){if(typeof b.isHidden==="undefined"){b.visible=true}else{b.visible=!b.isHidden}}this.isHidden_=!b.visible;this.alignBottom_=b.alignBottom||false;this.pane_=b.pane||"floatPane";this.enableEventPropagation_=b.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var k;var l;var g;var j=this;var i=function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}};var h=function(a){a.returnValue=false;if(a.preventDefault){a.preventDefault()}if(!j.enableEventPropagation_){i(a)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{g=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-g.left-g.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];l=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(k=0;k<l.length;k++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,l[k],i))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(a){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",h);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var b="";if(this.closeBoxURL_!==""){b="<img";b+=" src='"+this.closeBoxURL_+"'";b+=" align=right";b+=" style='";b+=" position: relative;";b+=" cursor: pointer;";b+=" margin: "+this.closeBoxMargin_+";";b+="'>"}return b};InfoBox.prototype.addClickHandler_=function(){var b;if(this.closeBoxURL_!==""){b=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(b,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var b=this;return function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}google.maps.event.trigger(b,"closeclick");b.close()}};InfoBox.prototype.panBox_=function(A){var c;var E;var u=0,y=0;if(!A){c=this.getMap();if(c instanceof google.maps.Map){if(!c.getBounds().contains(this.position_)){c.setCenter(this.position_)}E=c.getBounds();var z=c.getDiv();var x=z.offsetWidth;var v=z.offsetHeight;var D=this.pixelOffset_.width;var F=this.pixelOffset_.height;var w=this.div_.offsetWidth;var s=this.div_.offsetHeight;var B=this.infoBoxClearance_.width;var C=this.infoBoxClearance_.height;var r=this.getProjection().fromLatLngToContainerPixel(this.position_);if(r.x<(-D+B)){u=r.x+D-B}else{if((r.x+w+D+B)>x){u=r.x+w+D+B-x}}if(this.alignBottom_){if(r.y<(-F+C+s)){y=r.y+F-C-s}else{if((r.y+F+C)>v){y=r.y+F+C-v}}}else{if(r.y<(-F+C)){y=r.y+F-C}else{if((r.y+s+F+C)>v){y=r.y+s+F+C-v}}}if(!(u===0&&y===0)){var t=c.getCenter();c.panBy(u,y)}}}};InfoBox.prototype.setBoxStyle_=function(){var d,c;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";c=this.boxStyle_;for(d in c){if(c.hasOwnProperty(d)){this.div_.style[d]=c[d]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var f;var d={top:0,bottom:0,left:0,right:0};var e=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){f=e.ownerDocument.defaultView.getComputedStyle(e,"");if(f){d.top=parseInt(f.borderTopWidth,10)||0;d.bottom=parseInt(f.borderBottomWidth,10)||0;d.left=parseInt(f.borderLeftWidth,10)||0;d.right=parseInt(f.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(e.currentStyle){d.top=parseInt(e.currentStyle.borderTopWidth,10)||0;d.bottom=parseInt(e.currentStyle.borderBottomWidth,10)||0;d.left=parseInt(e.currentStyle.borderLeftWidth,10)||0;d.right=parseInt(e.currentStyle.borderRightWidth,10)||0}}}return d};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var b=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(b.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(b.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(b.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(b){if(typeof b.boxClass!=="undefined"){this.boxClass_=b.boxClass;this.setBoxStyle_()}if(typeof b.boxStyle!=="undefined"){this.boxStyle_=b.boxStyle;this.setBoxStyle_()}if(typeof b.content!=="undefined"){this.setContent(b.content)}if(typeof b.disableAutoPan!=="undefined"){this.disableAutoPan_=b.disableAutoPan}if(typeof b.maxWidth!=="undefined"){this.maxWidth_=b.maxWidth}if(typeof b.pixelOffset!=="undefined"){this.pixelOffset_=b.pixelOffset}if(typeof b.alignBottom!=="undefined"){this.alignBottom_=b.alignBottom}if(typeof b.position!=="undefined"){this.setPosition(b.position)}if(typeof b.zIndex!=="undefined"){this.setZIndex(b.zIndex)}if(typeof b.closeBoxMargin!=="undefined"){this.closeBoxMargin_=b.closeBoxMargin}if(typeof b.closeBoxURL!=="undefined"){this.closeBoxURL_=b.closeBoxURL}if(typeof b.infoBoxClearance!=="undefined"){this.infoBoxClearance_=b.infoBoxClearance}if(typeof b.isHidden!=="undefined"){this.isHidden_=b.isHidden}if(typeof b.visible!=="undefined"){this.isHidden_=!b.visible}if(typeof b.enableEventPropagation!=="undefined"){this.enableEventPropagation_=b.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(b){this.content_=b;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(b){this.position_=b;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(b){this.zIndex_=b;if(this.div_){this.div_.style.zIndex=b}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(b){this.isHidden_=!b;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var b;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){b=false}else{b=!this.isHidden_}return b};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(d,f){var e=this;if(f){this.position_=f.getPosition();this.moveListener_=google.maps.event.addListener(f,"position_changed",function(){e.setPosition(this.getPosition())})}this.setMap(d);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var b;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(b=0;b<this.eventListeners_.length;b++){google.maps.event.removeListener(this.eventListeners_[b])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(g,f,h){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=g;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var j=h||{};this.gridSize_=j.gridSize||60;this.minClusterSize_=j.minimumClusterSize||2;this.maxZoom_=j.maxZoom||null;this.styles_=j.styles||[];this.imagePath_=j.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=j.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(j.zoomOnClick!=undefined){this.zoomOnClick_=j.zoomOnClick}this.averageCenter_=false;if(j.averageCenter!=undefined){this.averageCenter_=j.averageCenter}this.setupStyles_();this.setMap(g);this.prevZoom_=this.map_.getZoom();var i=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var a=i.map_.getZoom();var c=i.map_.minZoom||0;var b=Math.min(i.map_.maxZoom||100,i.map_.mapTypes[i.map_.getMapTypeId()].maxZoom);a=Math.min(Math.max(a,c),b);if(i.prevZoom_!=a){i.prevZoom_=a;i.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){i.redraw()});if(f&&(f.length||Object.keys(f).length)){this.addMarkers(f,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(c,d){return(function(b){for(var a in b.prototype){this.prototype[a]=b.prototype[a]}return this}).apply(c,[d])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var c=0,d;d=this.sizes[c];c++){this.styles_.push({url:this.imagePath_+(c+1)+"."+this.imageExtension_,height:d,width:d})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var g=this.getMarkers();var h=new google.maps.LatLngBounds();for(var e=0,f;f=g[e];e++){h.extend(f.getPosition())}this.map_.fitBounds(h)};MarkerClusterer.prototype.setStyles=function(b){this.styles_=b};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(b){this.maxZoom_=b};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(g,h){var f=0;var i=g.length;var j=i;while(j!==0){j=parseInt(j/10,10);f++}f=Math.min(f,h);return{text:i,index:f}};MarkerClusterer.prototype.setCalculator=function(b){this.calculator_=b};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(g,h){if(g.length){for(var e=0,f;f=g[e];e++){this.pushMarkerTo_(f)}}else{if(Object.keys(g).length){for(var f in g){this.pushMarkerTo_(g[f])}}}if(!h){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(d){d.isAdded=false;if(d.draggable){var c=this;google.maps.event.addListener(d,"dragend",function(){d.isAdded=false;c.repaint()})}this.markers_.push(d)};MarkerClusterer.prototype.addMarker=function(d,c){this.pushMarkerTo_(d);if(!c){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(e){var h=-1;if(this.markers_.indexOf){h=this.markers_.indexOf(e)}else{for(var g=0,f;f=this.markers_[g];g++){if(f==e){h=g;break}}}if(h==-1){return false}e.setMap(null);this.markers_.splice(h,1);return true};MarkerClusterer.prototype.removeMarker=function(f,e){var d=this.removeMarker_(f);if(!e&&d){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(g,j){var h=false;for(var k=0,l;l=g[k];k++){var i=this.removeMarker_(l);h=h||i}if(!j&&h){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(b){if(!this.ready_){this.ready_=b;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(b){this.map_=b};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(b){this.gridSize_=b};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(b){this.minClusterSize_=b};MarkerClusterer.prototype.getExtendedBounds=function(p){var j=this.getProjection();var o=new google.maps.LatLng(p.getNorthEast().lat(),p.getNorthEast().lng());var m=new google.maps.LatLng(p.getSouthWest().lat(),p.getSouthWest().lng());var i=j.fromLatLngToDivPixel(o);i.x+=this.gridSize_;i.y-=this.gridSize_;var k=j.fromLatLngToDivPixel(m);k.x-=this.gridSize_;k.y+=this.gridSize_;var n=j.fromDivPixelToLatLng(i);var l=j.fromDivPixelToLatLng(k);p.extend(n);p.extend(l);return p};MarkerClusterer.prototype.isMarkerInBounds_=function(d,c){return c.contains(d.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(g){for(var h=0,f;f=this.clusters_[h];h++){f.remove()}for(var h=0,e;e=this.markers_[h];h++){e.isAdded=false;if(g){e.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var b=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var d=0,a;a=b[d];d++){a.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(o,p){if(!o||!p){return 0}var c=6371;var d=(p.lat()-o.lat())*Math.PI/180;var a=(p.lng()-o.lng())*Math.PI/180;var l=Math.sin(d/2)*Math.sin(d/2)+Math.cos(o.lat()*Math.PI/180)*Math.cos(p.lat()*Math.PI/180)*Math.sin(a/2)*Math.sin(a/2);var m=2*Math.atan2(Math.sqrt(l),Math.sqrt(1-l));var n=c*m;return n};MarkerClusterer.prototype.addToClosestCluster_=function(k){var n=40000;var p=null;var l=k.getPosition();for(var d=0,i;i=this.clusters_[d];d++){var m=i.getCenter();if(m){var o=this.distanceBetweenPoints_(m,k.getPosition());if(o<n){n=o;p=i}}}if(p&&p.isMarkerInClusterBounds(k)){p.addMarker(k)}else{var i=new Cluster(this);i.addMarker(k);this.clusters_.push(i)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var e=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var g=this.getExtendedBounds(e);for(var h=0,f;f=this.markers_[h];h++){if(!f.isAdded&&this.isMarkerInBounds_(f,g)){this.addToClosestCluster_(f)}}};function Cluster(b){this.markerClusterer_=b;this.map_=b.getMap();this.gridSize_=b.getGridSize();this.minClusterSize_=b.getMinClusterSize();this.averageCenter_=b.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,b.getStyles(),b.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(e){if(this.markers_.indexOf){return this.markers_.indexOf(e)!=-1}else{for(var d=0,f;f=this.markers_[d];d++){if(f==e){return true}}}return false};Cluster.prototype.addMarker=function(j){if(this.isMarkerAlreadyAdded(j)){return false}if(!this.center_){this.center_=j.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var k=this.markers_.length+1;var g=(this.center_.lat()*(k-1)+j.getPosition().lat())/k;var i=(this.center_.lng()*(k-1)+j.getPosition().lng())/k;this.center_=new google.maps.LatLng(g,i);this.calculateBounds_()}}j.isAdded=true;this.markers_.push(j);var l=this.markers_.length;if(l<this.minClusterSize_&&j.getMap()!=this.map_){j.setMap(this.map_)}if(l==this.minClusterSize_){for(var h=0;h<l;h++){this.markers_[h].setMap(null)}}if(l>=this.minClusterSize_){j.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var h=new google.maps.LatLngBounds(this.center_,this.center_);var g=this.getMarkers();for(var e=0,f;f=g[e];e++){h.extend(f.getPosition())}return h};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var b=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(b)};Cluster.prototype.isMarkerInClusterBounds=function(b){return this.bounds_.contains(b.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var h=this.map_.getZoom();var g=this.markerClusterer_.getMaxZoom();if(g&&h>g){for(var j=0,l;l=this.markers_[j];j++){l.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var i=this.markerClusterer_.getStyles().length;var k=this.markerClusterer_.getCalculator()(this.markers_,i);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(k);this.clusterIcon_.show()};function ClusterIcon(f,d,e){f.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=d;this.padding_=e||0;this.cluster_=f;this.center_=null;this.map_=f.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var b=this.cluster_.getMarkerClusterer();google.maps.event.trigger(b,"clusterclick",this.cluster_);if(b.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var d=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(d);this.div_.innerHTML=this.sums_.text}var f=this.getPanes();f.overlayMouseTarget.appendChild(this.div_);var e=this;google.maps.event.addDomListener(this.div_,"click",function(){e.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(c){var d=this.getProjection().fromLatLngToDivPixel(c);d.x-=parseInt(this.width_/2,10);d.y-=parseInt(this.height_/2,10);return d};ClusterIcon.prototype.draw=function(){if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.top=b.y+"px";this.div_.style.left=b.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(b){this.sums_=b;this.text_=b.text;this.index_=b.index;if(this.div_){this.div_.innerHTML=b.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var d=Math.max(0,this.sums_.index-1);d=Math.min(this.styles_.length-1,d);var c=this.styles_[d];this.url_=c.url;this.height_=c.height;this.width_=c.width;this.textColor_=c.textColor;this.anchor_=c.anchor;this.textSize_=c.textSize;this.backgroundPosition_=c.backgroundPosition};ClusterIcon.prototype.setCenter=function(b){this.center_=b};ClusterIcon.prototype.createCss=function(g){var h=[];h.push("background-image:url("+this.url_+");");var j=this.backgroundPosition_?this.backgroundPosition_:"0 0";h.push("background-position:"+j+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){h.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{h.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){h.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{h.push("width:"+this.width_+"px; text-align:center;")}}else{h.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var f=this.textColor_?this.textColor_:"black";var i=this.textSize_?this.textSize_:11;h.push("cursor:pointer; top:"+g.y+"px; left:"+g.x+"px; color:"+f+"; position:absolute; font-size:"+i+"px; font-family:Arial,sans-serif; font-weight:bold");return h.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(d){var f=[];for(var e in d){if(d.hasOwnProperty(e)){f.push(e)}}return f};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var c=new google.maps.LatLng(-18.8800397,-47.05878999999999);var d={zoom:5,center:c,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),d)}initialize();function abrirInfoBox(c,d){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[c].open(map,d);idInfoBoxAberto=c}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(d){var e=new google.maps.LatLngBounds();$.each(d,function(b,a){var c=new google.maps.Marker({position:new google.maps.LatLng(a.Latitude,a.Longitude),title:"Mobiliados"});var h={content:"<p>"+a.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[a.Id]=new InfoBox(h);infoBox[a.Id].marker=c;infoBox[a.Id].listener=google.maps.event.addListener(c,"click",function(g){abrirInfoBox(a.Id,c)});markers.push(c);e.extend(c.position)});var f=new MarkerClusterer(map,markers);map.fitBounds(e)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(a){a=a||{};google.maps.OverlayView.apply(this,arguments);this.content_=a.content||"";this.disableAutoPan_=a.disableAutoPan||false;this.maxWidth_=a.maxWidth||0;this.pixelOffset_=a.pixelOffset||new google.maps.Size(0,0);this.position_=a.position||new google.maps.LatLng(0,0);this.zIndex_=a.zIndex||null;this.boxClass_=a.boxClass||"infoBox";this.boxStyle_=a.boxStyle||{};this.closeBoxMargin_=a.closeBoxMargin||"2px";this.closeBoxURL_=a.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(a.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=a.infoBoxClearance||new google.maps.Size(1,1);if(typeof a.visible==="undefined"){if(typeof a.isHidden==="undefined"){a.visible=true}else{a.visible=!a.isHidden}}this.isHidden_=!a.visible;this.alignBottom_=a.alignBottom||false;this.pane_=a.pane||"floatPane";this.enableEventPropagation_=a.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var b;var a;var f;var c=this;var d=function(g){g.cancelBubble=true;if(g.stopPropagation){g.stopPropagation()}};var e=function(g){g.returnValue=false;if(g.preventDefault){g.preventDefault()}if(!c.enableEventPropagation_){d(g)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{f=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-f.left-f.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];a=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(b=0;b<a.length;b++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,a[b],d))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(g){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",e);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var a="";if(this.closeBoxURL_!==""){a="<img";a+=" src='"+this.closeBoxURL_+"'";a+=" align=right";a+=" style='";a+=" position: relative;";a+=" cursor: pointer;";a+=" margin: "+this.closeBoxMargin_+";";a+="'>"}return a};InfoBox.prototype.addClickHandler_=function(){var a;if(this.closeBoxURL_!==""){a=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(a,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var a=this;return function(b){b.cancelBubble=true;if(b.stopPropagation){b.stopPropagation()}google.maps.event.trigger(a,"closeclick");a.close()}};InfoBox.prototype.panBox_=function(f){var g;var q;var m=0,i=0;if(!f){g=this.getMap();if(g instanceof google.maps.Map){if(!g.getBounds().contains(this.position_)){g.setCenter(this.position_)}q=g.getBounds();var h=g.getDiv();var j=h.offsetWidth;var l=h.offsetHeight;var b=this.pixelOffset_.width;var o=this.pixelOffset_.height;var k=this.div_.offsetWidth;var p=this.div_.offsetHeight;var e=this.infoBoxClearance_.width;var d=this.infoBoxClearance_.height;var a=this.getProjection().fromLatLngToContainerPixel(this.position_);if(a.x<(-b+e)){m=a.x+b-e}else{if((a.x+k+b+e)>j){m=a.x+k+b+e-j}}if(this.alignBottom_){if(a.y<(-o+d+p)){i=a.y+o-d-p}else{if((a.y+o+d)>l){i=a.y+o+d-l}}}else{if(a.y<(-o+d)){i=a.y+o-d}else{if((a.y+p+o+d)>l){i=a.y+p+o+d-l}}}if(!(m===0&&i===0)){var n=g.getCenter();g.panBy(m,i)}}}};InfoBox.prototype.setBoxStyle_=function(){var a,b;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";b=this.boxStyle_;for(a in b){if(b.hasOwnProperty(a)){this.div_.style[a]=b[a]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var a;var c={top:0,bottom:0,left:0,right:0};var b=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){a=b.ownerDocument.defaultView.getComputedStyle(b,"");if(a){c.top=parseInt(a.borderTopWidth,10)||0;c.bottom=parseInt(a.borderBottomWidth,10)||0;c.left=parseInt(a.borderLeftWidth,10)||0;c.right=parseInt(a.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(b.currentStyle){c.top=parseInt(b.currentStyle.borderTopWidth,10)||0;c.bottom=parseInt(b.currentStyle.borderBottomWidth,10)||0;c.left=parseInt(b.currentStyle.borderLeftWidth,10)||0;c.right=parseInt(b.currentStyle.borderRightWidth,10)||0}}}return c};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var a=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(a.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(a.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(a.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(a){if(typeof a.boxClass!=="undefined"){this.boxClass_=a.boxClass;this.setBoxStyle_()}if(typeof a.boxStyle!=="undefined"){this.boxStyle_=a.boxStyle;this.setBoxStyle_()}if(typeof a.content!=="undefined"){this.setContent(a.content)}if(typeof a.disableAutoPan!=="undefined"){this.disableAutoPan_=a.disableAutoPan}if(typeof a.maxWidth!=="undefined"){this.maxWidth_=a.maxWidth}if(typeof a.pixelOffset!=="undefined"){this.pixelOffset_=a.pixelOffset}if(typeof a.alignBottom!=="undefined"){this.alignBottom_=a.alignBottom}if(typeof a.position!=="undefined"){this.setPosition(a.position)}if(typeof a.zIndex!=="undefined"){this.setZIndex(a.zIndex)}if(typeof a.closeBoxMargin!=="undefined"){this.closeBoxMargin_=a.closeBoxMargin}if(typeof a.closeBoxURL!=="undefined"){this.closeBoxURL_=a.closeBoxURL}if(typeof a.infoBoxClearance!=="undefined"){this.infoBoxClearance_=a.infoBoxClearance}if(typeof a.isHidden!=="undefined"){this.isHidden_=a.isHidden}if(typeof a.visible!=="undefined"){this.isHidden_=!a.visible}if(typeof a.enableEventPropagation!=="undefined"){this.enableEventPropagation_=a.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(a){this.content_=a;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(a){this.position_=a;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(a){this.zIndex_=a;if(this.div_){this.div_.style.zIndex=a}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(a){this.isHidden_=!a;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var a;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){a=false}else{a=!this.isHidden_}return a};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(c,a){var b=this;if(a){this.position_=a.getPosition();this.moveListener_=google.maps.event.addListener(a,"position_changed",function(){b.setPosition(this.getPosition())})}this.setMap(c);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var a;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(a=0;a<this.eventListeners_.length;a++){google.maps.event.removeListener(this.eventListeners_[a])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(d,e,c){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=d;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var a=c||{};this.gridSize_=a.gridSize||60;this.minClusterSize_=a.minimumClusterSize||2;this.maxZoom_=a.maxZoom||null;this.styles_=a.styles||[];this.imagePath_=a.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=a.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(a.zoomOnClick!=undefined){this.zoomOnClick_=a.zoomOnClick}this.averageCenter_=false;if(a.averageCenter!=undefined){this.averageCenter_=a.averageCenter}this.setupStyles_();this.setMap(d);this.prevZoom_=this.map_.getZoom();var b=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var g=b.map_.getZoom();var h=b.map_.minZoom||0;var f=Math.min(b.map_.maxZoom||100,b.map_.mapTypes[b.map_.getMapTypeId()].maxZoom);g=Math.min(Math.max(g,h),f);if(b.prevZoom_!=g){b.prevZoom_=g;b.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){b.redraw()});if(e&&(e.length||Object.keys(e).length)){this.addMarkers(e,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(b,a){return(function(c){for(var d in c.prototype){this.prototype[d]=c.prototype[d]}return this}).apply(b,[a])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var b=0,a;a=this.sizes[b];b++){this.styles_.push({url:this.imagePath_+(b+1)+"."+this.imageExtension_,height:a,width:a})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var b=this.getMarkers();var a=new google.maps.LatLngBounds();for(var d=0,c;c=b[d];d++){a.extend(c.getPosition())}this.map_.fitBounds(a)};MarkerClusterer.prototype.setStyles=function(a){this.styles_=a};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(a){this.maxZoom_=a};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(d,c){var e=0;var b=d.length;var a=b;while(a!==0){a=parseInt(a/10,10);e++}e=Math.min(e,c);return{text:b,index:e}};MarkerClusterer.prototype.setCalculator=function(a){this.calculator_=a};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(b,a){if(b.length){for(var d=0,c;c=b[d];d++){this.pushMarkerTo_(c)}}else{if(Object.keys(b).length){for(var c in b){this.pushMarkerTo_(b[c])}}}if(!a){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(a){a.isAdded=false;if(a.draggable){var b=this;google.maps.event.addListener(a,"dragend",function(){a.isAdded=false;b.repaint()})}this.markers_.push(a)};MarkerClusterer.prototype.addMarker=function(a,b){this.pushMarkerTo_(a);if(!b){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(d){var a=-1;if(this.markers_.indexOf){a=this.markers_.indexOf(d)}else{for(var b=0,c;c=this.markers_[b];b++){if(c==d){a=b;break}}}if(a==-1){return false}d.setMap(null);this.markers_.splice(a,1);return true};MarkerClusterer.prototype.removeMarker=function(a,b){var c=this.removeMarker_(a);if(!b&&c){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(f,c){var e=false;for(var b=0,a;a=f[b];b++){var d=this.removeMarker_(a);e=e||d}if(!c&&e){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(a){if(!this.ready_){this.ready_=a;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(a){this.map_=a};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(a){this.gridSize_=a};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(a){this.minClusterSize_=a};MarkerClusterer.prototype.getExtendedBounds=function(f){var d=this.getProjection();var g=new google.maps.LatLng(f.getNorthEast().lat(),f.getNorthEast().lng());var a=new google.maps.LatLng(f.getSouthWest().lat(),f.getSouthWest().lng());var e=d.fromLatLngToDivPixel(g);e.x+=this.gridSize_;e.y-=this.gridSize_;var c=d.fromLatLngToDivPixel(a);c.x-=this.gridSize_;c.y+=this.gridSize_;var h=d.fromDivPixelToLatLng(e);var b=d.fromDivPixelToLatLng(c);f.extend(h);f.extend(b);return f};MarkerClusterer.prototype.isMarkerInBounds_=function(a,b){return b.contains(a.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(b){for(var a=0,c;c=this.clusters_[a];a++){c.remove()}for(var a=0,d;d=this.markers_[a];a++){d.isAdded=false;if(b){d.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var a=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var c=0,b;b=a[c];c++){b.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(i,g){if(!i||!g){return 0}var k=6371;var h=(g.lat()-i.lat())*Math.PI/180;var f=(g.lng()-i.lng())*Math.PI/180;var e=Math.sin(h/2)*Math.sin(h/2)+Math.cos(i.lat()*Math.PI/180)*Math.cos(g.lat()*Math.PI/180)*Math.sin(f/2)*Math.sin(f/2);var b=2*Math.atan2(Math.sqrt(e),Math.sqrt(1-e));var j=k*b;return j};MarkerClusterer.prototype.addToClosestCluster_=function(c){var j=40000;var f=null;var b=c.getPosition();for(var h=0,e;e=this.clusters_[h];h++){var a=e.getCenter();if(a){var g=this.distanceBetweenPoints_(a,c.getPosition());if(g<j){j=g;f=e}}}if(f&&f.isMarkerInClusterBounds(c)){f.addMarker(c)}else{var e=new Cluster(this);e.addMarker(c);this.clusters_.push(e)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var d=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var b=this.getExtendedBounds(d);for(var a=0,c;c=this.markers_[a];a++){if(!c.isAdded&&this.isMarkerInBounds_(c,b)){this.addToClosestCluster_(c)}}};function Cluster(a){this.markerClusterer_=a;this.map_=a.getMap();this.gridSize_=a.getGridSize();this.minClusterSize_=a.getMinClusterSize();this.averageCenter_=a.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,a.getStyles(),a.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(b){if(this.markers_.indexOf){return this.markers_.indexOf(b)!=-1}else{for(var c=0,a;a=this.markers_[c];c++){if(a==b){return true}}}return false};Cluster.prototype.addMarker=function(c){if(this.isMarkerAlreadyAdded(c)){return false}if(!this.center_){this.center_=c.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var b=this.markers_.length+1;var f=(this.center_.lat()*(b-1)+c.getPosition().lat())/b;var d=(this.center_.lng()*(b-1)+c.getPosition().lng())/b;this.center_=new google.maps.LatLng(f,d);this.calculateBounds_()}}c.isAdded=true;this.markers_.push(c);var a=this.markers_.length;if(a<this.minClusterSize_&&c.getMap()!=this.map_){c.setMap(this.map_)}if(a==this.minClusterSize_){for(var e=0;e<a;e++){this.markers_[e].setMap(null)}}if(a>=this.minClusterSize_){c.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);var b=this.getMarkers();for(var d=0,c;c=b[d];d++){a.extend(c.getPosition())}return a};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(a)};Cluster.prototype.isMarkerInClusterBounds=function(a){return this.bounds_.contains(a.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var e=this.map_.getZoom();var f=this.markerClusterer_.getMaxZoom();if(f&&e>f){for(var c=0,a;a=this.markers_[c];c++){a.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var d=this.markerClusterer_.getStyles().length;var b=this.markerClusterer_.getCalculator()(this.markers_,d);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(b);this.clusterIcon_.show()};function ClusterIcon(a,c,b){a.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=c;this.padding_=b||0;this.cluster_=a;this.center_=null;this.map_=a.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var a=this.cluster_.getMarkerClusterer();google.maps.event.trigger(a,"clusterclick",this.cluster_);if(a.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var c=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(c);this.div_.innerHTML=this.sums_.text}var a=this.getPanes();a.overlayMouseTarget.appendChild(this.div_);var b=this;google.maps.event.addDomListener(this.div_,"click",function(){b.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(b){var a=this.getProjection().fromLatLngToDivPixel(b);a.x-=parseInt(this.width_/2,10);a.y-=parseInt(this.height_/2,10);return a};ClusterIcon.prototype.draw=function(){if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.top=a.y+"px";this.div_.style.left=a.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(a){this.sums_=a;this.text_=a.text;this.index_=a.index;if(this.div_){this.div_.innerHTML=a.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var a=Math.max(0,this.sums_.index-1);a=Math.min(this.styles_.length-1,a);var b=this.styles_[a];this.url_=b.url;this.height_=b.height;this.width_=b.width;this.textColor_=b.textColor;this.anchor_=b.anchor;this.textSize_=b.textSize;this.backgroundPosition_=b.backgroundPosition};ClusterIcon.prototype.setCenter=function(a){this.center_=a};ClusterIcon.prototype.createCss=function(d){var c=[];c.push("background-image:url("+this.url_+");");var a=this.backgroundPosition_?this.backgroundPosition_:"0 0";c.push("background-position:"+a+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){c.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{c.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){c.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{c.push("width:"+this.width_+"px; text-align:center;")}}else{c.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var e=this.textColor_?this.textColor_:"black";var b=this.textSize_?this.textSize_:11;c.push("cursor:pointer; top:"+d.y+"px; left:"+d.x+"px; color:"+e+"; position:absolute; font-size:"+b+"px; font-family:Arial,sans-serif; font-weight:bold");return c.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(c){var a=[];for(var b in c){if(c.hasOwnProperty(b)){a.push(b)}}return a};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var b=new google.maps.LatLng(-18.8800397,-47.05878999999999);var a={zoom:5,center:b,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),a)}initialize();function abrirInfoBox(b,a){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[b].open(map,a);idInfoBoxAberto=b}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(c){var b=new google.maps.LatLngBounds();$.each(c,function(d,e){var g=new google.maps.Marker({position:new google.maps.LatLng(e.Latitude,e.Longitude),title:"Mobiliados"});var f={content:"<p>"+e.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[e.Id]=new InfoBox(f);infoBox[e.Id].marker=g;infoBox[e.Id].listener=google.maps.event.addListener(g,"click",function(h){abrirInfoBox(e.Id,g)});markers.push(g);b.extend(g.position)});var a=new MarkerClusterer(map,markers);map.fitBounds(b)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(b){b=b||{};google.maps.OverlayView.apply(this,arguments);this.content_=b.content||"";this.disableAutoPan_=b.disableAutoPan||false;this.maxWidth_=b.maxWidth||0;this.pixelOffset_=b.pixelOffset||new google.maps.Size(0,0);this.position_=b.position||new google.maps.LatLng(0,0);this.zIndex_=b.zIndex||null;this.boxClass_=b.boxClass||"infoBox";this.boxStyle_=b.boxStyle||{};this.closeBoxMargin_=b.closeBoxMargin||"2px";this.closeBoxURL_=b.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(b.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=b.infoBoxClearance||new google.maps.Size(1,1);if(typeof b.visible==="undefined"){if(typeof b.isHidden==="undefined"){b.visible=true}else{b.visible=!b.isHidden}}this.isHidden_=!b.visible;this.alignBottom_=b.alignBottom||false;this.pane_=b.pane||"floatPane";this.enableEventPropagation_=b.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var g;var h;var i;var l=this;var k=function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}};var j=function(a){a.returnValue=false;if(a.preventDefault){a.preventDefault()}if(!l.enableEventPropagation_){k(a)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{i=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-i.left-i.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];h=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(g=0;g<h.length;g++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,h[g],k))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(a){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",j);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var b="";if(this.closeBoxURL_!==""){b="<img";b+=" src='"+this.closeBoxURL_+"'";b+=" align=right";b+=" style='";b+=" position: relative;";b+=" cursor: pointer;";b+=" margin: "+this.closeBoxMargin_+";";b+="'>"}return b};InfoBox.prototype.addClickHandler_=function(){var b;if(this.closeBoxURL_!==""){b=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(b,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var b=this;return function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}google.maps.event.trigger(b,"closeclick");b.close()}};InfoBox.prototype.panBox_=function(B){var A;var c;var u=0,y=0;if(!B){A=this.getMap();if(A instanceof google.maps.Map){if(!A.getBounds().contains(this.position_)){A.setCenter(this.position_)}c=A.getBounds();var z=A.getDiv();var x=z.offsetWidth;var v=z.offsetHeight;var E=this.pixelOffset_.width;var s=this.pixelOffset_.height;var w=this.div_.offsetWidth;var r=this.div_.offsetHeight;var C=this.infoBoxClearance_.width;var D=this.infoBoxClearance_.height;var F=this.getProjection().fromLatLngToContainerPixel(this.position_);if(F.x<(-E+C)){u=F.x+E-C}else{if((F.x+w+E+C)>x){u=F.x+w+E+C-x}}if(this.alignBottom_){if(F.y<(-s+D+r)){y=F.y+s-D-r}else{if((F.y+s+D)>v){y=F.y+s+D-v}}}else{if(F.y<(-s+D)){y=F.y+s-D}else{if((F.y+r+s+D)>v){y=F.y+r+s+D-v}}}if(!(u===0&&y===0)){var t=A.getCenter();A.panBy(u,y)}}}};InfoBox.prototype.setBoxStyle_=function(){var d,c;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";c=this.boxStyle_;for(d in c){if(c.hasOwnProperty(d)){this.div_.style[d]=c[d]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var e;var f={top:0,bottom:0,left:0,right:0};var d=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){e=d.ownerDocument.defaultView.getComputedStyle(d,"");if(e){f.top=parseInt(e.borderTopWidth,10)||0;f.bottom=parseInt(e.borderBottomWidth,10)||0;f.left=parseInt(e.borderLeftWidth,10)||0;f.right=parseInt(e.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(d.currentStyle){f.top=parseInt(d.currentStyle.borderTopWidth,10)||0;f.bottom=parseInt(d.currentStyle.borderBottomWidth,10)||0;f.left=parseInt(d.currentStyle.borderLeftWidth,10)||0;f.right=parseInt(d.currentStyle.borderRightWidth,10)||0}}}return f};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var b=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(b.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(b.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(b.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(b){if(typeof b.boxClass!=="undefined"){this.boxClass_=b.boxClass;this.setBoxStyle_()}if(typeof b.boxStyle!=="undefined"){this.boxStyle_=b.boxStyle;this.setBoxStyle_()}if(typeof b.content!=="undefined"){this.setContent(b.content)}if(typeof b.disableAutoPan!=="undefined"){this.disableAutoPan_=b.disableAutoPan}if(typeof b.maxWidth!=="undefined"){this.maxWidth_=b.maxWidth}if(typeof b.pixelOffset!=="undefined"){this.pixelOffset_=b.pixelOffset}if(typeof b.alignBottom!=="undefined"){this.alignBottom_=b.alignBottom}if(typeof b.position!=="undefined"){this.setPosition(b.position)}if(typeof b.zIndex!=="undefined"){this.setZIndex(b.zIndex)}if(typeof b.closeBoxMargin!=="undefined"){this.closeBoxMargin_=b.closeBoxMargin}if(typeof b.closeBoxURL!=="undefined"){this.closeBoxURL_=b.closeBoxURL}if(typeof b.infoBoxClearance!=="undefined"){this.infoBoxClearance_=b.infoBoxClearance}if(typeof b.isHidden!=="undefined"){this.isHidden_=b.isHidden}if(typeof b.visible!=="undefined"){this.isHidden_=!b.visible}if(typeof b.enableEventPropagation!=="undefined"){this.enableEventPropagation_=b.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(b){this.content_=b;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(b){this.position_=b;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(b){this.zIndex_=b;if(this.div_){this.div_.style.zIndex=b}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(b){this.isHidden_=!b;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var b;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){b=false}else{b=!this.isHidden_}return b};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(f,e){var d=this;if(e){this.position_=e.getPosition();this.moveListener_=google.maps.event.addListener(e,"position_changed",function(){d.setPosition(this.getPosition())})}this.setMap(f);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var b;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(b=0;b<this.eventListeners_.length;b++){google.maps.event.removeListener(this.eventListeners_[b])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(i,h,j){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=i;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var g=j||{};this.gridSize_=g.gridSize||60;this.minClusterSize_=g.minimumClusterSize||2;this.maxZoom_=g.maxZoom||null;this.styles_=g.styles||[];this.imagePath_=g.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=g.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(g.zoomOnClick!=undefined){this.zoomOnClick_=g.zoomOnClick}this.averageCenter_=false;if(g.averageCenter!=undefined){this.averageCenter_=g.averageCenter}this.setupStyles_();this.setMap(i);this.prevZoom_=this.map_.getZoom();var f=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var b=f.map_.getZoom();var a=f.map_.minZoom||0;var c=Math.min(f.map_.maxZoom||100,f.map_.mapTypes[f.map_.getMapTypeId()].maxZoom);b=Math.min(Math.max(b,a),c);if(f.prevZoom_!=b){f.prevZoom_=b;f.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){f.redraw()});if(h&&(h.length||Object.keys(h).length)){this.addMarkers(h,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(c,d){return(function(b){for(var a in b.prototype){this.prototype[a]=b.prototype[a]}return this}).apply(c,[d])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var c=0,d;d=this.sizes[c];c++){this.styles_.push({url:this.imagePath_+(c+1)+"."+this.imageExtension_,height:d,width:d})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var e=this.getMarkers();var f=new google.maps.LatLngBounds();for(var g=0,h;h=e[g];g++){f.extend(h.getPosition())}this.map_.fitBounds(f)};MarkerClusterer.prototype.setStyles=function(b){this.styles_=b};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(b){this.maxZoom_=b};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(i,j){var h=0;var f=i.length;var g=f;while(g!==0){g=parseInt(g/10,10);h++}h=Math.min(h,j);return{text:f,index:h}};MarkerClusterer.prototype.setCalculator=function(b){this.calculator_=b};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(e,f){if(e.length){for(var g=0,h;h=e[g];g++){this.pushMarkerTo_(h)}}else{if(Object.keys(e).length){for(var h in e){this.pushMarkerTo_(e[h])}}}if(!f){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(d){d.isAdded=false;if(d.draggable){var c=this;google.maps.event.addListener(d,"dragend",function(){d.isAdded=false;c.repaint()})}this.markers_.push(d)};MarkerClusterer.prototype.addMarker=function(d,c){this.pushMarkerTo_(d);if(!c){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(g){var f=-1;if(this.markers_.indexOf){f=this.markers_.indexOf(g)}else{for(var e=0,h;h=this.markers_[e];e++){if(h==g){f=e;break}}}if(f==-1){return false}g.setMap(null);this.markers_.splice(f,1);return true};MarkerClusterer.prototype.removeMarker=function(e,d){var f=this.removeMarker_(e);if(!d&&f){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(i,l){var j=false;for(var g=0,h;h=i[g];g++){var k=this.removeMarker_(h);j=j||k}if(!l&&j){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(b){if(!this.ready_){this.ready_=b;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(b){this.map_=b};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(b){this.gridSize_=b};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(b){this.minClusterSize_=b};MarkerClusterer.prototype.getExtendedBounds=function(m){var o=this.getProjection();var l=new google.maps.LatLng(m.getNorthEast().lat(),m.getNorthEast().lng());var j=new google.maps.LatLng(m.getSouthWest().lat(),m.getSouthWest().lng());var n=o.fromLatLngToDivPixel(l);n.x+=this.gridSize_;n.y-=this.gridSize_;var p=o.fromLatLngToDivPixel(j);p.x-=this.gridSize_;p.y+=this.gridSize_;var k=o.fromDivPixelToLatLng(n);var i=o.fromDivPixelToLatLng(p);m.extend(k);m.extend(i);return m};MarkerClusterer.prototype.isMarkerInBounds_=function(d,c){return c.contains(d.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(e){for(var f=0,h;h=this.clusters_[f];f++){h.remove()}for(var f=0,g;g=this.markers_[f];f++){g.isAdded=false;if(e){g.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var b=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var d=0,a;a=b[d];d++){a.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(l,n){if(!l||!n){return 0}var c=6371;var m=(n.lat()-l.lat())*Math.PI/180;var o=(n.lng()-l.lng())*Math.PI/180;var p=Math.sin(m/2)*Math.sin(m/2)+Math.cos(l.lat()*Math.PI/180)*Math.cos(n.lat()*Math.PI/180)*Math.sin(o/2)*Math.sin(o/2);var a=2*Math.atan2(Math.sqrt(p),Math.sqrt(1-p));var d=c*a;return d};MarkerClusterer.prototype.addToClosestCluster_=function(p){var k=40000;var n=null;var d=p.getPosition();for(var l=0,o;o=this.clusters_[l];l++){var i=o.getCenter();if(i){var m=this.distanceBetweenPoints_(i,p.getPosition());if(m<k){k=m;n=o}}}if(n&&n.isMarkerInClusterBounds(p)){n.addMarker(p)}else{var o=new Cluster(this);o.addMarker(p);this.clusters_.push(o)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var g=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var e=this.getExtendedBounds(g);for(var f=0,h;h=this.markers_[f];f++){if(!h.isAdded&&this.isMarkerInBounds_(h,e)){this.addToClosestCluster_(h)}}};function Cluster(b){this.markerClusterer_=b;this.map_=b.getMap();this.gridSize_=b.getGridSize();this.minClusterSize_=b.getMinClusterSize();this.averageCenter_=b.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,b.getStyles(),b.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(d){if(this.markers_.indexOf){return this.markers_.indexOf(d)!=-1}else{for(var f=0,e;e=this.markers_[f];f++){if(e==d){return true}}}return false};Cluster.prototype.addMarker=function(l){if(this.isMarkerAlreadyAdded(l)){return false}if(!this.center_){this.center_=l.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var g=this.markers_.length+1;var i=(this.center_.lat()*(g-1)+l.getPosition().lat())/g;var k=(this.center_.lng()*(g-1)+l.getPosition().lng())/g;this.center_=new google.maps.LatLng(i,k);this.calculateBounds_()}}l.isAdded=true;this.markers_.push(l);var h=this.markers_.length;if(h<this.minClusterSize_&&l.getMap()!=this.map_){l.setMap(this.map_)}if(h==this.minClusterSize_){for(var j=0;j<h;j++){this.markers_[j].setMap(null)}}if(h>=this.minClusterSize_){l.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var f=new google.maps.LatLngBounds(this.center_,this.center_);var e=this.getMarkers();for(var g=0,h;h=e[g];g++){f.extend(h.getPosition())}return f};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var b=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(b)};Cluster.prototype.isMarkerInClusterBounds=function(b){return this.bounds_.contains(b.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var j=this.map_.getZoom();var i=this.markerClusterer_.getMaxZoom();if(i&&j>i){for(var l=0,h;h=this.markers_[l];l++){h.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var k=this.markerClusterer_.getStyles().length;var g=this.markerClusterer_.getCalculator()(this.markers_,k);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(g);this.clusterIcon_.show()};function ClusterIcon(e,f,d){e.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=f;this.padding_=d||0;this.cluster_=e;this.center_=null;this.map_=e.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var b=this.cluster_.getMarkerClusterer();google.maps.event.trigger(b,"clusterclick",this.cluster_);if(b.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var f=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(f);this.div_.innerHTML=this.sums_.text}var e=this.getPanes();e.overlayMouseTarget.appendChild(this.div_);var d=this;google.maps.event.addDomListener(this.div_,"click",function(){d.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(c){var d=this.getProjection().fromLatLngToDivPixel(c);d.x-=parseInt(this.width_/2,10);d.y-=parseInt(this.height_/2,10);return d};ClusterIcon.prototype.draw=function(){if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.top=b.y+"px";this.div_.style.left=b.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(b){this.sums_=b;this.text_=b.text;this.index_=b.index;if(this.div_){this.div_.innerHTML=b.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var d=Math.max(0,this.sums_.index-1);d=Math.min(this.styles_.length-1,d);var c=this.styles_[d];this.url_=c.url;this.height_=c.height;this.width_=c.width;this.textColor_=c.textColor;this.anchor_=c.anchor;this.textSize_=c.textSize;this.backgroundPosition_=c.backgroundPosition};ClusterIcon.prototype.setCenter=function(b){this.center_=b};ClusterIcon.prototype.createCss=function(i){var j=[];j.push("background-image:url("+this.url_+");");var g=this.backgroundPosition_?this.backgroundPosition_:"0 0";j.push("background-position:"+g+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){j.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{j.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){j.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{j.push("width:"+this.width_+"px; text-align:center;")}}else{j.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var h=this.textColor_?this.textColor_:"black";var f=this.textSize_?this.textSize_:11;j.push("cursor:pointer; top:"+i.y+"px; left:"+i.x+"px; color:"+h+"; position:absolute; font-size:"+f+"px; font-family:Arial,sans-serif; font-weight:bold");return j.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(f){var e=[];for(var d in f){if(f.hasOwnProperty(d)){e.push(d)}}return e};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var c=new google.maps.LatLng(-18.8800397,-47.05878999999999);var d={zoom:5,center:c,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),d)}initialize();function abrirInfoBox(c,d){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[c].open(map,d);idInfoBoxAberto=c}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(f){var d=new google.maps.LatLngBounds();$.each(f,function(h,c){var a=new google.maps.Marker({position:new google.maps.LatLng(c.Latitude,c.Longitude),title:"Mobiliados"});var b={content:"<p>"+c.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[c.Id]=new InfoBox(b);infoBox[c.Id].marker=a;infoBox[c.Id].listener=google.maps.event.addListener(a,"click",function(g){abrirInfoBox(c.Id,a)});markers.push(a);d.extend(a.position)});var e=new MarkerClusterer(map,markers);map.fitBounds(d)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(a){a=a||{};google.maps.OverlayView.apply(this,arguments);this.content_=a.content||"";this.disableAutoPan_=a.disableAutoPan||false;this.maxWidth_=a.maxWidth||0;this.pixelOffset_=a.pixelOffset||new google.maps.Size(0,0);this.position_=a.position||new google.maps.LatLng(0,0);this.zIndex_=a.zIndex||null;this.boxClass_=a.boxClass||"infoBox";this.boxStyle_=a.boxStyle||{};this.closeBoxMargin_=a.closeBoxMargin||"2px";this.closeBoxURL_=a.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(a.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=a.infoBoxClearance||new google.maps.Size(1,1);if(typeof a.visible==="undefined"){if(typeof a.isHidden==="undefined"){a.visible=true}else{a.visible=!a.isHidden}}this.isHidden_=!a.visible;this.alignBottom_=a.alignBottom||false;this.pane_=a.pane||"floatPane";this.enableEventPropagation_=a.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var f;var e;var d;var a=this;var b=function(g){g.cancelBubble=true;if(g.stopPropagation){g.stopPropagation()}};var c=function(g){g.returnValue=false;if(g.preventDefault){g.preventDefault()}if(!a.enableEventPropagation_){b(g)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{d=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-d.left-d.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];e=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(f=0;f<e.length;f++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,e[f],b))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(g){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",c);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var a="";if(this.closeBoxURL_!==""){a="<img";a+=" src='"+this.closeBoxURL_+"'";a+=" align=right";a+=" style='";a+=" position: relative;";a+=" cursor: pointer;";a+=" margin: "+this.closeBoxMargin_+";";a+="'>"}return a};InfoBox.prototype.addClickHandler_=function(){var a;if(this.closeBoxURL_!==""){a=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(a,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var a=this;return function(b){b.cancelBubble=true;if(b.stopPropagation){b.stopPropagation()}google.maps.event.trigger(a,"closeclick");a.close()}};InfoBox.prototype.panBox_=function(e){var f;var g;var m=0,i=0;if(!e){f=this.getMap();if(f instanceof google.maps.Map){if(!f.getBounds().contains(this.position_)){f.setCenter(this.position_)}g=f.getBounds();var h=f.getDiv();var j=h.offsetWidth;var l=h.offsetHeight;var q=this.pixelOffset_.width;var p=this.pixelOffset_.height;var k=this.div_.offsetWidth;var b=this.div_.offsetHeight;var d=this.infoBoxClearance_.width;var a=this.infoBoxClearance_.height;var o=this.getProjection().fromLatLngToContainerPixel(this.position_);if(o.x<(-q+d)){m=o.x+q-d}else{if((o.x+k+q+d)>j){m=o.x+k+q+d-j}}if(this.alignBottom_){if(o.y<(-p+a+b)){i=o.y+p-a-b}else{if((o.y+p+a)>l){i=o.y+p+a-l}}}else{if(o.y<(-p+a)){i=o.y+p-a}else{if((o.y+b+p+a)>l){i=o.y+b+p+a-l}}}if(!(m===0&&i===0)){var n=f.getCenter();f.panBy(m,i)}}}};InfoBox.prototype.setBoxStyle_=function(){var a,b;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";b=this.boxStyle_;for(a in b){if(b.hasOwnProperty(a)){this.div_.style[a]=b[a]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var b;var a={top:0,bottom:0,left:0,right:0};var c=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){b=c.ownerDocument.defaultView.getComputedStyle(c,"");if(b){a.top=parseInt(b.borderTopWidth,10)||0;a.bottom=parseInt(b.borderBottomWidth,10)||0;a.left=parseInt(b.borderLeftWidth,10)||0;a.right=parseInt(b.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(c.currentStyle){a.top=parseInt(c.currentStyle.borderTopWidth,10)||0;a.bottom=parseInt(c.currentStyle.borderBottomWidth,10)||0;a.left=parseInt(c.currentStyle.borderLeftWidth,10)||0;a.right=parseInt(c.currentStyle.borderRightWidth,10)||0}}}return a};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var a=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(a.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(a.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(a.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(a){if(typeof a.boxClass!=="undefined"){this.boxClass_=a.boxClass;this.setBoxStyle_()}if(typeof a.boxStyle!=="undefined"){this.boxStyle_=a.boxStyle;this.setBoxStyle_()}if(typeof a.content!=="undefined"){this.setContent(a.content)}if(typeof a.disableAutoPan!=="undefined"){this.disableAutoPan_=a.disableAutoPan}if(typeof a.maxWidth!=="undefined"){this.maxWidth_=a.maxWidth}if(typeof a.pixelOffset!=="undefined"){this.pixelOffset_=a.pixelOffset}if(typeof a.alignBottom!=="undefined"){this.alignBottom_=a.alignBottom}if(typeof a.position!=="undefined"){this.setPosition(a.position)}if(typeof a.zIndex!=="undefined"){this.setZIndex(a.zIndex)}if(typeof a.closeBoxMargin!=="undefined"){this.closeBoxMargin_=a.closeBoxMargin}if(typeof a.closeBoxURL!=="undefined"){this.closeBoxURL_=a.closeBoxURL}if(typeof a.infoBoxClearance!=="undefined"){this.infoBoxClearance_=a.infoBoxClearance}if(typeof a.isHidden!=="undefined"){this.isHidden_=a.isHidden}if(typeof a.visible!=="undefined"){this.isHidden_=!a.visible}if(typeof a.enableEventPropagation!=="undefined"){this.enableEventPropagation_=a.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(a){this.content_=a;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(a){this.position_=a;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(a){this.zIndex_=a;if(this.div_){this.div_.style.zIndex=a}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(a){this.isHidden_=!a;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var a;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){a=false}else{a=!this.isHidden_}return a};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(a,b){var c=this;if(b){this.position_=b.getPosition();this.moveListener_=google.maps.event.addListener(b,"position_changed",function(){c.setPosition(this.getPosition())})}this.setMap(a);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var a;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(a=0;a<this.eventListeners_.length;a++){google.maps.event.removeListener(this.eventListeners_[a])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(b,c,a){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=b;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var d=a||{};this.gridSize_=d.gridSize||60;this.minClusterSize_=d.minimumClusterSize||2;this.maxZoom_=d.maxZoom||null;this.styles_=d.styles||[];this.imagePath_=d.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=d.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(d.zoomOnClick!=undefined){this.zoomOnClick_=d.zoomOnClick}this.averageCenter_=false;if(d.averageCenter!=undefined){this.averageCenter_=d.averageCenter}this.setupStyles_();this.setMap(b);this.prevZoom_=this.map_.getZoom();var e=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var f=e.map_.getZoom();var g=e.map_.minZoom||0;var h=Math.min(e.map_.maxZoom||100,e.map_.mapTypes[e.map_.getMapTypeId()].maxZoom);f=Math.min(Math.max(f,g),h);if(e.prevZoom_!=f){e.prevZoom_=f;e.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){e.redraw()});if(c&&(c.length||Object.keys(c).length)){this.addMarkers(c,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(b,a){return(function(c){for(var d in c.prototype){this.prototype[d]=c.prototype[d]}return this}).apply(b,[a])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var b=0,a;a=this.sizes[b];b++){this.styles_.push({url:this.imagePath_+(b+1)+"."+this.imageExtension_,height:a,width:a})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var d=this.getMarkers();var c=new google.maps.LatLngBounds();for(var b=0,a;a=d[b];b++){c.extend(a.getPosition())}this.map_.fitBounds(c)};MarkerClusterer.prototype.setStyles=function(a){this.styles_=a};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(a){this.maxZoom_=a};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(b,a){var c=0;var e=b.length;var d=e;while(d!==0){d=parseInt(d/10,10);c++}c=Math.min(c,a);return{text:e,index:c}};MarkerClusterer.prototype.setCalculator=function(a){this.calculator_=a};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(d,c){if(d.length){for(var b=0,a;a=d[b];b++){this.pushMarkerTo_(a)}}else{if(Object.keys(d).length){for(var a in d){this.pushMarkerTo_(d[a])}}}if(!c){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(a){a.isAdded=false;if(a.draggable){var b=this;google.maps.event.addListener(a,"dragend",function(){a.isAdded=false;b.repaint()})}this.markers_.push(a)};MarkerClusterer.prototype.addMarker=function(a,b){this.pushMarkerTo_(a);if(!b){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(b){var c=-1;if(this.markers_.indexOf){c=this.markers_.indexOf(b)}else{for(var d=0,a;a=this.markers_[d];d++){if(a==b){c=d;break}}}if(c==-1){return false}b.setMap(null);this.markers_.splice(c,1);return true};MarkerClusterer.prototype.removeMarker=function(b,c){var a=this.removeMarker_(b);if(!c&&a){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(d,a){var c=false;for(var f=0,e;e=d[f];f++){var b=this.removeMarker_(e);c=c||b}if(!a&&c){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(a){if(!this.ready_){this.ready_=a;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(a){this.map_=a};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(a){this.gridSize_=a};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(a){this.minClusterSize_=a};MarkerClusterer.prototype.getExtendedBounds=function(a){var g=this.getProjection();var b=new google.maps.LatLng(a.getNorthEast().lat(),a.getNorthEast().lng());var d=new google.maps.LatLng(a.getSouthWest().lat(),a.getSouthWest().lng());var h=g.fromLatLngToDivPixel(b);h.x+=this.gridSize_;h.y-=this.gridSize_;var f=g.fromLatLngToDivPixel(d);f.x-=this.gridSize_;f.y+=this.gridSize_;var c=g.fromDivPixelToLatLng(h);var e=g.fromDivPixelToLatLng(f);a.extend(c);a.extend(e);return a};MarkerClusterer.prototype.isMarkerInBounds_=function(a,b){return b.contains(a.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(d){for(var c=0,a;a=this.clusters_[c];c++){a.remove()}for(var c=0,b;b=this.markers_[c];c++){b.isAdded=false;if(d){b.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var a=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var c=0,b;b=a[c];c++){b.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(f,k){if(!f||!k){return 0}var j=6371;var b=(k.lat()-f.lat())*Math.PI/180;var i=(k.lng()-f.lng())*Math.PI/180;var g=Math.sin(b/2)*Math.sin(b/2)+Math.cos(f.lat()*Math.PI/180)*Math.cos(k.lat()*Math.PI/180)*Math.sin(i/2)*Math.sin(i/2);var e=2*Math.atan2(Math.sqrt(g),Math.sqrt(1-g));var h=j*e;return h};MarkerClusterer.prototype.addToClosestCluster_=function(f){var c=40000;var j=null;var h=f.getPosition();for(var b=0,g;g=this.clusters_[b];b++){var e=g.getCenter();if(e){var a=this.distanceBetweenPoints_(e,f.getPosition());if(a<c){c=a;j=g}}}if(j&&j.isMarkerInClusterBounds(f)){j.addMarker(f)}else{var g=new Cluster(this);g.addMarker(f);this.clusters_.push(g)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var b=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var d=this.getExtendedBounds(b);for(var c=0,a;a=this.markers_[c];c++){if(!a.isAdded&&this.isMarkerInBounds_(a,d)){this.addToClosestCluster_(a)}}};function Cluster(a){this.markerClusterer_=a;this.map_=a.getMap();this.gridSize_=a.getGridSize();this.minClusterSize_=a.getMinClusterSize();this.averageCenter_=a.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,a.getStyles(),a.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(c){if(this.markers_.indexOf){return this.markers_.indexOf(c)!=-1}else{for(var a=0,b;b=this.markers_[a];a++){if(b==c){return true}}}return false};Cluster.prototype.addMarker=function(a){if(this.isMarkerAlreadyAdded(a)){return false}if(!this.center_){this.center_=a.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var f=this.markers_.length+1;var d=(this.center_.lat()*(f-1)+a.getPosition().lat())/f;var b=(this.center_.lng()*(f-1)+a.getPosition().lng())/f;this.center_=new google.maps.LatLng(d,b);this.calculateBounds_()}}a.isAdded=true;this.markers_.push(a);var e=this.markers_.length;if(e<this.minClusterSize_&&a.getMap()!=this.map_){a.setMap(this.map_)}if(e==this.minClusterSize_){for(var c=0;c<e;c++){this.markers_[c].setMap(null)}}if(e>=this.minClusterSize_){a.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var c=new google.maps.LatLngBounds(this.center_,this.center_);var d=this.getMarkers();for(var b=0,a;a=d[b];b++){c.extend(a.getPosition())}return c};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(a)};Cluster.prototype.isMarkerInClusterBounds=function(a){return this.bounds_.contains(a.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var c=this.map_.getZoom();var d=this.markerClusterer_.getMaxZoom();if(d&&c>d){for(var a=0,e;e=this.markers_[a];a++){e.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var b=this.markerClusterer_.getStyles().length;var f=this.markerClusterer_.getCalculator()(this.markers_,b);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(f);this.clusterIcon_.show()};function ClusterIcon(b,a,c){b.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=a;this.padding_=c||0;this.cluster_=b;this.center_=null;this.map_=b.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var a=this.cluster_.getMarkerClusterer();google.maps.event.trigger(a,"clusterclick",this.cluster_);if(a.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.innerHTML=this.sums_.text}var b=this.getPanes();b.overlayMouseTarget.appendChild(this.div_);var c=this;google.maps.event.addDomListener(this.div_,"click",function(){c.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(b){var a=this.getProjection().fromLatLngToDivPixel(b);a.x-=parseInt(this.width_/2,10);a.y-=parseInt(this.height_/2,10);return a};ClusterIcon.prototype.draw=function(){if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.top=a.y+"px";this.div_.style.left=a.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(a){this.sums_=a;this.text_=a.text;this.index_=a.index;if(this.div_){this.div_.innerHTML=a.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var a=Math.max(0,this.sums_.index-1);a=Math.min(this.styles_.length-1,a);var b=this.styles_[a];this.url_=b.url;this.height_=b.height;this.width_=b.width;this.textColor_=b.textColor;this.anchor_=b.anchor;this.textSize_=b.textSize;this.backgroundPosition_=b.backgroundPosition};ClusterIcon.prototype.setCenter=function(a){this.center_=a};ClusterIcon.prototype.createCss=function(b){var a=[];a.push("background-image:url("+this.url_+");");var d=this.backgroundPosition_?this.backgroundPosition_:"0 0";a.push("background-position:"+d+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){a.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{a.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){a.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{a.push("width:"+this.width_+"px; text-align:center;")}}else{a.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var c=this.textColor_?this.textColor_:"black";var e=this.textSize_?this.textSize_:11;a.push("cursor:pointer; top:"+b.y+"px; left:"+b.x+"px; color:"+c+"; position:absolute; font-size:"+e+"px; font-family:Arial,sans-serif; font-weight:bold");return a.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(a){var b=[];for(var c in a){if(a.hasOwnProperty(c)){b.push(c)}}return b};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var b=new google.maps.LatLng(-18.8800397,-47.05878999999999);var a={zoom:5,center:b,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),a)}initialize();function abrirInfoBox(b,a){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[b].open(map,a);idInfoBoxAberto=b}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(a){var c=new google.maps.LatLngBounds();$.each(a,function(f,g){var e=new google.maps.Marker({position:new google.maps.LatLng(g.Latitude,g.Longitude),title:"Mobiliados"});var d={content:"<p>"+g.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[g.Id]=new InfoBox(d);infoBox[g.Id].marker=e;infoBox[g.Id].listener=google.maps.event.addListener(e,"click",function(h){abrirInfoBox(g.Id,e)});markers.push(e);c.extend(e.position)});var b=new MarkerClusterer(map,markers);map.fitBounds(c)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(b){b=b||{};google.maps.OverlayView.apply(this,arguments);this.content_=b.content||"";this.disableAutoPan_=b.disableAutoPan||false;this.maxWidth_=b.maxWidth||0;this.pixelOffset_=b.pixelOffset||new google.maps.Size(0,0);this.position_=b.position||new google.maps.LatLng(0,0);this.zIndex_=b.zIndex||null;this.boxClass_=b.boxClass||"infoBox";this.boxStyle_=b.boxStyle||{};this.closeBoxMargin_=b.closeBoxMargin||"2px";this.closeBoxURL_=b.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(b.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=b.infoBoxClearance||new google.maps.Size(1,1);if(typeof b.visible==="undefined"){if(typeof b.isHidden==="undefined"){b.visible=true}else{b.visible=!b.isHidden}}this.isHidden_=!b.visible;this.alignBottom_=b.alignBottom||false;this.pane_=b.pane||"floatPane";this.enableEventPropagation_=b.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var i;var j;var k;var h=this;var g=function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}};var l=function(a){a.returnValue=false;if(a.preventDefault){a.preventDefault()}if(!h.enableEventPropagation_){g(a)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{k=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-k.left-k.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];j=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(i=0;i<j.length;i++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,j[i],g))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(a){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",l);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var b="";if(this.closeBoxURL_!==""){b="<img";b+=" src='"+this.closeBoxURL_+"'";b+=" align=right";b+=" style='";b+=" position: relative;";b+=" cursor: pointer;";b+=" margin: "+this.closeBoxMargin_+";";b+="'>"}return b};InfoBox.prototype.addClickHandler_=function(){var b;if(this.closeBoxURL_!==""){b=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(b,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var b=this;return function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}google.maps.event.trigger(b,"closeclick");b.close()}};InfoBox.prototype.panBox_=function(C){var B;var A;var u=0,y=0;if(!C){B=this.getMap();if(B instanceof google.maps.Map){if(!B.getBounds().contains(this.position_)){B.setCenter(this.position_)}A=B.getBounds();var z=B.getDiv();var x=z.offsetWidth;var v=z.offsetHeight;var c=this.pixelOffset_.width;var r=this.pixelOffset_.height;var w=this.div_.offsetWidth;var E=this.div_.offsetHeight;var D=this.infoBoxClearance_.width;var F=this.infoBoxClearance_.height;var s=this.getProjection().fromLatLngToContainerPixel(this.position_);if(s.x<(-c+D)){u=s.x+c-D}else{if((s.x+w+c+D)>x){u=s.x+w+c+D-x}}if(this.alignBottom_){if(s.y<(-r+F+E)){y=s.y+r-F-E}else{if((s.y+r+F)>v){y=s.y+r+F-v}}}else{if(s.y<(-r+F)){y=s.y+r-F}else{if((s.y+E+r+F)>v){y=s.y+E+r+F-v}}}if(!(u===0&&y===0)){var t=B.getCenter();B.panBy(u,y)}}}};InfoBox.prototype.setBoxStyle_=function(){var d,c;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";c=this.boxStyle_;for(d in c){if(c.hasOwnProperty(d)){this.div_.style[d]=c[d]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var d;var e={top:0,bottom:0,left:0,right:0};var f=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){d=f.ownerDocument.defaultView.getComputedStyle(f,"");if(d){e.top=parseInt(d.borderTopWidth,10)||0;e.bottom=parseInt(d.borderBottomWidth,10)||0;e.left=parseInt(d.borderLeftWidth,10)||0;e.right=parseInt(d.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(f.currentStyle){e.top=parseInt(f.currentStyle.borderTopWidth,10)||0;e.bottom=parseInt(f.currentStyle.borderBottomWidth,10)||0;e.left=parseInt(f.currentStyle.borderLeftWidth,10)||0;e.right=parseInt(f.currentStyle.borderRightWidth,10)||0}}}return e};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var b=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(b.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(b.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(b.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(b){if(typeof b.boxClass!=="undefined"){this.boxClass_=b.boxClass;this.setBoxStyle_()}if(typeof b.boxStyle!=="undefined"){this.boxStyle_=b.boxStyle;this.setBoxStyle_()}if(typeof b.content!=="undefined"){this.setContent(b.content)}if(typeof b.disableAutoPan!=="undefined"){this.disableAutoPan_=b.disableAutoPan}if(typeof b.maxWidth!=="undefined"){this.maxWidth_=b.maxWidth}if(typeof b.pixelOffset!=="undefined"){this.pixelOffset_=b.pixelOffset}if(typeof b.alignBottom!=="undefined"){this.alignBottom_=b.alignBottom}if(typeof b.position!=="undefined"){this.setPosition(b.position)}if(typeof b.zIndex!=="undefined"){this.setZIndex(b.zIndex)}if(typeof b.closeBoxMargin!=="undefined"){this.closeBoxMargin_=b.closeBoxMargin}if(typeof b.closeBoxURL!=="undefined"){this.closeBoxURL_=b.closeBoxURL}if(typeof b.infoBoxClearance!=="undefined"){this.infoBoxClearance_=b.infoBoxClearance}if(typeof b.isHidden!=="undefined"){this.isHidden_=b.isHidden}if(typeof b.visible!=="undefined"){this.isHidden_=!b.visible}if(typeof b.enableEventPropagation!=="undefined"){this.enableEventPropagation_=b.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(b){this.content_=b;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(b){this.position_=b;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(b){this.zIndex_=b;if(this.div_){this.div_.style.zIndex=b}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(b){this.isHidden_=!b;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var b;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){b=false}else{b=!this.isHidden_}return b};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(e,d){var f=this;if(d){this.position_=d.getPosition();this.moveListener_=google.maps.event.addListener(d,"position_changed",function(){f.setPosition(this.getPosition())})}this.setMap(e);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var b;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(b=0;b<this.eventListeners_.length;b++){google.maps.event.removeListener(this.eventListeners_[b])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(f,j,g){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=f;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var i=g||{};this.gridSize_=i.gridSize||60;this.minClusterSize_=i.minimumClusterSize||2;this.maxZoom_=i.maxZoom||null;this.styles_=i.styles||[];this.imagePath_=i.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=i.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(i.zoomOnClick!=undefined){this.zoomOnClick_=i.zoomOnClick}this.averageCenter_=false;if(i.averageCenter!=undefined){this.averageCenter_=i.averageCenter}this.setupStyles_();this.setMap(f);this.prevZoom_=this.map_.getZoom();var h=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var c=h.map_.getZoom();var b=h.map_.minZoom||0;var a=Math.min(h.map_.maxZoom||100,h.map_.mapTypes[h.map_.getMapTypeId()].maxZoom);c=Math.min(Math.max(c,b),a);if(h.prevZoom_!=c){h.prevZoom_=c;h.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){h.redraw()});if(j&&(j.length||Object.keys(j).length)){this.addMarkers(j,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(c,d){return(function(b){for(var a in b.prototype){this.prototype[a]=b.prototype[a]}return this}).apply(c,[d])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var c=0,d;d=this.sizes[c];c++){this.styles_.push({url:this.imagePath_+(c+1)+"."+this.imageExtension_,height:d,width:d})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var g=this.getMarkers();var h=new google.maps.LatLngBounds();for(var e=0,f;f=g[e];e++){h.extend(f.getPosition())}this.map_.fitBounds(h)};MarkerClusterer.prototype.setStyles=function(b){this.styles_=b};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(b){this.maxZoom_=b};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(f,g){var j=0;var h=f.length;var i=h;while(i!==0){i=parseInt(i/10,10);j++}j=Math.min(j,g);return{text:h,index:j}};MarkerClusterer.prototype.setCalculator=function(b){this.calculator_=b};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(g,h){if(g.length){for(var e=0,f;f=g[e];e++){this.pushMarkerTo_(f)}}else{if(Object.keys(g).length){for(var f in g){this.pushMarkerTo_(g[f])}}}if(!h){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(d){d.isAdded=false;if(d.draggable){var c=this;google.maps.event.addListener(d,"dragend",function(){d.isAdded=false;c.repaint()})}this.markers_.push(d)};MarkerClusterer.prototype.addMarker=function(d,c){this.pushMarkerTo_(d);if(!c){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(e){var h=-1;if(this.markers_.indexOf){h=this.markers_.indexOf(e)}else{for(var g=0,f;f=this.markers_[g];g++){if(f==e){h=g;break}}}if(h==-1){return false}e.setMap(null);this.markers_.splice(h,1);return true};MarkerClusterer.prototype.removeMarker=function(d,f){var e=this.removeMarker_(d);if(!f&&e){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(k,h){var l=false;for(var i=0,j;j=k[i];i++){var g=this.removeMarker_(j);l=l||g}if(!h&&l){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(b){if(!this.ready_){this.ready_=b;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(b){this.map_=b};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(b){this.gridSize_=b};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(b){this.minClusterSize_=b};MarkerClusterer.prototype.getExtendedBounds=function(j){var l=this.getProjection();var i=new google.maps.LatLng(j.getNorthEast().lat(),j.getNorthEast().lng());var o=new google.maps.LatLng(j.getSouthWest().lat(),j.getSouthWest().lng());var k=l.fromLatLngToDivPixel(i);k.x+=this.gridSize_;k.y-=this.gridSize_;var m=l.fromLatLngToDivPixel(o);m.x-=this.gridSize_;m.y+=this.gridSize_;var p=l.fromDivPixelToLatLng(k);var n=l.fromDivPixelToLatLng(m);j.extend(p);j.extend(n);return j};MarkerClusterer.prototype.isMarkerInBounds_=function(d,c){return c.contains(d.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(g){for(var h=0,f;f=this.clusters_[h];h++){f.remove()}for(var h=0,e;e=this.markers_[h];h++){e.isAdded=false;if(g){e.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var b=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var d=0,a;a=b[d];d++){a.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(o,c){if(!o||!c){return 0}var d=6371;var a=(c.lat()-o.lat())*Math.PI/180;var l=(c.lng()-o.lng())*Math.PI/180;var n=Math.sin(a/2)*Math.sin(a/2)+Math.cos(o.lat()*Math.PI/180)*Math.cos(c.lat()*Math.PI/180)*Math.sin(l/2)*Math.sin(l/2);var p=2*Math.atan2(Math.sqrt(n),Math.sqrt(1-n));var m=d*p;return m};MarkerClusterer.prototype.addToClosestCluster_=function(n){var p=40000;var k=null;var l=n.getPosition();for(var d=0,m;m=this.clusters_[d];d++){var o=m.getCenter();if(o){var i=this.distanceBetweenPoints_(o,n.getPosition());if(i<p){p=i;k=m}}}if(k&&k.isMarkerInClusterBounds(n)){k.addMarker(n)}else{var m=new Cluster(this);m.addMarker(n);this.clusters_.push(m)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var e=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var g=this.getExtendedBounds(e);for(var h=0,f;f=this.markers_[h];h++){if(!f.isAdded&&this.isMarkerInBounds_(f,g)){this.addToClosestCluster_(f)}}};function Cluster(b){this.markerClusterer_=b;this.map_=b.getMap();this.gridSize_=b.getGridSize();this.minClusterSize_=b.getMinClusterSize();this.averageCenter_=b.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,b.getStyles(),b.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(f){if(this.markers_.indexOf){return this.markers_.indexOf(f)!=-1}else{for(var e=0,d;d=this.markers_[e];e++){if(d==f){return true}}}return false};Cluster.prototype.addMarker=function(h){if(this.isMarkerAlreadyAdded(h)){return false}if(!this.center_){this.center_=h.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var i=this.markers_.length+1;var k=(this.center_.lat()*(i-1)+h.getPosition().lat())/i;var g=(this.center_.lng()*(i-1)+h.getPosition().lng())/i;this.center_=new google.maps.LatLng(k,g);this.calculateBounds_()}}h.isAdded=true;this.markers_.push(h);var j=this.markers_.length;if(j<this.minClusterSize_&&h.getMap()!=this.map_){h.setMap(this.map_)}if(j==this.minClusterSize_){for(var l=0;l<j;l++){this.markers_[l].setMap(null)}}if(j>=this.minClusterSize_){h.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var h=new google.maps.LatLngBounds(this.center_,this.center_);var g=this.getMarkers();for(var e=0,f;f=g[e];e++){h.extend(f.getPosition())}return h};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var b=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(b)};Cluster.prototype.isMarkerInClusterBounds=function(b){return this.bounds_.contains(b.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var l=this.map_.getZoom();var k=this.markerClusterer_.getMaxZoom();if(k&&l>k){for(var h=0,j;j=this.markers_[h];h++){j.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var g=this.markerClusterer_.getStyles().length;var i=this.markerClusterer_.getCalculator()(this.markers_,g);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(i);this.clusterIcon_.show()};function ClusterIcon(d,e,f){d.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=e;this.padding_=f||0;this.cluster_=d;this.center_=null;this.map_=d.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var b=this.cluster_.getMarkerClusterer();google.maps.event.trigger(b,"clusterclick",this.cluster_);if(b.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var e=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(e);this.div_.innerHTML=this.sums_.text}var d=this.getPanes();d.overlayMouseTarget.appendChild(this.div_);var f=this;google.maps.event.addDomListener(this.div_,"click",function(){f.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(c){var d=this.getProjection().fromLatLngToDivPixel(c);d.x-=parseInt(this.width_/2,10);d.y-=parseInt(this.height_/2,10);return d};ClusterIcon.prototype.draw=function(){if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.top=b.y+"px";this.div_.style.left=b.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(b){this.sums_=b;this.text_=b.text;this.index_=b.index;if(this.div_){this.div_.innerHTML=b.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var d=Math.max(0,this.sums_.index-1);d=Math.min(this.styles_.length-1,d);var c=this.styles_[d];this.url_=c.url;this.height_=c.height;this.width_=c.width;this.textColor_=c.textColor;this.anchor_=c.anchor;this.textSize_=c.textSize;this.backgroundPosition_=c.backgroundPosition};ClusterIcon.prototype.setCenter=function(b){this.center_=b};ClusterIcon.prototype.createCss=function(f){var g=[];g.push("background-image:url("+this.url_+");");var i=this.backgroundPosition_?this.backgroundPosition_:"0 0";g.push("background-position:"+i+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){g.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{g.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){g.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{g.push("width:"+this.width_+"px; text-align:center;")}}else{g.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var j=this.textColor_?this.textColor_:"black";var h=this.textSize_?this.textSize_:11;g.push("cursor:pointer; top:"+f.y+"px; left:"+f.x+"px; color:"+j+"; position:absolute; font-size:"+h+"px; font-family:Arial,sans-serif; font-weight:bold");return g.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(e){var d=[];for(var f in e){if(e.hasOwnProperty(f)){d.push(f)}}return d};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var c=new google.maps.LatLng(-18.8800397,-47.05878999999999);var d={zoom:5,center:c,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),d)}initialize();function abrirInfoBox(c,d){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[c].open(map,d);idInfoBoxAberto=c}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(e){var f=new google.maps.LatLngBounds();$.each(e,function(b,a){var c=new google.maps.Marker({position:new google.maps.LatLng(a.Latitude,a.Longitude),title:"Mobiliados"});var h={content:"<p>"+a.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[a.Id]=new InfoBox(h);infoBox[a.Id].marker=c;infoBox[a.Id].listener=google.maps.event.addListener(c,"click",function(g){abrirInfoBox(a.Id,c)});markers.push(c);f.extend(c.position)});var d=new MarkerClusterer(map,markers);map.fitBounds(f)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(a){a=a||{};google.maps.OverlayView.apply(this,arguments);this.content_=a.content||"";this.disableAutoPan_=a.disableAutoPan||false;this.maxWidth_=a.maxWidth||0;this.pixelOffset_=a.pixelOffset||new google.maps.Size(0,0);this.position_=a.position||new google.maps.LatLng(0,0);this.zIndex_=a.zIndex||null;this.boxClass_=a.boxClass||"infoBox";this.boxStyle_=a.boxStyle||{};this.closeBoxMargin_=a.closeBoxMargin||"2px";this.closeBoxURL_=a.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(a.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=a.infoBoxClearance||new google.maps.Size(1,1);if(typeof a.visible==="undefined"){if(typeof a.isHidden==="undefined"){a.visible=true}else{a.visible=!a.isHidden}}this.isHidden_=!a.visible;this.alignBottom_=a.alignBottom||false;this.pane_=a.pane||"floatPane";this.enableEventPropagation_=a.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var d;var c;var b;var e=this;var f=function(g){g.cancelBubble=true;if(g.stopPropagation){g.stopPropagation()}};var a=function(g){g.returnValue=false;if(g.preventDefault){g.preventDefault()}if(!e.enableEventPropagation_){f(g)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{b=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-b.left-b.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];c=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(d=0;d<c.length;d++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,c[d],f))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(g){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",a);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var a="";if(this.closeBoxURL_!==""){a="<img";a+=" src='"+this.closeBoxURL_+"'";a+=" align=right";a+=" style='";a+=" position: relative;";a+=" cursor: pointer;";a+=" margin: "+this.closeBoxMargin_+";";a+="'>"}return a};InfoBox.prototype.addClickHandler_=function(){var a;if(this.closeBoxURL_!==""){a=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(a,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var a=this;return function(b){b.cancelBubble=true;if(b.stopPropagation){b.stopPropagation()}google.maps.event.trigger(a,"closeclick");a.close()}};InfoBox.prototype.panBox_=function(d){var e;var f;var m=0,i=0;if(!d){e=this.getMap();if(e instanceof google.maps.Map){if(!e.getBounds().contains(this.position_)){e.setCenter(this.position_)}f=e.getBounds();var h=e.getDiv();var j=h.offsetWidth;var l=h.offsetHeight;var g=this.pixelOffset_.width;var b=this.pixelOffset_.height;var k=this.div_.offsetWidth;var q=this.div_.offsetHeight;var a=this.infoBoxClearance_.width;var o=this.infoBoxClearance_.height;var p=this.getProjection().fromLatLngToContainerPixel(this.position_);if(p.x<(-g+a)){m=p.x+g-a}else{if((p.x+k+g+a)>j){m=p.x+k+g+a-j}}if(this.alignBottom_){if(p.y<(-b+o+q)){i=p.y+b-o-q}else{if((p.y+b+o)>l){i=p.y+b+o-l}}}else{if(p.y<(-b+o)){i=p.y+b-o}else{if((p.y+q+b+o)>l){i=p.y+q+b+o-l}}}if(!(m===0&&i===0)){var n=e.getCenter();e.panBy(m,i)}}}};InfoBox.prototype.setBoxStyle_=function(){var a,b;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";b=this.boxStyle_;for(a in b){if(b.hasOwnProperty(a)){this.div_.style[a]=b[a]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var c;var b={top:0,bottom:0,left:0,right:0};var a=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){c=a.ownerDocument.defaultView.getComputedStyle(a,"");if(c){b.top=parseInt(c.borderTopWidth,10)||0;b.bottom=parseInt(c.borderBottomWidth,10)||0;b.left=parseInt(c.borderLeftWidth,10)||0;b.right=parseInt(c.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(a.currentStyle){b.top=parseInt(a.currentStyle.borderTopWidth,10)||0;b.bottom=parseInt(a.currentStyle.borderBottomWidth,10)||0;b.left=parseInt(a.currentStyle.borderLeftWidth,10)||0;b.right=parseInt(a.currentStyle.borderRightWidth,10)||0}}}return b};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var a=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(a.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(a.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(a.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(a){if(typeof a.boxClass!=="undefined"){this.boxClass_=a.boxClass;this.setBoxStyle_()}if(typeof a.boxStyle!=="undefined"){this.boxStyle_=a.boxStyle;this.setBoxStyle_()}if(typeof a.content!=="undefined"){this.setContent(a.content)}if(typeof a.disableAutoPan!=="undefined"){this.disableAutoPan_=a.disableAutoPan}if(typeof a.maxWidth!=="undefined"){this.maxWidth_=a.maxWidth}if(typeof a.pixelOffset!=="undefined"){this.pixelOffset_=a.pixelOffset}if(typeof a.alignBottom!=="undefined"){this.alignBottom_=a.alignBottom}if(typeof a.position!=="undefined"){this.setPosition(a.position)}if(typeof a.zIndex!=="undefined"){this.setZIndex(a.zIndex)}if(typeof a.closeBoxMargin!=="undefined"){this.closeBoxMargin_=a.closeBoxMargin}if(typeof a.closeBoxURL!=="undefined"){this.closeBoxURL_=a.closeBoxURL}if(typeof a.infoBoxClearance!=="undefined"){this.infoBoxClearance_=a.infoBoxClearance}if(typeof a.isHidden!=="undefined"){this.isHidden_=a.isHidden}if(typeof a.visible!=="undefined"){this.isHidden_=!a.visible}if(typeof a.enableEventPropagation!=="undefined"){this.enableEventPropagation_=a.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(a){this.content_=a;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(a){this.position_=a;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(a){this.zIndex_=a;if(this.div_){this.div_.style.zIndex=a}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(a){this.isHidden_=!a;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var a;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){a=false}else{a=!this.isHidden_}return a};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(b,c){var a=this;if(c){this.position_=c.getPosition();this.moveListener_=google.maps.event.addListener(c,"position_changed",function(){a.setPosition(this.getPosition())})}this.setMap(b);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var a;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(a=0;a<this.eventListeners_.length;a++){google.maps.event.removeListener(this.eventListeners_[a])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(e,a,d){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=e;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var b=d||{};this.gridSize_=b.gridSize||60;this.minClusterSize_=b.minimumClusterSize||2;this.maxZoom_=b.maxZoom||null;this.styles_=b.styles||[];this.imagePath_=b.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=b.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(b.zoomOnClick!=undefined){this.zoomOnClick_=b.zoomOnClick}this.averageCenter_=false;if(b.averageCenter!=undefined){this.averageCenter_=b.averageCenter}this.setupStyles_();this.setMap(e);this.prevZoom_=this.map_.getZoom();var c=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var h=c.map_.getZoom();var f=c.map_.minZoom||0;var g=Math.min(c.map_.maxZoom||100,c.map_.mapTypes[c.map_.getMapTypeId()].maxZoom);h=Math.min(Math.max(h,f),g);if(c.prevZoom_!=h){c.prevZoom_=h;c.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){c.redraw()});if(a&&(a.length||Object.keys(a).length)){this.addMarkers(a,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(b,a){return(function(c){for(var d in c.prototype){this.prototype[d]=c.prototype[d]}return this}).apply(b,[a])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var b=0,a;a=this.sizes[b];b++){this.styles_.push({url:this.imagePath_+(b+1)+"."+this.imageExtension_,height:a,width:a})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var b=this.getMarkers();var a=new google.maps.LatLngBounds();for(var d=0,c;c=b[d];d++){a.extend(c.getPosition())}this.map_.fitBounds(a)};MarkerClusterer.prototype.setStyles=function(a){this.styles_=a};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(a){this.maxZoom_=a};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(e,d){var a=0;var c=e.length;var b=c;while(b!==0){b=parseInt(b/10,10);a++}a=Math.min(a,d);return{text:c,index:a}};MarkerClusterer.prototype.setCalculator=function(a){this.calculator_=a};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(b,a){if(b.length){for(var d=0,c;c=b[d];d++){this.pushMarkerTo_(c)}}else{if(Object.keys(b).length){for(var c in b){this.pushMarkerTo_(b[c])}}}if(!a){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(a){a.isAdded=false;if(a.draggable){var b=this;google.maps.event.addListener(a,"dragend",function(){a.isAdded=false;b.repaint()})}this.markers_.push(a)};MarkerClusterer.prototype.addMarker=function(a,b){this.pushMarkerTo_(a);if(!b){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(d){var a=-1;if(this.markers_.indexOf){a=this.markers_.indexOf(d)}else{for(var b=0,c;c=this.markers_[b];b++){if(c==d){a=b;break}}}if(a==-1){return false}d.setMap(null);this.markers_.splice(a,1);return true};MarkerClusterer.prototype.removeMarker=function(c,a){var b=this.removeMarker_(c);if(!a&&b){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(b,e){var a=false;for(var d=0,c;c=b[d];d++){var f=this.removeMarker_(c);a=a||f}if(!e&&a){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(a){if(!this.ready_){this.ready_=a;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(a){this.map_=a};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(a){this.gridSize_=a};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(a){this.minClusterSize_=a};MarkerClusterer.prototype.getExtendedBounds=function(d){var b=this.getProjection();var e=new google.maps.LatLng(d.getNorthEast().lat(),d.getNorthEast().lng());var g=new google.maps.LatLng(d.getSouthWest().lat(),d.getSouthWest().lng());var c=b.fromLatLngToDivPixel(e);c.x+=this.gridSize_;c.y-=this.gridSize_;var a=b.fromLatLngToDivPixel(g);a.x-=this.gridSize_;a.y+=this.gridSize_;var f=b.fromDivPixelToLatLng(c);var h=b.fromDivPixelToLatLng(a);d.extend(f);d.extend(h);return d};MarkerClusterer.prototype.isMarkerInBounds_=function(a,b){return b.contains(a.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(b){for(var a=0,c;c=this.clusters_[a];a++){c.remove()}for(var a=0,d;d=this.markers_[a];a++){d.isAdded=false;if(b){d.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var a=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var c=0,b;b=a[c];c++){b.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(i,k){if(!i||!k){return 0}var h=6371;var f=(k.lat()-i.lat())*Math.PI/180;var e=(k.lng()-i.lng())*Math.PI/180;var j=Math.sin(f/2)*Math.sin(f/2)+Math.cos(i.lat()*Math.PI/180)*Math.cos(k.lat()*Math.PI/180)*Math.sin(e/2)*Math.sin(e/2);var g=2*Math.atan2(Math.sqrt(j),Math.sqrt(1-j));var b=h*g;return b};MarkerClusterer.prototype.addToClosestCluster_=function(j){var f=40000;var c=null;var b=j.getPosition();for(var h=0,a;a=this.clusters_[h];h++){var g=a.getCenter();if(g){var e=this.distanceBetweenPoints_(g,j.getPosition());if(e<f){f=e;c=a}}}if(c&&c.isMarkerInClusterBounds(j)){c.addMarker(j)}else{var a=new Cluster(this);a.addMarker(j);this.clusters_.push(a)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var d=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var b=this.getExtendedBounds(d);for(var a=0,c;c=this.markers_[a];a++){if(!c.isAdded&&this.isMarkerInBounds_(c,b)){this.addToClosestCluster_(c)}}};function Cluster(a){this.markerClusterer_=a;this.map_=a.getMap();this.gridSize_=a.getGridSize();this.minClusterSize_=a.getMinClusterSize();this.averageCenter_=a.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,a.getStyles(),a.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(a){if(this.markers_.indexOf){return this.markers_.indexOf(a)!=-1}else{for(var b=0,c;c=this.markers_[b];b++){if(c==a){return true}}}return false};Cluster.prototype.addMarker=function(e){if(this.isMarkerAlreadyAdded(e)){return false}if(!this.center_){this.center_=e.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var d=this.markers_.length+1;var b=(this.center_.lat()*(d-1)+e.getPosition().lat())/d;var f=(this.center_.lng()*(d-1)+e.getPosition().lng())/d;this.center_=new google.maps.LatLng(b,f);this.calculateBounds_()}}e.isAdded=true;this.markers_.push(e);var c=this.markers_.length;if(c<this.minClusterSize_&&e.getMap()!=this.map_){e.setMap(this.map_)}if(c==this.minClusterSize_){for(var a=0;a<c;a++){this.markers_[a].setMap(null)}}if(c>=this.minClusterSize_){e.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);var b=this.getMarkers();for(var d=0,c;c=b[d];d++){a.extend(c.getPosition())}return a};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(a)};Cluster.prototype.isMarkerInClusterBounds=function(a){return this.bounds_.contains(a.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var a=this.map_.getZoom();var b=this.markerClusterer_.getMaxZoom();if(b&&a>b){for(var e=0,c;c=this.markers_[e];e++){c.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var f=this.markerClusterer_.getStyles().length;var d=this.markerClusterer_.getCalculator()(this.markers_,f);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(d);this.clusterIcon_.show()};function ClusterIcon(c,b,a){c.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=b;this.padding_=a||0;this.cluster_=c;this.center_=null;this.map_=c.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var a=this.cluster_.getMarkerClusterer();google.maps.event.trigger(a,"clusterclick",this.cluster_);if(a.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.innerHTML=this.sums_.text}var c=this.getPanes();c.overlayMouseTarget.appendChild(this.div_);var a=this;google.maps.event.addDomListener(this.div_,"click",function(){a.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(b){var a=this.getProjection().fromLatLngToDivPixel(b);a.x-=parseInt(this.width_/2,10);a.y-=parseInt(this.height_/2,10);return a};ClusterIcon.prototype.draw=function(){if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.top=a.y+"px";this.div_.style.left=a.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(a){this.sums_=a;this.text_=a.text;this.index_=a.index;if(this.div_){this.div_.innerHTML=a.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var a=Math.max(0,this.sums_.index-1);a=Math.min(this.styles_.length-1,a);var b=this.styles_[a];this.url_=b.url;this.height_=b.height;this.width_=b.width;this.textColor_=b.textColor;this.anchor_=b.anchor;this.textSize_=b.textSize;this.backgroundPosition_=b.backgroundPosition};ClusterIcon.prototype.setCenter=function(a){this.center_=a};ClusterIcon.prototype.createCss=function(e){var d=[];d.push("background-image:url("+this.url_+");");var b=this.backgroundPosition_?this.backgroundPosition_:"0 0";d.push("background-position:"+b+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){d.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{d.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){d.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{d.push("width:"+this.width_+"px; text-align:center;")}}else{d.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var a=this.textColor_?this.textColor_:"black";var c=this.textSize_?this.textSize_:11;d.push("cursor:pointer; top:"+e.y+"px; left:"+e.x+"px; color:"+a+"; position:absolute; font-size:"+c+"px; font-family:Arial,sans-serif; font-weight:bold");return d.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(b){var c=[];for(var a in b){if(b.hasOwnProperty(a)){c.push(a)}}return c};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var b=new google.maps.LatLng(-18.8800397,-47.05878999999999);var a={zoom:5,center:b,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),a)}initialize();function abrirInfoBox(b,a){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[b].open(map,a);idInfoBoxAberto=b}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(b){var a=new google.maps.LatLngBounds();$.each(b,function(d,e){var g=new google.maps.Marker({position:new google.maps.LatLng(e.Latitude,e.Longitude),title:"Mobiliados"});var f={content:"<p>"+e.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[e.Id]=new InfoBox(f);infoBox[e.Id].marker=g;infoBox[e.Id].listener=google.maps.event.addListener(g,"click",function(h){abrirInfoBox(e.Id,g)});markers.push(g);a.extend(g.position)});var c=new MarkerClusterer(map,markers);map.fitBounds(a)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(b){b=b||{};google.maps.OverlayView.apply(this,arguments);this.content_=b.content||"";this.disableAutoPan_=b.disableAutoPan||false;this.maxWidth_=b.maxWidth||0;this.pixelOffset_=b.pixelOffset||new google.maps.Size(0,0);this.position_=b.position||new google.maps.LatLng(0,0);this.zIndex_=b.zIndex||null;this.boxClass_=b.boxClass||"infoBox";this.boxStyle_=b.boxStyle||{};this.closeBoxMargin_=b.closeBoxMargin||"2px";this.closeBoxURL_=b.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(b.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=b.infoBoxClearance||new google.maps.Size(1,1);if(typeof b.visible==="undefined"){if(typeof b.isHidden==="undefined"){b.visible=true}else{b.visible=!b.isHidden}}this.isHidden_=!b.visible;this.alignBottom_=b.alignBottom||false;this.pane_=b.pane||"floatPane";this.enableEventPropagation_=b.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var k;var l;var g;var j=this;var i=function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}};var h=function(a){a.returnValue=false;if(a.preventDefault){a.preventDefault()}if(!j.enableEventPropagation_){i(a)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{g=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-g.left-g.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];l=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(k=0;k<l.length;k++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,l[k],i))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(a){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",h);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var b="";if(this.closeBoxURL_!==""){b="<img";b+=" src='"+this.closeBoxURL_+"'";b+=" align=right";b+=" style='";b+=" position: relative;";b+=" cursor: pointer;";b+=" margin: "+this.closeBoxMargin_+";";b+="'>"}return b};InfoBox.prototype.addClickHandler_=function(){var b;if(this.closeBoxURL_!==""){b=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(b,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var b=this;return function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}google.maps.event.trigger(b,"closeclick");b.close()}};InfoBox.prototype.panBox_=function(D){var C;var B;var u=0,y=0;if(!D){C=this.getMap();if(C instanceof google.maps.Map){if(!C.getBounds().contains(this.position_)){C.setCenter(this.position_)}B=C.getBounds();var z=C.getDiv();var x=z.offsetWidth;var v=z.offsetHeight;var A=this.pixelOffset_.width;var E=this.pixelOffset_.height;var w=this.div_.offsetWidth;var c=this.div_.offsetHeight;var F=this.infoBoxClearance_.width;var s=this.infoBoxClearance_.height;var r=this.getProjection().fromLatLngToContainerPixel(this.position_);if(r.x<(-A+F)){u=r.x+A-F}else{if((r.x+w+A+F)>x){u=r.x+w+A+F-x}}if(this.alignBottom_){if(r.y<(-E+s+c)){y=r.y+E-s-c}else{if((r.y+E+s)>v){y=r.y+E+s-v}}}else{if(r.y<(-E+s)){y=r.y+E-s}else{if((r.y+c+E+s)>v){y=r.y+c+E+s-v}}}if(!(u===0&&y===0)){var t=C.getCenter();C.panBy(u,y)}}}};InfoBox.prototype.setBoxStyle_=function(){var d,c;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";c=this.boxStyle_;for(d in c){if(c.hasOwnProperty(d)){this.div_.style[d]=c[d]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var f;var d={top:0,bottom:0,left:0,right:0};var e=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){f=e.ownerDocument.defaultView.getComputedStyle(e,"");if(f){d.top=parseInt(f.borderTopWidth,10)||0;d.bottom=parseInt(f.borderBottomWidth,10)||0;d.left=parseInt(f.borderLeftWidth,10)||0;d.right=parseInt(f.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(e.currentStyle){d.top=parseInt(e.currentStyle.borderTopWidth,10)||0;d.bottom=parseInt(e.currentStyle.borderBottomWidth,10)||0;d.left=parseInt(e.currentStyle.borderLeftWidth,10)||0;d.right=parseInt(e.currentStyle.borderRightWidth,10)||0}}}return d};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var b=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(b.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(b.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(b.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(b){if(typeof b.boxClass!=="undefined"){this.boxClass_=b.boxClass;this.setBoxStyle_()}if(typeof b.boxStyle!=="undefined"){this.boxStyle_=b.boxStyle;this.setBoxStyle_()}if(typeof b.content!=="undefined"){this.setContent(b.content)}if(typeof b.disableAutoPan!=="undefined"){this.disableAutoPan_=b.disableAutoPan}if(typeof b.maxWidth!=="undefined"){this.maxWidth_=b.maxWidth}if(typeof b.pixelOffset!=="undefined"){this.pixelOffset_=b.pixelOffset}if(typeof b.alignBottom!=="undefined"){this.alignBottom_=b.alignBottom}if(typeof b.position!=="undefined"){this.setPosition(b.position)}if(typeof b.zIndex!=="undefined"){this.setZIndex(b.zIndex)}if(typeof b.closeBoxMargin!=="undefined"){this.closeBoxMargin_=b.closeBoxMargin}if(typeof b.closeBoxURL!=="undefined"){this.closeBoxURL_=b.closeBoxURL}if(typeof b.infoBoxClearance!=="undefined"){this.infoBoxClearance_=b.infoBoxClearance}if(typeof b.isHidden!=="undefined"){this.isHidden_=b.isHidden}if(typeof b.visible!=="undefined"){this.isHidden_=!b.visible}if(typeof b.enableEventPropagation!=="undefined"){this.enableEventPropagation_=b.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(b){this.content_=b;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(b){this.position_=b;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(b){this.zIndex_=b;if(this.div_){this.div_.style.zIndex=b}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(b){this.isHidden_=!b;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var b;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){b=false}else{b=!this.isHidden_}return b};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(d,f){var e=this;if(f){this.position_=f.getPosition();this.moveListener_=google.maps.event.addListener(f,"position_changed",function(){e.setPosition(this.getPosition())})}this.setMap(d);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var b;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(b=0;b<this.eventListeners_.length;b++){google.maps.event.removeListener(this.eventListeners_[b])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(h,g,i){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=h;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var f=i||{};this.gridSize_=f.gridSize||60;this.minClusterSize_=f.minimumClusterSize||2;this.maxZoom_=f.maxZoom||null;this.styles_=f.styles||[];this.imagePath_=f.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=f.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(f.zoomOnClick!=undefined){this.zoomOnClick_=f.zoomOnClick}this.averageCenter_=false;if(f.averageCenter!=undefined){this.averageCenter_=f.averageCenter}this.setupStyles_();this.setMap(h);this.prevZoom_=this.map_.getZoom();var j=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var a=j.map_.getZoom();var c=j.map_.minZoom||0;var b=Math.min(j.map_.maxZoom||100,j.map_.mapTypes[j.map_.getMapTypeId()].maxZoom);a=Math.min(Math.max(a,c),b);if(j.prevZoom_!=a){j.prevZoom_=a;j.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){j.redraw()});if(g&&(g.length||Object.keys(g).length)){this.addMarkers(g,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(c,d){return(function(b){for(var a in b.prototype){this.prototype[a]=b.prototype[a]}return this}).apply(c,[d])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var c=0,d;d=this.sizes[c];c++){this.styles_.push({url:this.imagePath_+(c+1)+"."+this.imageExtension_,height:d,width:d})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var e=this.getMarkers();var f=new google.maps.LatLngBounds();for(var g=0,h;h=e[g];g++){f.extend(h.getPosition())}this.map_.fitBounds(f)};MarkerClusterer.prototype.setStyles=function(b){this.styles_=b};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(b){this.maxZoom_=b};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(h,i){var g=0;var j=h.length;var f=j;while(f!==0){f=parseInt(f/10,10);g++}g=Math.min(g,i);return{text:j,index:g}};MarkerClusterer.prototype.setCalculator=function(b){this.calculator_=b};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(e,f){if(e.length){for(var g=0,h;h=e[g];g++){this.pushMarkerTo_(h)}}else{if(Object.keys(e).length){for(var h in e){this.pushMarkerTo_(e[h])}}}if(!f){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(d){d.isAdded=false;if(d.draggable){var c=this;google.maps.event.addListener(d,"dragend",function(){d.isAdded=false;c.repaint()})}this.markers_.push(d)};MarkerClusterer.prototype.addMarker=function(d,c){this.pushMarkerTo_(d);if(!c){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(g){var f=-1;if(this.markers_.indexOf){f=this.markers_.indexOf(g)}else{for(var e=0,h;h=this.markers_[e];e++){if(h==g){f=e;break}}}if(f==-1){return false}g.setMap(null);this.markers_.splice(f,1);return true};MarkerClusterer.prototype.removeMarker=function(f,e){var d=this.removeMarker_(f);if(!e&&d){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(g,j){var h=false;for(var k=0,l;l=g[k];k++){var i=this.removeMarker_(l);h=h||i}if(!j&&h){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(b){if(!this.ready_){this.ready_=b;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(b){this.map_=b};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(b){this.gridSize_=b};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(b){this.minClusterSize_=b};MarkerClusterer.prototype.getExtendedBounds=function(o){var i=this.getProjection();var n=new google.maps.LatLng(o.getNorthEast().lat(),o.getNorthEast().lng());var l=new google.maps.LatLng(o.getSouthWest().lat(),o.getSouthWest().lng());var p=i.fromLatLngToDivPixel(n);p.x+=this.gridSize_;p.y-=this.gridSize_;var j=i.fromLatLngToDivPixel(l);j.x-=this.gridSize_;j.y+=this.gridSize_;var m=i.fromDivPixelToLatLng(p);var k=i.fromDivPixelToLatLng(j);o.extend(m);o.extend(k);return o};MarkerClusterer.prototype.isMarkerInBounds_=function(d,c){return c.contains(d.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(e){for(var f=0,h;h=this.clusters_[f];f++){h.remove()}for(var f=0,g;g=this.markers_[f];f++){g.isAdded=false;if(e){g.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var b=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var d=0,a;a=b[d];d++){a.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(l,c){if(!l||!c){return 0}var m=6371;var o=(c.lat()-l.lat())*Math.PI/180;var p=(c.lng()-l.lng())*Math.PI/180;var d=Math.sin(o/2)*Math.sin(o/2)+Math.cos(l.lat()*Math.PI/180)*Math.cos(c.lat()*Math.PI/180)*Math.sin(p/2)*Math.sin(p/2);var n=2*Math.atan2(Math.sqrt(d),Math.sqrt(1-d));var a=m*n;return a};MarkerClusterer.prototype.addToClosestCluster_=function(k){var n=40000;var p=null;var d=k.getPosition();for(var l=0,i;i=this.clusters_[l];l++){var m=i.getCenter();if(m){var o=this.distanceBetweenPoints_(m,k.getPosition());if(o<n){n=o;p=i}}}if(p&&p.isMarkerInClusterBounds(k)){p.addMarker(k)}else{var i=new Cluster(this);i.addMarker(k);this.clusters_.push(i)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var g=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var e=this.getExtendedBounds(g);for(var f=0,h;h=this.markers_[f];f++){if(!h.isAdded&&this.isMarkerInBounds_(h,e)){this.addToClosestCluster_(h)}}};function Cluster(b){this.markerClusterer_=b;this.map_=b.getMap();this.gridSize_=b.getGridSize();this.minClusterSize_=b.getMinClusterSize();this.averageCenter_=b.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,b.getStyles(),b.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(e){if(this.markers_.indexOf){return this.markers_.indexOf(e)!=-1}else{for(var d=0,f;f=this.markers_[d];d++){if(f==e){return true}}}return false};Cluster.prototype.addMarker=function(j){if(this.isMarkerAlreadyAdded(j)){return false}if(!this.center_){this.center_=j.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var k=this.markers_.length+1;var g=(this.center_.lat()*(k-1)+j.getPosition().lat())/k;var i=(this.center_.lng()*(k-1)+j.getPosition().lng())/k;this.center_=new google.maps.LatLng(g,i);this.calculateBounds_()}}j.isAdded=true;this.markers_.push(j);var l=this.markers_.length;if(l<this.minClusterSize_&&j.getMap()!=this.map_){j.setMap(this.map_)}if(l==this.minClusterSize_){for(var h=0;h<l;h++){this.markers_[h].setMap(null)}}if(l>=this.minClusterSize_){j.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var f=new google.maps.LatLngBounds(this.center_,this.center_);var e=this.getMarkers();for(var g=0,h;h=e[g];g++){f.extend(h.getPosition())}return f};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var b=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(b)};Cluster.prototype.isMarkerInClusterBounds=function(b){return this.bounds_.contains(b.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var h=this.map_.getZoom();var g=this.markerClusterer_.getMaxZoom();if(g&&h>g){for(var j=0,l;l=this.markers_[j];j++){l.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var i=this.markerClusterer_.getStyles().length;var k=this.markerClusterer_.getCalculator()(this.markers_,i);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(k);this.clusterIcon_.show()};function ClusterIcon(f,d,e){f.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=d;this.padding_=e||0;this.cluster_=f;this.center_=null;this.map_=f.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var b=this.cluster_.getMarkerClusterer();google.maps.event.trigger(b,"clusterclick",this.cluster_);if(b.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var d=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(d);this.div_.innerHTML=this.sums_.text}var f=this.getPanes();f.overlayMouseTarget.appendChild(this.div_);var e=this;google.maps.event.addDomListener(this.div_,"click",function(){e.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(c){var d=this.getProjection().fromLatLngToDivPixel(c);d.x-=parseInt(this.width_/2,10);d.y-=parseInt(this.height_/2,10);return d};ClusterIcon.prototype.draw=function(){if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.top=b.y+"px";this.div_.style.left=b.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(b){this.sums_=b;this.text_=b.text;this.index_=b.index;if(this.div_){this.div_.innerHTML=b.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var d=Math.max(0,this.sums_.index-1);d=Math.min(this.styles_.length-1,d);var c=this.styles_[d];this.url_=c.url;this.height_=c.height;this.width_=c.width;this.textColor_=c.textColor;this.anchor_=c.anchor;this.textSize_=c.textSize;this.backgroundPosition_=c.backgroundPosition};ClusterIcon.prototype.setCenter=function(b){this.center_=b};ClusterIcon.prototype.createCss=function(h){var i=[];i.push("background-image:url("+this.url_+");");var f=this.backgroundPosition_?this.backgroundPosition_:"0 0";i.push("background-position:"+f+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){i.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{i.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){i.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{i.push("width:"+this.width_+"px; text-align:center;")}}else{i.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var g=this.textColor_?this.textColor_:"black";var j=this.textSize_?this.textSize_:11;i.push("cursor:pointer; top:"+h.y+"px; left:"+h.x+"px; color:"+g+"; position:absolute; font-size:"+j+"px; font-family:Arial,sans-serif; font-weight:bold");return i.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(d){var f=[];for(var e in d){if(d.hasOwnProperty(e)){f.push(e)}}return f};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var c=new google.maps.LatLng(-18.8800397,-47.05878999999999);var d={zoom:5,center:c,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),d)}initialize();function abrirInfoBox(c,d){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[c].open(map,d);idInfoBoxAberto=c}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(d){var e=new google.maps.LatLngBounds();$.each(d,function(h,c){var a=new google.maps.Marker({position:new google.maps.LatLng(c.Latitude,c.Longitude),title:"Mobiliados"});var b={content:"<p>"+c.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[c.Id]=new InfoBox(b);infoBox[c.Id].marker=a;infoBox[c.Id].listener=google.maps.event.addListener(a,"click",function(g){abrirInfoBox(c.Id,a)});markers.push(a);e.extend(a.position)});var f=new MarkerClusterer(map,markers);map.fitBounds(e)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(a){a=a||{};google.maps.OverlayView.apply(this,arguments);this.content_=a.content||"";this.disableAutoPan_=a.disableAutoPan||false;this.maxWidth_=a.maxWidth||0;this.pixelOffset_=a.pixelOffset||new google.maps.Size(0,0);this.position_=a.position||new google.maps.LatLng(0,0);this.zIndex_=a.zIndex||null;this.boxClass_=a.boxClass||"infoBox";this.boxStyle_=a.boxStyle||{};this.closeBoxMargin_=a.closeBoxMargin||"2px";this.closeBoxURL_=a.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(a.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=a.infoBoxClearance||new google.maps.Size(1,1);if(typeof a.visible==="undefined"){if(typeof a.isHidden==="undefined"){a.visible=true}else{a.visible=!a.isHidden}}this.isHidden_=!a.visible;this.alignBottom_=a.alignBottom||false;this.pane_=a.pane||"floatPane";this.enableEventPropagation_=a.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var b;var a;var f;var c=this;var d=function(g){g.cancelBubble=true;if(g.stopPropagation){g.stopPropagation()}};var e=function(g){g.returnValue=false;if(g.preventDefault){g.preventDefault()}if(!c.enableEventPropagation_){d(g)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{f=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-f.left-f.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];a=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(b=0;b<a.length;b++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,a[b],d))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(g){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",e);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var a="";if(this.closeBoxURL_!==""){a="<img";a+=" src='"+this.closeBoxURL_+"'";a+=" align=right";a+=" style='";a+=" position: relative;";a+=" cursor: pointer;";a+=" margin: "+this.closeBoxMargin_+";";a+="'>"}return a};InfoBox.prototype.addClickHandler_=function(){var a;if(this.closeBoxURL_!==""){a=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(a,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var a=this;return function(b){b.cancelBubble=true;if(b.stopPropagation){b.stopPropagation()}google.maps.event.trigger(a,"closeclick");a.close()}};InfoBox.prototype.panBox_=function(b){var d;var e;var m=0,i=0;if(!b){d=this.getMap();if(d instanceof google.maps.Map){if(!d.getBounds().contains(this.position_)){d.setCenter(this.position_)}e=d.getBounds();var h=d.getDiv();var j=h.offsetWidth;var l=h.offsetHeight;var f=this.pixelOffset_.width;var q=this.pixelOffset_.height;var k=this.div_.offsetWidth;var g=this.div_.offsetHeight;var o=this.infoBoxClearance_.width;var p=this.infoBoxClearance_.height;var a=this.getProjection().fromLatLngToContainerPixel(this.position_);if(a.x<(-f+o)){m=a.x+f-o}else{if((a.x+k+f+o)>j){m=a.x+k+f+o-j}}if(this.alignBottom_){if(a.y<(-q+p+g)){i=a.y+q-p-g}else{if((a.y+q+p)>l){i=a.y+q+p-l}}}else{if(a.y<(-q+p)){i=a.y+q-p}else{if((a.y+g+q+p)>l){i=a.y+g+q+p-l}}}if(!(m===0&&i===0)){var n=d.getCenter();d.panBy(m,i)}}}};InfoBox.prototype.setBoxStyle_=function(){var a,b;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";b=this.boxStyle_;for(a in b){if(b.hasOwnProperty(a)){this.div_.style[a]=b[a]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var a;var c={top:0,bottom:0,left:0,right:0};var b=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){a=b.ownerDocument.defaultView.getComputedStyle(b,"");if(a){c.top=parseInt(a.borderTopWidth,10)||0;c.bottom=parseInt(a.borderBottomWidth,10)||0;c.left=parseInt(a.borderLeftWidth,10)||0;c.right=parseInt(a.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(b.currentStyle){c.top=parseInt(b.currentStyle.borderTopWidth,10)||0;c.bottom=parseInt(b.currentStyle.borderBottomWidth,10)||0;c.left=parseInt(b.currentStyle.borderLeftWidth,10)||0;c.right=parseInt(b.currentStyle.borderRightWidth,10)||0}}}return c};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var a=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(a.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(a.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(a.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(a){if(typeof a.boxClass!=="undefined"){this.boxClass_=a.boxClass;this.setBoxStyle_()}if(typeof a.boxStyle!=="undefined"){this.boxStyle_=a.boxStyle;this.setBoxStyle_()}if(typeof a.content!=="undefined"){this.setContent(a.content)}if(typeof a.disableAutoPan!=="undefined"){this.disableAutoPan_=a.disableAutoPan}if(typeof a.maxWidth!=="undefined"){this.maxWidth_=a.maxWidth}if(typeof a.pixelOffset!=="undefined"){this.pixelOffset_=a.pixelOffset}if(typeof a.alignBottom!=="undefined"){this.alignBottom_=a.alignBottom}if(typeof a.position!=="undefined"){this.setPosition(a.position)}if(typeof a.zIndex!=="undefined"){this.setZIndex(a.zIndex)}if(typeof a.closeBoxMargin!=="undefined"){this.closeBoxMargin_=a.closeBoxMargin}if(typeof a.closeBoxURL!=="undefined"){this.closeBoxURL_=a.closeBoxURL}if(typeof a.infoBoxClearance!=="undefined"){this.infoBoxClearance_=a.infoBoxClearance}if(typeof a.isHidden!=="undefined"){this.isHidden_=a.isHidden}if(typeof a.visible!=="undefined"){this.isHidden_=!a.visible}if(typeof a.enableEventPropagation!=="undefined"){this.enableEventPropagation_=a.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(a){this.content_=a;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof a.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+a}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(a)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(a){this.position_=a;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(a){this.zIndex_=a;if(this.div_){this.div_.style.zIndex=a}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(a){this.isHidden_=!a;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var a;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){a=false}else{a=!this.isHidden_}return a};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(c,a){var b=this;if(a){this.position_=a.getPosition();this.moveListener_=google.maps.event.addListener(a,"position_changed",function(){b.setPosition(this.getPosition())})}this.setMap(c);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var a;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(a=0;a<this.eventListeners_.length;a++){google.maps.event.removeListener(this.eventListeners_[a])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(c,d,b){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=c;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var e=b||{};this.gridSize_=e.gridSize||60;this.minClusterSize_=e.minimumClusterSize||2;this.maxZoom_=e.maxZoom||null;this.styles_=e.styles||[];this.imagePath_=e.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=e.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(e.zoomOnClick!=undefined){this.zoomOnClick_=e.zoomOnClick}this.averageCenter_=false;if(e.averageCenter!=undefined){this.averageCenter_=e.averageCenter}this.setupStyles_();this.setMap(c);this.prevZoom_=this.map_.getZoom();var a=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var g=a.map_.getZoom();var h=a.map_.minZoom||0;var f=Math.min(a.map_.maxZoom||100,a.map_.mapTypes[a.map_.getMapTypeId()].maxZoom);g=Math.min(Math.max(g,h),f);if(a.prevZoom_!=g){a.prevZoom_=g;a.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){a.redraw()});if(d&&(d.length||Object.keys(d).length)){this.addMarkers(d,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(b,a){return(function(c){for(var d in c.prototype){this.prototype[d]=c.prototype[d]}return this}).apply(b,[a])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var b=0,a;a=this.sizes[b];b++){this.styles_.push({url:this.imagePath_+(b+1)+"."+this.imageExtension_,height:a,width:a})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var d=this.getMarkers();var c=new google.maps.LatLngBounds();for(var b=0,a;a=d[b];b++){c.extend(a.getPosition())}this.map_.fitBounds(c)};MarkerClusterer.prototype.setStyles=function(a){this.styles_=a};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(a){this.maxZoom_=a};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(c,b){var d=0;var a=c.length;var e=a;while(e!==0){e=parseInt(e/10,10);d++}d=Math.min(d,b);return{text:a,index:d}};MarkerClusterer.prototype.setCalculator=function(a){this.calculator_=a};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(d,c){if(d.length){for(var b=0,a;a=d[b];b++){this.pushMarkerTo_(a)}}else{if(Object.keys(d).length){for(var a in d){this.pushMarkerTo_(d[a])}}}if(!c){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(a){a.isAdded=false;if(a.draggable){var b=this;google.maps.event.addListener(a,"dragend",function(){a.isAdded=false;b.repaint()})}this.markers_.push(a)};MarkerClusterer.prototype.addMarker=function(a,b){this.pushMarkerTo_(a);if(!b){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(b){var c=-1;if(this.markers_.indexOf){c=this.markers_.indexOf(b)}else{for(var d=0,a;a=this.markers_[d];d++){if(a==b){c=d;break}}}if(c==-1){return false}b.setMap(null);this.markers_.splice(c,1);return true};MarkerClusterer.prototype.removeMarker=function(a,b){var c=this.removeMarker_(a);if(!b&&c){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(f,c){var e=false;for(var b=0,a;a=f[b];b++){var d=this.removeMarker_(a);e=e||d}if(!c&&e){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(a){if(!this.ready_){this.ready_=a;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(a){this.map_=a};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(a){this.gridSize_=a};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(a){this.minClusterSize_=a};MarkerClusterer.prototype.getExtendedBounds=function(g){var e=this.getProjection();var h=new google.maps.LatLng(g.getNorthEast().lat(),g.getNorthEast().lng());var b=new google.maps.LatLng(g.getSouthWest().lat(),g.getSouthWest().lng());var f=e.fromLatLngToDivPixel(h);f.x+=this.gridSize_;f.y-=this.gridSize_;var d=e.fromLatLngToDivPixel(b);d.x-=this.gridSize_;d.y+=this.gridSize_;var a=e.fromDivPixelToLatLng(f);var c=e.fromDivPixelToLatLng(d);g.extend(a);g.extend(c);return g};MarkerClusterer.prototype.isMarkerInBounds_=function(a,b){return b.contains(a.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(d){for(var c=0,a;a=this.clusters_[c];c++){a.remove()}for(var c=0,b;b=this.markers_[c];c++){b.isAdded=false;if(d){b.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var a=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var c=0,b;b=a[c];c++){b.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(f,k){if(!f||!k){return 0}var b=6371;var i=(k.lat()-f.lat())*Math.PI/180;var g=(k.lng()-f.lng())*Math.PI/180;var h=Math.sin(i/2)*Math.sin(i/2)+Math.cos(f.lat()*Math.PI/180)*Math.cos(k.lat()*Math.PI/180)*Math.sin(g/2)*Math.sin(g/2);var j=2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));var e=b*j;return e};MarkerClusterer.prototype.addToClosestCluster_=function(c){var j=40000;var f=null;var h=c.getPosition();for(var b=0,e;e=this.clusters_[b];b++){var a=e.getCenter();if(a){var g=this.distanceBetweenPoints_(a,c.getPosition());if(g<j){j=g;f=e}}}if(f&&f.isMarkerInClusterBounds(c)){f.addMarker(c)}else{var e=new Cluster(this);e.addMarker(c);this.clusters_.push(e)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var b=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var d=this.getExtendedBounds(b);for(var c=0,a;a=this.markers_[c];c++){if(!a.isAdded&&this.isMarkerInBounds_(a,d)){this.addToClosestCluster_(a)}}};function Cluster(a){this.markerClusterer_=a;this.map_=a.getMap();this.gridSize_=a.getGridSize();this.minClusterSize_=a.getMinClusterSize();this.averageCenter_=a.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,a.getStyles(),a.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(b){if(this.markers_.indexOf){return this.markers_.indexOf(b)!=-1}else{for(var c=0,a;a=this.markers_[c];c++){if(a==b){return true}}}return false};Cluster.prototype.addMarker=function(c){if(this.isMarkerAlreadyAdded(c)){return false}if(!this.center_){this.center_=c.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var b=this.markers_.length+1;var f=(this.center_.lat()*(b-1)+c.getPosition().lat())/b;var d=(this.center_.lng()*(b-1)+c.getPosition().lng())/b;this.center_=new google.maps.LatLng(f,d);this.calculateBounds_()}}c.isAdded=true;this.markers_.push(c);var a=this.markers_.length;if(a<this.minClusterSize_&&c.getMap()!=this.map_){c.setMap(this.map_)}if(a==this.minClusterSize_){for(var e=0;e<a;e++){this.markers_[e].setMap(null)}}if(a>=this.minClusterSize_){c.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var c=new google.maps.LatLngBounds(this.center_,this.center_);var d=this.getMarkers();for(var b=0,a;a=d[b];b++){c.extend(a.getPosition())}return c};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var a=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(a)};Cluster.prototype.isMarkerInClusterBounds=function(a){return this.bounds_.contains(a.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var e=this.map_.getZoom();var f=this.markerClusterer_.getMaxZoom();if(f&&e>f){for(var c=0,a;a=this.markers_[c];c++){a.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var d=this.markerClusterer_.getStyles().length;var b=this.markerClusterer_.getCalculator()(this.markers_,d);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(b);this.clusterIcon_.show()};function ClusterIcon(a,c,b){a.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=c;this.padding_=b||0;this.cluster_=a;this.center_=null;this.map_=a.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var a=this.cluster_.getMarkerClusterer();google.maps.event.trigger(a,"clusterclick",this.cluster_);if(a.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var c=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(c);this.div_.innerHTML=this.sums_.text}var a=this.getPanes();a.overlayMouseTarget.appendChild(this.div_);var b=this;google.maps.event.addDomListener(this.div_,"click",function(){b.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(b){var a=this.getProjection().fromLatLngToDivPixel(b);a.x-=parseInt(this.width_/2,10);a.y-=parseInt(this.height_/2,10);return a};ClusterIcon.prototype.draw=function(){if(this.visible_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.top=a.y+"px";this.div_.style.left=a.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var a=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(a);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(a){this.sums_=a;this.text_=a.text;this.index_=a.index;if(this.div_){this.div_.innerHTML=a.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var a=Math.max(0,this.sums_.index-1);a=Math.min(this.styles_.length-1,a);var b=this.styles_[a];this.url_=b.url;this.height_=b.height;this.width_=b.width;this.textColor_=b.textColor;this.anchor_=b.anchor;this.textSize_=b.textSize;this.backgroundPosition_=b.backgroundPosition};ClusterIcon.prototype.setCenter=function(a){this.center_=a};ClusterIcon.prototype.createCss=function(c){var b=[];b.push("background-image:url("+this.url_+");");var e=this.backgroundPosition_?this.backgroundPosition_:"0 0";b.push("background-position:"+e+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){b.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{b.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){b.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{b.push("width:"+this.width_+"px; text-align:center;")}}else{b.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var d=this.textColor_?this.textColor_:"black";var a=this.textSize_?this.textSize_:11;b.push("cursor:pointer; top:"+c.y+"px; left:"+c.x+"px; color:"+d+"; position:absolute; font-size:"+a+"px; font-family:Arial,sans-serif; font-weight:bold");return b.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(c){var a=[];for(var b in c){if(c.hasOwnProperty(b)){a.push(b)}}return a};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var b=new google.maps.LatLng(-18.8800397,-47.05878999999999);var a={zoom:5,center:b,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),a)}initialize();function abrirInfoBox(b,a){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[b].open(map,a);idInfoBoxAberto=b}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(c){var b=new google.maps.LatLngBounds();$.each(c,function(f,g){var e=new google.maps.Marker({position:new google.maps.LatLng(g.Latitude,g.Longitude),title:"Mobiliados"});var d={content:"<p>"+g.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[g.Id]=new InfoBox(d);infoBox[g.Id].marker=e;infoBox[g.Id].listener=google.maps.event.addListener(e,"click",function(h){abrirInfoBox(g.Id,e)});markers.push(e);b.extend(e.position)});var a=new MarkerClusterer(map,markers);map.fitBounds(b)})}
/*!
 * @name InfoBox
 * @version 1.1.13 [March 19, 2014]
 * @author Gary Little (inspired by proof-of-concept code from Pamela Fox of Google)
 * @copyright Copyright 2010 Gary Little [gary at luxcentral.com]
 * @fileoverview InfoBox extends the Google Maps JavaScript API V3 <tt>OverlayView</tt> class.
 *  <p>
 *  An InfoBox behaves like a <tt>google.maps.InfoWindow</tt>, but it supports several
 *  additional properties for advanced styling. An InfoBox can also be used as a map label.
 *  <p>
 *  An InfoBox also fires the same events as a <tt>google.maps.InfoWindow</tt>.
 */
;
/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;function InfoBox(b){b=b||{};google.maps.OverlayView.apply(this,arguments);this.content_=b.content||"";this.disableAutoPan_=b.disableAutoPan||false;this.maxWidth_=b.maxWidth||0;this.pixelOffset_=b.pixelOffset||new google.maps.Size(0,0);this.position_=b.position||new google.maps.LatLng(0,0);this.zIndex_=b.zIndex||null;this.boxClass_=b.boxClass||"infoBox";this.boxStyle_=b.boxStyle||{};this.closeBoxMargin_=b.closeBoxMargin||"2px";this.closeBoxURL_=b.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif";if(b.closeBoxURL===""){this.closeBoxURL_=""}this.infoBoxClearance_=b.infoBoxClearance||new google.maps.Size(1,1);if(typeof b.visible==="undefined"){if(typeof b.isHidden==="undefined"){b.visible=true}else{b.visible=!b.isHidden}}this.isHidden_=!b.visible;this.alignBottom_=b.alignBottom||false;this.pane_=b.pane||"floatPane";this.enableEventPropagation_=b.enableEventPropagation||false;this.div_=null;this.closeListener_=null;this.moveListener_=null;this.contextListener_=null;this.eventListeners_=null;this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView();InfoBox.prototype.createInfoBoxDiv_=function(){var g;var h;var i;var l=this;var k=function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}};var j=function(a){a.returnValue=false;if(a.preventDefault){a.preventDefault()}if(!l.enableEventPropagation_){k(a)}};if(!this.div_){this.div_=document.createElement("div");this.setBoxStyle_();if(typeof this.content_.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+this.content_}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(this.content_)}this.getPanes()[this.pane_].appendChild(this.div_);this.addClickHandler_();if(this.div_.style.width){this.fixedWidthSet_=true}else{if(this.maxWidth_!==0&&this.div_.offsetWidth>this.maxWidth_){this.div_.style.width=this.maxWidth_;this.div_.style.overflow="auto";this.fixedWidthSet_=true}else{i=this.getBoxWidths_();this.div_.style.width=(this.div_.offsetWidth-i.left-i.right)+"px";this.fixedWidthSet_=false}}this.panBox_(this.disableAutoPan_);if(!this.enableEventPropagation_){this.eventListeners_=[];h=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"];for(g=0;g<h.length;g++){this.eventListeners_.push(google.maps.event.addDomListener(this.div_,h[g],k))}this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(a){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",j);google.maps.event.trigger(this,"domready")}};InfoBox.prototype.getCloseBoxImg_=function(){var b="";if(this.closeBoxURL_!==""){b="<img";b+=" src='"+this.closeBoxURL_+"'";b+=" align=right";b+=" style='";b+=" position: relative;";b+=" cursor: pointer;";b+=" margin: "+this.closeBoxMargin_+";";b+="'>"}return b};InfoBox.prototype.addClickHandler_=function(){var b;if(this.closeBoxURL_!==""){b=this.div_.firstChild;this.closeListener_=google.maps.event.addDomListener(b,"click",this.getCloseClickHandler_())}else{this.closeListener_=null}};InfoBox.prototype.getCloseClickHandler_=function(){var b=this;return function(a){a.cancelBubble=true;if(a.stopPropagation){a.stopPropagation()}google.maps.event.trigger(b,"closeclick");b.close()}};InfoBox.prototype.panBox_=function(E){var D;var C;var u=0,y=0;if(!E){D=this.getMap();if(D instanceof google.maps.Map){if(!D.getBounds().contains(this.position_)){D.setCenter(this.position_)}C=D.getBounds();var z=D.getDiv();var x=z.offsetWidth;var v=z.offsetHeight;var B=this.pixelOffset_.width;var c=this.pixelOffset_.height;var w=this.div_.offsetWidth;var A=this.div_.offsetHeight;var s=this.infoBoxClearance_.width;var r=this.infoBoxClearance_.height;var F=this.getProjection().fromLatLngToContainerPixel(this.position_);if(F.x<(-B+s)){u=F.x+B-s}else{if((F.x+w+B+s)>x){u=F.x+w+B+s-x}}if(this.alignBottom_){if(F.y<(-c+r+A)){y=F.y+c-r-A}else{if((F.y+c+r)>v){y=F.y+c+r-v}}}else{if(F.y<(-c+r)){y=F.y+c-r}else{if((F.y+A+c+r)>v){y=F.y+A+c+r-v}}}if(!(u===0&&y===0)){var t=D.getCenter();D.panBy(u,y)}}}};InfoBox.prototype.setBoxStyle_=function(){var d,c;if(this.div_){this.div_.className=this.boxClass_;this.div_.style.cssText="";c=this.boxStyle_;for(d in c){if(c.hasOwnProperty(d)){this.div_.style[d]=c[d]}}this.div_.style.WebkitTransform="translateZ(0)";if(typeof this.div_.style.opacity!=="undefined"&&this.div_.style.opacity!==""){this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+(this.div_.style.opacity*100)+')"';this.div_.style.filter="alpha(opacity="+(this.div_.style.opacity*100)+")"}this.div_.style.position="absolute";this.div_.style.visibility="hidden";if(this.zIndex_!==null){this.div_.style.zIndex=this.zIndex_}}};InfoBox.prototype.getBoxWidths_=function(){var e;var f={top:0,bottom:0,left:0,right:0};var d=this.div_;if(document.defaultView&&document.defaultView.getComputedStyle){e=d.ownerDocument.defaultView.getComputedStyle(d,"");if(e){f.top=parseInt(e.borderTopWidth,10)||0;f.bottom=parseInt(e.borderBottomWidth,10)||0;f.left=parseInt(e.borderLeftWidth,10)||0;f.right=parseInt(e.borderRightWidth,10)||0}}else{if(document.documentElement.currentStyle){if(d.currentStyle){f.top=parseInt(d.currentStyle.borderTopWidth,10)||0;f.bottom=parseInt(d.currentStyle.borderBottomWidth,10)||0;f.left=parseInt(d.currentStyle.borderLeftWidth,10)||0;f.right=parseInt(d.currentStyle.borderRightWidth,10)||0}}}return f};InfoBox.prototype.onRemove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var b=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=(b.x+this.pixelOffset_.width)+"px";if(this.alignBottom_){this.div_.style.bottom=-(b.y+this.pixelOffset_.height)+"px"}else{this.div_.style.top=(b.y+this.pixelOffset_.height)+"px"}if(this.isHidden_){this.div_.style.visibility="hidden"}else{this.div_.style.visibility="visible"}};InfoBox.prototype.setOptions=function(b){if(typeof b.boxClass!=="undefined"){this.boxClass_=b.boxClass;this.setBoxStyle_()}if(typeof b.boxStyle!=="undefined"){this.boxStyle_=b.boxStyle;this.setBoxStyle_()}if(typeof b.content!=="undefined"){this.setContent(b.content)}if(typeof b.disableAutoPan!=="undefined"){this.disableAutoPan_=b.disableAutoPan}if(typeof b.maxWidth!=="undefined"){this.maxWidth_=b.maxWidth}if(typeof b.pixelOffset!=="undefined"){this.pixelOffset_=b.pixelOffset}if(typeof b.alignBottom!=="undefined"){this.alignBottom_=b.alignBottom}if(typeof b.position!=="undefined"){this.setPosition(b.position)}if(typeof b.zIndex!=="undefined"){this.setZIndex(b.zIndex)}if(typeof b.closeBoxMargin!=="undefined"){this.closeBoxMargin_=b.closeBoxMargin}if(typeof b.closeBoxURL!=="undefined"){this.closeBoxURL_=b.closeBoxURL}if(typeof b.infoBoxClearance!=="undefined"){this.infoBoxClearance_=b.infoBoxClearance}if(typeof b.isHidden!=="undefined"){this.isHidden_=b.isHidden}if(typeof b.visible!=="undefined"){this.isHidden_=!b.visible}if(typeof b.enableEventPropagation!=="undefined"){this.enableEventPropagation_=b.enableEventPropagation}if(this.div_){this.draw()}};InfoBox.prototype.setContent=function(b){this.content_=b;if(this.div_){if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(!this.fixedWidthSet_){this.div_.style.width=""}if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}if(!this.fixedWidthSet_){this.div_.style.width=this.div_.offsetWidth+"px";if(typeof b.nodeType==="undefined"){this.div_.innerHTML=this.getCloseBoxImg_()+b}else{this.div_.innerHTML=this.getCloseBoxImg_();this.div_.appendChild(b)}}this.addClickHandler_()}google.maps.event.trigger(this,"content_changed")};InfoBox.prototype.setPosition=function(b){this.position_=b;if(this.div_){this.draw()}google.maps.event.trigger(this,"position_changed")};InfoBox.prototype.setZIndex=function(b){this.zIndex_=b;if(this.div_){this.div_.style.zIndex=b}google.maps.event.trigger(this,"zindex_changed")};InfoBox.prototype.setVisible=function(b){this.isHidden_=!b;if(this.div_){this.div_.style.visibility=(this.isHidden_?"hidden":"visible")}};InfoBox.prototype.getContent=function(){return this.content_};InfoBox.prototype.getPosition=function(){return this.position_};InfoBox.prototype.getZIndex=function(){return this.zIndex_};InfoBox.prototype.getVisible=function(){var b;if((typeof this.getMap()==="undefined")||(this.getMap()===null)){b=false}else{b=!this.isHidden_}return b};InfoBox.prototype.show=function(){this.isHidden_=false;if(this.div_){this.div_.style.visibility="visible"}};InfoBox.prototype.hide=function(){this.isHidden_=true;if(this.div_){this.div_.style.visibility="hidden"}};InfoBox.prototype.open=function(f,e){var d=this;if(e){this.position_=e.getPosition();this.moveListener_=google.maps.event.addListener(e,"position_changed",function(){d.setPosition(this.getPosition())})}this.setMap(f);if(this.div_){this.panBox_()}};InfoBox.prototype.close=function(){var b;if(this.closeListener_){google.maps.event.removeListener(this.closeListener_);this.closeListener_=null}if(this.eventListeners_){for(b=0;b<this.eventListeners_.length;b++){google.maps.event.removeListener(this.eventListeners_[b])}this.eventListeners_=null}if(this.moveListener_){google.maps.event.removeListener(this.moveListener_);this.moveListener_=null}if(this.contextListener_){google.maps.event.removeListener(this.contextListener_);this.contextListener_=null}this.setMap(null)};
/*!
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */
;function MarkerClusterer(j,i,f){this.extend(MarkerClusterer,google.maps.OverlayView);this.map_=j;this.markers_=[];this.clusters_=[];this.sizes=[53,56,66,78,90];this.styles_=[];this.ready_=false;var h=f||{};this.gridSize_=h.gridSize||60;this.minClusterSize_=h.minimumClusterSize||2;this.maxZoom_=h.maxZoom||null;this.styles_=h.styles||[];this.imagePath_=h.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_;this.imageExtension_=h.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_;this.zoomOnClick_=true;if(h.zoomOnClick!=undefined){this.zoomOnClick_=h.zoomOnClick}this.averageCenter_=false;if(h.averageCenter!=undefined){this.averageCenter_=h.averageCenter}this.setupStyles_();this.setMap(j);this.prevZoom_=this.map_.getZoom();var g=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var b=g.map_.getZoom();var a=g.map_.minZoom||0;var c=Math.min(g.map_.maxZoom||100,g.map_.mapTypes[g.map_.getMapTypeId()].maxZoom);b=Math.min(Math.max(b,a),c);if(g.prevZoom_!=b){g.prevZoom_=b;g.resetViewport()}});google.maps.event.addListener(this.map_,"idle",function(){g.redraw()});if(i&&(i.length||Object.keys(i).length)){this.addMarkers(i,false)}}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png";MarkerClusterer.prototype.extend=function(c,d){return(function(b){for(var a in b.prototype){this.prototype[a]=b.prototype[a]}return this}).apply(c,[d])};MarkerClusterer.prototype.onAdd=function(){this.setReady_(true)};MarkerClusterer.prototype.draw=function(){};MarkerClusterer.prototype.setupStyles_=function(){if(this.styles_.length){return}for(var c=0,d;d=this.sizes[c];c++){this.styles_.push({url:this.imagePath_+(c+1)+"."+this.imageExtension_,height:d,width:d})}};MarkerClusterer.prototype.fitMapToMarkers=function(){var g=this.getMarkers();var h=new google.maps.LatLngBounds();for(var e=0,f;f=g[e];e++){h.extend(f.getPosition())}this.map_.fitBounds(h)};MarkerClusterer.prototype.setStyles=function(b){this.styles_=b};MarkerClusterer.prototype.getStyles=function(){return this.styles_};MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_};MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_};MarkerClusterer.prototype.getMarkers=function(){return this.markers_};MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length};MarkerClusterer.prototype.setMaxZoom=function(b){this.maxZoom_=b};MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_};MarkerClusterer.prototype.calculator_=function(j,f){var i=0;var g=j.length;var h=g;while(h!==0){h=parseInt(h/10,10);i++}i=Math.min(i,f);return{text:g,index:i}};MarkerClusterer.prototype.setCalculator=function(b){this.calculator_=b};MarkerClusterer.prototype.getCalculator=function(){return this.calculator_};MarkerClusterer.prototype.addMarkers=function(g,h){if(g.length){for(var e=0,f;f=g[e];e++){this.pushMarkerTo_(f)}}else{if(Object.keys(g).length){for(var f in g){this.pushMarkerTo_(g[f])}}}if(!h){this.redraw()}};MarkerClusterer.prototype.pushMarkerTo_=function(d){d.isAdded=false;if(d.draggable){var c=this;google.maps.event.addListener(d,"dragend",function(){d.isAdded=false;c.repaint()})}this.markers_.push(d)};MarkerClusterer.prototype.addMarker=function(d,c){this.pushMarkerTo_(d);if(!c){this.redraw()}};MarkerClusterer.prototype.removeMarker_=function(e){var h=-1;if(this.markers_.indexOf){h=this.markers_.indexOf(e)}else{for(var g=0,f;f=this.markers_[g];g++){if(f==e){h=g;break}}}if(h==-1){return false}e.setMap(null);this.markers_.splice(h,1);return true};MarkerClusterer.prototype.removeMarker=function(e,d){var f=this.removeMarker_(e);if(!d&&f){this.resetViewport();this.redraw();return true}else{return false}};MarkerClusterer.prototype.removeMarkers=function(i,l){var j=false;for(var g=0,h;h=i[g];g++){var k=this.removeMarker_(h);j=j||k}if(!l&&j){this.resetViewport();this.redraw();return true}};MarkerClusterer.prototype.setReady_=function(b){if(!this.ready_){this.ready_=b;this.createClusters_()}};MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length};MarkerClusterer.prototype.getMap=function(){return this.map_};MarkerClusterer.prototype.setMap=function(b){this.map_=b};MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_};MarkerClusterer.prototype.setGridSize=function(b){this.gridSize_=b};MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_};MarkerClusterer.prototype.setMinClusterSize=function(b){this.minClusterSize_=b};MarkerClusterer.prototype.getExtendedBounds=function(l){var n=this.getProjection();var k=new google.maps.LatLng(l.getNorthEast().lat(),l.getNorthEast().lng());var i=new google.maps.LatLng(l.getSouthWest().lat(),l.getSouthWest().lng());var m=n.fromLatLngToDivPixel(k);m.x+=this.gridSize_;m.y-=this.gridSize_;var o=n.fromLatLngToDivPixel(i);o.x-=this.gridSize_;o.y+=this.gridSize_;var j=n.fromDivPixelToLatLng(m);var p=n.fromDivPixelToLatLng(o);l.extend(j);l.extend(p);return l};MarkerClusterer.prototype.isMarkerInBounds_=function(d,c){return c.contains(d.getPosition())};MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(true);this.markers_=[]};MarkerClusterer.prototype.resetViewport=function(g){for(var h=0,f;f=this.clusters_[h];h++){f.remove()}for(var h=0,e;e=this.markers_[h];h++){e.isAdded=false;if(g){e.setMap(null)}}this.clusters_=[]};MarkerClusterer.prototype.repaint=function(){var b=this.clusters_.slice();this.clusters_.length=0;this.resetViewport();this.redraw();window.setTimeout(function(){for(var d=0,a;a=b[d];d++){a.remove()}},0)};MarkerClusterer.prototype.redraw=function(){this.createClusters_()};MarkerClusterer.prototype.distanceBetweenPoints_=function(o,c){if(!o||!c){return 0}var a=6371;var l=(c.lat()-o.lat())*Math.PI/180;var n=(c.lng()-o.lng())*Math.PI/180;var m=Math.sin(l/2)*Math.sin(l/2)+Math.cos(o.lat()*Math.PI/180)*Math.cos(c.lat()*Math.PI/180)*Math.sin(n/2)*Math.sin(n/2);var d=2*Math.atan2(Math.sqrt(m),Math.sqrt(1-m));var p=a*d;return p};MarkerClusterer.prototype.addToClosestCluster_=function(p){var k=40000;var n=null;var l=p.getPosition();for(var d=0,o;o=this.clusters_[d];d++){var i=o.getCenter();if(i){var m=this.distanceBetweenPoints_(i,p.getPosition());if(m<k){k=m;n=o}}}if(n&&n.isMarkerInClusterBounds(p)){n.addMarker(p)}else{var o=new Cluster(this);o.addMarker(p);this.clusters_.push(o)}};MarkerClusterer.prototype.createClusters_=function(){if(!this.ready_){return}var e=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast());var g=this.getExtendedBounds(e);for(var h=0,f;f=this.markers_[h];h++){if(!f.isAdded&&this.isMarkerInBounds_(f,g)){this.addToClosestCluster_(f)}}};function Cluster(b){this.markerClusterer_=b;this.map_=b.getMap();this.gridSize_=b.getGridSize();this.minClusterSize_=b.getMinClusterSize();this.averageCenter_=b.isAverageCenter();this.center_=null;this.markers_=[];this.bounds_=null;this.clusterIcon_=new ClusterIcon(this,b.getStyles(),b.getGridSize())}Cluster.prototype.isMarkerAlreadyAdded=function(d){if(this.markers_.indexOf){return this.markers_.indexOf(d)!=-1}else{for(var f=0,e;e=this.markers_[f];f++){if(e==d){return true}}}return false};Cluster.prototype.addMarker=function(l){if(this.isMarkerAlreadyAdded(l)){return false}if(!this.center_){this.center_=l.getPosition();this.calculateBounds_()}else{if(this.averageCenter_){var g=this.markers_.length+1;var i=(this.center_.lat()*(g-1)+l.getPosition().lat())/g;var k=(this.center_.lng()*(g-1)+l.getPosition().lng())/g;this.center_=new google.maps.LatLng(i,k);this.calculateBounds_()}}l.isAdded=true;this.markers_.push(l);var h=this.markers_.length;if(h<this.minClusterSize_&&l.getMap()!=this.map_){l.setMap(this.map_)}if(h==this.minClusterSize_){for(var j=0;j<h;j++){this.markers_[j].setMap(null)}}if(h>=this.minClusterSize_){l.setMap(null)}this.updateIcon();return true};Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_};Cluster.prototype.getBounds=function(){var h=new google.maps.LatLngBounds(this.center_,this.center_);var g=this.getMarkers();for(var e=0,f;f=g[e];e++){h.extend(f.getPosition())}return h};Cluster.prototype.remove=function(){this.clusterIcon_.remove();this.markers_.length=0;delete this.markers_};Cluster.prototype.getSize=function(){return this.markers_.length};Cluster.prototype.getMarkers=function(){return this.markers_};Cluster.prototype.getCenter=function(){return this.center_};Cluster.prototype.calculateBounds_=function(){var b=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(b)};Cluster.prototype.isMarkerInClusterBounds=function(b){return this.bounds_.contains(b.getPosition())};Cluster.prototype.getMap=function(){return this.map_};Cluster.prototype.updateIcon=function(){var j=this.map_.getZoom();var i=this.markerClusterer_.getMaxZoom();if(i&&j>i){for(var l=0,h;h=this.markers_[l];l++){h.setMap(this.map_)}return}if(this.markers_.length<this.minClusterSize_){this.clusterIcon_.hide();return}var k=this.markerClusterer_.getStyles().length;var g=this.markerClusterer_.getCalculator()(this.markers_,k);this.clusterIcon_.setCenter(this.center_);this.clusterIcon_.setSums(g);this.clusterIcon_.show()};function ClusterIcon(e,f,d){e.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView);this.styles_=f;this.padding_=d||0;this.cluster_=e;this.center_=null;this.map_=e.getMap();this.div_=null;this.sums_=null;this.visible_=false;this.setMap(this.map_)}ClusterIcon.prototype.triggerClusterClick=function(){var b=this.cluster_.getMarkerClusterer();google.maps.event.trigger(b,"clusterclick",this.cluster_);if(b.isZoomOnClick()){this.map_.fitBounds(this.cluster_.getBounds())}};ClusterIcon.prototype.onAdd=function(){this.div_=document.createElement("DIV");if(this.visible_){var f=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(f);this.div_.innerHTML=this.sums_.text}var e=this.getPanes();e.overlayMouseTarget.appendChild(this.div_);var d=this;google.maps.event.addDomListener(this.div_,"click",function(){d.triggerClusterClick()})};ClusterIcon.prototype.getPosFromLatLng_=function(c){var d=this.getProjection().fromLatLngToDivPixel(c);d.x-=parseInt(this.width_/2,10);d.y-=parseInt(this.height_/2,10);return d};ClusterIcon.prototype.draw=function(){if(this.visible_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.top=b.y+"px";this.div_.style.left=b.x+"px"}};ClusterIcon.prototype.hide=function(){if(this.div_){this.div_.style.display="none"}this.visible_=false};ClusterIcon.prototype.show=function(){if(this.div_){var b=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(b);this.div_.style.display=""}this.visible_=true};ClusterIcon.prototype.remove=function(){this.setMap(null)};ClusterIcon.prototype.onRemove=function(){if(this.div_&&this.div_.parentNode){this.hide();this.div_.parentNode.removeChild(this.div_);this.div_=null}};ClusterIcon.prototype.setSums=function(b){this.sums_=b;this.text_=b.text;this.index_=b.index;if(this.div_){this.div_.innerHTML=b.text}this.useStyle()};ClusterIcon.prototype.useStyle=function(){var d=Math.max(0,this.sums_.index-1);d=Math.min(this.styles_.length-1,d);var c=this.styles_[d];this.url_=c.url;this.height_=c.height;this.width_=c.width;this.textColor_=c.textColor;this.anchor_=c.anchor;this.textSize_=c.textSize;this.backgroundPosition_=c.backgroundPosition};ClusterIcon.prototype.setCenter=function(b){this.center_=b};ClusterIcon.prototype.createCss=function(j){var f=[];f.push("background-image:url("+this.url_+");");var h=this.backgroundPosition_?this.backgroundPosition_:"0 0";f.push("background-position:"+h+";");if(typeof this.anchor_==="object"){if(typeof this.anchor_[0]==="number"&&this.anchor_[0]>0&&this.anchor_[0]<this.height_){f.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;")}else{f.push("height:"+this.height_+"px; line-height:"+this.height_+"px;")}if(typeof this.anchor_[1]==="number"&&this.anchor_[1]>0&&this.anchor_[1]<this.width_){f.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;")}else{f.push("width:"+this.width_+"px; text-align:center;")}}else{f.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;")}var i=this.textColor_?this.textColor_:"black";var g=this.textSize_?this.textSize_:11;f.push("cursor:pointer; top:"+j.y+"px; left:"+j.x+"px; color:"+i+"; position:absolute; font-size:"+g+"px; font-family:Arial,sans-serif; font-weight:bold");return f.join("")};window.MarkerClusterer=MarkerClusterer;MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker;MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers;MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers;MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers;MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator;MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize;MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds;MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap;MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers;MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom;MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles;MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters;MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers;MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw;MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker;MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers;MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport;MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint;MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator;MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize;MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom;MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd;MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw;Cluster.prototype.getCenter=Cluster.prototype.getCenter;Cluster.prototype.getSize=Cluster.prototype.getSize;Cluster.prototype.getMarkers=Cluster.prototype.getMarkers;ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd;ClusterIcon.prototype.draw=ClusterIcon.prototype.draw;ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;Object.keys=Object.keys||function(f){var e=[];for(var d in f){if(f.hasOwnProperty(d)){e.push(d)}}return e};
/*!
 * Custom maps v3
 */
;var map;var idInfoBoxAberto;var infoBox=[];var markers=[];function initialize(){var c=new google.maps.LatLng(-18.8800397,-47.05878999999999);var d={zoom:5,center:c,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("mapa"),d)}initialize();function abrirInfoBox(c,d){if(typeof(idInfoBoxAberto)=="number"&&typeof(infoBox[idInfoBoxAberto])=="object"){infoBox[idInfoBoxAberto].close()}infoBox[c].open(map,d);idInfoBoxAberto=c}var url_json="/imoveis-json/";function carregarPontos(){$.getJSON(url_json,function(f){var d=new google.maps.LatLngBounds();$.each(f,function(b,a){var c=new google.maps.Marker({position:new google.maps.LatLng(a.Latitude,a.Longitude),title:"Mobiliados"});var h={content:"<p>"+a.Descricao+"</p>",pixelOffset:new google.maps.Size(-150,0),infoBoxClearance:new google.maps.Size(1,1)};infoBox[a.Id]=new InfoBox(h);infoBox[a.Id].marker=c;infoBox[a.Id].listener=google.maps.event.addListener(c,"click",function(g){abrirInfoBox(a.Id,c)});markers.push(c);d.extend(c.position)});var e=new MarkerClusterer(map,markers);map.fitBounds(d)})};