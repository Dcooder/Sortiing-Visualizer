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

async function merge(left,mid,right){
    let leftArr = array.slice(left,mid+1);
    let rightArr = array.slice(mid+1,right+1);

    let i = 0; //tracks position in leftArr
    let j = 0; //tracks position in rightArr
    let k = left;

    while(i < leftArr.length && j < rightArr.length){

        colorBar(left + i, COLOR_COMPARING);
        colorBar(mid + 1 + j, COLOR_COMPARING);
        await sleep(getDelay());

        if (leftArr[i] <= rightArr[j]){
            array[k] = leftArr[i];
            i++;
        }else{
            array[k] = rightArr[j];
            j++;
        }

        updateBarHeights(array);

        colorBar(k,COLOR_DEFAULT);
        k++;
    }

    while( i < leftArr.length){
        array[k] = leftArr[i];
        updateBarHeights(array);
        colorBar(k,COLOR_DEFAULT);
        i++;
        k++;
        await sleep(getDelay());
    }

    while( j < rightArr.length){
        array[k] = rightArr[j];
        updateBarHeights(array);
        colorBar(k,COLOR_DEFAULT);
        j++;
        k++;
        await sleep(getDelay());
    }

    for (let x = left; x <= right; x++){
        colorBar(x,COLOR_SORTED);
        playSortedSound();
        await sleep(getDelay() / 3);
    }
}

async function mergesort(left,right){
    if (left >= right){
        return;
    }

    let mid = Math.floor((left + right) / 2);

    await mergesort(left,mid);
    await mergesort(mid+1,right);
    await merge(left,mid,right);
}

//this function partitions the array around a pivot
async function partition(left,right){
    let pivot = array[right];
    colorBar(right,COLOR_SWAPPING);

    let i = left - 1;

    for (let j = 0; j < right; j++){
        colorBar(j,COLOR_COMPARING);
        await sleep(getDelay());

        if (array[j] < pivot){
            i++;

            //swapping
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;

            playSwapSound();
            updateBarHeights(array);
            await sleep(getDelay());
        }

        colorBar(j,COLOR_DEFAULT);
    }

    i++;
    let temp = array[i];
    array[i] = array[right];
    array[right] = temp;

    updateBarHeights(array);

    sortedIndices.push(i);
    colorBar(i,COLOR_SORTED);
    playSortedSound();
    await sleep(getDelay());

    return i;
}

// This function recursively sorts using partition
async function quickSort(left, right) {

  if (left >= right) {
    return;
  }

  let pivotIndex = await partition(left, right);
  await quickSort(left, pivotIndex - 1);
  await quickSort(pivotIndex + 1, right);
}

document.getElementById('btn-generate').addEventListener('click',generateArray);
document.getElementById('btn-bubble').addEventListener('click', bubbleSort);
document.getElementById('btn-merge').addEventListener('click', function() {mergesort(0,array.length -1);
});
document.getElementById('btn-quick').addEventListener('click',function() {
    quickSort(0,array.length - 1);
})

generateArray();