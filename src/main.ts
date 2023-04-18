// #region VARIABLES DECLARATION
// #region BUTTONS
const $modalButton: HTMLButtonElement   = document.querySelector('.button--modal') as HTMLButtonElement;
const $helpButton: HTMLButtonElement    = document.querySelector('.button--help') as HTMLButtonElement;
const $encryptButton: HTMLButtonElement = document.querySelector('.button--encrypt') as HTMLButtonElement;
const $decryptButton: HTMLButtonElement = document.querySelector('.button--decrypt') as HTMLButtonElement;
const $pasteButton: HTMLButtonElement   = document.querySelector('.button--paste') as HTMLButtonElement;
const $clearButton: HTMLButtonElement   = document.querySelector('.button--clear') as HTMLButtonElement;
const $swapButton: HTMLButtonElement    = document.querySelector('.button--swap') as HTMLButtonElement;
const $resetButton: HTMLButtonElement   = document.querySelector('.button--reset') as HTMLButtonElement;
const $copyButton: HTMLButtonElement    = document.querySelector('.button--copy') as HTMLButtonElement;
// #endregion

// #region MODAL ELEMENTS
const $modal: HTMLDivElement                  = document.querySelector('.modal') as HTMLDivElement;
const $modalTitle: HTMLHeadingElement         = document.querySelector('.modal__title') as HTMLHeadingElement;
const $modalDescription: HTMLParagraphElement = document.querySelector('.modal__description') as HTMLParagraphElement;
// #endregion

// #region CONTAINERS
const $infoContainer: HTMLDivElement        = document.querySelector('.container__info') as HTMLDivElement;
const $encryptTextContainer: HTMLDivElement = document.querySelector('.container__encrypt-text') as HTMLDivElement;
// #endregion

// #region TEXTAREAS
const $textareaInput: HTMLTextAreaElement  = document.getElementById('textarea-box__input') as HTMLTextAreaElement;
const $textareaOutput: HTMLTextAreaElement = document.getElementById('textarea-box__text') as HTMLTextAreaElement;
// #endregion

// Form
const $inputForm: HTMLFormElement = document.getElementById('inputForm') as HTMLFormElement;

// Enums
enum ModalType { Success, Information, Warning, Error };

// #region INTERFACES
interface KeyEncrypt {
    readonly [key: string]: readonly string;
}

interface Icon {
    [key: ModalType]: HTMLSpanElement;
}

interface ModalSettings {
    type       : ModalType,
    title      : string,
    description: string,
    timeout    : number
}
// #endregion

// Keys
const KEYS_ENCRYPT: KeyEncrypt = {
    a: 'ai',
    e: 'enter',
    i: 'imes',
    o: 'ober',
    u: 'ufat'
};

// Icons
const MODAL_ICONS: Icon = {
    [ModalType.Success]    : document.querySelector('.modal__icon--correct'),
    [ModalType.Information]: document.querySelector('.modal__icon--information'),
    [ModalType.Warning]    : document.querySelector('.modal__icon--warning'),
    [ModalType.Error]      : document.querySelector('.modal__icon--error')
}

// #region REGULAR EXPRESSIONS
// const pattern: RegExp = /[À-ðò-ÿA-Z]/;
const pattern: RegExp = /^[a-z\s]+$/;
const flags: string   = 'mg';
const regExp: RegExp  = new RegExp(pattern, flags);
// #endregion

// #region GLOBAL SETTINGS
const timeout  : number      = 50;
const modalLife: number      = 1500;
let   writeInterval : number = 0;
// #endregion

// Modal
const modal: ModalSettings = {
    type       : ModalType.Information,
    title      : '',
    description: '',
    timeout    : modalLife
}
// #endregion

// #region FUNCTIONS
const encrypt = (text: string): string => {
    Object.entries(KEYS_ENCRYPT).forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[0], 'img'), keyEncrypt[1]));

    return text;
};

const decrypt = (text: string): string => {
    Object.entries(KEYS_ENCRYPT).reverse().forEach(keyEncrypt  => text = text.replace(new RegExp(keyEncrypt[1], 'img'), keyEncrypt[0]));
    
    return text;
};

const updateTextarea = ($textarea: HTMLTextAreaElement,text: string, interval: number = timeout): void => {
    let index: number = 0;

    const textLength: number = text.length;

    clearTextarea($textarea);

    writeInterval = setInterval(() => {
        const char: string = text[index];

        $textarea.value += char;

        index++;

        if (index == textLength) clearInterval(writeInterval);
    }, interval);
};

