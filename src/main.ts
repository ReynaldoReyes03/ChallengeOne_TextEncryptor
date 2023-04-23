// #region VARIABLES DECLARATION
// #region BUTTONS
const $modalButton: HTMLButtonElement   = document.querySelector('.button--modal') as HTMLButtonElement;
const $helpButton: HTMLButtonElement    = document.querySelector('.button--help') as HTMLButtonElement;
const $closeHelp_1: HTMLButtonElement   = document.querySelector('.help-container__button') as HTMLButtonElement;
const $closeHelp_2: HTMLButtonElement   = document.querySelectorAll('.help-container__button')[1] as HTMLButtonElement;
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
const $helpContainer: HTMLDivElement        = document.querySelector('.back-filter') as HTMLDivElement;
const $helpScrollContainer: HTMLDivElement  = document.querySelector('.help') as HTMLDivElement;
const $firefoxContainer: HTMLDivElement     = document.querySelector('.firefox-info') as HTMLDivElement;
const $infoContainer: HTMLDivElement        = document.querySelector('.container__info') as HTMLDivElement;
const $encryptTextContainer: HTMLDivElement = document.querySelector('.container__encrypt-text') as HTMLDivElement;
// #endregion

// #region TEXTAREAS
const $textareaInput: HTMLTextAreaElement  = document.getElementById('textarea-box__input') as HTMLTextAreaElement;
const $textareaOutput: HTMLTextAreaElement = document.getElementById('textarea-box__text') as HTMLTextAreaElement;
// #endregion

// #region LABELS
const $labelOutput: HTMLLabelElement = document.querySelectorAll('.textarea-box__label')[1] as HTMLLabelElement;
// #endregio

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
enum CSSProperty { Display = 'display', Overflow = 'overflow' };
enum DisplayType { None = 'none', Flex = 'flex' };
enum OverflowType { Auto = 'auto', Hidden = 'hidden' };

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
// Flags
const flags: string = 'g';

