$(function(){
	mhnUI.setup();
});
mhnUI = {
    pattern: "",
    setup: function() {
        this.lock(), this.filter(), this.colors(), this.links.setup(), this.dialog.setup(), setInterval("mhnUI.datetime()", 1e3)
    },
    lock: function() {
        mhnUI.page.hide(), pattern = new PatternLock(".mhn-lock", {
            margin: 15
        }), $(".mhn-lock-title").html($(".mhn-lock-title").data("title")), pattern.checkForPattern("7415369", function() {
            $(".mhn-lock-title").html('<span class="mhn-lock-success">Yes! you unlocked pattern</span>'), $(".patt-holder").addClass("patt-success"), setTimeout(function() {
                pattern.reset(), mhnUI.message()
            }, 1e3), mhnUI.page.show()
        }, function() {
            $(".mhn-lock-title").html('<span class="mhn-lock-failure">Opps! pattern is not correct</span>'), $(".patt-holder").removeClass("patt-success"), setTimeout(function() {
                pattern.reset(), mhnUI.message()
            }, 2e3)
        })
    },
    message: function() {
        $(".mhn-lock-title span").fadeOut(), setTimeout(function() {
            $(".mhn-lock-title").html($(".mhn-lock-title").data("title")), $(".mhn-lock-title span").fadeIn()
        }, 500)
    },
    datetime: function() {
        var t = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"),
            e = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"),
            n = new Date,
            i = n.getYear();
        1e3 > i && (i += 1900);
        var a = n.getDay(),
            o = n.getMonth(),
            s = n.getDate();
        10 > s && (s = "0" + s);
        var h = n.getHours(),
            c = n.getMinutes(),
            u = n.getSeconds(),
            l = "AM";
        h >= 12 && (l = "PM"), h > 12 && (h -= 12), 0 == h && (h = 12), 9 >= c && (c = "0" + c), 9 >= u && (u = "0" + u), $(".mhn-ui-date-time .mhn-ui-day").text(t[a]), $(".mhn-ui-date-time .mhn-ui-date").text(e[o] + " " + s + ", " + i), $(".mhn-ui-date-time .mhn-ui-time").text(h + ":" + c + " " + l), $(".mhn-ui-app-time").text(h + ":" + c + ":" + u + " " + l)
    },
    page: {
        show: function(t) {
            t = t ? t : "page-home", $(".mhn-ui-page").hide(), $(".mhn-ui-page." + t).show()
        },
        hide: function(t) {
            t = t ? t : "page-lock", $(".mhn-ui-page").hide(), $(".mhn-ui-page." + t).show()
        }
    },
    filter: function() {
        $(".mhn-ui-filter .mhn-ui-btn").click(function() {
            $(this).toggleClass("active"), $(".mhn-ui-filter-list").toggle(100)
        }), $(".mhn-ui-filter-list>div").click(function() {
            var t = $(this).data("filter");
            $(this).siblings().removeAttr("class"), $(this).addClass("active");
            var e = function(t) {
                $(".mhn-ui-apps .mhn-ui-col").fadeOut(400), $('.mhn-ui-apps .mhn-ui-col[data-filter="' + t + '"]').fadeIn(400)
            };
            switch (t) {
                case "all":
                    $(".mhn-ui-apps .mhn-ui-col").fadeIn(400);
                    break;
                case "general":
                    e(t);
                    break;
                case "social":
                    e(t);
                    break;
                case "credits":
                    e(t)
            }
            $(".mhn-ui-filter-list").toggle(100), $(".mhn-ui-filter .mhn-ui-btn").removeClass("active"), $(".mhn-ui-page-title").text($(this).text())
        })
    },
    colors: function() {
        $(".mhn-ui-icon span").on("mouseover", function() {
            $(this).css("background", $(this).data("color"))
        }).on("mouseout", function() {
            $(this).removeAttr("style")
        })
    },
    links: {
        setup: function() {
            $(".mhn-ui-apps .mhn-ui-icon").click(function() {
                var t = $(this).data("href"),
                    e = $(this).data("open");
                t && mhnUI.links.href(t), e && mhnUI.page.show(e)
            })
        },
        href: function(t) {
            mhnUI.dialog.show(t)
        }
    },
    dialog: {
        setup: function() {
            $('.mhn-ui-dialog-wrap,.mhn-ui-dialog-wrap a[data-action="cancel"]').click(function() {
                mhnUI.dialog.hide()
            }), $(".mhn-ui-dialog").click(function(t) {
                t.stopPropagation()
            }), $('.mhn-ui-dialog a[data-action="confirm"]').click(function() {
                setTimeout(function() {
                    mhnUI.dialog.hide()
                }, 400)
            })
        },
        show: function(t) {
            $('.mhn-ui-dialog-wrap a[data-action="confirm"]').attr("href", t), $(".mhn-ui-dialog-wrap").show()
        },
        hide: function() {
            $('.mhn-ui-dialog-wrap a[data-action="confirm"]').removeAttr("href"), $(".mhn-ui-dialog-wrap").fadeOut(400)
        }
    }
};

