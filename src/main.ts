// Buttons
const $modalButton: HTMLButtonElement   = document.querySelector('.button--modal') as HTMLButtonElement;
const $helpButton: HTMLButtonElement    = document.querySelector('.button--help') as HTMLButtonElement;
const $encryptButton: HTMLButtonElement = document.querySelector('.button--encrypt') as HTMLButtonElement;
const $decryptButton: HTMLButtonElement = document.querySelector('.button--decrypt') as HTMLButtonElement;
const $pasteButton: HTMLButtonElement   = document.querySelector('.button--paste') as HTMLButtonElement;
const $clearButton: HTMLButtonElement   = document.querySelector('.button--clear') as HTMLButtonElement;
const $swapButton: HTMLButtonElement    = document.querySelector('.button--swap') as HTMLButtonElement;
const $resetButton: HTMLButtonElement   = document.querySelector('.button--reset') as HTMLButtonElement;
const $copyButton: HTMLButtonElement    = document.querySelector('.button--copy') as HTMLButtonElement;

// Modal Elements
const $modal: HTMLDivElement                  = document.querySelector('.modal') as HTMLDivElement;
const $modalTitle: HTMLHeadingElement         = document.querySelector('.modal__title') as HTMLHeadingElement;
const $modalDescription: HTMLParagraphElement = document.querySelector('.modal__description') as HTMLParagraphElement;

// Containers
const $infoContainer: HTMLDivElement        = document.querySelector('.container__info') as HTMLDivElement;
const $encryptTextContainer: HTMLDivElement = document.querySelector('.container__encrypt-text') as HTMLDivElement;

// Textareas
const $textareaInput: HTMLTextAreaElement  = document.getElementById('textarea-box__input') as HTMLTextAreaElement;
const $textareaOutput: HTMLTextAreaElement = document.getElementById('textarea-box__text') as HTMLTextAreaElement;

// Form
const $inputForm: HTMLFormElement = document.getElementById('inputForm') as HTMLFormElement;

// Keys
interface indexValue {
    [key: string]: string
}

const KEYS_ENCRYPT: indexValue = {
    a: 'ai',
    e: 'enter',
    i: 'imes',
    o: 'ober',
    u: 'ufat'
};

// Regular Expression
const pattern: RegExp = /[À-ðò-ÿA-Z]/;
const flags: string   = 'mg';
const regExp: RegExp  = new RegExp(pattern, flags);

const encrypt = (text: string): string => {
    Object.entries(KEYS_ENCRYPT).forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[0], 'img'), keyEncrypt[1]));

    return text;
};

const decrypt = (text: string): string => {
    Object.entries(KEYS_ENCRYPT).reverse().forEach(keyEncrypt  => text = text.replace(new RegExp(keyEncrypt[1], 'img'), keyEncrypt[0]));
    
    return text;
};

const updateTextareaOutput = ($textarea: HTMLTextAreaElement,text: string): void => {
    let index: number = 0;

    const textLength: number = text.length;
    const interval: number   = 50;

    clearTextarea($textarea);

    const writeText: number = setInterval(() => {
        const char: string = text[index];

        $textarea.value += char;

        index++;

        if (index == textLength) clearInterval(writeText);
    }, interval);
};

const copyToClipboard = async (text: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error(`Failed to copy: ${error}`);
    }
};

const pasteFromClipboard = async ($textarea: HTMLTextAreaElement): Promise<void> {
    try {
        $textarea.value = await navigator.clipboard.readText();
    } catch (error) {
        console.error(`Failed to read clipboard content: ${error}`);
    }
}

const clearTextarea = ($textarea: HTMLTextAreaElement): string => $textarea.value = '';

const reset = (...$textareas: Array<HTMLTextAreaElement>): void => $textareas.forEach($textarea => clearTextarea($textarea));

const swapTextareasContent = ($textareaFrom: HTMLTextAreaElement, $textareaTo: HTMLTextAreaElement): void => {
    copyToClipboard($textareaFrom.value);
    clearTextarea($textareaFrom);
    pasteFromClipboard($textareaTo);
}

const isFirefox = (): boolean => navigator.userAgent.toLowerCase().includes('firefox');

const validateText = (text: string): boolean => {
    regExp.lastIndex = 0;

    return !regExp.test(text);
}

$inputForm.addEventListener('submit', (e: SubmitEvent): void => e.preventDefault());

$helpButton.addEventListener('click', () => console.log('Open help window'));

$encryptButton.addEventListener('click', () => {
    const text: string = encrypt($textareaInput.value);

    updateTextareaOutput($textareaOutput, text);
});

$decryptButton.addEventListener('click', () => {
    const text: string = decrypt($textareaInput.value);

    updateTextareaOutput($textareaOutput, text);
});

$pasteButton.addEventListener('click', () => pasteFromClipboard($textareaInput));
$clearButton.addEventListener('click', () => clearTextarea($textareaInput));
$swapButton.addEventListener('click', () => swapTextareasContent($textareaOutput, $textareaInput));
$resetButton.addEventListener('click', () => reset($textareaInput, $textareaOutput));

$copyButton.addEventListener('click', () => copyToClipboard($textareaOutput.value));