const HTML = require('html-parse-stringify');
const getUrls = require('get-urls');
const normalize = require('normalize-url');

module.exports.getUrlsFromCommentBody = function(commentBody)  {
    const hrefRegex = /(href=".*"|href='.*')/g; // grab href='*' or href="*"
    const urlRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g; // grab string between single or double quotes
    const hrefs = commentBody.match(hrefRegex);
    const found = hrefs.map(href => href.charAt(0) === '/' ? 'reddit.com' + href.match(urlRegex)[0] : href);
    const join = found.join(' ');
    const urls = Array.from(getUrls(join));
    return urls;
}

module.exports.normalizeCommentBody = function(commentBody) {
    const escapedCommentBody = unescapeHTML(commentBody);
    const json = HTML.parse(escapedCommentBody);
    replaceRelativeUrls(json[0], options);
    newHTML = HTML.stringify(json);
    return newHTML;
}

function unescapeHTML(escapedHTML) {
    return escapedHTML
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function replaceRelativeUrls(node) {
    // If this node is a tag (a, p, etc) and the options want to modify that part.
    if (node.type === 'text') {
        return;
    }

    if (node.type === 'tag' && options[node.name]) {
        const allKeys = Object.keys(options[node.name]);
        const href = allKeys.attrs.href;
        if (href && href.charAt(0) === '/') {
            const newUrl = 'reddit.com' + href;
            const normilizedUrl = normalize(newUrl, {forceHttps: true });
            allKeys.attrs.href = normilizedUrl;
        }
    }

    for (let child of node.children) {
        replaceRelativeUrls(child, options);
    }

    return;
}


