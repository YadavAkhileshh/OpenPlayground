//Naming Elements
var spooky = document.getElementById("spooky");

var cloud = document.getElementsByClassName("cloud");

var cloudButton = document.getElementsByClassName("cloudButton");
var cloudButtonCloudTop = document.getElementsByClassName("cloudButtonCloudTop");
var cloudButtonCloudBottom = document.getElementsByClassName("cloudButtonCloudBottom");
var cloudButtonFullMoon = document.getElementsByClassName("cloudButtonFullMoon");
var cloudButtonCrescentMoon = document.getElementsByClassName("cloudButtonCrescentMoon");

var treeface1 = document.getElementsByClassName("treeface1");
var treeface1Eyeball = document.getElementsByClassName("treeface1Eyeball");
var treeface2 = document.getElementsByClassName("treeface2");
var treeface2Eyeball = document.getElementsByClassName("treeface2Eyeball");

var clawgroup = document.getElementsByClassName("clawgroup");
var claw1 = document.getElementsByClassName("claw2");
var claw2 = document.getElementsByClassName("claw2");
var clawBubble = document.getElementsByClassName("clawBubble");

var ghostTeacup = document.getElementsByClassName("ghostTeacup");
var teacup = document.getElementsByClassName("teacup");
var ghost1 = document.getElementsByClassName("ghost1");

var ghostTeapot = document.getElementsByClassName("ghostTeapot");
var teapot = document.getElementsByClassName("teapot");
var ghost2 = document.getElementsByClassName("ghost2");

var ghostMadHat = document.getElementsByClassName("ghostMadHat");
var ghostMadHatHat = document.getElementsByClassName("ghostMadHatHat");
var ghostMiley = document.getElementsByClassName("ghostMiley");
var ghostMileyHand = document.getElementsByClassName("ghostMileyHand");

var pumpkin2 = document.getElementsByClassName("pumpkin2");
var pumpkin2Eyes = document.getElementsByClassName("pumpkin2Eyes");

var dracula = document.getElementsByClassName("dracula");
var greenFace = document.getElementsByClassName("greenFace");
var greenFaceMouth = document.getElementsByClassName("greenFaceMouth");

var windowWitch = document.getElementsByClassName("windowWitch");
var windowWitchBubblegroup = document.getElementsByClassName("windowWitchBubblegroup");
var windowWitchBubble = document.getElementsByClassName("windowWitchBubble");

var windowFrontgroup = document.getElementsByClassName("windowFrontgroup");
var windowFront = document.getElementsByClassName("windowFront");

var treeOne = document.getElementsByClassName("treeOne");
var treeTwo = document.getElementsByClassName("treeTwo");
var swingingSign = document.getElementsByClassName("swingingSign");
var swingingSignGhost = document.getElementsByClassName("swingingSignGhost");

var grass = document.getElementsByClassName("grass");


// Animation

//*****Non-Spooky
//cloud
var tlcloud = new TimelineMax();
tlcloud.staggerFromTo(cloud, 4, {
  x:0,
  y:0
}, {
  x:-20,
  y:20,
  repeat:-1,
  yoyo:true,
  ease: "linear"
}, 2)

//grass
var tlgrass = new TimelineMax();
tlgrass.staggerFromTo(grass, 2, {
  transformOrigin:"0% 100%",
  skewX:"10deg"
}, {
  skewX:"-10deg",
  repeat: -1,
  yoyo: true
}, 0.3);

//trees
var tltreeSwing = new TimelineMax();
tltreeSwing.staggerFromTo([treeOne,treeTwo], 1.5, {
  transformOrigin: "50% 100%",
  skewX:0
}, {
  skewX:1.2,
  repeat:-1,
  yoyo:true,
  ease:"linear"
}, .5)




//*****Spooky Trigger
//cloudButton animation
var tlcloudButton = new TimelineMax();
tlcloudButton.set(cloudButtonCloudTop, {x:-45, y:45})
tlcloudButton.set(cloudButtonCloudBottom, {x:60, y:-60})
tlcloudButton.to([cloudButtonCloudTop, cloudButtonCloudBottom], .8, {x:0, y:0})
tlcloudButton.to(cloudButtonCloudTop, 1, {x:-45, y:45})
tlcloudButton.to(cloudButtonCloudBottom, 1, {x:60, y:-60}, '-=1');

//full/crescent-moon animation
var tlcloudStatus = new TimelineMax();
tlcloudStatus.fromTo(cloudButtonCrescentMoon, .5, {opacity:0}, {opacity:1}, .5)
tlcloudStatus.fromTo(cloudButtonFullMoon, .5, {opacity:1}, {opacity:0}, 0.5)

//cloudButton pause function
var pauseBtn = document.getElementById("pause")
pauseBtn.onclick = function() {
  tlcloudButton.play(!tlcloudButton.play());
  tlcloudStatus.reversed(!tlcloudStatus.reversed());
    
  tlspooky.reversed(!tlspooky.reversed());
  tlghostFloating.restart();
  tlclawGroup.restart();
  tldracula.restart();
}




