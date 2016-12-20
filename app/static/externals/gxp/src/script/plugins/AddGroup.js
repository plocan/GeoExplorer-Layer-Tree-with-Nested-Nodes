




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
 *  .. class:: AddGroup(config)
 *
 *    Plugin for adding a new group on layer tree.
 *
 */
gxp.plugins.AddGroup = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_addgroup */
    ptype: "gxp_addgroup",
    
    /** api: config[addGroupMenuText]
     *  ``String``
     *  Text for add menu item (i18n).
     */
    addGroupMenuText: "Add Group",

    /** api: config[addGroupActionTip]
     *  ``String``
     *  Text for add action tooltip (i18n).
     */
    addGroupActionTip: "Add a new group in the layer tree",
    
    addGroupDialogTitle: "New Group",
    
    addGroupFieldSetText: "Group Info",
    
    addGroupFieldLabel: "Group Name",
    
    addGroupButtonText: "Add Group",
    
    addGroupMsg: "Please enter a group name",

    addGroupPositionLabel:"Select a position",

    /** 
     * api: method[addActions]
     */
    addActions: function() {
        var apptarget = this.target;
        
        var actions = gxp.plugins.AddGroup.superclass.addActions.apply(this, [{
            menuText: this.addGroupMenuText,
            iconCls: "gxp-icon-addgroup",
            disabled: false,
            tooltip: this.addGroupActionTip,
	    itemId: "addGroup",
            handler: function() {
                
                var enableBtnFunction = function(){
                    if(this.getValue() != "")
                        Ext.getCmp("group-addbutton").enable();
                    else
                        Ext.getCmp("group-addbutton").disable();
                };
                
                if(this.win)
                    this.win.destroy();

                this.win = new Ext.Window({
                    width: 315,
                    height: 200,
                    title: this.addGroupDialogTitle,
                    constrainHeader: true,
                    renderTo: apptarget.mapPanel.body,
                    items: [
                        new Ext.form.FormPanel({
                            width: 300,
                            height: 150,
                            items: [
                                {
                                  xtype: 'fieldset',
                                  id: 'group-field-set',
                                  title: this.addGroupFieldSetText,
                                  items: [
                                      {
                                        xtype: 'textfield',
                                        width: 120,
                                        id: 'diag-text-field',
                                        fieldLabel: this.addGroupFieldLabel,
                                        listeners: {
                                            render: function(f){
                                                f.el.on('keydown', enableBtnFunction, f, {buffer: 350});
                                            }
                                        }
                                      },{
                                        xtype: 'combo',
                                        width: 120,
                                        id:'diag-combobox',
                                        fieldLabel:  this.addGroupPositionLabel,
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
                                text: this.addGroupButtonText,
                                iconCls: "gxp-icon-addgroup-button",
                                id: "group-addbutton",
                                scope: this,
                                disabled: true,
                                handler: function(){      
                                    this.win.hide();                             
                                    var tree = Ext.getCmp("layers");      

                                    var textField = Ext.getCmp("diag-text-field");
                                    var combobox = Ext.getCmp("diag-combobox");

                                    var groupNames;
                                    var groupConfig;
                                    var groupId = Date.now().toString();

                                    var node = tree.root.findChild("text",textField.getValue(),true);
                                    if(node){
                                         Ext.Msg.show({
                                             title: "New Group",
                                             msg: textField.getValue()+" name is already in use. Please try a different name.",
                                             buttons: Ext.Msg.OK,
                                             icon: Ext.MessageBox.OK
                                        });
                                    }
                                    else if(textField.isDirty() && textField.isValid()){
                                        var group = textField.getValue();
                                        var position = combobox.getValue();

                                        var LayerNodeUI = Ext.extend( GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());
                                    
                                       // var locIndex= tree.localIndexs[GeoExt.Lang.locale];
                                        
                                         if(typeof group == "string"){
                                            groupNames=group.split(tree.localLabelSep);
                                            groupConfig= new Object();
                                        }else{
                                            groupNames=group.title.split(tree.localLabelSep);
                                            groupConfig= group;
                                        }
                                        if(groupNames.length > 0){
                                            groupConfig.title= /*groupNames[locIndex] ? groupNames[locIndex] :*/ groupNames[0];
                                        }

                                        /*var groupConfig = typeof group == "string" ?
                                            {title: group} : group;*/
                                           
                                        var selectedNode = tree.getSelectionModel().getSelectedNode();
                                        //var me = this.target;
                                        var node = new GeoExt.tree.LayerContainer({
                                                text: groupConfig.title,
                                                iconCls: "gxp-folder",
                                                expanded: true,
                                                //checked: false,
                                                group: group == "default" ? undefined : groupId,
                                                loader: new GeoExt.tree.LayerLoader({
                                                    baseAttrs: groupConfig.exclusive ? {checkedGroup: group} : undefined,
                                                    store: this.target.mapPanel.layers,
                                                    filter: (function(group) {
                                                        return function(record) {
                                                            return (record.get("group") || "default") == groupId &&
                                                                record.getLayer().displayInLayerSwitcher == true;
                                                        };
                                                    })(groupId),
                                                    createNode: function(attr) {
                                                        attr.uiProvider = LayerNodeUI;
                                                        attr.component = {
                                                            xtype: "gx_wmslegend",
                                                            layerRecord: this.store.getByLayer(attr.layer),
                                                            showTitle: false,
                                                            // custom class for css positioning
                                                            // see tree-legend.html
                                                            cls: "legend" //currently this css class is used for hiding layer legend
                                                        }
                                                        return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);                                                        
                                                    }
                                                }),
                                                singleClickExpand: true,
                                                allowDrag: true,
                                                listeners: {
                                                    append: function(tree, node) {
                                                        node.expand();
                                                    }
                                                }
                                            });

                                        if(selectedNode && !selectedNode.leaf)
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
                                            tree.root.insertBefore(node, tree.root.firstChild);                                            
                                    }else{
                                        Ext.Msg.show({
                                             title: "New Group",
                                             msg: this.addGroupMsg,
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

Ext.preg(gxp.plugins.AddGroup.prototype.ptype, gxp.plugins.AddGroup);

