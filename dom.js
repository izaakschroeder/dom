(function(dom) {

var 
	sax = require("sax"),
	util = require('util');

function Node() {
	this.childNodes = [];
	this.firstChild = null;
	this.lastChild = null;
	this.nextSibling = null;
	this.previousSibling = null;
	this.attributes = { }
}

Node.prototype.getAttribute = function(attr) {
	return this.attributes[attr];
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
	for(var i = 0; i<base.childNodes.length; ++i) {
		var child = base.childNodes[i];
		if (child == node || contains(child, node))
			return true;
	}
	return false;
}

Node.prototype.insertChild = function(idx, child) {
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
		if (parent.childNodes[i] == this) {
			return i;
		}
	return -1;
}

Node.prototype.remove = function() {
	this.empty();
	var parent = this.parentNode;
	if (parent) {
		if (parent.firstChild == this)
			parent.firstChild = this.nextSibling;
		if (parent.lastChild == this)
			parent.lastChild = this.previousSibling;
		parent.childNodes.splice(this.position(), 1);
	}

	this.ownerDocument = this.previousSibling = this.nextSibling = this.parentNode = null;
}

Node.prototype.replace = function(replacement) {
	var n = this.position();
	var p = this.parentNode;
	var r = typeof replacement.length !== "undefined" && typeof replacement.splice === "function" ? replacement : [replacement];
	this.remove();
	if (p) 
		for (var i=n, j=0; j<r.length; ++i, ++j) 
			p.insertChild(i, r[j]);
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
	for(var attr in this.attributes)
		out += " "+attr+'="'+this.attributes[attr]+'"';
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
	return this.nodeValue;
}

Text.prototype.cloneNode = function() {
	return new Text(this.nodeValue);
}






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
	var parser = sax.parser(true);
	
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


dom.parser = function (done) { return new DOM(done) };

dom.Document = Document;
dom.Element = Element;
dom.ProcessingInstruction = ProcessingInstruction;
dom.Text = Text;
dom.CDATASection = CDATASection;
dom.Comment = Comment;
dom.DocumentType = DocumentType;


})(typeof exports === "undefined" ? dom = {} : exports);