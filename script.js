let array = [];

function generateArray(){
    array = [];

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

document.getElementById('btn-generate').addEventListener('click',generateArray);
document.getElementById('btn-bubble').addEventListener('click',function()
{ 
    alert('Bubble sort coming soon');

});

generateArray();