
/**
 * @requires plugins/Tool.js
 * @requires GeoExt/widgets/tree/LayerNode.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = RemoveFolderGroup
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: RemoveFolderGroup(config)
 *
 *    Plugin for removing a tree node(Folder)/layer container(Group) node on layer tree.
 *
 */
gxp.plugins.RemoveFolderGroup = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_removefoldergroup */
    ptype: "gxp_removefoldergroup",
    
    /** api: config[removeFolderGroupMenuText]
     *  ``String``
     *  Text for remove menu item (i18n).
     */
    removeFolderGroupMenuText: "Remove Folder/Group",

    /** api: config[removeFolderGroupActionTip]
     *  ``String``
     *  Text for remove action tooltip (i18n).
     */
    removeFolderGroupActionTip: "Remove a folder or group in the layer tree",
    
    removeFolderGroupDialogTitle: "Remove Folder or Group",
    
    addFolderButtonText: "Remove",
    
    removeFolderGroupMsg: "Are you sure you want to delete this node? Please confirm the removal of ",

    /** 
     * api: method[removeActions]
     */
    addActions: function() {
        var apptarget = this.target;
        
        var actions = gxp.plugins.RemoveFolderGroup.superclass.addActions.apply(this, [{
            menuText: this.removeFolderGroupMenuText,
            iconCls: "gxp-removefolder-icon",
            disabled: false,
            tooltip: this.removeFolderGroupActionTip,
	    itemId: "removeFolderGroup",
            handler: function() {
                
                var enableBtnFunction = function(){
                    if(this.getValue() != "")
                        Ext.getCmp("folder-addbutton").enable();
                    else
                        Ext.getCmp("folder-addbutton").disable();
                };

                var tree = Ext.getCmp("layers");
                var selectedNode = tree.getSelectionModel().getSelectedNode();      
                var layers = this.target.mapPanel.layers;

                //if it is a tree node with childs
                if(!(selectedNode instanceof GeoExt.tree.LayerContainer) && selectedNode.childNodes.length != 0)
                {
                    Ext.MessageBox.alert('Delete', 'You must remove its childs nodes first', function(){
                    });
                }
                else if(selectedNode.attributes.group == "background")
                    Ext.MessageBox.alert('Delete', 'You can\'t remove ' +selectedNode.attributes.text, function(){
                    });   
                else
                {
                    Ext.MessageBox.confirm('Delete', this.removeFolderGroupMsg + selectedNode.attributes.text, function(btn){
                       if(btn === 'yes'){
                           var layer;
                           for(var i = 0;i < layers.data.length;i++)
                           {
                                layer = layers.data.items[i];
                                if(layer.data.group && layer.data.group == selectedNode.attributes.group)
                                {
                                   layers.remove(layer);
                                   i--;
                                }
                           }
                           selectedNode.remove();
                       }                 
                     });
                }                
            },
            scope: this
        }]);

       
        return actions;
    }
        
});

Ext.preg(gxp.plugins.RemoveFolderGroup.prototype.ptype, gxp.plugins.RemoveFolderGroup);