//*****Spooky Section
var tlspooky = new TimelineMax();
tlspooky.set(spooky, {opacity:0})
tlspooky.fromTo([spooky, windowFrontgroup], 1, {opacity:1}, {opacity:0});

//dracula
var tldracula = new TimelineMax();
tldracula.set(dracula, {opacity:0})
tldracula.to(dracula, 8, {opacity:.9}, 3)
tldracula.fromTo(dracula, 3, {opacity:.9, scale:1}, {
  scale: .9,
  opacity:.2,
  repeat:-1,
  repeatDelay: 4,
  yoyo:true
})

//blinks
var tltreeBlink = new TimelineMax({repeat:-1});
tltreeBlink.to([treeface1Eyeball, treeface2Eyeball], .2, {opacity: 0}, 3)
tltreeBlink.to([treeface1Eyeball, treeface2Eyeball], .2, {opacity: 1})

//swingingSign
var tlswingingSign = new TimelineMax();
tlswingingSign.fromTo(swingingSign, 1.2,{
  transformOrigin:"50% 0%",
  rotation: "5deg"
}, {
  rotation:"-5deg",
  repeat:-1, 
  yoyo:true,
  ease:"linear"
})

//pumpkin
var tlpumpkinBlink = new TimelineMax({repeat:-1});
tlpumpkinBlink.to([pumpkin2Eyes], .2, {opacity: 0}, 2)
tlpumpkinBlink.to([pumpkin2Eyes], .2, {opacity: 1})

var tlpumpkinRock = new TimelineMax();
tlpumpkinRock.fromTo(pumpkin2, 1, {
  rotation: '-5deg',
}, {
  rotation: '5deg',
  repeat:-1,
  yoyo:true,
  ease:'linear'
})

//monsterFace
var tlgreenFace = new TimelineMax({
  repeat:-1,
  yoyo:true
});
tlgreenFace.set(greenFace, {opacity:0})
tlgreenFace.to(greenFace, 5, {opacity:1}, 5)
tlgreenFace.to(greenFaceMouth, .5, {scaleY:1.2})

//windowflicker
var tlwindowFlicker = new TimelineMax();
tlwindowFlicker.fromTo(windowFront, .4, {opacity:0}, {opacity:1, repeat:-1, yoyo:true, repeatDelay:2, ease: Bounce.easeOut})

//bubbles
var tlBubble = new TimelineMax();
tlBubble.staggerFromTo(clawBubble, 4, {
  y:0,
  opacity:1
}, {
  y:-50,
  opacity:0.1,
  scale:2,
  repeat:-1,
}, 1)

var tlBubbleWitch = new TimelineMax();
tlBubbleWitch.staggerFromTo(windowWitchBubble, 4, {
  y:0,
  opacity:1
}, {
  y:-50,
  opacity:0.1,
  scale:2,
  repeat:-1,
}, 1)

//claw 
var tlclawGroup = new TimelineMax();
tlclawGroup.set(clawgroup, {opacity:0})
tlclawGroup.to(clawgroup, 2, {opacity:1}, 6)

var tlclaw1Shake = new TimelineMax({repeat:-1});
tlclaw1Shake.to(claw1, .2, {rotation:"10deg"}, 2)
tlclaw1Shake.to(claw1, .2, {rotation:"-8deg"})

var tlshake = new TimelineMax({repeat:-1});
tlshake.to(claw2, .2, {rotation:"10deg"}, 2)
tlshake.to(claw2, .2, {rotation:"-8deg"})



//ghosts
var tlghostFloating = new TimelineMax();
tlghostFloating.set([ghostTeacup, ghostTeapot], {opacity:0})
tlghostFloating.to([ghostTeacup, ghostTeapot], 3, {opacity:1}, 3)
tlghostFloating.staggerFromTo([ghostTeacup, ghostTeapot], 1.5, {
  x:0,
  y:0
}, {
  y:7,
  repeat:-1,
  yoyo:true
}, .7)

var tlghostTeapot = new TimelineMax();
tlghostTeapot.fromTo(teapot, .8, {
  rotation: "0deg",
}, {
  rotation:"-15deg",
  y:4,
  repeat:-1,
  repeatDelay:1,
  yoyo:true
})

//madhat
var tlghostMadHat = new TimelineMax();
tlghostMadHat.fromTo(ghostMadHat, 2, {
  opacity:.4,
  scale:1,
}, {
  opacity:1,
  scale:1.1,
  y:-10,
  rotation:'10deg',
  repeat:-1,
  yoyo:true
})

tlghostHat = new TimelineMax({
  repeat:-1,
  yoyo:true
});
tlghostHat.to(ghostMadHatHat, 1.5, {y:-4, x:-3})

//miley
var tlghostMiley = new TimelineMax();
tlghostMiley.fromTo(ghostMiley, 2, {
  opacity:.8,
}, {
  opacity:1,
  repeat:-1,
  yoyo:true
}, 3)