// Patterns
const smallLettersPattern: RegExp      = /^[a-zñ\s]+$/;
const numbersPattern: RegExp           = /[0-9]/;
const capitalLettersPattern: RegExp    = /[A-ZÑ]/;
const accentedLettersPattern: RegExp   = /[À-ðò-ÿ]/;
const specialCharactersPattern: RegExp = /[!-/:-@[-`{-¿]/;

// Declarations
const smallLettersRegExp: RegExp      = new RegExp(smallLettersPattern, flags);
const numberRegExp: RegExp            = new RegExp(numbersPattern, flags);
const capitalLettersRegExp: RegExp    = new RegExp(capitalLettersPattern, flags);
const accentedLettersRegExp: RegExp   = new RegExp(accentedLettersPattern, flags);
const specialCharactersRegExp: RegExp = new RegExp(specialCharactersPattern, flags);
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

const updateLabelText = ($label: HTMLLabelElement, $text: string): void => {
    $label.textContent = $text;
};

const changeAdviceVisibility = ($visible: boolean): void => {
    if ($visible) $advice.classList.add('visible');
    else $advice.classList.remove('visible');
}

const changeHTMLElementDisplay = ($htmlElement: HTMLElement, displayType: DisplayType): void => {
    const elementStyle = getComputedStyle($htmlElement);
    const elementDisplay = elementStyle.getPropertyValue(CSSProperty.Display);

    if (elementDisplay != displayType) {
        $htmlElement.style.setProperty(CSSProperty.Display, displayType);
        
        if ($htmlElement === $infoContainer) {
            if (displayType === DisplayType.Flex) {
                startSVGAnimation($animatedSVG);
                updateLabelText($labelOutput, '');
            } else stopSVGAnimation($animatedSVG, animationTimeout, animationInterval);
        }
    }
};

const changeHelpContainerVisibility = ($visible: boolean): void => {
    if ($visible) {
        document.body.style.setProperty(CSSProperty.Overflow, OverflowType.Hidden);
        
        $helpScrollContainer.scrollTop = 0;
        $helpContainer.classList.remove('close');
        $helpContainer.classList.add('open');
    } else {
        setTimeout(() => {
            document.body.style.setProperty(CSSProperty.Overflow, OverflowType.Auto);
        }, 500);

        $helpContainer.classList.remove('open');
        $helpContainer.classList.add('close');
    }
}

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
    }, 300);
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
    openModalWindow(ModalType.Success, 'Success', 'The Text Encryptor was restored.');
};

const swapTextareasContent = ($textareaFrom: HTMLTextAreaElement, $textareaTo: HTMLTextAreaElement): void => {
    clearInterval(writeInterval);

    const textToMove: string = $textareaFrom.value.trim();

    if (textToMove === '') {
        openModalWindow(ModalType.Warning, 'Error', 'There is no text to swap.');
        changeVisibleContainer($infoContainer, $encryptTextContainer);
    } else {
        if (validateText(textToMove)) {
            reset($textareaFrom, $textareaTo);
            updateTextarea($textareaTo, textToMove, 5);
        } else {
            const message = generateInvalidCharacterMessage(textToMove);

            openModalWindow(ModalType.Warning, 'Error', message, 2500);
        }
    }
}

const isFirefox = (): boolean => navigator.userAgent.toLowerCase().includes('firefox');

const checkUserAgent = (): void => {
    if (!isFirefox()) $helpContainer.querySelector('.help div')?.removeChild($firefoxContainer);
}

const validateText = (text: string): boolean => {
    smallLettersRegExp.lastIndex = 0;

    return smallLettersRegExp.test(text);
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

$helpButton.addEventListener('click', () => changeHelpContainerVisibility(true));

$closeHelp_1.addEventListener('click', () => changeHelpContainerVisibility(false));
$closeHelp_2.addEventListener('click', () => changeHelpContainerVisibility(false));

const generateInvalidCharacterMessage = (textToValidate: string): string => {
    let message: string       = 'Your text contains ';
    let errors: Array<string> = [];
    
    numberRegExp.lastIndex            = 0;
    capitalLettersRegExp.lastIndex    = 0;
    accentedLettersRegExp.lastIndex   = 0;
    specialCharactersRegExp.lastIndex = 0;
    
    if (numberRegExp.test(textToValidate)) errors.push('numbers');
    if (capitalLettersRegExp.test(textToValidate)) errors.push('capital letters');
    if (accentedLettersRegExp.test(textToValidate)) errors.push('accented letters');
    if (specialCharactersRegExp.test(textToValidate)) errors.push('special characters');
    
    if (errors.length < 1) {
        message += 'some special character.';
    } else if (errors.length > 1) {
        for (let i: number = 0; i < errors.length - 1; i++) {
            message += errors[i];

            if (i < errors.length - 2) message += ', ';
        }
        
        message += ` and ${errors[errors.length - 1]}.`;
    } else {
        message += `${errors[0]}.`;
    }

    return message;
}

$encryptButton.addEventListener('click', () => {
    let text: string = $textareaInput.value.trim();

    if (text === '') {
        openModalWindow(ModalType.Error, 'Error', 'Your text is empty.');
    } else {
        if (validateText(text)) {
            changeVisibleContainer($encryptTextContainer, $infoContainer);
            updateTextarea($textareaOutput, encrypt(text));
            openModalWindow(ModalType.Success, 'Text Encrypted', 'Your text was encrypted.', 1000);
            updateLabelText($labelOutput, 'Encrypted text:');
        } else {
            const message = generateInvalidCharacterMessage(text);

            openModalWindow(ModalType.Error, 'Error', message, 2500);
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
            updateLabelText($labelOutput, 'Decrypted text:');
        } else {
            const message = generateInvalidCharacterMessage(text);

            openModalWindow(ModalType.Error, 'Error', message, 2500);
        }
    }
});

$pasteButton.addEventListener('click', () => {
    pasteFromClipboard($textareaInput);
});

$clearButton.addEventListener('click', () => {
    clearTextarea($textareaInput);
    changeVisibleContainer($infoContainer, $encryptTextContainer);
    openModalWindow(ModalType.Success, 'Success', 'The text area has been cleared.');
});

$swapButton.addEventListener('click', () => swapTextareasContent($textareaOutput, $textareaInput));
$resetButton.addEventListener('click', () => reset($textareaInput, $textareaOutput));

$copyButton.addEventListener('click', () => copyToClipboard($textareaOutput.value));

startSVGAnimation($animatedSVG);
checkUserAgent();
// #endregion