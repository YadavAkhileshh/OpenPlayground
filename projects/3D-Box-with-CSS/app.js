    /* 
REFERENCE:
http://24ways.org/2010/intro-to-css-3d-transforms/ 
by David DeSandro
*/
var init = function() {
  var box = document.querySelector('.box'),
      showPanelButtons = document.querySelectorAll('ul#options li button'),
      panelClassName = 'show-front',

      onButtonClick = function( event ){
        console.log(box)
        $(box).removeClass( panelClassName );
        panelClassName = event.target.className;
        $(box).addClass( panelClassName );
      };

  for (var i=0, len = showPanelButtons.length; i < len; i++) {
    showPanelButtons[i].addEventListener( 'click', onButtonClick, false);
  }
  
  // document.getElementById('toggle-backface-visibility').addEventListener( 'click', function(){
  //   box.toggleClass('panels-backface-invisible');
  // }, false);
  
};
  
window.addEventListener( 'DOMContentLoaded', init, false);


//Only to Demo
$('button').click(function(){
  $('ul#options li button').removeClass('current');
  $(this).addClass('current');
});