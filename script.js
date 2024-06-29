const body = document.querySelector('body')
const wpm = document.querySelector('.wpm')
const cpm = document.querySelector('.cpm')
const mistake = document.querySelector('.mistake')
const p = document.querySelector('.text')
const refresh = document.querySelector('.refresh')
const input = document.querySelector('input')

let typedChar = 0;
let wrongCharIndexes = [];
let timerStart=false;
let timer=0
let intervalId = null;
let typing = true;

function focusInput() {
    input.focus()
    p.firstChild.classList.add('active')
}
async function fetchTexts() {
    const response = await fetch('texts.txt')
    const texts = await response.text()
    return texts.split('\n')
}

async function loadParagraph() {
    p.innerHTML = ""
    const texts = await fetchTexts()
    const selectedText = texts[Math.floor(Math.random() * 21)].trim()
    for (let char of selectedText) {
        p.innerHTML += `<span>${char}</span>`
    }
    input.maxLength = selectedText.length
}
function startTimer () {
    timerStart=true
    intervalId = setInterval(() => {
        timer++
    }, 1000);
}
function handleResult(){
    if(timer===0) return;
    wpm.innerHTML = `WPM: ${parseInt(((typedChar-wrongCharIndexes.length)*60)/(5*timer))}`
    cpm.innerHTML = `CPM: ${parseInt(((typedChar-wrongCharIndexes.length)/timer)*60)}`
    mistake.innerHTML = `Mistake: ${wrongCharIndexes.length}`
}
function handleInput(e, span) {
    let lastInputChar = e.target.value.slice(-1)
    if (span.length > typedChar) {
        if (span[typedChar].innerHTML === lastInputChar) {
            span[typedChar].classList.add("correct")
        } else {
            wrongCharIndexes.push(typedChar)
            span[typedChar].classList.add('wrong')
        }
        span[typedChar].classList.remove('active')
        span[typedChar+1] && span[typedChar+1].classList.add('active')
        typedChar++
        handleResult()
    }
    if(span.length < e.target.value.length){
        typing=false
        clearInterval(intervalId)
    }
}

function handleBackSpace(e, span) {
    if (typedChar) {
        span[typedChar - 1].classList.remove('correct')
        span[typedChar - 1].classList.remove('wrong')
        span[typedChar - 1].classList.add('active')
        span[typedChar] && span[typedChar].classList.remove('active')
        wrongCharIndexes.includes(typedChar-1) && wrongCharIndexes.splice(wrongCharIndexes.indexOf(typedChar-1),1)
        typedChar--
        handleResult()
    }
}
function resetTyping (e) {
    e.stopPropagation()
    clearInterval(intervalId)
    typedChar = 0;
    wrongCharIndexes = [];
    timerStart=false;
    timer=0
    intervalId = null;
    typing = true;
    loadParagraph()
    input.value=''
    wpm.innerHTML = `WPM: 0`
    cpm.innerHTML = `CPM: 0`
    mistake.innerHTML = `Mistakes: 0`
}
function Typing(e) {
    if(!typing) return;
    timerStart===false && startTimer()
    const span = document.querySelectorAll('span')
    if (e.inputType === 'insertText') {
        handleInput(e, span)
    }
    if (e.inputType === "deleteContentBackward") {
        handleBackSpace(e,span)
    }
}

refresh.addEventListener('click',resetTyping)
input.addEventListener('input', Typing)
body.addEventListener('click', focusInput)
loadParagraph()
