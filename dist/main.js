"use strict";
// #region VARIABLES DECLARATION
// #region BUTTONS
const $modalButton = document.querySelector('.button--modal');
const $helpButton = document.querySelector('.button--help');
const $closeHelp_1 = document.querySelector('.help-container__button');
const $closeHelp_2 = document.querySelectorAll('.help-container__button')[1];
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
const $helpContainer = document.querySelector('.back-filter');
const $firefoxContainer = document.querySelector('.firefox-info');
const $infoContainer = document.querySelector('.container__info');
const $encryptTextContainer = document.querySelector('.container__encrypt-text');
// #endregion
// #region TEXTAREAS
const $textareaInput = document.getElementById('textarea-box__input');
const $textareaOutput = document.getElementById('textarea-box__text');
// #endregion
// #region LABELS
const $labelOutput = document.querySelectorAll('.textarea-box__label')[1];
// #endregio
// Form
const $inputForm = document.getElementById('inputForm');
// Advice
const $advice = document.querySelector('.advice');
// SVG
const $animatedSVG = document.querySelector('.container__image');
const $decorationPaths = document.querySelectorAll('.container__image--decorations path');
const $centerPaths = document.querySelectorAll('.container__image--center path');
// Enums
var ModalType;
(function (ModalType) {
    ModalType[ModalType["Success"] = 0] = "Success";
    ModalType[ModalType["Information"] = 1] = "Information";
    ModalType[ModalType["Warning"] = 2] = "Warning";
    ModalType[ModalType["Error"] = 3] = "Error";
})(ModalType || (ModalType = {}));
;
var DisplayType;
(function (DisplayType) {
    DisplayType["None"] = "none";
    DisplayType["Flex"] = "flex";
})(DisplayType || (DisplayType = {}));
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
const pattern = /^[a-zñ\s]+$/;
const flags = 'g';
const regExp = new RegExp(pattern, flags);
// #endregion
// #region GLOBAL SETTINGS
const timeout = 15;
const modalLife = 1500;
let writeInterval = 0;
let animationInterval = 0;
let animationTimeout = 0;
// #endregion
// #endregion
// #region FUNCTIONS
const encrypt = (text) => {
    Object.entries(KEYS_ENCRYPT).forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[0], 'mg'), keyEncrypt[1]));
    return text;
};
const decrypt = (text) => {
    Object.entries(KEYS_ENCRYPT).reverse().forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[1], 'mg'), keyEncrypt[0]));
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
const updateLabelText = ($label, $text) => {
    $label.textContent = $text;
};
const changeAdviceVisibility = ($visible) => {
    if ($visible)
        $advice.classList.add('visible');
    else
        $advice.classList.remove('visible');
};
const changeHTMLElementDisplay = ($htmlElement, displayType) => {
    const elementStyle = getComputedStyle($htmlElement);
    const elementDisplay = elementStyle.getPropertyValue('display');
    if (elementDisplay != displayType) {
        $htmlElement.style.setProperty('display', displayType);
        if ($htmlElement === $infoContainer) {
            if (displayType === DisplayType.Flex) {
                startSVGAnimation($animatedSVG);
                updateLabelText($labelOutput, '');
            }
            else
                stopSVGAnimation($animatedSVG, animationTimeout, animationInterval);
        }
    }
};
const changeHelpContainerVisibility = ($visible) => {
    if ($visible) {
        document.body.style.setProperty('overflow', 'hidden');
        $helpContainer.classList.remove('close');
        $helpContainer.classList.add('open');
    }
    else {
        setTimeout(() => {
            document.body.style.setProperty('overflow', 'auto');
        }, 500);
        $helpContainer.classList.remove('open');
        $helpContainer.classList.add('close');
    }
};
const changeVisibleContainer = ($elementToShow, $elementToHide) => {
    clearTextarea($textareaOutput);
    changeHTMLElementDisplay($elementToShow, DisplayType.Flex);
    changeHTMLElementDisplay($elementToHide, DisplayType.None);
};
const openModalWindow = (type, title, description, timeout = modalLife) => {
    Object.entries(MODAL_ICONS).forEach((icon) => {
        if (icon[0] === type.toString())
            icon[1].classList.add('active');
    });
    $modalTitle.textContent = title;
    $modalDescription.textContent = description;
    $modal.classList.remove('close');
    $modal.classList.add('open');
    setTimeout(closeModalWindow, timeout);
};
const closeModalWindow = () => {
    $modal.classList.remove('open');
    $modal.classList.add('close');
    setTimeout(() => {
        Object.values(MODAL_ICONS).forEach(icon => icon.classList.remove('active'));
        $modalTitle.textContent = '';
        $modalDescription.textContent = '';
    }, 300);
};
const copyToClipboard = async (text) => {
    text = text.trim();
    if (text === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
    }
    else {
        try {
            await navigator.clipboard.writeText(text);
            openModalWindow(ModalType.Success, 'Success', 'Text copied to clipboard.');
        }
        catch (error) {
            openModalWindow(ModalType.Error, 'Error', 'Failed to copy text to clipboard.');
            console.error(`Failed to copy text to clipboard: ${error}`);
        }
    }
};
const pasteFromClipboard = async ($textarea) => {
    clearInterval(writeInterval);
    try {
        $textarea.value = await navigator.clipboard.readText();
        const text = $textareaInput.value.trim();
        changeVisibleContainer($infoContainer, $encryptTextContainer);
        if (!validateText(text))
            changeAdviceVisibility(true);
        openModalWindow(ModalType.Success, 'Success', 'Text pasted from clipboard.');
    }
    catch (error) {
        openModalWindow(ModalType.Error, 'Error', 'Failed to read clipboard content.');
        console.error(`Failed to read clipboard content: ${error}`);
    }
};
const clearTextarea = ($textarea) => {
    clearInterval(writeInterval);
    $textarea.value = '';
    changeAdviceVisibility(false);
};
const reset = (...$textareas) => {
    clearInterval(writeInterval);
    $textareas.forEach($textarea => clearTextarea($textarea));
    changeVisibleContainer($infoContainer, $encryptTextContainer);
    openModalWindow(ModalType.Success, 'Success', 'Text encryptor reset.');
};
const swapTextareasContent = ($textareaFrom, $textareaTo) => {
    clearInterval(writeInterval);
    const textToMove = $textareaFrom.value.trim();
    if (textToMove === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
        changeVisibleContainer($infoContainer, $encryptTextContainer);
    }
    else {
        if (validateText(textToMove)) {
            reset($textareaFrom, $textareaTo);
            updateTextarea($textareaTo, textToMove, 5);
        }
        else {
            openModalWindow(ModalType.Error, 'Error', 'Your text contains symbols or especial characters.');
        }
    }
};
const isFirefox = () => navigator.userAgent.toLowerCase().includes('firefox');
const checkUserAgent = () => {
    var _a;
    if (!isFirefox())
        (_a = $helpContainer.querySelector('.help div')) === null || _a === void 0 ? void 0 : _a.removeChild($firefoxContainer);
    console.log('object');
};
const validateText = (text) => {
    regExp.lastIndex = 0;
    return regExp.test(text);
};
const checkTextareaValue = ($textarea) => {
    const text = $textarea.value.trim();
    changeVisibleContainer($infoContainer, $encryptTextContainer);
    if (text === '') {
        changeAdviceVisibility(false);
    }
    else {
        if (!validateText(text))
            changeAdviceVisibility(true);
        else
            changeAdviceVisibility(false);
    }
};
const getPathsLength = ($paths) => {
    const pathsLengt = [...$paths].map($path => Math.ceil($path.getTotalLength()));
    console.log(pathsLengt.join(' '));
};
const startSVGAnimation = ($svgImage) => {
    $svgImage.classList.remove('active');
    $svgImage.classList.toggle('active');
    animationTimeout = setTimeout(() => $svgImage.classList.toggle('active'), 7500);
    animationInterval = setInterval(() => {
        $svgImage.classList.toggle('active');
        animationTimeout = setTimeout(() => $svgImage.classList.toggle('active'), 7500);
    }, 8000);
};
const stopSVGAnimation = ($svgImage, timeout, interval) => {
    $svgImage.classList.remove('active');
    clearTimeout(timeout);
    clearInterval(interval);
};
// #endregion
// #region EVENT LISTENERS
$textareaInput.addEventListener('keyup', () => checkTextareaValue($textareaInput));
$textareaInput.addEventListener('change', () => checkTextareaValue($textareaInput));
$inputForm.addEventListener('submit', (e) => e.preventDefault());
$modalButton.addEventListener('click', closeModalWindow);
$helpButton.addEventListener('click', () => changeHelpContainerVisibility(true));
$closeHelp_1.addEventListener('click', () => changeHelpContainerVisibility(false));
$closeHelp_2.addEventListener('click', () => changeHelpContainerVisibility(false));
$encryptButton.addEventListener('click', () => {
    let text = $textareaInput.value.trim();
    if (text === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
    }
    else {
        if (validateText(text)) {
            changeVisibleContainer($encryptTextContainer, $infoContainer);
            updateTextarea($textareaOutput, encrypt(text));
            openModalWindow(ModalType.Success, 'Text Encrypted', 'Your text was encrypted.', 1000);
            updateLabelText($labelOutput, 'Encrypted text:');
        }
        else {
            openModalWindow(ModalType.Error, 'Error', 'Your text contains symbols or especial characters.');
        }
    }
});
$decryptButton.addEventListener('click', () => {
    let text = $textareaInput.value.trim();
    if (text === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
    }
    else {
        if (validateText(text)) {
            changeVisibleContainer($encryptTextContainer, $infoContainer);
            updateTextarea($textareaOutput, decrypt(text));
            openModalWindow(ModalType.Success, 'Text Decrypted', 'Your text was decrypted.', 1000);
            updateLabelText($labelOutput, 'Decrypted text:');
        }
        else {
            openModalWindow(ModalType.Error, 'Error', 'Your text contains symbols or especial characters.');
        }
    }
});
$pasteButton.addEventListener('click', () => {
    pasteFromClipboard($textareaInput);
});
$clearButton.addEventListener('click', () => {
    clearTextarea($textareaInput);
    changeVisibleContainer($infoContainer, $encryptTextContainer);
    openModalWindow(ModalType.Success, 'Success', 'Textarea cleared.');
});
$swapButton.addEventListener('click', () => swapTextareasContent($textareaOutput, $textareaInput));
$resetButton.addEventListener('click', () => reset($textareaInput, $textareaOutput));
$copyButton.addEventListener('click', () => copyToClipboard($textareaOutput.value));
startSVGAnimation($animatedSVG);
checkUserAgent();
// #endregion
//# sourceMappingURL=main.js.map