/**
This override replaces tokenRe to match a token with nameDelimiter
*/
Ext.define('Ext.ux.app.bind.Template', {
    override: 'Ext.app.bind.Template',
    
    tokenRe: /\{[!]?(?:(?:(\d+)|([a-z_][\w\-\.|]*))(?::([a-z_\.]+)(?:\(([^\)]*?)?\))?)?)\}/gi
});