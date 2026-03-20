const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const COLOR_DEFAULT = '#4fc3f7'; //blue - untouched bar
const COLOR_COMPARING = '#f4a261'; //orange - currently being compared
const COLOR_SWAPPING = '#e63946'; // red - being swapped
const COLOR_SORTED = '#2a9d8f'; // green - in final position

let sortedIndices = [];
let array = [];

function generateArray(){
    array = [];
    sortedIndices = [];

    for(let i=0; i<30; i++){
        let randomHeight = Math.floor(Math.random()*360) + 20;
        array.push(randomHeight);
    }

    drawBars(array);
}

function drawBars(arr){

    let container = document.getElementById('bar-container');

    container.innerHTML = '';

    for(let i=0; i<arr.length; i++){

        let bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = arr[i] + 'px';

        container.appendChild(bar);
    }
}

function updateBarHeights(arr){
    let bars = document.querySelectorAll('.bar');
    for (let i = 0; i < arr.length; i++){
        bars[i].style.height = arr[i] + 'px';
    }
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
}

function colorBar(index, color){
    let bars = document.querySelectorAll('.bar');
    bars[index].style.backgroundColor = color;
}

function playSound(frequency,duration, type = 'sine'){

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    //connect oscillator -> gainnode -> speakers
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    //set the pitch
    oscillator.frequency.value = frequency;
    oscillator.type = type; // wave type

    gainNode.gain.setValueAtTime(0.1,audioCtx.currentTime);// volume 0.1
    gainNode.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime + duration / 1000);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function playSwapSound(){
    playSound(200, 80, 'square');
}

function playSortedSound(){
    playSound(600, 150, 'sine');
}

function getDelay(){
    let slider = document.getElementById('speed-slider');
    let sliderValue = slider.value;
    return (101 - sliderValue) * 30;
}

async function bubbleSort(){

    let n = array.length;

    for (let i = 0; i< n-1; i++){

        for (let j = 0; j < n - i - 1; j++){

            colorBar(j,COLOR_COMPARING);
            colorBar(j+1,COLOR_COMPARING);

            await sleep(getDelay());

            if (array[j] > array[j+1]){
                colorBar(j, COLOR_SWAPPING);
                colorBar(j+1, COLOR_SWAPPING);

                playSwapSound();

                let temp = array[j];
                array[j] = array[j+1];
                array[j+1] = temp;

                updateBarHeights(array);
                await sleep(getDelay());
            }

            colorBar(j,COLOR_DEFAULT);
            colorBar(j+1, COLOR_DEFAULT);
        }
        sortedIndices.push(n-1-i);
        colorBar(n-1-i, COLOR_SORTED);
        playSortedSound();
    }
    sortedIndices.push(0);
    colorBar(0,COLOR_SORTED);
    playSortedSound();
}

document.getElementById('btn-generate').addEventListener('click',generateArray);
document.getElementById('btn-bubble').addEventListener('click', bubbleSort);

generateArray();