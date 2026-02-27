/* 
* I will keep publishing examples to help push the web foward.
* PLEASE Like, Heart or Share if you like, and don't forget to follow. 
* Thanks.
*
* Now let's animate it :)
*/

var $box = $('.box'),
  inter = 30,
  speed = 0;

function moveBox(e) {
  //TweenMax.killTweensOf();
  $box.each(function(index, val) {
   TweenLite.to($(this), 0.05, { css: { left: e.pageX, top: e.pageY},delay:0+(index/750)});
  });
}

$(window).on('mousemove', moveBox);

$box.each(function(index, val) {
    index = index + 1;
    TweenMax.set(
      $(this),{
        autoAlpha: 1,
        delay:0
      });
  });
  TweenMax.set(
    $('.text:nth-child(30)'), {
      autoAlpha: 1,
      delay: 0
    }
  );

//V2.0
$('.pointer').mouseover(function(){
  //console.log('cursor');
  $box.addClass('arrow');
});
$('.circle').mouseover(function(){
  //console.log('circle');
  $box.removeClass('arrow');
});