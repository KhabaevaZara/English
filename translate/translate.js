 // База данных текстов для заданий
 const texts = [
    {
        id: 1,
        content: "Break a leg on your performance tonight! I know you've been burning the midnight oil to prepare.",
        suspicious: [
            { phrase: "Break a leg", hint: "Идиома: Пожелание удачи (дословно 'сломай ногу')" },
            { phrase: "burning the midnight oil", hint: "Идиома: Усердно работать допоздна" }
        ],
        literal: "Сломай ногу на своем выступлении сегодня вечером! Я знаю, что ты сжигал полуночное масло, чтобы подготовиться.",
        creative: "Ни пуха ни пера на выступлении сегодня! Я знаю, как усердно ты готовился по ночам."
    },
    {
        id: 2,
        content: "That new startup is really killing it! They've managed to secure some serious dough from investors.",
        suspicious: [
            { phrase: "killing it", hint: "Сленг: Достигать большого успеха" },
            { phrase: "dough", hint: "Сленг: Деньги (дословно 'тесто')" }
        ],
        literal: "Этот новый стартап действительно убивает это! Они сумели получить серьезное тесто от инвесторов.",
        creative: "Этот новый стартап действительно преуспевает! Им удалось привлечь солидные инвестиции."
    },
    {
        id: 3,
        content: "The software update was a piece of cake to install, but now my computer is on the fritz.",
        suspicious: [
            { phrase: "a piece of cake", hint: "Идиома: Очень просто, легко" },
            { phrase: "on the fritz", hint: "Идиома: Неисправен, сломан" }
        ],
        literal: "Обновление программного обеспечения было куском пирога для установки, но теперь мой компьютер на фритце.",
        creative: "Обновление ПО установилось очень легко, но теперь мой компьютер работает с перебоями."
    },
    {
        id: 4,
        content: "Don't count your chickens before they hatch. The deal isn't signed yet, so let's not jump the gun.",
        suspicious: [
            { phrase: "count your chickens before they hatch", hint: "Идиома: Строить планы до того, как что-то произошло" },
            { phrase: "jump the gun", hint: "Идиома: Действовать преждевременно" }
        ],
        literal: "Не считай своих цыплят прежде, чем они вылупились. Сделка еще не подписана, так что давайте не прыгать из пушки.",
        creative: "Не стоит строить планы заранее. Сделка еще не подписана, так что не будем торопиться."
    }
];

// Текущее состояние приложения
let currentTextIndex = 0;
let selectedAudience = null;
let currentPhase = 1;
let completedPhases = [];

// DOM элементы
const phase1 = document.getElementById('phase1');
const phase2 = document.getElementById('phase2');
const phase3 = document.getElementById('phase3');
const completionMessage = document.getElementById('completionMessage');
const sourceTextElement = document.getElementById('sourceText');
const tooltip = document.getElementById('tooltip');
const progressSteps = document.querySelectorAll('.progress-step');
const completeMissionBtn = document.getElementById('completeMission');

// Инициализация приложения
function initApp() {
    loadRandomText();
    setupEventListeners();
    setupTooltips();
    updatePhaseVisibility();
}

// Загрузка случайного текста
function loadRandomText() {
    currentTextIndex = Math.floor(Math.random() * texts.length);
    const textData = texts[currentTextIndex];
    
    // Форматируем текст с выделением подозрительных элементов
    let formattedText = textData.content;
    textData.suspicious.forEach(item => {
        const regex = new RegExp(escapeRegExp(item.phrase), 'g');
        formattedText = formattedText.replace(regex, `<span class="suspicious" data-hint="${escapeHtml(item.hint)}">${item.phrase}</span>`);
    });
    
    sourceTextElement.innerHTML = formattedText;
    
    // Сброс предыдущих значений
    document.getElementById('suspiciousElements').value = '';
    document.getElementById('literalTranslation').value = '';
    document.getElementById('creativeTranslation').value = '';
    document.getElementById('localizedTranslation').value = '';
    
    // Сброс выбора аудитории
    if (selectedAudience) {
        selectedAudience.classList.remove('selected');
        selectedAudience = null;
    }
    
    // Сброс прогресса
    currentPhase = 1;
    completedPhases = [];
    updateProgressTracker();
    updatePhaseVisibility();
    
    // Скрываем сообщение о завершении
    completionMessage.classList.add('hidden');
    completeMissionBtn.classList.add('hidden');
}

