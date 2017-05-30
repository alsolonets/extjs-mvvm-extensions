/* global Ext */

/**
* This override encapsulates the ViewModel of a component.
* This is achieved by giving unique names to the properties of the ViewModel.
*/
Ext.define('Ext.vmx.app.SplitViewModel', {
    override: 'Ext.app.ViewModel',

    config: {
        /**
        @cfg {String}
        ViewModel name
        */
        name: undefined,

        /**
        @cfg {String}
        @private
        Identifier (name + sequential identifier)
        */
        uniqueName: undefined,

        /**
        @cfg {String}
        @private
        uniqueName + '_'
        */
        prefix: undefined
    },

    uniqueNameRe: /_id_\d+/,

    privates: {
        applyData: function (newData, data) {
            newData = this.getPrefixedData(newData);
            data = this.getPrefixedData(data);

            return this.callParent([newData, data]);
        },

        applyLinks: function (links) {
            links = this.getPrefixedData(links);
            return this.callParent([links]);
        },

        applyFormulas: function (formulas) {
            formulas = this.getPrefixedData(formulas);
            return this.callParent([formulas]);
        },

        bindExpression: function (path, callback, scope, options) {
            path = this.getPrefixedPath(path);
            return this.callParent([path, callback, scope, options]);
        }
    },

    linkTo: function (key, reference) {
        key = this.getPrefixedPath(key);
        return this.callParent([key, reference]);
    },

    get: function (path) {
        path = this.getPrefixedPath(path);
        return this.callParent([path]);
    },

    set: function (path, value) {
        if (Ext.isString(path)) {
            path = this.getPrefixedPath(path);
        }
        else if (Ext.isObject(path)) {
            path = this.getPrefixedData(path);
        }
        this.callParent([path, value]);
    },

    /**
    * The name is either a specified name 
    * or a type of the ViewModel 
    * or just 'viewmodel' (for anonymous ViewModels).
    */
    applyName: function (name) {
        name = name || this.type || 'viewmodel';
        return name;
    },

    /**
    * Unique name is based on the Ext.id generator
    */
    applyUniqueName: function (uniqueName) {
        uniqueName = uniqueName || Ext.id(null, this.getName() + '_id_');
        return uniqueName;
    },

    /**
    * Prefix is the unique name with the delimiter
    */
    applyPrefix: function (prefix) {
        prefix = prefix || this.getUniqueName() + '_';
        return prefix;
    },

    /**
    Get the data object with the keys prefixed
    */
    getPrefixedData: function (data) {
        var name, newName, value,
            result;

        if (!data) {
            return null;
        }

        result = {};

        for (name in data) {
            value = data[name];
            newName = this.getPrefixedPath(name);
            result[newName] = value;
        }

        return result;
    },

    /**
    Get the path with a correct prefix

    Examples:

        foo.bar -> myviewmodel_id_123_foo.bar
        myviewmodel.foo.bar -> myviewmodel_id_123_foo.bar
        myviewmodel_id_123_foo.bar -> myviewmodel_id_123_foo.bar (no change)

    */
    getPrefixedPath: function (path) {
        var parts,
            maybeHasViewModelName,
            name,
            vm;

        // If there is already a unique name in the path
        if (this.uniqueNameRe.test(path)) {
            return path;
        }

        // The descriptor may contain a name of a ViewModel: myviewmodel.foo.bar
        maybeHasViewModelName = path.indexOf('.') > -1;
        if (maybeHasViewModelName) {
            parts = path.split('.');
            name = parts[0];

            // Searching for it
            vm = this.findViewModelByName(name);
            if (vm) {
                // Found. Binding to the specified ViewModel
                path = vm.getPrefix() + parts.slice(1).join('.');
            }
            else {
                // Not found. Binding to this ViewModel
                path = this.getPrefix() + path;
            }
        }
        else {
            // The descriptor doesn't contain the name of a ViewModel.
            // Binding to this ViewModel
            path = this.getPrefix() + path;
        }

        return path;
    },

    /**
    Find a ViewModel by the name up the hierarchy
    @param {String} name ViewModel's name
    @param {Boolean} skipThis true to ignore this instance
    */
    findViewModelByName: function (name, skipThis) {
        var result,
            vm = skipThis ? this.getParent() : this;

        while (vm) {
            if (vm.getName() == name) {
                return vm;
            }
            vm = vm.getParent();
        }

        return null;
    }
});
