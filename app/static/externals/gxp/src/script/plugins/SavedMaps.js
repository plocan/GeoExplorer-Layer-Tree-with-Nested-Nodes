


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
                    width: 300,
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
                                        {header: "Modified", dataIndex: 'modified', xtype:'datecolumn', renderer: Ext.util.Format.dateRenderer('d/m/Y H:i'), sortable: true}
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