const openModalWindow = (modal: ModalSettings) => {
    Object.entries(MODAL_ICONS).forEach((icon: [string, HTMLSpanElement]) => {
        if (icon[0] === modal.type.toString()) {
            icon[1].style.setProperty('display', 'block');
        } else {
            icon[1].style.setProperty('display', 'none');
        }
    });

    $modalTitle.textContent       = modal.title;
    $modalDescription.textContent = modal.description;

    $modal.classList.remove('close');
    $modal.classList.add('open');

    setTimeout(closeModalWindow, modal.timeout);
};

const closeModalWindow = () => {
    $modal.classList.remove('open');
    $modal.classList.add('close');
}

const copyToClipboard = async (text: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);

        modal.type        = ModalType.Success;
        modal.title       = 'Success';
        modal.description = 'Text copied to clipboard.';
        modal.timeout     = modalLife;
    } catch (error) {
        modal.type        = ModalType.Error;
        modal.title       = 'Error';
        modal.description = 'Failed to copy text to clipboard.';
        modal.timeout     = modalLife;

        
        console.error(`Failed to copy text to clipboard: ${error}`);
    }

    openModalWindow(modal);
};

const pasteFromClipboard = async ($textarea: HTMLTextAreaElement): Promise<void> {
    clearInterval(writeInterval);

    try {
        $textarea.value = await navigator.clipboard.readText();
    } catch (error) {
        modal.type        = ModalType.Error;
        modal.title       = 'Error';
        modal.description = 'Failed to read clipboard content.';
        modal.timeout     = modalLife;

        openModalWindow(modal);
        
        console.error(`Failed to read clipboard content: ${error}`);
    }
}

const clearTextarea = ($textarea: HTMLTextAreaElement): void => {
    clearInterval(writeInterval);

    $textarea.value = ''
};

const reset = (...$textareas: Array<HTMLTextAreaElement>): void => {
    clearInterval(writeInterval);
    $textareas.forEach($textarea => clearTextarea($textarea));
};

const swapTextareasContent = ($textareaFrom: HTMLTextAreaElement, $textareaTo: HTMLTextAreaElement): void => {
    clearInterval(writeInterval);

    const textToMove: string = $textareaFrom.value;

    clearTextarea($textareaFrom);
    clearTextarea($textareaTo);
    updateTextarea($textareaTo, textToMove, 25);
}

const isFirefox = (): boolean => navigator.userAgent.toLowerCase().includes('firefox');

const validateText = (text: string): boolean => {
    regExp.lastIndex = 0;

    return regExp.test(text);
}
// #endregion

// #region EVENT LISTENERS
$inputForm.addEventListener('submit', (e: SubmitEvent): void => e.preventDefault());

$modalButton.addEventListener('click', closeModalWindow);
$helpButton.addEventListener('click', () => console.log('Open help window'));

$encryptButton.addEventListener('click', () => {
    let text: string             = $textareaInput.value;

    if (validateText(text)) {
        text = encrypt(text);

        updateTextarea($textareaOutput, text);

        modal.type        = ModalType.Success;
        modal.title       = 'Text Encrypted';
        modal.description = 'Your text was encrypted.';
        modal.timeout     = modalLife;
    } else {
        modal.type        = ModalType.Error;
        modal.title       = 'Error';
        modal.description = 'Your text contains symbols or characters.';
        modal.timeout     = modalLife;
    }

    openModalWindow(modal);
});

$decryptButton.addEventListener('click', () => {
    let text: string             = $textareaInput.value;

    if (validateText(text)) {
        text = decrypt(text);

        updateTextarea($textareaOutput, text);

        modal.type        = ModalType.Success;
        modal.title       = 'Text Decrypted';
        modal.description = 'Your text was decrypted.';
        modal.timeout     = modalLife;
    } else {
        modal.type        = ModalType.Error;
        modal.title       = 'Error';
        modal.description = 'Your text contains symbols and characters.';
        modal.timeout     = modalLife;
    }

    openModalWindow(modal);
});

$pasteButton.addEventListener('click', () => pasteFromClipboard($textareaInput));
$clearButton.addEventListener('click', () => clearTextarea($textareaInput));
$swapButton.addEventListener('click', () => swapTextareasContent($textareaOutput, $textareaInput));
$resetButton.addEventListener('click', () => reset($textareaInput, $textareaOutput));

$copyButton.addEventListener('click', () => copyToClipboard($textareaOutput.value));
// #endregion