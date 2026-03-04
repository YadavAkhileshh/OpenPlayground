var $hours = document.getElementById('hours');
var $minutes = document.getElementById('minutes');

setTimeout(function () {
  "use strict";

  var hours = new Date().getHours();
  var minutes = new Date().getMinutes();

  hours = 9;
  minutes = 10;
  
  if (hours >= 6 && hours < 12) {
    $hours.className = 'left';
  } else {
    $hours.className = 'right';
  }

  if (minutes <= 30) {
    $minutes.className = 'back left';
  } else {
    $minutes.className = 'left';
  }

  $hours.className = 'right';
  $minutes.className = 'back left';

  set($hours,  30 * hours);
  set($minutes, 6 * minutes);
}, 1000);

function set ($elmt, deg) {
  "use strict";

  if ($elmt.id === 'hours' && deg < 180) {
    deg = deg - 5;
  }

  if ($elmt.id === 'minutes' && deg < 180) {
    deg = deg + 5;
  } else {
    deg = deg - 5;
  }

  $elmt.style.transform = 'rotate(' + deg + 'deg)';
  $elmt.style.webkitTransform = 'rotate(' + deg + 'deg)';
}