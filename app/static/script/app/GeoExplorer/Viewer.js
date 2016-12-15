/**
 * Copyright (c) 2009-2010 The Open Planning Project
 *
 * @requires GeoExplorer.js
 */

/** api: (define)
 *  module = GeoExplorer
 *  class = Embed
 *  base_link = GeoExplorer
 */
Ext.namespace("GeoExplorer");

/** api: constructor
 *  ..class:: GeoExplorer.Viewer(config)
 *
 *  Create a GeoExplorer application suitable for embedding in larger pages.
 */
GeoExplorer.Viewer = Ext.extend(GeoExplorer, {



  applyConfig: function(config) {
        var allTools = config.viewerTools || this.viewerTools;
        var tools = [];
        var toolConfig;
        for (var i=0, len=allTools.length; i<len; i++) {
            var tool = allTools[i];
            if (tool.checked === true) {
                var properties = ['checked', 'iconCls', 'id', 'leaf', 'loader', 'text'];
                for (var key in properties) {
                    delete tool[properties[key]];
                }
                toolConfig = Ext.applyIf({
                    actionTarget: "paneltbar"
                }, tool);
                tools.push(toolConfig);
            }
        }
        tools.push({
                ptype: "gxp_layermanager",
                outputConfig: {
                    id: "layers",
                    tbar: [],
                    autoScroll: true
                },
                outputTarget: "tree"
            });
        
        config.tools = tools;
        GeoExplorer.Viewer.superclass.applyConfig.call(this, config);
    },
    
    
    loadConfig: function(config) {
        GeoExplorer.Composer.superclass.loadConfig.apply(this, arguments);
        
        var query = Ext.urlDecode(document.location.search.substr(1));
        if (query && query.styler) {
            for (var i=config.map.layers.length-1; i>=0; --i) {
                delete config.map.layers[i].selected;
            }
            config.map.layers.push({
                source: "local",
                name: query.styler,
                selected: true,
                bbox: query.lazy && query.bbox ? query.bbox.split(",") : undefined
            });
            this.on('layerselectionchange', function(rec) {
                var styler = this.tools.styler,
                    layer = rec.getLayer(),
                    extent = layer.maxExtent;
                if (extent && !query.bbox) {
                    this.mapPanel.map.zoomToExtent(extent);
                }
                this.doAuthorized(styler.roles, styler.addOutput, styler);
            }, this, {single: true});            
        }
    },


    /** private: method[setCookieValue]
     *  Set the value for a cookie parameter
     */
    setCookieValue: function(param, value) {
        document.cookie = param + '=' + escape(value);
    },

    /** private: method[clearCookieValue]
     *  Clear a certain cookie parameter.
     */
    clearCookieValue: function(param) {
        document.cookie = param + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    },

    /** private: method[getCookieValue]
     *  Get the value of a certain cookie parameter. Returns null if not found.
     */
    getCookieValue: function(param) {
        var i, x, y, cookies = document.cookie.split(";");
        for (i=0; i < cookies.length; i++) {
            x = cookies[i].substr(0, cookies[i].indexOf("="));
            y = cookies[i].substr(cookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==param) {
                return unescape(y);
            }
        }
        return null;
    },


    /** private: method[initPortal]
     * Create the various parts that compose the layout.
     */
    initPortal: function() {
        
       var westLayersPanel = new gxp.CrumbPanel({
            id: "tree",
            region: "west",            
            width: 320,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            hideCollapseTool: true,
            header: false,
            flex:75//set percentage height when parent panel layout set to vbox
        });
        
         var westLegendPanel = new GeoExt.LegendPanel({
            title: 'Legend Panel',
            defaults: {
                style: 'padding:5px',
                baseParams: {
                    FORMAT: 'image/png',
                    LEGEND_OPTIONS: 'forceLabels:on'
                }
            },
            bodyStyle: 'padding:5px',
            width: 320,           
            autoScroll: true,
            region: 'west',
            flex:25
        });

        var westContainerPanel = new Ext.Panel({
            region: "west",
            width: 320,            
            layout: "vbox",
            items:[westLayersPanel, westLegendPanel] 
        });

        var southPanel = new Ext.Panel({
            region: "south",
            id: "south",
            height: 220,
            border: false,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            collapsed: true,
            hideCollapseTool: true,
            header: false,
            layout: "border",
            items: [{
                region: "center",
                id: "table",
                title: this.tableText,
                layout: "fit"
            }, {
                region: "west",
                width: 320,
                id: "query",
                title: this.queryText,
                split: true,
                collapsible: true,
                collapseMode: "mini",
                collapsed: true,
                hideCollapseTool: true,
                layout: "fit"
            }]
        });
        var toolbar = new Ext.Toolbar({
            disabled: true,
            id: 'paneltbar',
            items: []
        });
        this.on("ready", function() {
            // enable only those items that were not specifically disabled
            var disabled = toolbar.items.filterBy(function(item) {
                return item.initialConfig && item.initialConfig.disabled;
            });
            toolbar.enable();
            disabled.each(function(item) {
                item.disable();
            });
        });

        var googleEarthPanel = new gxp.GoogleEarthPanel({
            mapPanel: this.mapPanel,
            id: "globe",
            tbar: [],
            listeners: {
                beforeadd: function(record) {
                    return record.get("group") !== "background";
                }
            }
        });
        
        // TODO: continue making this Google Earth Panel more independent
        // Currently, it's too tightly tied into the viewer.
        // In the meantime, we keep track of all items that the were already
        // disabled when the panel is shown.
        var preGoogleDisabled = [];

        googleEarthPanel.on("show", function() {
            preGoogleDisabled.length = 0;
            toolbar.items.each(function(item) {
                if (item.disabled) {
                    preGoogleDisabled.push(item);
                }
            });
            toolbar.disable();
            // loop over all the tools and remove their output
            for (var key in this.tools) {
                var tool = this.tools[key];
                if (tool.outputTarget === "map") {
                    tool.removeOutput();
                }
            }
            var layersContainer = Ext.getCmp("tree");
            var layersToolbar = layersContainer && layersContainer.getTopToolbar();
            if (layersToolbar) {
                layersToolbar.items.each(function(item) {
                    if (item.disabled) {
                        preGoogleDisabled.push(item);
                    }
                });
                layersToolbar.disable();
            }
        }, this);

        googleEarthPanel.on("hide", function() {
            // re-enable all tools
            toolbar.enable();
            
            var layersContainer = Ext.getCmp("tree");
            var layersToolbar = layersContainer && layersContainer.getTopToolbar();
            if (layersToolbar) {
                layersToolbar.enable();
            }
            // now go back and disable all things that were disabled previously
            for (var i=0, ii=preGoogleDisabled.length; i<ii; ++i) {
                preGoogleDisabled[i].disable();
            }

        }, this);

        this.mapPanelContainer = new Ext.Panel({
            layout: "card",
            region: "center",
            defaults: {
                border: false
            },
            items: [
                this.mapPanel,
                googleEarthPanel
            ],
            activeItem: 0
        });
        
        this.portalItems = [{
            region: "center",
            layout: "border",
            tbar: toolbar,
            items: [
                this.mapPanelContainer,
                westContainerPanel,                
                southPanel
            ]
        }];
        
        GeoExplorer.Composer.superclass.initPortal.apply(this, arguments);      

    },

    /**
     * api: method[createTools]
     * Create the various parts that compose the layout.
     */
    createTools: function() {
        GeoExplorer.Viewer.superclass.createTools.apply(this, arguments);
        
        Ext.getCmp("aboutbutton")
            .setText("Plocan")
            .setIconClass('icon-plocan');    
    
    }
});