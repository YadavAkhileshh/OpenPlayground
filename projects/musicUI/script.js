const audio = document.getElementById("audio");
const progress = document.getElementById("progress");
const title = document.getElementById("title");

let songs = [
{
name:"Song 1",
file:"song1.mp3"
},
{
name:"Song 2",
file:"song2.mp3"
},
{
name:"Song 3",
file:"song3.mp3"
}
];

let currentSong = 0;

function loadSong(index){

currentSong = index;

audio.src = songs[index].file;

title.innerText = songs[index].name;

audio.play();

}

function playSong(){

audio.play();

}

function pauseSong(){

audio.pause();

}

function nextSong(){

currentSong++;

if(currentSong >= songs.length){
currentSong = 0;
}

loadSong(currentSong);

}

function prevSong(){

currentSong--;

if(currentSong < 0){
currentSong = songs.length - 1;
}

loadSong(currentSong);

}

audio.addEventListener("timeupdate",()=>{

progress.value = audio.currentTime / audio.duration * 100;

});

progress.addEventListener("input",()=>{

audio.currentTime = progress.value / 100 * audio.duration;

});