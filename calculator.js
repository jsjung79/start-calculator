class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.history = [];
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        computation = Math.round(computation * 10000000000) / 10000000000;
        this.addToHistory(`${prev} ${this.operation} ${current}`, computation);

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    calculatePercent() {
        if (this.currentOperand === '0' || this.currentOperand === '') return;
        const current = parseFloat(this.currentOperand);
        this.currentOperand = (current / 100).toString();
    }

    addToHistory(equation, result) {
        this.history.unshift({ equation, result });
        if (this.history.length > 20) this.history.pop();
        this.updateHistoryUI();
    }

    updateHistoryUI() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<li style="text-align:center; color:var(--text-secondary); margin-top:20px;">기록이 없습니다</li>';
            return;
        }

        this.history.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add('history-item');
            li.innerHTML = `
                <div class="history-equation">${item.equation} =</div>
                <div class="history-result">${this.getDisplayNumber(item.result.toString())}</div>
            `;
            li.addEventListener('click', () => {
                this.currentOperand = item.result.toString();
                this.previousOperand = '';
                this.operation = undefined;
                this.shouldResetScreen = true;
                this.updateDisplay();
            });
            historyList.appendChild(li);
        });
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryUI();
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
}

// Initialization
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-action="equals"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const percentButton = document.querySelector('[data-action="percent"]');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);
calculator.updateHistoryUI();

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

clearButton.addEventListener('click', button => {
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
    calculator.updateDisplay();
});

percentButton.addEventListener('click', button => {
    calculator.calculatePercent();
    calculator.updateDisplay();
});

document.addEventListener('keydown', e => {
    if (document.getElementById('split-panel').classList.contains('active')) return;

    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        let op = e.key;
        if (op === '*') op = '×';
        if (op === '/') op = '÷';
        if (op === '-') op = '−';
        calculator.chooseOperation(op);
        calculator.updateDisplay();
    }
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
});

// Theme Toggle
const themeToggleBtn = document.querySelector('.theme-toggle');
let isDarkTheme = false;

themeToggleBtn.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="ph ph-sun"></i>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '<i class="ph ph-moon"></i>';
    }
});

// History Panel Toggle
const historyToggleBtn = document.querySelector('.history-toggle');
const historyPanel = document.getElementById('history-panel');
const closeHistoryBtn = document.querySelector('.close-history');
const clearHistoryBtn = document.getElementById('clear-history-btn');

historyToggleBtn.addEventListener('click', () => {
    historyPanel.classList.toggle('active');
    document.getElementById('split-panel').classList.remove('active');
});

closeHistoryBtn.addEventListener('click', () => {
    historyPanel.classList.remove('active');
});

clearHistoryBtn.addEventListener('click', () => {
    calculator.clearHistory();
});

// Split Bill Logic
const splitToggleBtn = document.querySelector('.split-toggle');
const splitPanel = document.getElementById('split-panel');
const closeSplitBtn = document.querySelector('.close-split');

const splitTotalInput = document.getElementById('split-total');
const splitPeopleInput = document.getElementById('split-people');
const splitMinusBtn = document.getElementById('split-minus');
const splitPlusBtn = document.getElementById('split-plus');
const splitResultElement = document.getElementById('split-result');
const splitCopyBtn = document.getElementById('split-copy');

function calculateSplit() {
    const total = parseFloat(splitTotalInput.value) || 0;
    const people = parseInt(splitPeopleInput.value) || 1;
    
    if (people < 1) {
        splitPeopleInput.value = 1;
    }

    // Amount per person (rounded up to nearest 10 won for convenience in KRW)
    let amountPerPerson = total / people;
    amountPerPerson = Math.ceil(amountPerPerson / 10) * 10;
    
    splitResultElement.innerText = amountPerPerson.toLocaleString();
}

splitToggleBtn.addEventListener('click', () => {
    splitPanel.classList.add('active');
    historyPanel.classList.remove('active');
    
    // Auto populate total from current calculator display
    let currentCalcVal = parseFloat(calculator.currentOperand);
    if (!isNaN(currentCalcVal) && currentCalcVal > 0) {
        splitTotalInput.value = currentCalcVal;
    }
    calculateSplit();
});

closeSplitBtn.addEventListener('click', () => {
    splitPanel.classList.remove('active');
});

splitTotalInput.addEventListener('input', calculateSplit);
splitPeopleInput.addEventListener('input', calculateSplit);

splitMinusBtn.addEventListener('click', () => {
    let current = parseInt(splitPeopleInput.value) || 1;
    if (current > 1) {
        splitPeopleInput.value = current - 1;
        calculateSplit();
    }
});

splitPlusBtn.addEventListener('click', () => {
    let current = parseInt(splitPeopleInput.value) || 1;
    splitPeopleInput.value = current + 1;
    calculateSplit();
});

splitCopyBtn.addEventListener('click', () => {
    const total = parseInt(splitTotalInput.value).toLocaleString();
    const people = splitPeopleInput.value;
    const perPerson = splitResultElement.innerText;
    
    const textToCopy = `총 결제 금액 ${total}원을 ${people}명이 나누어 1인당 ${perPerson}원씩입니다.`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = splitCopyBtn.innerHTML;
        splitCopyBtn.innerHTML = '<i class="ph ph-check"></i> 복사 완료!';
        splitCopyBtn.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            splitCopyBtn.innerHTML = originalText;
            splitCopyBtn.style.backgroundColor = '';
        }, 2000);
    });
});
