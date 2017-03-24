/* global Ext */

/**
This override replaces tokenRe to match a token with nameDelimiter
*/
Ext.define('Ext.vmx.Template', {
    override: 'Ext.Template',

    tokenRe: /\{(?:(?:(\d+)|([a-z_][\w\-|]*))(?::([a-z_\.]+)(?:\(([^\)]*?)?\))?)?)\}/gi
});