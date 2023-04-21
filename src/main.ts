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

// Advice
const $advice: HTMLDivElement = document.querySelector('.advice') as HTMLDivElement;

// SVG
const $animatedSVG: SVGElement = document.querySelector('.container__image') as SVGElement;
const $decorationPaths: NodeListOf<SVGPathElement> = document.querySelectorAll('.container__image--decorations path');
const $centerPaths: NodeListOf<SVGPathElement> = document.querySelectorAll('.container__image--center path');

// Enums
enum ModalType { Success, Information, Warning, Error };
enum DisplayType { None = 'none', Flex = 'flex' }

// #region INTERFACES
interface KeyEncrypt {
    readonly [key: string]: string;
}

interface Icon {
    [key: string]: HTMLSpanElement;
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
    [ModalType.Success]    : document.querySelector('.modal__icon--correct') as HTMLSpanElement,
    [ModalType.Information]: document.querySelector('.modal__icon--information') as HTMLSpanElement,
    [ModalType.Warning]    : document.querySelector('.modal__icon--warning') as HTMLSpanElement,
    [ModalType.Error]      : document.querySelector('.modal__icon--error') as HTMLSpanElement
}

// #region REGULAR EXPRESSIONS
// const pattern: RegExp = /[À-ðò-ÿA-Z]/;
const pattern: RegExp = /^[a-zñ\s]+$/;
const flags: string   = 'g';
const regExp: RegExp  = new RegExp(pattern, flags);
// #endregion

// #region GLOBAL SETTINGS
const timeout  : number = 15;
const modalLife: number = 1500;

let writeInterval : number    = 0;
let animationInterval: number = 0
let animationTimeout: number  = 0;
// #endregion

// #endregion

// #region FUNCTIONS
const encrypt = (text: string): string => {
    Object.entries(KEYS_ENCRYPT).forEach(keyEncrypt => text = text.replace(new RegExp(keyEncrypt[0], 'mg'), keyEncrypt[1]));

    return text;
};

