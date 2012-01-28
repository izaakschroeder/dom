(function(dom) {

global.sizzleCapabilities = {
	contains: true,
	compareDocumentPosition: false,
	nodeListToArray: true,
	querySelectorAll: false,
	getElementsByClassName: false,
	getElementByIdWithName: false,
	getElementsByTagNameIncludesComments: false,
	normalizedHrefAttributes: false,
	matchesSelector: false
}

var 
	sax = require("sax"),
	util = require('util'),
	sizzle = require('sizzle').Sizzle,
	Stream = require('stream'),
	EventEmitter = require('events').EventEmitter;

function Node() {
	EventEmitter.call(this);
	this.childNodes = [];
	this.firstChild = null;
	this.lastChild = null;
	this.nextSibling = null;
	this.previousSibling = null;
	this.attributes = { }
}
util.inherits(Node, EventEmitter);

Node.prototype.querySelector = function(query) {
	var results = sizzle(query, this);
	return results.length > 0 ? results[0] : null;
}

Node.prototype.querySelectorAll = function(query) {
	return sizzle(query, this);
}

Node.prototype.getAttribute = function(attr) {
	return this.attributes[attr];
}

Node.prototype.setAttribute = function(attr, val) {
	this.attributes[attr] = val;
	this.emit("attribute", attr);
}

Node.prototype.removeAttribute = function(attr) {
	delete this.attributes[attr];
	this.emit("attribute", attr);
}



Node.prototype.getElementsByAttribute = function(attr, value) {
	var out = [];
	
	for(var i = 0; i<this.childNodes.length; ++i) {
		var child = this.childNodes[i];		
		
		if (child.attributes[attr] == value)
			out.push(child);
						
		var elems = child.getElementsByAttribute(attr, value);
		for(var j = 0; j<elems.length; ++j)
			out.push(elems[j]);
	}
	return out;
}

Node.prototype.getElementsByTagName = function(tagName) {
	var out = [];

	for(var i = 0; i<this.childNodes.length; ++i) {
		var child = this.childNodes[i];				
		if (child.nodeType == 1 && (tagName == "*" || child.tagName == tagName))
			out.push(child);
		var elems = child.getElementsByTagName(tagName);
		for(var j = 0; j<elems.length; ++j)
			out.push(elems[j]);
	}
	return out;
}

Node.prototype.getElementById = function(id) {
	return this.getElementsByAttribute("id", id)[0];
}

Node.prototype.getElementsByName = function(name) {
	return this.getElementsByAttribute("name", name);
}

Node.prototype.contains = function(base, node) {
	if (base === undefined) {
		//FIXME: Needs work here....
		return false;
	}
	for(var i = 0; i<base.childNodes.length; ++i) {
		var child = base.childNodes[i];
		if (child === node || child.contains(node))
			return true;
	}
	return false;
}

Node.prototype.insertChild = function(idx, child) {
	if (idx > this.childNodes.length)
		throw new Error("Index out of bounds ("+idx+" >= " + this.childNodes.length+")!")
	child.parentNode = this;
	this.childNodes.splice(idx,0,child);
				
	if (idx == 0) {
		this.firstChild = child;
		child.previousSibling = null;
	}
	else {
		child.previousSibling = this.childNodes[idx - 1];
		child.previousSibling.nextSibling = child;
	}
		
	if (idx == this.childNodes.length-1) {
		this.lastChild = child;
		child.nextSibling = null;
	}
	else {
		child.nextSibling = this.childNodes[idx+1];
		child.nextSibling.previousSibling = child;
	}
	
	child.ownerDocument = this.ownerDocument;
}

Node.prototype.appendChild = function(child) {
	this.insertChild(this.childNodes.length, child);
}

Node.prototype.prependChild = function(child) {
	this.insertChild(0, child);
}

Node.prototype.position = function() {
	var parent = this.parentNode;
	if (!parent)
		return -1;
	for(var i = 0; i<parent.childNodes.length; ++i)
		if (parent.childNodes[i] === this)
			return i;
	return -1;
}

Node.prototype.removeChild = function(child) {
	var parent = this;
	if (parent.firstChild == child)
		parent.firstChild = child.nextSibling;
	if (parent.lastChild == child)
		parent.lastChild = child.previousSibling;
	parent.childNodes.splice(child.position(), 1);
	child.ownerDocument = child.previousSibling = child.nextSibling = child.parentNode = null;
	return child;
}


Node.prototype.insertBefore = function(newElement, referenceElement) {
	if (referenceElement === null) 
		this.appendChild(newElement);
	else
		p.insertChild(referenceElement.position(), newChild);
}

Node.prototype.replaceChild = function(newChild, oldChild) {
	if (oldChild.parentNode !== this)
		throw new Error("Replacing an element that doesn't belong to me!");
	var n = oldChild.position();
	var p = this;
	this.removeChild(oldChild);
	p.insertChild(n, newChild);
	return oldChild;
}

Node.prototype.empty = function() {
	this.childNodes = [];
	this.firstChild = null;
	this.lastChild = null;
}

Node.prototype.content = function(content) {
	if (typeof content === "undefined") {
		content = "";
		for(var i = 0; i < this.childNodes.length; ++i) 
			content += this.childNodes[i].toString();
		return content;
	} else {
		this.empty();
		if (!(content instanceof Node))
			content = new Text(content);
		this.appendChild(content);
	}
	
}



Node.prototype.__defineSetter__("textContent", function(data) {
	this.content(new Text(data));
});

Node.prototype.__defineGetter__("textContent", function() {
	var out = "";
	for(var i = 0; i < this.childNodes.length; ++i)
			out += this.childNodes[i].textContent;
	return out;
});

Node.prototype.__defineGetter__("nextElementSibling", function() {
	var nextSibling = this.nextSibling;
	while (nextSibling && nextSibling.nodeType !== 1)
		nextSibling = nextSibling.nextSibling;
	return nextSibling;
});


/**
 * Element
 *
 */
function Element(e, attrs) {
	
	Node.call(this);
	
	if (typeof e === "object") {
		this.attributes = e.attributes || { };
		this.tagName = e.name || e.tagName;
	} else {
		this.attributes = attrs || { };
		this.tagName = e;
	}
	
	this.nodeName = this.tagName;
	this.nodeType = 1;
}

util.inherits(Element, Node);


Element.prototype.toString = function() {
	var out = "", text = "";
	for(var i = 0; i<this.childNodes.length; ++i)
		text += this.childNodes[i].toString();
	out += "<"+this.tagName+"";
	for(var attr in this.attributes) //replace(/\\/g, '\\\\').?
		out += " "+attr+'="'+this.attributes[attr].replace(/"/g, '&quot;').replace(/'/g, '&apos;')+'"';
	if (text)
		out += ">" + text + "</" + this.tagName + ">";
	else
		out += "/>";
	return out;
}

Element.prototype.cloneNode = function(deep) {
	var attrs = { };
	for (var i in this.attributes)
		attrs[i] = this.attributes[i];
	var e = new Element(this.tagName, attrs);
	if (deep)
		for(var i = 0; i < this.childNodes.length; ++i)
			e.appendChild(this.childNodes[i].cloneNode(deep));

	
	return e;
}

function ClassList(element) {
	Array.call(this);
	var self = this;
	this.element = element;
	this.rebuild();
	element.on("attribute", function(attr) {
		if (attr === "class")
			self.rebuild();
	})
}
ClassList.prototype = [ ];

ClassList.prototype.add = function(name) {
	if (this.indexOf(name) === -1) {
		this.push(name);
		this.sync();
	}
}

ClassList.prototype.remove = function(name) {
	var index = this.indexOf(name);
	if (index !== -1) {
		this.splice(index, 1);
		this.sync();
	}
}

ClassList.prototype.toggle = function(name) {
	var index = this.indexOf(name);
	if (index !== -1) 
		this.splice(index, 1);
	else 
		this.push(name);
	this.sync();
}
ClassList.prototype.contains = function(name) {
	return this.indexOf(name) !== -1;
}

ClassList.prototype.toString = function() {
	return this.join(" ");
}

ClassList.prototype.rebuild = function() {
	this.splice(0, this.length);
	Array.prototype.push.apply(this, this.element.getAttribute("class").trim().split(/\s+/))
}

ClassList.prototype.sync =  function() {
	this.element.attributes["class"] = this.toString();
}

function DataSet(element) {
	var self = this;

	element.on("attribute", function(name) {
		if (name.match(/^data-/))
			self[name.substr(5)] = element.getAttribute(name);
	})

	for (var name in element.attributes)
		if (name.match(/^data-/))
			self[name.substr(5)] = element.getAttribute(name);
}

Element.prototype.__defineGetter__("classList", function() {
	if (this._classList)
		return this._classList;
	this._classList = new ClassList(this);
	return this._classList;
})

Element.prototype.__defineGetter__("dataset", function() {
	if (this._dataset)
		return this._dataset;
	this._dataset = new DataSet(this);
	return this._dataset;
})


/**
 * Text
 *
 */
function Text(text) {
	Node.call(this);
	this.nodeValue = text || "";
}

util.inherits(Text, Node);

Text.prototype.nodeType = 3;
Text.prototype.nodeName = "#text"

Text.prototype.toString = function() {
	return this.nodeValue.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Text.prototype.cloneNode = function() {
	return new Text(this.nodeValue);
}

Text.prototype.__defineGetter__("textContent", function() {
	return this.nodeValue;
});




/**
 * CDATASection
 *
 */
function CDATASection(cdata) {
	Node.call(this);
	this.nodeValue = cdata || "";
	this.nodeType = 4;
	this.nodeName = "#cdata";
}

util.inherits(CDATASection, Node);

CDATASection.prototype.toString = function() {
	return "<![CDATA["+node.nodeValue+"]]";
}

CDATASection.prototype.cloneNode = function() {
	return new CDATASection(this.nodeValue);
}


CDATASection.prototype.__defineGetter__("textContent", function() {
	return this.nodeValue;
});


/**
 * ProcessingInstruction
 *
 *
 */
function ProcessingInstruction(name, body) {
	Node.call(this);
	this.nodeName = name;
	this.nodeValue = body;
	this.nodeType = 7;
}

util.inherits(ProcessingInstruction, Node);

ProcessingInstruction.prototype.toString = function() {
	return "<?"+this.nodeName+" "+this.nodeValue+"?>";
}

ProcessingInstruction.prototype.cloneNode = function() {
	return new ProcessingInstruction(this.nodeName, this.nodeValue);
}

ProcessingInstruction.prototype.__defineGetter__("textContent", function() {
	return "";
});


/**
 * Comment
 *
 *
 */
function Comment(comment) {
	Node.call(this);
	this.nodeValue = comment || "";
	this.nodeType = 8;
	this.nodeName = "#comment";
}

util.inherits(Comment, Node);

Comment.prototype.toString = function() {
	return "<!--"+this.nodeValue+"-->";
}

Comment.prototype.cloneNode = function() {
	return new Comment(this.nodeValue);
}

Comment.prototype.__defineGetter__("textContent", function() {
	return "";
});


/**
 * Document
 *
 *
 */
function Document() {
	Node.call(this);
	this.ownerDocument = this;
	this.nodeType = 9;
	this.nodeName = "#document";
}

util.inherits(Document, Node);


Document.prototype.getDocumentElement = function() {
	for(var i = 0; i<this.childNodes.length; ++i)
		if (this.childNodes[i].nodeType == 1) 
			return this.childNodes[i]
	return null;				
}

Document.prototype.toString = function() {
	var out = "";
	for(var i = 0; i<this.childNodes.length; ++i)
		out += this.childNodes[i].toString();
	return out;
}

Document.prototype.cloneNode = function(deep) {
	var doc = new Document();
	
	if (deep)
		for (var i = 0; i < this.childNodes.length; ++i) 
			doc.appendChild(this.childNodes[i].cloneNode(deep))
	
		
	return doc;
}

Document.prototype.createTextNode = function(content) {
	return new Text(content);
}



/**
 * DocumentType
 *
 */
function DocumentType(type) {
	Node.call(this);
	this.nodeName = type;
	this.nodeValue = type;
	this.nodeType = 10;
}

util.inherits(DocumentType, Node);

DocumentType.prototype.toString = function() {
	return "<!DOCTYPE "+this.nodeValue+">";
}

DocumentType.prototype.cloneNode = function() {
	return new DocumentType(this.nodeValue);
}

function DOM(done) {
	var parser = sax.parser(false, { lowercasetags: true });
	
	var parent = function() {
		return elementStack[elementStack.length - 1];
	}
	
	
	var document = new Document();
	
	var insert = function(node) {
		parent().appendChild(node);
	}
	
	var push = function(node) {
		insert(node);
		elementStack.push(node);
	}
	
	var pop = function(node) {
		elementStack.pop();
	}
	
	var elementStack = [document];
	
	parser.onerror = function (e) {
		throw "XML error: "+e;
	};
	
	parser.ontext = function (t) {
		insert(new Text(t));
	};
	
	parser.opencdata = function() {
		push(new CharacterDataNode());
	}
	
	parser.cdata = function(t) {
		parent().nodeValue += t;
	}
	
	parser.closecdata = function() {
		pop();
	}
	
	parser.ondoctype = function(t) {
		insert(new DocumentType(t));
	}
	
	parser.oncomment = function(t) {
		insert(new Comment(t));
	};
	
	parser.onprocessinginstruction = function(t) {
		insert(new ProcessingInstruction(t.name, t.body));
	}
	
	parser.onopentag = function (element) {
		push(new Element(element));
	};
	
	parser.onclosetag = function(element) {
		pop();
	}
	
	
	parser.onend = function () {
		done(document);
	};
	
	this.data = function(data) {
		parser.write(data);
	}
	
	this.end = function() {
		parser.end();
	}
}

Comment.prototype.__defineGetter__("textContent", function() {
	return "";
});


dom.parser = function (done) { return new DOM(done) };
dom.parse = function(data, done) {
	var parser = new DOM(done);
	if (typeof data === "string") {
		parser.data(data);
		parser.end();
	}
	else if (data instanceof Stream) {
		data.on("data", function(chunk) {
			parser.data(chunk.toString('utf8'));
		}).on("end", function() {
			parser.end();
		})
	}
	else {
		throw "Unknown data type!";
	}
}

dom.Document = Document;
dom.Element = Element;
dom.ProcessingInstruction = ProcessingInstruction;
dom.Text = Text;
dom.CDATASection = CDATASection;
dom.Comment = Comment;
dom.DocumentType = DocumentType;
dom.Node = Node;


})(typeof exports === "undefined" ? dom = {} : exports);