// Обновление видимости этапов
function updatePhaseVisibility() {
    // Все этапы неактивны по умолчанию
    document.querySelectorAll('.phase').forEach(phase => {
        phase.classList.remove('active', 'completed');
        phase.style.opacity = '0.5';
        phase.style.pointerEvents = 'none';
    });
    
    // Текущий этап активен
    const currentPhaseElement = document.getElementById(`phase${currentPhase}`);
    if (currentPhaseElement) {
        currentPhaseElement.classList.add('active');
        currentPhaseElement.style.opacity = '1';
        currentPhaseElement.style.pointerEvents = 'auto';
    }
    
    // Завершенные этапы помечаем
    completedPhases.forEach(phaseNum => {
        const phaseElement = document.getElementById(`phase${phaseNum}`);
        if (phaseElement) {
            phaseElement.classList.add('completed');
        }
    });
    
    // Показываем кнопку завершения миссии, если все этапы выполнены
    if (completedPhases.length === 3) {
        completeMissionBtn.classList.remove('hidden');
    } else {
        completeMissionBtn.classList.add('hidden');
    }
}

// Обновление трекера прогресса
function updateProgressTracker() {
    progressSteps.forEach(step => {
        const phaseNum = parseInt(step.getAttribute('data-phase'));
        step.classList.remove('active', 'completed');
        
        if (phaseNum === currentPhase) {
            step.classList.add('active');
        } else if (completedPhases.includes(phaseNum)) {
            step.classList.add('completed');
        }
    });
}

// Переход к следующему этапу
function goToNextPhase() {
    if (!completedPhases.includes(currentPhase)) {
        completedPhases.push(currentPhase);
    }
    
    if (currentPhase < 3) {
        currentPhase++;
        updatePhaseVisibility();
        updateProgressTracker();
        
        // Прокрутка к текущему этапу
        document.getElementById(`phase${currentPhase}`).scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Переход к конкретному этапу
function goToPhase(phaseNum) {
    // Можно переходить только к завершенным этапам или следующему после последнего завершенного
    const maxAvailablePhase = completedPhases.length > 0 ? Math.max(...completedPhases) + 1 : 1;
    
    if (phaseNum <= maxAvailablePhase && phaseNum >= 1) {
        currentPhase = phaseNum;
        updatePhaseVisibility();
        updateProgressTracker();
        
        // Прокрутка к текущему этапу
        document.getElementById(`phase${currentPhase}`).scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Проверка заполнения этапа
function validatePhase(phaseNum) {
    switch(phaseNum) {
        case 1:
            return document.getElementById('suspiciousElements').value.trim() !== '';
        case 2:
            return document.getElementById('literalTranslation').value.trim() !== '' && 
                   document.getElementById('creativeTranslation').value.trim() !== '';
        case 3:
            return document.getElementById('localizedTranslation').value.trim() !== '' && 
                   selectedAudience !== null;
        default:
            return false;
    }
}

// Экранирование для регулярных выражений
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Экранирование HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Настройка всплывающих подсказок
function setupTooltips() {
    document.querySelectorAll('.suspicious').forEach(element => {
        element.addEventListener('mouseover', function(e) {
            const hint = this.getAttribute('data-hint');
            tooltip.innerHTML = hint;
            tooltip.style.opacity = '1';
            
            // Позиционирование подсказки
            const rect = this.getBoundingClientRect();
            tooltip.style.left = (rect.left + window.scrollX) + 'px';
            tooltip.style.top = (rect.bottom + window.scrollY + 5) + 'px';
        });
        
        element.addEventListener('mouseout', function() {
            tooltip.style.opacity = '0';
        });
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Выбор аудитории
    document.querySelectorAll('.audience-option').forEach(option => {
        option.addEventListener('click', function() {
            if (selectedAudience) {
                selectedAudience.classList.remove('selected');
            }
            this.classList.add('selected');
            selectedAudience = this;
        });
    });
    
    // Завершение этапа
    document.querySelectorAll('.complete-phase').forEach(button => {
        button.addEventListener('click', function() {
            const phaseNum = parseInt(this.getAttribute('data-phase'));
            
            if (!validatePhase(phaseNum)) {
                alert('Пожалуйста, заполните все необходимые поля перед завершением этапа!');
                return;
            }
            
            goToNextPhase();
        });
    });
    
    // Завершение миссии
    document.getElementById('completeMission').addEventListener('click', () => {
        completionMessage.classList.remove('hidden');
        completionMessage.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Новая миссия
    document.getElementById('newMission').addEventListener('click', () => {
        loadRandomText();
        document.body.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Клик по шагам прогресса
    progressSteps.forEach(step => {
        step.addEventListener('click', function() {
            const phaseNum = parseInt(this.getAttribute('data-phase'));
            goToPhase(phaseNum);
        });
    });
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', initApp);