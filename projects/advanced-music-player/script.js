const songs = [
    {
        title:"SoundHelix 1",
        src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover:"https://picsum.photos/300?1"
    },
    {
        title:"SoundHelix 2",
        src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover:"https://picsum.photos/300?2"
    },
    {
        title:"SoundHelix 3",
        src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover:"https://picsum.photos/300?3"
    }
];

const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progressContainer");
const title = document.getElementById("title");
const cover = document.getElementById("cover");
const volume = document.getElementById("volume");
const playlist = document.getElementById("playlist");
const album = document.querySelector(".album-container");

let songIndex = 0;
let isPlaying = false;

function loadSong(index){
    audio.src = songs[index].src;
    title.textContent = songs[index].title;
    cover.src = songs[index].cover;
}

function playSong(){
    audio.play();
    isPlaying = true;
    playBtn.textContent = "⏸";
    album.style.animationPlayState = "running";
}

function pauseSong(){
    audio.pause();
    isPlaying = false;
    playBtn.textContent = "▶";
    album.style.animationPlayState = "paused";
}

playBtn.addEventListener("click",()=>{
    isPlaying ? pauseSong() : playSong();
});

nextBtn.addEventListener("click",()=>{
    songIndex = (songIndex+1)%songs.length;
    loadSong(songIndex);
    playSong();
});

prevBtn.addEventListener("click",()=>{
    songIndex = (songIndex-1+songs.length)%songs.length;
    loadSong(songIndex);
    playSong();
});

audio.addEventListener("timeupdate",()=>{
    const {duration,currentTime} = audio;
    const progressPercent = (currentTime/duration)*100;
    progress.style.width = progressPercent+"%";

    document.getElementById("currentTime").textContent = formatTime(currentTime);
    document.getElementById("duration").textContent = formatTime(duration);
});

function formatTime(time){
    const min = Math.floor(time/60);
    const sec = Math.floor(time%60).toString().padStart(2,"0");
    return `${min}:${sec}`;
}

progressContainer.addEventListener("click",(e)=>{
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX/width)*audio.duration;
});

volume.addEventListener("input",()=>{
    audio.volume = volume.value;
});

audio.addEventListener("ended",()=>{
    nextBtn.click();
});

document.addEventListener("keydown",(e)=>{
    if(e.code==="Space"){
        e.preventDefault();
        playBtn.click();
    }
});

songs.forEach((song,index)=>{
    const li = document.createElement("li");
    li.textContent = song.title;
    li.addEventListener("click",()=>{
        songIndex = index;
        loadSong(songIndex);
        playSong();
    });
    playlist.appendChild(li);
});

loadSong(songIndex);
