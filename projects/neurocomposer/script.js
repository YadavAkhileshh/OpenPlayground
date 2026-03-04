const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let intervalId;
let tempo = 100;
let tension = 0;

const scales = {
    major: [0,2,4,5,7,9,11],
    minor: [0,2,3,5,7,8,10],
    dorian: [0,2,3,5,7,9,10]
};

const chordMap = {
    0: [0,4,7],
    1: [2,5,9],
    2: [4,7,11],
    3: [5,9,12],
    4: [7,11,14],
    5: [9,12,16]
};

let currentChordIndex = 0;

function playNote(freq, duration=0.3) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function getFrequency(semitone) {
    return 440 * Math.pow(2, (semitone - 9) / 12);
}

function nextChord() {
    const transitionMatrix = [
        [0.1,0.3,0.1,0.1,0.3,0.1],
        [0.2,0.1,0.3,0.2,0.1,0.1],
        [0.1,0.2,0.1,0.3,0.2,0.1],
        [0.2,0.2,0.2,0.1,0.2,0.1],
        [0.3,0.1,0.2,0.1,0.1,0.2],
        [0.2,0.2,0.1,0.2,0.1,0.2]
    ];

    const probabilities = transitionMatrix[currentChordIndex];
    let rand = Math.random();
    let sum = 0;

    for(let i=0;i<probabilities.length;i++){
        sum += probabilities[i];
        if(rand < sum){
            currentChordIndex = i;
            break;
        }
    }

    tension = Math.abs(currentChordIndex - 2);
    document.getElementById("tension").innerText = tension;
    document.getElementById("currentChord").innerText = "Chord " + currentChordIndex;

    playChord();
}

function playChord(){
    const chord = chordMap[currentChordIndex];
    chord.forEach(note=>{
        playNote(getFrequency(note));
    });
}

function startMusic(){
    tempo = document.getElementById("tempo").value;
    intervalId = setInterval(nextChord, 60000/tempo);
}

function stopMusic(){
    clearInterval(intervalId);
}
