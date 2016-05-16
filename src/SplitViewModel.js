/**
An override to split ViewModels data by their instances
*/
Ext.define('Ext.ux.app.SplitViewModel', {
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
        name + sequential identifer
        */
        uniqueName: undefined,

        /**
        @cfg {String}
        @private
        uniqueName + nameDelimiter
        */
        prefix: undefined
    },

    nameDelimiter: '|',
    expressionRe: /^(?:\{[!]?(?:(\d+)|([a-z_][\w\-\.|]*))\})$/i,
    uniqueNameRe: /-\d+$/,

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

    bind: function (descriptor, callback, scope, options) {
        if (Ext.isString(descriptor)) {
            descriptor = this.getPrefixedDescriptor(descriptor);
        }
        return this.callParent([descriptor, callback, scope, options]);
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

    applyName: function (name) {
        name = name || this.type || 'viewmodel';
        return name;
    },

    applyUniqueName: function (id) {
        id = id || Ext.id(null, this.getName() + '-');
        return id;
    },

    applyPrefix: function (prefix) {
        prefix = prefix || this.getUniqueName() + this.nameDelimiter;
        return prefix;
    },

    /**
    Apply a prefix to property names
    */
    getPrefixedData: function (data) {
        var name, newName, value,
            result = {};

        if (!data) {
            return null;
        }

        for (name in data) {
            value = data[name];
            newName = this.getPrefixedPath(name);
            result[newName] = value;
        }

        return result;
    },

    /**
    Get a descriptor with a prefix
    */
    getPrefixedDescriptor: function (descriptor) {
        var descriptorParts = this.expressionRe.exec(descriptor);

        if (!descriptorParts) {
            return descriptor;
        }

        var path = descriptorParts[2]; // '{foo}' -> 'foo'
        descriptor = descriptor.replace(path, this.getPrefixedPath(path));

        return descriptor;
    },

    /**
    Get a path with a correct prefix

    Examples:

        foo.bar -> viewmodel-123|foo.bar
        viewmodel|foo.bar -> viewmodel-123|foo.bar
        viewmodel-123|foo.bar -> viewmodel-123|foo.bar (no change)

    */
    getPrefixedPath: function (path) {
        var nameDelimiterPos = path.lastIndexOf(this.nameDelimiter),
            hasName = nameDelimiterPos != -1,
            name,
            isUnique,
            vmUniqueName,
            vm;

        if (hasName) {
            // bind to a ViewModel by name: viewmodel|foo.bar
            name = path.substring(0, nameDelimiterPos + this.nameDelimiter.length - 1);
            isUnique = this.uniqueNameRe.test(name);

            if (!isUnique) {
                // replace name by uniqueName: viewmodel-123|foo.bar
                vm = this.findViewModelByName(name);
                if (vm) {
                    vmUniqueName = vm.getUniqueName();
                    path = vmUniqueName + path.substring(nameDelimiterPos);
                }
                else {
                    Ext.log({ level: 'warn' }, 'Cannot find a ViewModel instance by a specifed name/type: ' + name);
                }
            }
        }
        else {
            // bind to this ViewModel: foo.bar -> viewmodel-123|foo.bar
            path = this.getPrefix() + path;
        }

        return path;
    },

    /**
    Find a ViewModel by name up by hierarchy
    @param {String} name ViewModel's name
    @param {Boolean} skipThis Pass true to ignore this instance
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
