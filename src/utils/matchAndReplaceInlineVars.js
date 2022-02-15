export function matchVarRequests(str) {
    const regex = /[%]\w+[%]/g
    return [...str.matchAll(regex)].map(f => f[0])
}

export function replaceInlineVars(str, arr, dict) {
    return arr.reduce((a, b) => a.replace(b, dict[b]), str)
}

export function matchAndReplaceInlineVars(str, dict, exp = /[%]\w+[%]/g) {
    return replaceInlineVars(str, matchVarRequests(str, exp), dict)
}