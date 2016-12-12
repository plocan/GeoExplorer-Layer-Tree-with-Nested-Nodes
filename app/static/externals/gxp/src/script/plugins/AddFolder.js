


/**
 * @requires plugins/Tool.js
 * @requires GeoExt/widgets/tree/LayerNode.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = AddFolder
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: AddFolder(config)
 *
 *    Plugin for adding a new folder on layer tree.
 *
 */
gxp.plugins.AddFolder = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_addfolder */
    ptype: "gxp_addfolder",
    
    /** api: config[addFolderMenuText]
     *  ``String``
     *  Text for add folder menu item (i18n).
     */
    addFolderMenuText: "Add Folder",

    /** api: config[addFolderActionTip]
     *  ``String``
     *  Text for add action tooltip (i18n).
     */
    addFolderActionTip: "Add a new folder in the layer tree",
    
    addFolderDialogTitle: "New Folder",
    
    addFolderFieldSetText: "Folder Name",
    
    addFolderFieldLabel: "New Folder",
    
    addFolderButtonText: "Add Folder",
    
    addFolderMsg: "Please enter a folder name",

    /** 
     * api: method[addActions]
     */
    addActions: function() {
        var apptarget = this.target;
        
        var actions = gxp.plugins.AddFolder.superclass.addActions.apply(this, [{
            menuText: this.addFolderMenuText,
            iconCls: "gxp-folder-icon",
            disabled: false,
            tooltip: this.addFolderActionTip,
	    itemId: "addFolder",
            handler: function() {
                
                var enableBtnFunction = function(){
                    if(this.getValue() != "")
                        Ext.getCmp("folder-addbutton").enable();
                    else
                        Ext.getCmp("folder-addbutton").disable();
                };
                
                if(this.win)
                    this.win.destroy();

                this.win = new Ext.Window({
                    width: 315,
                    height: 200,
                    title: this.addFolderDialogTitle,
                    constrainHeader: true,
                    renderTo: apptarget.mapPanel.body,
                    items: [
                        new Ext.form.FormPanel({
                            width: 300,
                            height: 150,
                            items: [
                                {
                                  xtype: 'fieldset',
                                  id: 'folder-field-set',
                                  title: this.addFolderFieldSetText,
                                  items: [
                                      {
                                        xtype: 'textfield',
                                        width: 120,
                                        id: 'diag-text-field',
                                        fieldLabel: this.addFolderFieldLabel,
                                        listeners: {
                                            render: function(f){
                                                f.el.on('keydown', enableBtnFunction, f, {buffer: 350});
                                            }
                                        }
                                      },{
                                        xtype: 'combo',
                                        width: 120,
                                        id:'diag-combobox',
                                        fieldLabel: 'Select a Position',
                                        store: new Ext.data.SimpleStore({
                                            data: [
                                                ['before', 'before'],
                                                ['inside', 'inside'],
                                                ['after', 'after']
                                            ],                                            
                                            fields: ['value', 'position']
                                        }),
                                        valueField: 'value',
                                        displayField: 'position',
                                        mode:'local',
                                        listeners: {
                                            render: function () {
                                                var combo = Ext.getCmp('diag-combobox');
                                                combo.setValue(combo.store.getAt('0').get('value'));
                                            }
                                         }
                                      }
                                  ]
                                }
                            ]
                        })
                    ],
                    bbar: new Ext.Toolbar({
                        items:[
                            '->',
                            {
                                text: this.addFolderButtonText,
                                iconCls: "gxp-icon-addgroup-button",
                                id: "folder-addbutton",
                                scope: this,
                                disabled: true,
                                handler: function(){      
                                    this.win.hide();                             
                                    var tree = Ext.getCmp("layers");      
 
                                    var textField = Ext.getCmp("diag-text-field");
                                    var combobox = Ext.getCmp("diag-combobox");
 
                                    var folderNames;
                                    var folderConfig;

                                    var node = tree.root.findChild("text",textField.getValue(),true);
                                    if(node){
                                         Ext.Msg.show({
                                             title: "New Folder",
                                             msg: textField.getValue()+" name is already in use. Please try a different name.",
                                             buttons: Ext.Msg.OK,
                                             icon: Ext.MessageBox.OK
                                        });
                                    }
                                    else if(textField.isDirty() && textField.isValid()){
                                        var folder = textField.getValue();
                                        var position = combobox.getValue();

                                       // var locIndex= tree.localIndexs[GeoExt.Lang.locale];
                                        
                                         if(typeof folder == "string"){
                                            folderNames=folder.split(tree.localLabelSep);
                                            folderConfig= new Object();
                                        }else{
                                            folderNames=folder.title.split(tree.localLabelSep);
                                            folderConfig= folder;
                                        }
                                        if(folderNames.length > 0){
                                            folderConfig.title= /*groupNames[locIndex] ? groupNames[locIndex] :*/ folderNames[0];
                                        }

                                        /*var groupConfig = typeof group == "string" ?
                                            {title: group} : group;*/
                                           
                                        var selectedNode = tree.getSelectionModel().getSelectedNode();
                                        
                                        var node = new Ext.tree.TreeNode({ // subcarpeta
                                            text: folder,
                                            allowDrag: false,
                                            draggable: false
                                        });

                                        if(selectedNode && !selectedNode.leaf )
                                        {
                                            if(position == "inside" && !(selectedNode instanceof GeoExt.tree.LayerContainer))
                                                selectedNode.appendChild(node);                                        
                                            else if(position == "before")
                                                selectedNode.parentNode.insertBefore(node, selectedNode); 
                                            else {
                                                var next = selectedNode.nextSibling;
                                                if(next)
                                                {

                                                    selectedNode.parentNode.insertBefore(node, next);              
                                                }
                                                else
                                                    selectedNode.parentNode.appendChild(node);
                                            }
                                        }
                                        else
                                            tree.root.insertBefore(node,tree.root.firstChild);                                            
                                    }else{
                                        Ext.Msg.show({
                                             title: "New Folder",
                                             msg: this.addFolderMsg,
                                             buttons: Ext.Msg.OK,
                                             icon: Ext.MessageBox.OK
                                        });
                                    }
                                    
                                    this.win.destroy();
                                    
                                    apptarget.modified = true;
                                }
                            }
                        ]
                    })
                });
                
                this.win.show();
            },
            scope: this
        }]);

       /* var renameAction = actions[0];

        this.target.on("layerselectionchange", function(record) {
            var tree = Ext.getCmp("layers");
            var node = tree.getSelectionModel().getSelectedNode();
            renameAction.setDisabled(
               node!= null && node.leaf
            );
        }, this);
         */ 
        return actions;
    }
        
});

Ext.preg(gxp.plugins.AddFolder.prototype.ptype, gxp.plugins.AddFolder);