const decrypt = (text: string): string => {
    Object.entries(KEYS_ENCRYPT).reverse().forEach(keyEncrypt  => text = text.replace(new RegExp(keyEncrypt[1], 'mg'), keyEncrypt[0]));
    
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

const changeAdviceVisibility = ($visible: boolean): void => {
    if ($visible) $advice.classList.add('visible');
    else $advice.classList.remove('visible');
}

const changeHTMLElementDisplay = ($htmlElement: HTMLElement, displayType: DisplayType): void => {
    const elementStyle = getComputedStyle($htmlElement);
    const elementDisplay = elementStyle.getPropertyValue('display');

    if (elementDisplay != displayType) {
        $htmlElement.style.setProperty('display', displayType);
        
        if ($htmlElement === $infoContainer) {
            if (displayType === DisplayType.Flex) startSVGAnimation($animatedSVG);
            else stopSVGAnimation($animatedSVG, animationTimeout, animationInterval);
        }
    }
};

const changeVisibleContainer = ($elementToShow: HTMLElement, $elementToHide: HTMLElement): void => {
    clearTextarea($textareaOutput);

    changeHTMLElementDisplay($elementToShow, DisplayType.Flex);
    changeHTMLElementDisplay($elementToHide, DisplayType.None);
}

const openModalWindow = (type: ModalType, title: string, description: string, timeout: number = modalLife): void => {
    Object.entries(MODAL_ICONS).forEach((icon: [string, HTMLSpanElement]) => {
        if (icon[0] === type.toString()) icon[1].classList.add('active');
    });

    $modalTitle.textContent       = title;
    $modalDescription.textContent = description;

    $modal.classList.remove('close');
    $modal.classList.add('open');

    setTimeout(closeModalWindow, timeout);
};

const closeModalWindow = (): void => {
    $modal.classList.remove('open');
    $modal.classList.add('close');

    setTimeout(() => {
        Object.values(MODAL_ICONS).forEach(icon => icon.classList.remove('active'));

        $modalTitle.textContent = '';
        $modalDescription.textContent = '';
    }, 550);
}

const copyToClipboard = async (text: string): Promise<void> => {
    text = text.trim();

    if (text === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
    } else {
        try {
            await navigator.clipboard.writeText(text);

            openModalWindow(ModalType.Success, 'Success', 'Text copied to clipboard.');
        } catch (error) {
            openModalWindow(ModalType.Error, 'Error', 'Failed to copy text to clipboard.');
    
            console.error(`Failed to copy text to clipboard: ${error}`);
        }
    }
};

const pasteFromClipboard = async ($textarea: HTMLTextAreaElement): Promise<void> => {
    clearInterval(writeInterval);

    try {
        $textarea.value = await navigator.clipboard.readText();

        const text: string = $textareaInput.value.trim();

        changeVisibleContainer($infoContainer, $encryptTextContainer);

        if (!validateText(text)) changeAdviceVisibility(true);
    
        openModalWindow(ModalType.Success, 'Success', 'Text pasted from clipboard.');
    } catch (error) {
        openModalWindow(ModalType.Error, 'Error', 'Failed to read clipboard content.');

        console.error(`Failed to read clipboard content: ${error}`);
    }
}

const clearTextarea = ($textarea: HTMLTextAreaElement): void => {
    clearInterval(writeInterval);

    $textarea.value = '';
    
    changeAdviceVisibility(false);
};

const reset = (...$textareas: Array<HTMLTextAreaElement>): void => {
    clearInterval(writeInterval);

    $textareas.forEach($textarea => clearTextarea($textarea));
    
    changeVisibleContainer($infoContainer, $encryptTextContainer);
    openModalWindow(ModalType.Success, 'Success', 'Text encryptor reset.');
};

const swapTextareasContent = ($textareaFrom: HTMLTextAreaElement, $textareaTo: HTMLTextAreaElement): void => {
    clearInterval(writeInterval);

    const textToMove: string = $textareaFrom.value.trim();

    if (textToMove === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
        changeVisibleContainer($infoContainer, $encryptTextContainer);
    } else {
        if (validateText(textToMove)) {
            reset($textareaFrom, $textareaTo);
            updateTextarea($textareaTo, textToMove, 5);
        } else {
            openModalWindow(ModalType.Error, 'Error', 'Your text contains symbols or especial characters.');
        }
    }
}

const isFirefox = (): boolean => navigator.userAgent.toLowerCase().includes('firefox');

const validateText = (text: string): boolean => {
    regExp.lastIndex = 0;

    return regExp.test(text);
}

const checkTextareaValue = ($textarea: HTMLTextAreaElement): void => {
    const text: string = $textarea.value.trim();

    changeVisibleContainer($infoContainer, $encryptTextContainer);

    if (text === '') {
        changeAdviceVisibility(false);
    } else {
        if (!validateText(text)) changeAdviceVisibility(true);
        else changeAdviceVisibility(false);
    }
}

const getPathsLength = ($paths: NodeListOf<SVGPathElement>): void => {
    const pathsLengt: Array<number> = [...$paths].map($path => Math.ceil($path.getTotalLength()));
    
    console.log(pathsLengt.join(' '));
};

const startSVGAnimation = ($svgImage: SVGElement): void => {
    $svgImage.classList.remove('active');
    $svgImage.classList.toggle('active');
    
    animationTimeout = setTimeout(() => $svgImage.classList.toggle('active'), 7500);
    
    animationInterval = setInterval(() => {
        $svgImage.classList.toggle('active');
        
        animationTimeout = setTimeout(() => $svgImage.classList.toggle('active'), 7500);
    }, 8000);
};

const stopSVGAnimation = ($svgImage: SVGElement, timeout: number, interval: number): void => {
    $svgImage.classList.remove('active');

    clearTimeout(timeout);
    clearInterval(interval);
}
// #endregion

// #region EVENT LISTENERS
$textareaInput.addEventListener('keyup', () => checkTextareaValue($textareaInput));
$textareaInput.addEventListener('change', () => checkTextareaValue($textareaInput));

$inputForm.addEventListener('submit', (e: SubmitEvent): void => e.preventDefault());

$modalButton.addEventListener('click', closeModalWindow);
$helpButton.addEventListener('click', () => console.log('Open help window'));

$encryptButton.addEventListener('click', () => {
    let text: string = $textareaInput.value.trim();

    if (text === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
    } else {
        if (validateText(text)) {
            changeVisibleContainer($encryptTextContainer, $infoContainer);
            updateTextarea($textareaOutput, encrypt(text));
            openModalWindow(ModalType.Success, 'Text Encrypted', 'Your text was encrypted.', 1000);
        } else {
            openModalWindow(ModalType.Error, 'Error', 'Your text contains symbols or especial characters.');
        }
    }
});

$decryptButton.addEventListener('click', () => {
    let text: string = $textareaInput.value.trim();
    
    if (text === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
    } else {
        if (validateText(text)) {
            changeVisibleContainer($encryptTextContainer, $infoContainer);
            updateTextarea($textareaOutput, decrypt(text));
            openModalWindow(ModalType.Success, 'Text Decrypted', 'Your text was decrypted.', 1000);
        } else {
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
// #endregion