/*
    patternLock.js v 0.5.0
    Author: Sudhanshu Yadav
    Copyright (c) 2015 Sudhanshu Yadav - ignitersworld.com , released under the MIT license.
    Demo on: ignitersworld.com/lab/patternLock.html
*/
!function(t,e,n,a){"use strict";function r(t){for(var e=t.holder,n=t.option,a=n.matrix,r=n.margin,i=n.radius,o=['<ul class="patt-wrap" style="padding:'+r+'px">'],s=0,l=a[0]*a[1];l>s;s++)o.push('<li class="patt-circ" style="margin:'+r+"px; width : "+2*i+"px; height : "+2*i+"px; -webkit-border-radius: "+i+"px; -moz-border-radius: "+i+"px; border-radius: "+i+'px; "><div class="patt-dots"></div></li>');o.push("</ul>"),e.html(o.join("")).css({width:a[1]*(2*i+2*r)+2*r+"px",height:a[0]*(2*i+2*r)+2*r+"px"}),t.pattCircle=t.holder.find(".patt-circ")}function i(t,e,n,a){var r=e-t,i=a-n;return{length:Math.ceil(Math.sqrt(r*r+i*i)),angle:Math.round(180*Math.atan2(i,r)/Math.PI)}}function o(){}function s(e,n){var a=this,i=a.token=Math.random(),h=p[i]=new o,u=h.holder=t(e);if(0!=u.length){h.object=a,n=h.option=t.extend({},s.defaults,n),r(h),u.addClass("patt-holder"),"static"==u.css("position")&&u.css("position","relative"),u.on("touchstart mousedown",function(t){d.call(this,t,a)}),h.option.onDraw=n.onDraw||l;var c=n.mapper;h.mapperFunc="object"==typeof c?function(t){return c[t]}:"function"==typeof c?c:l,h.option.mapper=null}}var l=function(){},p={},d=function(e,a){e.preventDefault();var r=p[a.token];if(!r.disabled){r.option.patternVisible||r.holder.addClass("patt-hidden");var i="touchstart"==e.type?"touchmove":"mousemove",o="touchstart"==e.type?"touchend":"mouseup";t(this).on(i+".pattern-move",function(t){h.call(this,t,a)}),t(n).one(o,function(){u.call(this,e,a)});var s=r.holder.find(".patt-wrap"),l=s.offset();r.wrapTop=l.top,r.wrapLeft=l.left,a.reset()}},h=function(e,n){e.preventDefault();var a=e.pageX||e.originalEvent.touches[0].pageX,r=e.pageY||e.originalEvent.touches[0].pageY,o=p[n.token],s=o.pattCircle,l=o.patternAry,d=o.option.lineOnMove,h=o.getIdxFromPoint(a,r),u=h.idx,c=o.mapperFunc(u)||u;if(l.length>0){var f=i(o.lineX1,h.x,o.lineY1,h.y);o.line.css({width:f.length+10+"px",transform:"rotate("+f.angle+"deg)"})}if(u){if(-1==l.indexOf(c)){var v,m=t(s[u-1]);if(o.lastPosObj){for(var g=o.lastPosObj,x=g.i,w=g.j,b=Math.abs(h.i-x),j=Math.abs(h.j-w);(0==b&&j>1||0==j&&b>1||j==b&&j>1)&&(w!=h.j||x!=h.i);){x=b?Math.min(h.i,x)+1:x,w=j?Math.min(h.j,w)+1:w,b=Math.abs(h.i-x),j=Math.abs(h.j-w);var M=(w-1)*o.option.matrix[1]+x,y=o.mapperFunc(M)||M;-1==l.indexOf(y)&&(t(s[M-1]).addClass("hovered"),l.push(y))}v=[],h.j-g.j>0?v.push("s"):h.j-g.j<0?v.push("n"):0,h.i-g.i>0?v.push("e"):h.i-g.i<0?v.push("w"):0,v=v.join("-")}m.addClass("hovered"),l.push(c);var P=o.option.margin,k=o.option.radius,C=(h.i-1)*(2*P+2*k)+2*P+k,O=(h.j-1)*(2*P+2*k)+2*P+k;if(1!=l.length){var D=i(o.lineX1,C,o.lineY1,O);o.line.css({width:D.length+10+"px",transform:"rotate("+D.angle+"deg)"}),d||o.line.show()}v&&(o.lastElm.addClass(v+" dir"),o.line.addClass(v+" dir"));var E=t('<div class="patt-lines" style="top:'+(O-5)+"px; left:"+(C-5)+'px"></div>');o.line=E,o.lineX1=C,o.lineY1=O,o.holder.append(E),d||o.line.hide(),o.lastElm=m}o.lastPosObj=h}},u=function(t,e){t.preventDefault();var n=p[e.token],a=n.patternAry.join("");n.holder.off(".pattern-move").removeClass("patt-hidden"),a&&(n.option.onDraw(a),n.line.remove(),n.rightPattern&&(a==n.rightPattern?n.onSuccess():(n.onError(),e.error())))};o.prototype={constructor:o,getIdxFromPoint:function(t,e){var n=this.option,a=n.matrix,r=t-this.wrapLeft,i=e-this.wrapTop,o=null,s=n.margin,l=2*n.radius+2*s,p=Math.ceil(r/l),d=Math.ceil(i/l),h=r%l,u=i%l;return p<=a[1]&&d<=a[0]&&h>2*s&&u>2*s&&(o=(d-1)*a[1]+p),{idx:o,i:p,j:d,x:r,y:i}}},s.prototype={constructor:s,option:function(t,e){var n=p[this.token],i=n.option;return e===a?i[t]:(i[t]=e,void(("margin"==t||"matrix"==t||"radius"==t)&&r(n)))},getPattern:function(){return p[this.token].patternAry.join("")},setPattern:function(t){var e=p[this.token],n=e.option,a=n.matrix,r=n.margin,i=n.radius;if(n.enableSetPattern){this.reset(),e.wrapLeft=0,e.wrapTop=0;for(var o=0;o<t.length;o++){var s=t[o]-1,d=s%a[1],u=Math.floor(s/a[1]),c=d*(2*r+2*i)+2*r+i,f=u*(2*r+2*i)+2*r+i;h.call(null,{pageX:c,pageY:f,preventDefault:l,originalEvent:{touches:[{pageX:c,pageY:f}]}},this)}}},enable:function(){var t=p[this.token];t.disabled=!1},disable:function(){var t=p[this.token];t.disabled=!0},reset:function(){var t=p[this.token];t.pattCircle.removeClass("hovered dir s n w e s-w s-e n-w n-e"),t.holder.find(".patt-lines").remove(),t.patternAry=[],t.lastPosObj=null,t.holder.removeClass("patt-error patt-success")},error:function(){p[this.token].holder.addClass("patt-error")},checkForPattern:function(t,e,n){var a=p[this.token];a.rightPattern=t,a.onSuccess=e||l,a.onError=n||l}},s.defaults={matrix:[3,3],margin:20,radius:25,patternVisible:!0,lineOnMove:!0,enableSetPattern:!1},e.PatternLock=s}(jQuery,window,document);