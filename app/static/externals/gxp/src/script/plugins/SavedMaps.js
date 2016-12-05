


/**
 * @requires plugins/Tool.js
 * @requires GeoExt/widgets/tree/LayerNode.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = AddGroup
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: SavedMaps(config)
 *
 *    Plugin for showing saved maps list.
 *
 */
gxp.plugins.SavedMaps = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_savedmaps */
    ptype: "gxp_savedmaps",
    
    /** api: config[savedMapsMenuText]
     *  ``String``
     *  Text for add menu item (i18n).
     */
    savedMapsMenuText: "Show Saved Maps",

    /** api: config[savedMapsActionTip]
     *  ``String``
     *  Text for add action tooltip (i18n).
     */
    savedMapsActionTip: "Show saved Maps List",
    
    savedMapsDialogTitle: "List of saved maps",
    
    //savedMapsFieldSetText: "Group Name",
    
    //savedMapsFieldLabel: "New Group",
    
    savedMapsButtonText: "Delete map",
    
    savedMapsMsg: "Are you sure you want to delete map of id ",

    /** 
     * api: method[addActions]
     */
    addActions: function() {
        var apptarget = this.target;
        
        var actions = gxp.plugins.SavedMaps.superclass.addActions.apply(this, [{
            menuText: this.savedMapsMenuText,
            iconCls: "gxp-listmaps-icon",
            disabled: false,
            tooltip: this.savedMapsActionTip,
            handler: function() {
                
                var enableBtnFunction = function(){
                    if(this.getValue() != "")
                        Ext.getCmp("maps-deletebutton").enable();
                    else
                        Ext.getCmp("maps-deletebutton").disable();
                };
                
                if(this.win)
                    this.win.destroy();

                
                var store = new Ext.data.JsonStore({
                    root: 'maps',
                    fields: [
                            {name: 'id', mapping: 'id'}, 
                            //{name: 'title', mapping: 'title'},
                            {name: 'created', mapping: 'created', type: 'date', dateFormat: 'time'},
                            {name: 'modified', mapping: 'modified', type: 'date', dateFormat: 'time'}                                                
                    ],                    
                    autoLoad: true,
                    // load using script tags for cross domain, if the data in on the same domain as
                    // this page, an HttpProxy would be better
                    proxy: new Ext.data.HttpProxy({
                        url: '../maps/'
                    })                
                });

                //store.load();
                var gridSavedMaps;
                this.win = new Ext.Window({
                    width: 500,
                    height: 600,
                    title: this.savedMapsDialogTitle,
                    constrainHeader: true,
                    renderTo: apptarget.mapPanel.body,
                    layout: 'fit',
                    items: [
                         gridSavedMaps = new Ext.grid.GridPanel({
                            store: store,
                            selModel: new Ext.grid.RowSelectionModel({singleSelect : true}),
                            columns: [
                                        {header: "Id", dataIndex: 'id', sortable: true},
                                        //{header: "Title", dataIndex: 'title', sortable: false},                                   
                                        {header: "Created", dataIndex: 'created', xtype:'datecolumn', renderer: Ext.util.Format.dateRenderer('d/m/Y H:i'), sortable: true},
                                        {header: "Modified", dataIndex: 'modified', xtype:'datecolumn', renderer: Ext.util.Format.dateRenderer('d/m/Y H:i'), sortable: true},
                    {header: "Composer", sortable: false, xtype: 'actioncolumn',
                          renderer: function(val, meta, record, rowIndex){
                           return '<a href="../composer/#maps/'+record.id+'" target="_blank"><img width="16" height="16" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAJsSURBVHjadFO/q1xlED0z34/73X37oonYCopF8A9QUggpVtKYRqLij8rCKmBi8yzsVUQrIzYmGAsF0cJ/wcomhZ2gRpRFIqYQ3913v/3uzLHYdZP3wNPNwJyZOXNGFovzCYDiHhpJx/9ABACk24Yet8VhE9NJuGp46F7uOEj7k2QVkTmAFgFMmwSUBHIu7+ZcDgABwPt7gyTM2he1Di+TfiiiJZI0Vd03s39CCKdzLgdm9vs0ta8BHIpAtgx7IcRnU+peApDG8fB50seYUn69lPlH4zhcWa/HjwGBWfum1uFqCHHX3ayhlNkyxvx+jPlSKfOval29qIDMASQRfSzG+NR6ffQWyZ9zLk/PZqeWfb+/nM1OLXMui2mavjWblu62irG7lFL3piwW5yGij+RcvkypOzeOw2ut1RsiMheRkeS0EY9wd4gIYkyP9v38l9bqZxEgzKbfSP+O5Lmum10HOLVWP0+pf1tEHwdIEdkHJJvZ99O0fockABxFQDpV8XEcDki/k/Psg67buymiM9L/UNWz7viVJEQIwO+I4MxmKrhub5VUNdR69GGtwwsA0HX9J+52q9bVqyJy0li7++rOHwRCSGfd/dZ6vbpqZrdjLG+k1L1C+sPHi0VOEgCAAfBS5j+5+w/jOFyIMT4hEp5prV4RATZryzGHxROT/SUiUA3P1Tpcdp+eVI17qtptNBCQWJF+d0tVThAISSKEdLHvHyDAAcAIoCd5e6v8mZz7T1UDABkjNqYXEcmk/d1afS+l7iCEeBkgeGzj/wQDzKYfzdo1ue+dBaCRaKr6ICBhm9tNt/M1ANLvkuS/AwAyr0Sye2vZUwAAAABJRU5ErkJggg==" /></a>';
                          }
                    },
                    {header: "Viewer", sortable: false, xtype: 'actioncolumn',
                          renderer: function(val, meta, record, rowIndex){
                           return '<a href="../viewer/#maps/'+record.id+'" target="_blank"><img width="16" height="16" title="" alt="" src=" data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAJhSURBVHjabFM9q1RXFF1rn3PuvTM+jfBQhKQJiJ0RtHukMhEVgpCoKAQ7TRWso/9ALOyVlCEhTUh4foCFWKikE0K6QAiJihBEeeN83HPOXhYz+nRwwdrFZu/FYn/w0KGDu8zCHkDAPBBzpFrLHcmdtLDIC5sgAMUY0/m2HV5w90Veb2przT/lnH8opV83swjAsASTRMmxSUFyuPt/AK3rht/HmHZLXhbq79AAjAGA5BLtI0l/1lqupdR+S1oEVJcdRJLbJfW15l8kiOQKgBnJlRDCCQk9yQ/M7Eop+R+z8K4AgCGA4u53AKrW/AfAD5umuwxgSqqR9G/bbrkvjT51r3+Tll4PNAIYkWzMwpcAglnzOcm1vp9eMjMzi2uAKHFH2w5/m0w29gIoAAIWUx1K6t3rjVrzj5JPJD0l+WzuTr1Z+KqU2dekrYaQ9kt6s84oYbxwcETi/2Zhp6SXZnaYtF0kdwLo3etjyV+QXH37XCI5d1BrvQ0IpO0zi8f7fnwWwMdm8XgIYIztRYC11nx70Tw/JEBjEk0I4TMAcq+33P2vphk8APQUYJD8SYzpfK31bgjpaM6zm2RwAIwAt0ualpKvAnAAnRmfS/47gA1JPYlYSr6cUvNdSs1BAF/kPLtuFiwCGIeQVgaD+Ovb+3WvkPTCzAaSPyplfMaMqyl157puy/pcpL8eay0/z2aTDUm29CgDElsBCtBY8jKZjL4BuC2l9lTXrawDo2Ox1nKvlHyPxHshASRAWiItT6ej0wBC0wxOhBA/iSQDyeVX3bSyKewko4Qym41PltIfcK8PXw0A4+9IQnQveZIAAAAASUVORK5CYII=" /></a>';
                          }
                    }
                            ],
                            loadMask: true,                            
                            listeners: {
                                rowdblclick: function(grid, rowIndex, columnIndex, e) {
                                    // Get the Record, this is the point at which rowIndex references a 
                                    // record's index in the grid's store.
                                    var record = grid.getStore().getAt(rowIndex);  
                                    window.open("../#maps/"+record.id, "_blank");
                                    // Get field name
                                    //var fieldName = grid.getColumnModel().getDataIndex(columnIndex); 
                                    //var data = record.get(fieldName);
                                },
                                rowclick: function(grid, idx){
                                    if(grid.store.totalLength > 0)
                                        Ext.getCmp('maps-deletebutton').enable();
                                },                                
                                scope: this
                            }
                        })
                    ],
                    bbar: new Ext.Toolbar({
                        items:[
                            '->',
                            {
                                text: this.savedMapsButtonText,
                                iconCls: "gxp-icon-addgroup-button",
                                id: "maps-deletebutton",
                                scope: this,
                                disabled: true,
                                handler: function(){      
                                    //this.win.hide();                             
                                    var selection = gridSavedMaps.getSelectionModel().getSelected();

                                    Ext.MessageBox.confirm('Deleting map', this.savedMapsMsg + selection.id, function(btn){
                                       if(btn === 'yes'){
                                            Ext.Ajax.request({
                                            method:'DELETE',
                                            url: '../maps/'+selection.id,
                                            success: function(request) {
                                                var result = Ext.util.JSON.decode(request.responseText);
                                                
                                                if(result.id == selection.id)
                                                    Ext.Msg.show({
                                                         title: "Confirm message",
                                                         msg: "Map was succesfully deleted",
                                                         buttons: Ext.Msg.OK,
                                                         icon: Ext.MessageBox.OK
                                                    });

                                            },
                                            failure: function(request) {
                                                var obj;
                                                try {
                                                    obj = Ext.util.JSON.decode(request.responseText);
                                                } catch (err) {
                                                    // pass
                                                }
                                                var msg = this.loadConfigErrorText;
                                                if (obj && obj.error) {
                                                    msg += obj.error;
                                                } else {
                                                    msg += this.loadConfigErrorDefaultText;
                                                }
                                                alert(msg);
                                                /*this.on({
                                                    ready: function() {
                                                        this.displayXHRTrouble(msg, request.status);
                                                    },
                                                    scope: this
                                                });
                                                
                                                window.location.hash = "";
                                                */
                                            },
                                            scope: this
                                        });
                                        store.remove(selection);
                                       }                 
                                     }); 
                                }
                            }
                        ]
                    })
                });
                
                
                this.win.show();
            },
            scope: this
        }]);

          
        return actions;
    }
        
});

Ext.preg(gxp.plugins.SavedMaps.prototype.ptype, gxp.plugins.SavedMaps);