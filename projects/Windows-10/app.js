new DragSelect({
  selectables: document.querySelectorAll('.apps'),
  callback: e => console.log(e)
});

var rightNow = new Date();

var res = rightNow.toISOString().slice(0, 10).replace(/-/g, "/");

document.getElementById("date").innerHTML = res;

var d1 = new Date();

document.getElementById("hours").innerHTML = d1.getHours();

var d2 = new Date();

document.getElementById("mins").innerHTML = d2.getMinutes();

