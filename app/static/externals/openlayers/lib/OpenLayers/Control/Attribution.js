/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.Attribution
 * The attribution control adds attribution from layers to the map display. 
 * It uses 'attribution' property of each layer.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.Attribution = 
  OpenLayers.Class(OpenLayers.Control, {
    
    /**
     * APIProperty: separator
     * {String} String used to separate layers.
     */
    separator: ", ",
    
    /**
     * APIProperty: template
     * {String} Template for the attribution. This has to include the substring
     *     "${layers}", which will be replaced by the layer specific
     *     attributions, separated by <separator>. The default is "${layers}".
     */
    template: "${layers}",
    
    /**
     * Constructor: OpenLayers.Control.Attribution 
     * 
     * Parameters:
     * options - {Object} Options for control.
     */

    /** 
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        this.map.events.un({
            "removelayer": this.updateAttribution,
            "addlayer": this.updateAttribution,
            "changelayer": this.updateAttribution,
            "changebaselayer": this.updateAttribution,
            scope: this
        });
        
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },    
    
    /**
     * Method: draw
     * Initialize control.
     * 
     * Returns: 
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */    
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        
        this.map.events.on({
            'changebaselayer': this.updateAttribution,
            'changelayer': this.updateAttribution,
            'addlayer': this.updateAttribution,
            'removelayer': this.updateAttribution,
            scope: this
        });
        this.updateAttribution();
        
        return this.div;    
    },

    /**
     * Method: updateAttribution
     * Update attribution string.
     */
    updateAttribution: function() {
        var attributions = ["<div style='margin-left:0px;margin-right:0px;z-index:1000000;position:absolute;left:0px;bottom:40px;'><a href='http://www.plocan.eu/' target='_blank' style='position: static; overflow: visible; float: none; display: inline;'><div style='width:350px;cursor:pointer;'><img src='../theme/app/img/plocan-logo.png' style='width:350px;-webkit-user-select:none;border:0px;'></div></a></div>"];
        if (this.map && this.map.layers) {
            for(var i=0, len=this.map.layers.length; i<len; i++) {
                var layer = this.map.layers[i];
                if (layer.attribution && layer.getVisibility()) {
                    // add attribution only if attribution text is unique
                    if (OpenLayers.Util.indexOf(
                                    attributions, layer.attribution) === -1) {
                        attributions.push( layer.attribution );
                    }
                }
            } 
            this.div.innerHTML = OpenLayers.String.format(this.template, {
                layers: attributions.join(this.separator)
            });
        }
    },

    CLASS_NAME: "OpenLayers.Control.Attribution"
});
