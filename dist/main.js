"use strict";
// #region VARIABLES DECLARATION
// #region BUTTONS
const $modalButton = document.querySelector('.button--modal');
const $helpButton = document.querySelector('.button--help');
const $encryptButton = document.querySelector('.button--encrypt');
const $decryptButton = document.querySelector('.button--decrypt');
const $pasteButton = document.querySelector('.button--paste');
const $clearButton = document.querySelector('.button--clear');
const $swapButton = document.querySelector('.button--swap');
const $resetButton = document.querySelector('.button--reset');
const $copyButton = document.querySelector('.button--copy');
// #endregion
// #region MODAL ELEMENTS
const $modal = document.querySelector('.modal');
const $modalTitle = document.querySelector('.modal__title');
const $modalDescription = document.querySelector('.modal__description');
// #endregion
// #region CONTAINERS
const $infoContainer = document.querySelector('.container__info');
const $encryptTextContainer = document.querySelector('.container__encrypt-text');
// #endregion
// #region TEXTAREAS
const $textareaInput = document.getElementById('textarea-box__input');
const $textareaOutput = document.getElementById('textarea-box__text');
// #endregion
// Form
const $inputForm = document.getElementById('inputForm');
// Enums
var ModalType;
(function (ModalType) {
    ModalType[ModalType["Success"] = 0] = "Success";
    ModalType[ModalType["Information"] = 1] = "Information";
    ModalType[ModalType["Warning"] = 2] = "Warning";
    ModalType[ModalType["Error"] = 3] = "Error";
})(ModalType || (ModalType = {}));
;
// #endregion
// Keys
const KEYS_ENCRYPT = {
    a: 'ai',
    e: 'enter',
    i: 'imes',
    o: 'ober',
    u: 'ufat'
};
// Icons
const MODAL_ICONS = {
    [ModalType.Success]: document.querySelector('.modal__icon--correct'),
    [ModalType.Information]: document.querySelector('.modal__icon--information'),
    [ModalType.Warning]: document.querySelector('.modal__icon--warning'),
    [ModalType.Error]: document.querySelector('.modal__icon--error')
};
// #region REGULAR EXPRESSIONS
// const pattern: RegExp = /[À-ðò-ÿA-Z]/;
const pattern = /^[a-z\s]+$/;
const flags = 'mg';
const regExp = new RegExp(pattern, flags);
// #endregion
// #region GLOBAL SETTINGS
const timeout = 50;
const modalLife = 1500;
let writeInterval = 0;
// #endregion
// Modal
const modal = {
    type: ModalType.Information,
    title: '',
    description: '',
    timeout: modalLife
};
// #endregion
// #region FUNCTIONS
const encrypt = (text) => {
    Object.entries(KEYS_ENCRYPT).forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[0], 'img'), keyEncrypt[1]));
    return text;
};
const decrypt = (text) => {
    Object.entries(KEYS_ENCRYPT).reverse().forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[1], 'img'), keyEncrypt[0]));
    return text;
};
const updateTextarea = ($textarea, text, interval = timeout) => {
    let index = 0;
    const textLength = text.length;
    clearTextarea($textarea);
    writeInterval = setInterval(() => {
        const char = text[index];
        $textarea.value += char;
        index++;
        if (index == textLength)
            clearInterval(writeInterval);
    }, interval);
};
const openModalWindow = (modal) => {
    Object.entries(MODAL_ICONS).forEach((icon) => {
        if (icon[0] === modal.type.toString()) {
            icon[1].style.setProperty('display', 'block');
        }
        else {
            icon[1].style.setProperty('display', 'none');
        }
    });
    $modalTitle.textContent = modal.title;
    $modalDescription.textContent = modal.description;
    $modal.classList.remove('close');
    $modal.classList.add('open');
    setTimeout(closeModalWindow, modal.timeout);
};
const closeModalWindow = () => {
    $modal.classList.remove('open');
    $modal.classList.add('close');
};
const copyToClipboard = async (text) => {
    text = text.trim();
    if (text === '') {
        modal.type = ModalType.Error;
        modal.title = 'Error';
        modal.description = 'Your text is empty.';
        modal.timeout = modalLife;
    }
    else {
        try {
            await navigator.clipboard.writeText(text);
            modal.type = ModalType.Success;
            modal.title = 'Success';
            modal.description = 'Text copied to clipboard.';
            modal.timeout = modalLife;
        }
        catch (error) {
            modal.type = ModalType.Error;
            modal.title = 'Error';
            modal.description = 'Failed to copy text to clipboard.';
            modal.timeout = modalLife;
            console.error(`Failed to copy text to clipboard: ${error}`);
        }
    }
    openModalWindow(modal);
};
const pasteFromClipboard = async ($textarea) => {
    clearInterval(writeInterval);
    try {
        $textarea.value = await navigator.clipboard.readText();
        modal.type = ModalType.Success;
        modal.title = 'Success';
        modal.description = 'Text pasted from clipboard.';
        modal.timeout = modalLife;
    }
    catch (error) {
        modal.type = ModalType.Error;
        modal.title = 'Error';
        modal.description = 'Failed to read clipboard content.';
        modal.timeout = modalLife;
        console.error(`Failed to read clipboard content: ${error}`);
    }
    openModalWindow(modal);
};
const clearTextarea = ($textarea) => {
    clearInterval(writeInterval);
    $textarea.value = '';
};
const reset = (...$textareas) => {
    clearInterval(writeInterval);
    $textareas.forEach($textarea => clearTextarea($textarea));
    modal.type = ModalType.Success;
    modal.title = 'Success';
    modal.description = 'Text encryptor reset.';
    modal.timeout = modalLife;
    openModalWindow(modal);
};
const swapTextareasContent = ($textareaFrom, $textareaTo) => {
    clearInterval(writeInterval);
    const textToMove = $textareaFrom.value.trim();
    if (textToMove === '') {
        modal.type = ModalType.Error;
        modal.title = 'Error';
        modal.description = 'Your text is empty.';
        modal.timeout = modalLife;
        openModalWindow(modal);
    }
    else {
        clearTextarea($textareaFrom);
        clearTextarea($textareaTo);
        updateTextarea($textareaTo, textToMove, 25);
    }
};
const isFirefox = () => navigator.userAgent.toLowerCase().includes('firefox');
const validateText = (text) => {
    regExp.lastIndex = 0;
    return regExp.test(text);
};
// #endregion
// #region EVENT LISTENERS
$inputForm.addEventListener('submit', (e) => e.preventDefault());
$modalButton.addEventListener('click', closeModalWindow);
$helpButton.addEventListener('click', () => console.log('Open help window'));
$encryptButton.addEventListener('click', () => {
    let text = $textareaInput.value.trim();
    if (text === '') {
        modal.type = ModalType.Error;
        modal.title = 'Error';
        modal.description = 'Your text is empty.';
        modal.timeout = modalLife;
    }
    else {
        if (validateText(text)) {
            text = encrypt(text);
            updateTextarea($textareaOutput, text);
            modal.type = ModalType.Success;
            modal.title = 'Text Encrypted';
            modal.description = 'Your text was encrypted.';
            modal.timeout = 1000;
        }
        else {
            modal.type = ModalType.Error;
            modal.title = 'Error';
            modal.description = 'Your text contains symbols or especial characters.';
            modal.timeout = modalLife;
        }
    }
    openModalWindow(modal);
});
$decryptButton.addEventListener('click', () => {
    let text = $textareaInput.value.trim();
    if (text === '') {
        modal.type = ModalType.Error;
        modal.title = 'Error';
        modal.description = 'Your text is empty.';
        modal.timeout = modalLife;
    }
    else {
        if (validateText(text)) {
            text = decrypt(text);
            updateTextarea($textareaOutput, text);
            modal.type = ModalType.Success;
            modal.title = 'Text Decrypted';
            modal.description = 'Your text was decrypted.';
            modal.timeout = 1000;
        }
        else {
            modal.type = ModalType.Error;
            modal.title = 'Error';
            modal.description = 'Your text contains symbols and characters.';
            modal.timeout = modalLife;
        }
    }
    openModalWindow(modal);
});
$pasteButton.addEventListener('click', () => pasteFromClipboard($textareaInput));
$clearButton.addEventListener('click', () => {
    clearTextarea($textareaInput);
    modal.type = ModalType.Success;
    modal.title = 'Success';
    modal.description = 'Textarea cleared.';
    modal.timeout = modalLife;
    openModalWindow(modal);
});
$swapButton.addEventListener('click', () => swapTextareasContent($textareaOutput, $textareaInput));
$resetButton.addEventListener('click', () => reset($textareaInput, $textareaOutput));
$copyButton.addEventListener('click', () => copyToClipboard($textareaOutput.value));
// #endregion
//# sourceMappingURL=main.js.map