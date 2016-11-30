

/**
 * @requires plugins/Tool.js
 * @requires GeoExt/widgets/tree/LayerNode.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = RenameGroupFolder
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: RenameGroupFolder(config)
 *
 *    Plugin for renaming a group/folder on layer tree.
 *
 */
gxp.plugins.RenameFolderGroup = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_renamefoldergroup */
    ptype: "gxp_renamefoldergroup",
    
    /** api: config[renameFolderGroupMenuText]
     *  ``String``
     *  Text for rename menu item (i18n).
     */
    renameFolderGroupMenuText: "Rename",

    /** api: config[addRenameActionTip]
     *  ``String``
     *  Text for add action tooltip (i18n).
     */
    renameFolderGroupActionTip: "Rename folder or group name in the layer tree",
    
    renameFolderGroupDialogTitle: "Rename Folder or Group Name",
    
    renameFolderGroupFieldSetText: "Name",
    
    renameFolderGroupFieldLabel: "New Name",
    
    renameFolderGroupButtonText: "Change Name",
    
    renameFolderGroupMsg: "Please enter a name",

    /** 
     * api: method[addActions]
     */
    addActions: function() {
        var apptarget = this.target;
        
        var actions = gxp.plugins.RenameFolderGroup.superclass.addActions.apply(this, [{
            menuText: this.renameFolderGroupMenuText,
            iconCls: "gxp-rename-icon",
            disabled: false,
            tooltip: this.renameFolderGroupActionTip,
            handler: function() {
                
                var enableBtnFunction = function(){
                    if(this.getValue() != "")
                        Ext.getCmp("foldergroup-renamebutton").enable();
                    else
                        Ext.getCmp("foldergroup-renamebutton").disable();
                };
                
                if(this.win)
                    this.win.destroy();

                this.win = new Ext.Window({
                    width: 315,
                    height: 200,
                    title: this.renameFolderGroupDialogTitle,
                    constrainHeader: true,
                    renderTo: apptarget.mapPanel.body,
                    items: [
                        new Ext.form.FormPanel({
                            width: 300,
                            height: 150,
                            items: [
                                {
                                  xtype: 'fieldset',
                                  id: 'foldergroup-field-set',
                                  title: this.addFolderFieldSetText,
                                  items: [
                                      {
                                        xtype: 'textfield',
                                        width: 120,
                                        id: 'diag-text-field',
                                        fieldLabel: this.renameFolderGroupFieldLabel,
                                        listeners: {
                                            render: function(f){
                                                f.el.on('keydown', enableBtnFunction, f, {buffer: 350});
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
                                text: this.renameFolderGroupButtonText,
                                iconCls: "gxp-icon-renamefoldergroup-button",
                                id: "foldergroup-renamebutton",
                                scope: this,
                                disabled: true,
                                handler: function(){      
                                    this.win.hide();                             
                                    var tree = Ext.getCmp("layers");      
                                    var textField = Ext.getCmp("diag-text-field");
                                    var foldergroupNames;
                                    var foldergroupConfig;

                                    var node = tree.root.findChild("text",textField.getValue(),true);
                                    if(node){
                                         Ext.Msg.show({
                                             title: "Rename",
                                             msg: textField.getValue()+" name is already in use. Please try a different name.",
                                             buttons: Ext.Msg.OK,
                                             icon: Ext.MessageBox.OK
                                        });
                                    }
                                    else if(textField.isDirty() && textField.isValid()){
                                        var name = textField.getValue();
                                       
                                       // var locIndex= tree.localIndexs[GeoExt.Lang.locale];
                                        
                                         if(typeof name == "string"){
                                            foldergroupNames=name.split(tree.localLabelSep);
                                            foldergroupConfig= new Object();
                                        }else{
                                            foldergroupNames=name.title.split(tree.localLabelSep);
                                            foldergroupConfig= name;
                                        }
                                        if(foldergroupNames.length > 0){
                                            foldergroupConfig.title= /*groupNames[locIndex] ? groupNames[locIndex] :*/ foldergroupNames[0];
                                        }

                                        /*var groupConfig = typeof group == "string" ?
                                            {title: group} : group;*/
                                           
                                        var selectedNode = tree.getSelectionModel().getSelectedNode();
                                        
                                        selectedNode.setText(name);                                                                   

                                    }else{
                                        Ext.Msg.show({
                                             title: "New Name",
                                             msg: this.renameFolderGroupMsg,
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
          
        return actions;
    }
        
});

Ext.preg(gxp.plugins.RenameFolderGroup.prototype.ptype, gxp.plugins.RenameFolderGroup);


