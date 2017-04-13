Extensions for custom components with a ViewModel.

- Ext.vmx.mixin.Bindable
- Ext.vmx.app.SplitViewModel

# Ext.vmx.mixin.Bindable

## Outside binding
Allows an outer component to bind to a component with own ViewModel. For instance, this is common when you extend from a Grid with a ViewModel inside.

```javascript
Ext.define('MyGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'mygrid',

    viewModel: {

    }
});
```

Without the extension you aren't able to bind to it's selection from the outside ([EXTJS-15503](http://google.com/search?q=EXTJS-15503)):
```javascript
Ext.define('MyPanel', {
    extend: 'Ext.panel.Panel',
    
    viewModel: {

    },

    items: [{
        xtype: 'mygrid',
        reference: 'mygrid'
    }, {
        xtype: 'textfield',
        fieldLabel: 'Selected record',
        /*
        Won't work because of the viewModel inside 'MyGrid'.
        Use 'Ext.vmx.mixin.Bindable' to fix.
        */
        bind: '{mygrid.selection.name}'
    }]
});
```


## Self binding
Allows to make a bind between component's configuration properties and it's inner components:

```javascript
Ext.define('MyGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'mygrid',

    viewModel: {

    },
    
    config: {
        readOnly: false
    },

    publishes: ['readOnly'],

    tbar: [{
        text: 'Add',
        itemId: 'addButton',
        bind: {
            disabled: '{readOnly}'
        }
    }, {
        text: 'Remove',
        itemId: 'removeButton',
        bind: {
            disabled: '{readOnly}',
            text: 'Remove {selection.name}'
        }
    }]    
});
```

## Demo
Full demo abailable at https://fiddle.sencha.com/#fiddle/1si5

## Limitations
No known issues. Backward compatible.
Keep in mind Sencha's recommendations: [Don't nest data objects more deeply than necessary](http://docs.sencha.com/extjs/6.2.1/guides/application_architecture/view_models_data_binding.html#application_architecture-_-view_models_data_binding_-_recommendations).

## Usage
```javascript
Ext.application({
    requires: [
        'Ext.vmx.mixin.Bindable'
    ]
});
```

# Ext.vmx.app.SplitViewModel

Allows you to:
- Define non-unique data field names among ViewModels
- Reference to a parent ViewModel from a child

This extension needs in a more detailed explanation. Imagine you have two components, one is nested into another. They both have ViewModels. And both of these ViewModels have a `color` data field. You want to use configuration properties to control component's state. How would you bind the inner component's `color` config to the outer component's `color`? If you try, you would see that the binding doesn't work as far as names are not unique.
https://fiddle.sencha.com/#fiddle/1so5

Seems we have to use different names for ViewModels' data fields. E.g. `innerColor` and `outerColor`. Obviously this is not convinient and doesn't guaranee uniqueness.

So here is the `SplitViewModel` extension that internally gives unique names to the data fields of a ViewModel. As the result ViewModels never interfere. To complete our example we are going to to make an explicit back-reference binding as shown:
```javascript
Ext.define('Fiddle.view.OuterContainer', {
    // ...
    
    viewModel: {
        name: 'outercontainer',
        data: {
            color: null
        }
    },
    
    // ...

    items: [{
        xtype: 'innercontainer',
        bind: {
            color: '{outercontainer.color}'
        }
    }]
});
```

1. We gave a `name` to the outer ViewModel since it's anonymous (in the same file). Either way the `name` would be taken from the `alias` automatically, e.g. 

    `alias: 'viewmodel.outercontainer'`.

2. We gave an explicit back-reference to the outer ViewModel:

    `color: '{outercontainer.color}'`

## Demo
Try it https://fiddle.sencha.com/#fiddle/1so9

## Pros
ViewModels are now isolated from each other. Developers are able to create independent views using both ViewControllers and ViewModels with no worrying about the ViewModels interference. With this extension binding becomes similar to a circuit boar wiring. Very predictable.

## Limitations
If you had nested views both with ViewModels like in example above, then you must add an explicit back-reference to your bindings where necessary. Even if property names are unique. All you have to do is to prefix the binding expression with ViewModel's `type` or `name`.

## Usage
```javascript
Ext.application({
    requires: [
        'Ext.vmx.app.SplitViewModel'
    ]
});
```

# Combining extensions
You are going to have the best results with both extensions included. Take a look at this example 

https://fiddle.sencha.com/#fiddle/1sod

There are no handlers. Everything is done with a declaration syntax. Component's state is controlled by configuration properties but the internals are bound via ViewModel. This is great. I wish Sencha would have done this by default.
