const expressionInput = document.getElementById('expressionInput');
const resultOutput = document.getElementById('resultOutput');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');

let memoryValue = 0;
const history = [];

const safeScope = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  log: (v) => Math.log10(v),
  ln: Math.log,
  PI: Math.PI,
  E: Math.E,
};

function sanitizeExpression(rawExpression) {
  return rawExpression
    .replace(/\s+/g, '')
    .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
}

function evaluateExpression(rawExpression) {
  const expression = sanitizeExpression(rawExpression);
  if (!expression) {
    return 0;
  }

  const evaluator = new Function(
    ...Object.keys(safeScope),
    `return (${expression});`
  );

  const result = evaluator(...Object.values(safeScope));
  if (!Number.isFinite(result)) {
    throw new Error('Math error');
  }

  return Number(result.toFixed(10));
}

function setResult(message, isError = false) {
  resultOutput.textContent = message;
  resultOutput.style.color = isError ? '#ff4f6d' : '';
}

function renderHistory() {
  historyList.innerHTML = '';
  if (!history.length) {
    historyList.innerHTML = '<li>No calculations yet.</li>';
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = `${entry.expression} = ${entry.result}`;
    btn.addEventListener('click', () => {
      expressionInput.value = entry.expression;
      setResult(String(entry.result));
      expressionInput.focus();
    });
    item.appendChild(btn);
    historyList.appendChild(item);
  });
}

function appendToExpression(value) {
  expressionInput.value += value;
  expressionInput.focus();
}

function calculate(storeHistory = true) {
  try {
    const expression = expressionInput.value.trim();
    const result = evaluateExpression(expression);
    setResult(String(result));

    if (storeHistory && expression) {
      history.unshift({ expression, result });
      if (history.length > 15) {
        history.pop();
      }
      renderHistory();
    }

    return result;
  } catch {
    setResult('Invalid expression', true);
    return null;
  }
}

function handleMemoryAction(action) {
  const currentResult = Number(resultOutput.textContent) || 0;

  switch (action) {
    case 'mc':
      memoryValue = 0;
      break;
    case 'mr':
      appendToExpression(String(memoryValue));
      break;
    case 'mplus':
      memoryValue += currentResult;
      break;
    case 'mminus':
      memoryValue -= currentResult;
      break;
    default:
      break;
  }
}

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    const { value, action } = button.dataset;

    if (value) {
      appendToExpression(value);
      return;
    }

    if (!action) {
      return;
    }

    if (action === 'clear') {
      expressionInput.value = '';
      setResult('0');
    } else if (action === 'delete') {
      expressionInput.value = expressionInput.value.slice(0, -1);
    } else if (action === 'equals') {
      calculate();
    } else {
      handleMemoryAction(action);
    }
  });
});

expressionInput.addEventListener('input', () => {
  calculate(false);
});

expressionInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    calculate();
  }

  if (event.key === 'Escape') {
    expressionInput.value = '';
    setResult('0');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Backspace' && document.activeElement !== expressionInput) {
    expressionInput.value = expressionInput.value.slice(0, -1);
  }
});

clearHistoryBtn.addEventListener('click', () => {
  history.length = 0;
  renderHistory();
});

themeToggle.addEventListener('click', () => {
  const darkModeEnabled = document.body.classList.toggle('dark');
  themeToggle.textContent = darkModeEnabled ? '☀️' : '🌙';
});

renderHistory();
