var fs = require("fs");
var parse = require('dotparser');

var labels = {triangle:"Person",octagon:"Genre",circle:"Movie",rectangle:"User",diamond:"Publisher",square:"Producer",ellipse:"Label"};

function _capitalize(l) {
	return l.substring(0,1).toUpperCase() + l.substring(1)
}
function _label(shape) {
	var l = labels[shape] || shape;
	return _capitalize(l);
}
function _type(label) {
	return label.toUpperCase();
}
function _id(node_id) {
	return parseInt(node_id.id.substring(1));
}
function _attrs(list) {
	var attrs = {};
	list.forEach(function (a) { if (a.eq !== null) { attrs[a.id]=a.eq }});
	return attrs;
}
function _props(attrs,exclude) {
	if (!exclude) exclude=[];
	var props = "";
	for ( var x in attrs) {
		if (attrs.hasOwnProperty(x) && exclude.indexOf(x) == -1) {
			if (props.length > 1) props += ","
			props += x + ":" + JSON.stringify(attrs[x])
		}
	}
	if (props.length > 1) { props = "{"+props+"}"}
	return props;
}

fs.readFile("test.dot", "utf-8", function(err, data) {
	var ast = parse(data)[0];
	var elements = ast.children
	for (var i=0;i<elements.length;i++) {
		var c = elements[i];
		// console.log(JSON.stringify(c));
		if (c.type == "node_stmt") {
			var id = _id(c.node_id);
			var attrs = _attrs(c.attr_list);
//			console.log("Node",id,attrs);
			attrs.id = id;
			console.log("CREATE (_"+id+":`"+_label(attrs.shape)+"`"+_props(attrs,["shape"])+")");
		}
		if (c.type == "edge_stmt") {
			var start =  _id(c.edge_list[0]);
			var end =  _id(c.edge_list[1]);
			var attrs = _attrs(c.attr_list);
//			console.log("Edge",start,end,attrs);
			console.log("CREATE (_"+start+")-[:`"+_type(attrs.label||"RELATED_TO")+"`"+_props(attrs,["label"])+"]->(_"+end+")");
		}
	}
})
