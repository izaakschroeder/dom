/**
 * Zest (https://github.com/chjj/zest)
 * A css selector engine.
 * Copyright (c) 2011, Christopher Jeffrey. (MIT Licensed)
 */


/**
 * Helpers
 */
var next = function(el) {
	while ((el = el.nextSibling) && el.nodeType !== 1);
	return el;
};

var prev = function(el) {
	while ((el = el.previousSibling) && el.nodeType !== 1);
	return el;
};

var child = function(el) {
	if (el = el.firstChild) 
		while (el.nodeType !== 1 && (el = el.nextSibling));
	return el;	
};

var unquote = function(str) {
	if (!str) return str;
	var ch = str[0];
	return (ch === '"' || ch === '\'') ? str.slice(1, -1) : str;
};


/**
 * Handle `nth` Selectors
 */

var nth = function(param, test) {
  var $ = param.replace(/\s+/g, '')
    , offset
    , group;

  if ($ === 'even') $ = '2n+0';
  else if ($ === 'odd') $ = '2n+1';
  else if (!~$.indexOf('n')) $ = '0n' + $;

  $ = /^([+-])?(\d+)?n([+-])?(\d+)?$/.exec($);
  group = $[1] === '-' ? -($[2] || 1) : +($[2] || 1);
  offset = $[4] ? ($[3] === '-' ? -$[4] : +$[4]) : 0;
  $ = param = undefined;

  return function(el) {
    if (el.parentNode.nodeType !== 1) return;

    var rel = child(el.parentNode)
      , pos = 0
      , diff;

    while (rel) {
      if (test(rel, el)) pos++;
      if (rel === el) {
        diff = pos - offset;
        return !group ? !diff : !(diff % group);
      }
      rel = next(rel);
    }
  };
};

/**
 * Simple Selectors
 */

var selectors = {
	'*': function() {
		return true;
	},
	'type': function(type) {
		type = type.toLowerCase();
		return function(el) {
			return el.nodeName.toLowerCase() === type;
		};
	},
	'attr': function(key, op, val) {
		if (!operators[op])
			throw new Error("Unsupported operator: "+op);
		op = operators[op];

		return function(el) {
			var attr;
			switch (key) {
			case 'for':
				attr = el.htmlFor;
				break;
			case 'class':
				attr = el.className;
				break;
			case 'href':
				attr = el.getAttribute('href', 2);
				break;
			default:
				attr = el.getAttribute(key);
			break;
			}
			return attr != null && op(attr + '', val);
		};
	},
	':first-child': function(el) {
		return !prev(el) && el.parentNode.nodeType === 1;
	},
	':last-child': function(el) {
		return !next(el) && el.parentNode.nodeType === 1;
	},
	':only-child': function(el) {
		return (!prev(el) && !next(el)) && el.parentNode.nodeType === 1;
	},
	':nth-child': function(param) {
		return nth(param, function() {
			return true;
		});
	},
	':root': function(el) {
		return el.ownerDocument.documentElement === el;
	},
	':empty': function(el) {
		return !el.firstChild;
	},
	':not': function(sel) {
		var test = compile(sel);
		return function(el) {
			return !test(el);
		};
	},
	':first-of-type': function(el) {
		if (el.parentNode.nodeType !== 1) 
			return;
		var type = el.nodeName;
		while (el = prev(el))
			if (el.nodeName === type) 
				return;
		
		return true;
	},
	':last-of-type': function(el) {
	if (el.parentNode.nodeType !== 1) 
		return;
	var type = el.nodeName;
	while (el = next(el))
		if (el.nodeName === type) 
			return;
	return true;
	},
	':only-of-type': function(el) {
		return selectors[':first-of-type'](el) && selectors[':last-of-type'](el);
	},
	':nth-of-type': function(param) {
		return nth(param, function(rel, el) {
			return rel.nodeName === el.nodeName;
		});
	},
	':checked': function(el) {
		return !!(el.getAttribute("checked") || el.getAttribute("selected"));
	},
	':indeterminate': function(el) {
		return !selectors[':checked'](el);
	},
	':enabled': function(el) {
		return !el.getAttribute("disabled");
	},
	':disabled': function(el) {
		return !!el.getAttribute("disabled");
	},
	':target': function(el) {
		return el.id === window.location.hash.substring(1);
	},
	':focus': function(el) {
		return el === el.ownerDocument.activeElement;
	},
	':matches': function(sel) {
		var test = compile(sel);
			return function(el) {
			return test(el);
		};
	},
	':nth-match': function(param) {
		var args = param.split(/\s*,\s*/), p = args.pop(), test = compile(args.join(','));
		return nth(p, test);
	},
	':links-here': function(el) {
		return el + '' === window.location + '';
	}
};

/**
 * Attribute Operators
 */

