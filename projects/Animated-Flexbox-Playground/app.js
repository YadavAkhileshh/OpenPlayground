console.clear();
var log = console.log.bind(console);


//
// Code by Gabi
// ===========================================================================
function changeFlex(e, t) {
  for (var n = document.querySelectorAll("." + e), l = document.querySelector("#" + t), r = 0; r < n.length; r++) n[r].addEventListener("change", function() {
    var e = this.value;
    l.setAttribute("class", "flex-container " + e)
  }, !1)
}

function changeItemFlex(e, t) {
  for (var n = document.querySelectorAll("." + e), l = document.querySelector("#" + t), r = 0; r < n.length; r++) n[r].addEventListener("change", function() {
    var e = this.value;
    l.setAttribute("class", "item " + e)
  }, !1)
}

function changeFlexBasis(e, t) {
  var n = isNaN(e.value) ? 0 : e.value;
  document.querySelector("#" + t).style.WebkitFlexBasis = n + "%", document.querySelector("#" + t).style.flexBasis = n + "%"
}

function changeFlexGrow(e, t) {
  var n = isNaN(e.value) ? 0 : e.value;
  document.querySelector("#" + t).style.WebkitFlexGrow = n, document.querySelector("#" + t).style.flexGrow = n
}

function changeFlexShrink(e, t) {
  var n = isNaN(e.value) ? 0 : e.value;
  document.querySelector("#" + t).style.WebkitFlexShrink = n, document.querySelector("#" + t).style.flexShrink = n
}

function changeFlexOrder(e, t) {
  var n = isNaN(e.value) ? 0 : e.value;
  document.querySelector("#" + t).style.WebkitOrder = n, document.querySelector("#" + t).style.order = n
}

function changeAll(e, t, n, l) {
  changeFlexBasis(e, l), changeFlexGrow(t, l), changeFlexShrink(n, l)
}
for (var items = document.querySelectorAll(".item"), i = 0; i < items.length; i++)
  if (items[i].hasAttribute("data-color")) {
    var color = items[i].getAttribute("data-color");
    items[i].style.backgroundColor = "#" + color
  }
for (var flexO = document.querySelectorAll(".flex-order"), o = 0; o < flexO.length; o++) flexO[o].addEventListener("change", function() {
  changeFlexOrder(this, "order" + this.id)
}, !1);
changeFlex("flex-direction", "direction"), changeFlex("flex-wrap", "wrap"), changeFlex("flex-align-items", "align"), changeFlex("justify-content", "justify"), changeFlex("align-content", "alignContent"), changeItemFlex("align-self", "alignSelf");
for (var flexGrow = document.querySelectorAll(".flex-grow"), i = 0; i < flexGrow.length; i++) flexGrow[i].addEventListener("change", function() {
  var e = "item" + this.id;
  changeFlexGrow(this, e)
});
for (var flexShrink = document.querySelectorAll(".flex-shrink"), j = 0; j < flexShrink.length; j++) flexShrink[j].addEventListener("change", function() {
  var e = "item" + this.id;
  changeFlexShrink(this, e)
});
var B1 = document.querySelector("#B1"),
  G1 = document.querySelector("#G1"),
  S1 = document.querySelector("#S1"),
  B2 = document.querySelector("#B2"),
  G2 = document.querySelector("#G2"),
  S2 = document.querySelector("#S2");
B1.addEventListener("change", function() {
  changeAll(B1, G1, S1, "item1")
}), G1.addEventListener("change", function() {
  changeAll(B1, G1, S1, "item1")
}), S1.addEventListener("change", function() {
  changeAll(B1, G1, S1, "item1")
}), B2.addEventListener("change", function() {
  changeAll(B2, G2, S2, "item2")
}), G2.addEventListener("change", function() {
  changeAll(B2, G2, S2, "item2")
}), S2.addEventListener("change", function() {
  changeAll(B2, G2, S2, "item2")
});


//
// ANIMATIONS
// ===========================================================================
var inputs = document.querySelectorAll("input");
var nodes  = document.querySelectorAll(".item");
var total  = nodes.length;
var dirty  = true;
var time   = 0.9;
var omega  = 12;
var zeta   = 0.9;
var boxes  = [];

for (var i = 0; i < total; i++) {
    
  var node   = nodes[i];  
  var width  = node.offsetWidth;
  var height = node.offsetHeight;    
  var color  = "transparent";    
    
  // Need another element to animate width & height... use clone instead of editing HTML
  var content = node.cloneNode(true);
  content.classList.add("item-content");
  
  TweenLite.set(node, { x: "+=0" });
  TweenLite.set(content, { width, height });  
  TweenLite.set([node, node.children], { backgroundColor: color, color });
  
  node.appendChild(content);
    
  var transform = node._gsTransform;
  var x = node.offsetLeft;
  var y = node.offsetTop;
  
  boxes[i] = { content, height, node, transform, width, x, y };
} 

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener("change", layout);
}

window.addEventListener("resize", () => { dirty = true; });

TweenLite.ticker.addEventListener("tick", () => dirty && layout());

layout();

function layout() {
  
  dirty = false;
  
  for (var i = 0; i < total; i++) {
    
    var box = boxes[i];
        
    var lastX = box.x;
    var lastY = box.y;   
       
    var lastW = box.width;
    var lastH = box.height;     
    
    var width  = box.width  = box.node.offsetWidth;
    var height = box.height = box.node.offsetHeight;
    
    box.x = box.node.offsetLeft;
    box.y = box.node.offsetTop;      
        
    if (lastX !== box.x || lastY !== box.y) {
      
      var x = box.transform.x + lastX - box.x;
      var y = box.transform.y + lastY - box.y;  
      
      // Tween to 0 to remove the transforms
      TweenLite.set(box.node, { x, y });
      TweenLite.to(box.node, time, { x: 0, y: 0, ease });
    }
        
    if (lastW !== box.width || lastH !== box.height) {      
      
      TweenLite.to(box.content, time, { autoRound: false, width, height, ease });      
    }
  }  
}

function ease(progress) {
  var beta  = Math.sqrt(1.0 - zeta * zeta);
  progress = 1 - Math.cos(progress * Math.PI / 2);   
  progress = 1 / beta * 
    Math.exp(-zeta * omega * progress) * 
    Math.sin( beta * omega * progress + Math.atan(beta / zeta));

  return 1 - progress;
}



