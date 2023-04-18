"use strict";
// Buttons
const $modalButton = document.querySelector('.button--modal');
const $helpButton = document.querySelector('.button--help');
const $encryptButton = document.querySelector('.button--encrypt');
const $decryptButton = document.querySelector('.button--decrypt');
const $pasteButton = document.querySelector('.button--paste');
const $clearButton = document.querySelector('.button--clear');
const $swapButton = document.querySelector('.button--swap');
const $resetButton = document.querySelector('.button--reset');
const $copyButton = document.querySelector('.button--copy');
// Modal Elements
const $modal = document.querySelector('.modal');
const $modalTitle = document.querySelector('.modal__title');
const $modalDescription = document.querySelector('.modal__description');
// Containers
const $infoContainer = document.querySelector('.container__info');
const $encryptTextContainer = document.querySelector('.container__encrypt-text');
// Textareas
const $textareaInput = document.getElementById('textarea-box__input');
const $textareaOutput = document.getElementById('textarea-box__text');
// Form
const $inputForm = document.getElementById('inputForm');
const KEYS_ENCRYPT = {
    a: 'ai',
    e: 'enter',
    i: 'imes',
    o: 'ober',
    u: 'ufat'
};
// Regular Expression
const pattern = /[À-ðò-ÿA-Z]/;
const flags = 'mg';
const regExp = new RegExp(pattern, flags);
const encrypt = (text) => {
    Object.entries(KEYS_ENCRYPT).forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[0], 'img'), keyEncrypt[1]));
    return text;
};
const decrypt = (text) => {
    Object.entries(KEYS_ENCRYPT).reverse().forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[1], 'img'), keyEncrypt[0]));
    return text;
};
const updateTextareaOutput = ($textarea, text) => {
    let index = 0;
    const textLength = text.length;
    const interval = 50;
    clearTextarea($textarea);
    const writeText = setInterval(() => {
        const char = text[index];
        $textarea.value += char;
        index++;
        if (index == textLength)
            clearInterval(writeText);
    }, interval);
};
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
    }
    catch (error) {
        console.error(`Failed to copy: ${error}`);
    }
};
const pasteFromClipboard = async ($textarea) => {
    try {
        $textarea.value = await navigator.clipboard.readText();
    }
    catch (error) {
        console.error(`Failed to read clipboard content: ${error}`);
    }
};
const clearTextarea = ($textarea) => $textarea.value = '';
const reset = (...$textareas) => $textareas.forEach($textarea => clearTextarea($textarea));
const swapTextareasContent = ($textareaFrom, $textareaTo) => {
    copyToClipboard($textareaFrom.value);
    clearTextarea($textareaFrom);
    pasteFromClipboard($textareaTo);
};
const isFirefox = () => navigator.userAgent.toLowerCase().includes('firefox');
const validateText = (text) => {
    regExp.lastIndex = 0;
    return !regExp.test(text);
};
$inputForm.addEventListener('submit', (e) => e.preventDefault());
$helpButton.addEventListener('click', () => console.log('Open help window'));
$encryptButton.addEventListener('click', () => {
    const text = encrypt($textareaInput.value);
    updateTextareaOutput($textareaOutput, text);
});
$decryptButton.addEventListener('click', () => {
    const text = decrypt($textareaInput.value);
    updateTextareaOutput($textareaOutput, text);
});
$pasteButton.addEventListener('click', () => pasteFromClipboard($textareaInput));
$clearButton.addEventListener('click', () => clearTextarea($textareaInput));
$swapButton.addEventListener('click', () => swapTextareasContent($textareaOutput, $textareaInput));
$resetButton.addEventListener('click', () => reset($textareaInput, $textareaOutput));
$copyButton.addEventListener('click', () => copyToClipboard($textareaOutput.value));
//# sourceMappingURL=main.js.map