var operators = {
	'-': function() {
		return true;
	},
	'=': function(attr, val) {
		return attr === val;
	},
		'*=': function(attr, val) {
	return attr.indexOf(val) !== -1;
	},
	'~=': function(attr, val) {
		var i = attr.indexOf(val), f, l;

		if (i === -1) 
			return;
		
		f = attr[i - 1];
		l = attr[i + val.length];

		return (f === ' ' && !l) || (!f && l === ' ') || (!f && !l);
	},
	'|=': function(attr, val) {
		var i = attr.indexOf(val), l;

		if (i !== 0) return;
		l = attr[i + val.length];

		return l === '-' || !l;
	},
	'^=': function(attr, val) {
		return attr.indexOf(val) === 0;
	},
	'$=': function(attr, val) {
		return attr.indexOf(val) + val.length === attr.length;
	}
};

/**
 * Combinator Logic
 */

var combinators = {
	' ': function(test) {
		return function(el) {
			while (el = el.parentNode) {
				if (test(el)) 
					return el;
			}
		};
	},
	'>': function(test) {
		return function(el) {
			return test(el = el.parentNode) && el;
		};
	},
	'+': function(test) {
		return function(el) {
			return test(el = prev(el)) && el;
		};
	},
	'~': function(test) {
		return function(el) {
			while (el = prev(el)) {
				if (test(el)) return el;
			}
		};
	},
	'noop': function(test) {
		return function(el) {
			return test(el) && el;
		};
	}
};

generatesElements = function(sel) {
	switch (sel[0]) {
	case '[':
	case ':':
		return false;
	default:
		return true;
	}
}

parse = function(sel) {
	var cap, param;
	switch (sel[0]) {
	case '.': 
		return selectors.attr('class', '~=', sel.substring(1));
	case '#': 
		return selectors.attr('id', '=', sel.substring(1));
	case '[': 
		//From Sizzle
		cap = /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/.exec(sel);
		return selectors.attr(cap[1], cap[2] || '-', unquote(cap[5]));
	case ':': 
		cap = /^(:[\w-]+)\(([^)]+)\)/.exec(sel);
		if (cap) sel = cap[1], param = unquote(cap[2]);
		return param ? selectors[sel](param) : selectors[sel];
	case '*': 
		return selectors['*'];
	default: 
		return selectors.type(sel);
	}
};


//From Sizzle modified to work with zest
var chunker = /((?:\\.|[^ ":>+~,()\[\\]+)+|[>+~]|:[\w-]+(\((?:\([^()]+\)|[^()]+)+\))?|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\])(\s*,\s*)?((?:.|\r|\n)*)/g

var parts = function(sel) {
	var a = [], cur = sel;
	do {
		chunker.exec("");
		m = chunker.exec(cur);
		if (m) {
			cur = m[4].trim();
			a.push(m[1]);
			if (m[3])
				return Array.prototype.concat.apply(a, parts(cur));
		}
	} while (m);
	return a;
}


var compile = function(sel) {
	var filter = [], comb = 'noop';

	parts(sel).reverse().forEach(function(part) {
		if (part in combinators) 
			return comb = part;
		var f = parse(part);
		filter.push(comb ? combinators[comb](f) : f);
		comb = generatesElements(part) ? ' ' : 'noop';
	});

	return compile.make(filter);
};

compile.make = function(func) {
	return function(el) {
		var i = 0, next;
		while (next = func[i++]) {
			if (!(el = next(el))) return;
		}
		return true;
	};
};

function dfs(node) {
	var child = [ node ], parent = [ ];
	while (child.length > 0) {
		var current = child.pop();
		if (current.nodeType === 1)
			parent.unshift(current);
		if (current.childNodes.length > 0)
			Array.prototype.push.apply(child, current.childNodes)
	}
	return parent;
}

var select = function(selector, context) {
	var original = dfs(context), results = [ ];
	var group = selector.split(/,\s*(?![^\[]*["'])/), sel = undefined, i = 0, scope, el, k;
	group.forEach(function(sel) {
		original.slice().filter(compile(sel)).forEach(function(item) {
			if (results.indexOf(item) === -1)
				results.push(item);
		});
	});
    return results;
};

/**
 * Compatibility
 */
var _select = select;
var zest = select = function (sel, context) {
	if (!~sel.indexOf(' ')) {
		if (sel[0] === '#' && /^#\w+$/.test(sel))
			return [context.getElementById(sel.substring(1))];

		// if (sel[0] === '.' && /^\.\w+$/.test(sel))
			//return context.getElementsByClassName(sel.substring(1));

		if (/^\w+$/.test(sel))
			return context.getElementsByTagName(sel);

	}
	return _select(sel, context);
};


zest.selectors = selectors;
zest.operators = operators;
zest.combinators = combinators;
zest.compile = compile;

zest.matches = function(el, sel) {
  return !!compile(sel)(el);
};

zest.cache = function() {
	if (compile.cache) 
		return;

	var raw = compile, cache = {};

	compile = function(sel) {
		return cache[sel] || (cache[sel] = raw(sel));
	};

	compile.raw = raw;
	compile.cache = cache;
	compile.make = raw.make;

	zest.compile = compile;
};


// comment this line
// to disable caching
zest.cache();

module.exports = zest
