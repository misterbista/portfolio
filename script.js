const SESSION_KEY = 'portfolio-loaded';

const TIMING = Object.freeze({
    typingFast: 5,
    typingMedium: 14,
    typingSlow: 28,
    typingVariance: 6,
    commandDelay: 100,
    lineDelay: 200,
    thinkPauseMin: 400,
    thinkPauseMax: 700,
    typoPause: 300,
    backspaceSpeed: 60,
    tabCompletePause: 180,
    scrollIndicatorTimeout: 1500,
    blinkDuration: 150,
    blinkDelayMin: 3000,
    blinkDelayMax: 8000,
    pupilResetDelay: 500,
    spinnerInterval: 80,
    loadingFadeDuration: 600,
    progressFinalizeDelay: 120,
    progressStartDelay: 100,
    typeStartDelay: 30,
    typoCorrectionDelay: 150,
    loadingHideDelayAfterAnimation: 800,
    animationStartDelay: 100,
});

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const TERMINAL_STEPS = Object.freeze([
    {
        cmd: 'git clone https://github.com/misterbista/portfolio.git',
        typo: {
            wrongText: 'git clone https://github.com/misterbitsa',
            deleteCount: 5,
            correction: 'bista/portfolio.git',
        },
        output: [
            { text: "Cloning into 'portfolio'...", cls: 'dim', delay: 350 },
            { text: 'remote: Enumerating objects: 47, done.', cls: 'dim', delay: 160 },
            { text: 'remote: Counting objects: 100% (47/47), done.', cls: 'dim', delay: 120 },
            { text: 'remote: Compressing objects: 100% (31/31), done.', cls: 'dim', delay: 200 },
            { type: 'progress', text: 'Receiving objects:', total: 47, speed: 30, cls: 'dim' },
            { text: 'Resolving deltas: 100% (12/12), done.', cls: 'dim', delay: 220 },
        ],
    },
    {
        cmd: 'cd portfolio',
        tabComplete: { typed: 'cd por', completed: 'tfolio' },
        output: [],
        changeDir: true,
    },
    {
        cmd: 'npm i && npm run dev',
        output: [
            { type: 'spinner', text: 'installing dependencies...', duration: 1400, cls: 'dim' },
            { text: 'added 187 packages in 2.1s', cls: 'success', delay: 200 },
            { text: '', cls: 'blank', delay: 80 },
            { text: '  VITE v5.4.2  ready in 287 ms', cls: 'vite', delay: 220 },
            { text: '', cls: 'blank', delay: 50 },
            { text: '  ➜  Remote:  https://piyushrajbista.com.np', cls: 'url', delay: 130 },
        ],
    },
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomBetween = (min, max) => min + Math.random() * (max - min);
const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));
const isSessionLoaded = () => sessionStorage.getItem(SESSION_KEY) === 'true';
const markSessionLoaded = () => sessionStorage.setItem(SESSION_KEY, 'true');

// Prevent loading-screen flash on refresh.
if (isSessionLoaded()) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
}

class LoadingScreenManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
    }

    hide({ immediate = false } = {}) {
        if (!this.loadingScreen) return;

        if (immediate) {
            this.loadingScreen.classList.remove('fade-out');
            this.loadingScreen.style.display = 'none';
            return;
        }

        this.loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, TIMING.loadingFadeDuration);
    }

    show() {
        if (!this.loadingScreen) return;

        this.loadingScreen.style.opacity = '1';
        this.loadingScreen.style.visibility = 'visible';
        this.loadingScreen.style.display = '';
        this.loadingScreen.classList.remove('fade-out');
        markSessionLoaded();
    }

    isRefresh() {
        return isSessionLoaded();
    }
}

class TerminalAnimation {
    constructor(loadingManager) {
        this.terminalContent = document.querySelector('.terminal-content');
        this.loadingManager = loadingManager;
        this.steps = TERMINAL_STEPS;
        this.reset();
    }

    reset() {
        this.stepIndex = 0;
        this.inGitRepo = false;
        this.currentDir = '~';
    }

    getPromptHTML() {
        const gitPart = this.inGitRepo ? ' <span class="prompt-git">(main)</span>' : '';
        return `<span class="prompt-user">user@dev</span> <span class="prompt-dir">${this.currentDir}</span>${gitPart} $ `;
    }

    createPromptLine() {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `${this.getPromptHTML()}<span class="terminal-text"></span><span class="cursor">|</span>`;
        return line;
    }

    appendPromptLine() {
        if (!this.terminalContent) return null;
        const line = this.createPromptLine();
        this.terminalContent.appendChild(line);
        return line;
    }

    getCurrentTextSpan() {
        const line = this.terminalContent?.lastElementChild;
        if (!line) return null;
        return line.querySelector('.terminal-text');
    }

    getTypingDelay(char, context) {
        if (char === ' ') return TIMING.typingMedium + Math.random() * 40;
        if ('/:@.'.includes(char) && context === 'url') {
            return TIMING.typingSlow + Math.random() * TIMING.typingVariance;
        }
        if (context === 'command') return TIMING.typingFast + Math.random() * 3;
        return TIMING.typingMedium + Math.random() * TIMING.typingVariance;
    }

    getCharContext(text, index) {
        if (index < 4) return 'command';
        const urlIndex = text.indexOf('://');
        if (urlIndex !== -1 && index > urlIndex) return 'url';
        return 'normal';
    }

    async typeText(textSpan, text, { contextText = text, microPause = false } = {}) {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const context = this.getCharContext(contextText, i);
            textSpan.textContent += char;

            let delay = this.getTypingDelay(char, context);
            if (microPause && Math.random() < 0.08) {
                delay += randomBetween(80, 200);
            }

            await sleep(delay);
        }
    }

    async backspace(textSpan, count) {
        for (let i = 0; i < count; i++) {
            textSpan.textContent = textSpan.textContent.slice(0, -1);
            await sleep(TIMING.backspaceSpeed + Math.random() * 30);
        }
    }

    async typeCommand(command) {
        const textSpan = this.getCurrentTextSpan();
        if (!textSpan) return;

        await sleep(TIMING.typeStartDelay);
        await this.typeText(textSpan, command, { contextText: command, microPause: true });
        await sleep(TIMING.commandDelay);
    }

    async typeWithTypo(typo) {
        const textSpan = this.getCurrentTextSpan();
        if (!textSpan) return;

        await sleep(TIMING.typeStartDelay);
        await this.typeText(textSpan, typo.wrongText, { contextText: typo.wrongText });
        await sleep(TIMING.typoPause);
        await this.backspace(textSpan, typo.deleteCount);
        await sleep(TIMING.typoCorrectionDelay);
        await this.typeText(textSpan, typo.correction);
    }

    async typeWithTabComplete(tabComplete) {
        const line = this.terminalContent?.lastElementChild;
        if (!line) return;

        const textSpan = line.querySelector('.terminal-text');
        const cursor = line.querySelector('.cursor');
        if (!textSpan) return;

        await sleep(TIMING.typeStartDelay);
        await this.typeText(textSpan, tabComplete.typed, { contextText: tabComplete.typed });
        await sleep(TIMING.tabCompletePause);

        if (cursor) cursor.classList.add('tab-flash');
        await sleep(TIMING.tabCompletePause);

        textSpan.textContent += tabComplete.completed;
        if (cursor) cursor.classList.remove('tab-flash');

        await sleep(TIMING.commandDelay);
    }

    async showProgressBar(config) {
        if (!this.terminalContent) return;

        const line = document.createElement('div');
        line.className = `terminal-line ${config.cls || ''}`;
        this.terminalContent.appendChild(line);

        const barWidth = 20;
        let current = 0;

        await sleep(TIMING.progressStartDelay);

        while (current < config.total) {
            current = Math.min(config.total, current + randomInt(1, 3));

            const filled = Math.round((current / config.total) * barWidth);
            const empty = barWidth - filled;
            const percentage = Math.round((current / config.total) * 100);
            const bar = `${'#'.repeat(filled)}${'·'.repeat(empty)}`;

            line.textContent = `${config.text} [${bar}] ${percentage}% (${current}/${config.total})`;

            if (current < config.total) {
                await sleep(config.speed + Math.random() * 40);
            }
        }

        line.textContent = `Receiving objects: 100% (${config.total}/${config.total}), 18.4 KiB | 3.2 MiB/s, done.`;
        await sleep(TIMING.progressFinalizeDelay);
    }

    async showSpinner(config) {
        if (!this.terminalContent) return;

        const line = document.createElement('div');
        line.className = `terminal-line ${config.cls || ''} spinner`;
        this.terminalContent.appendChild(line);

        let elapsed = 0;
        let frame = 0;

        while (elapsed < config.duration) {
            line.textContent = `${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} ${config.text}`;
            await sleep(TIMING.spinnerInterval);
            elapsed += TIMING.spinnerInterval;
            frame += 1;
        }

        line.remove();
    }

    appendOutputLine(text, cls = '') {
        if (!this.terminalContent) return;

        const line = document.createElement('div');
        line.className = `terminal-line ${cls}`;
        line.textContent = text;
        this.terminalContent.appendChild(line);
    }

    async showOutputLines(lines) {
        for (const item of lines) {
            if (item.type === 'progress') {
                await this.showProgressBar(item);
                continue;
            }

            if (item.type === 'spinner') {
                await this.showSpinner(item);
                continue;
            }

            const { text, cls = '', delay = 80 } = item;
            await sleep(delay);
            this.appendOutputLine(text, cls);
        }
    }

    async processStep(step) {
        if (step.typo) {
            await this.typeWithTypo(step.typo);
        } else if (step.tabComplete) {
            await this.typeWithTabComplete(step.tabComplete);
        } else {
            await this.typeCommand(step.cmd);
        }

        const currentLine = this.terminalContent?.lastElementChild;
        if (currentLine) {
            currentLine.innerHTML = `${this.getPromptHTML()}${step.cmd}`;
        }

        if (step.changeDir) {
            this.inGitRepo = true;
            this.currentDir = '~/portfolio';
        }

        await this.showOutputLines(step.output);
    }

    async start() {
        if (!this.terminalContent) return;

        this.terminalContent.innerHTML = '';
        this.reset();
        this.appendPromptLine();

        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            this.stepIndex = i;

            await this.processStep(step);

            if (i < this.steps.length - 1) {
                await sleep(randomBetween(TIMING.thinkPauseMin, TIMING.thinkPauseMax));
                this.appendPromptLine();
                await sleep(TIMING.lineDelay);
            }
        }

        await sleep(TIMING.loadingHideDelayAfterAnimation);
        this.loadingManager.hide();
    }
}

class ScrollIndicator {
    constructor() {
        this.sections = Array.from(document.querySelectorAll('.section'));
        if (!this.sections.length) return;

        this.indicator = null;
        this.dots = [];
        this.hideTimeout = null;

        this.handleScroll = this.updateIndicator.bind(this);
        this.handleResize = this.updatePosition.bind(this);

        this.init();
    }

    init() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'scroll-indicator';
        document.body.appendChild(this.indicator);

        this.dots = this.sections.map((section) => {
            const dot = document.createElement('div');
            dot.className = 'scroll-dot';
            dot.addEventListener('click', () => section.scrollIntoView({ behavior: 'smooth' }));
            this.indicator.appendChild(dot);
            return dot;
        });

        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleResize);

        this.updatePosition();
        this.updateIndicator();
    }

    updatePosition() {
        if (!this.indicator) return;
        const centerY = window.innerHeight / 2;
        this.indicator.style.top = `${centerY}px`;
        this.indicator.style.transform = 'translateY(-50%)';
    }

    getCurrentSectionIndex() {
        const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
        if (reachedBottom) return this.sections.length - 1;

        let closestIndex = 0;
        let minDistance = Infinity;

        this.sections.forEach((section, index) => {
            const distance = Math.abs(section.getBoundingClientRect().top);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    updateIndicator() {
        if (!this.indicator) return;

        this.indicator.classList.add('visible');
        clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            this.indicator.classList.remove('visible');
        }, TIMING.scrollIndicatorTimeout);

        const currentSectionIndex = this.getCurrentSectionIndex();
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSectionIndex);
        });
    }
}

class GooglyEyes {
    constructor() {
        this.pupils = Array.from(document.querySelectorAll('.pupil'));
        this.eyes = Array.from(document.querySelectorAll('.eye'));
        if (!this.pupils.length || !this.eyes.length) return;

        this.init();
    }

    init() {
        document.addEventListener('mousemove', (event) => this.trackMouse(event));
        this.scheduleBlink();

        this.eyes.forEach((eye) => {
            eye.addEventListener('click', () => this.handleEyeClick(eye));
        });
    }

    trackMouse(event) {
        this.pupils.forEach((pupil) => {
            const eye = pupil.parentElement;
            if (!eye) return;

            const eyeRect = eye.getBoundingClientRect();
            const centerX = eyeRect.left + eyeRect.width / 2;
            const centerY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
            const maxDistance = eyeRect.width / 2 - 7;
            const pointerDistance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
            const distance = Math.min(maxDistance, pointerDistance * 0.25);

            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;

            pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
        });
    }

    blink() {
        this.eyes.forEach((eye) => eye.classList.add('blink'));
        setTimeout(() => {
            this.eyes.forEach((eye) => eye.classList.remove('blink'));
        }, TIMING.blinkDuration);
    }

    scheduleBlink() {
        const delay = randomBetween(TIMING.blinkDelayMin, TIMING.blinkDelayMax);
        setTimeout(() => {
            this.blink();
            this.scheduleBlink();
        }, delay);
    }

    handleEyeClick(eye) {
        eye.classList.add('blink');
        setTimeout(() => {
            eye.classList.remove('blink');
        }, TIMING.blinkDuration);

        const pupil = eye.querySelector('.pupil');
        if (!pupil) return;

        pupil.style.transform = 'translate(-50%, -60%)';
        setTimeout(() => {
            pupil.style.transform = 'translate(-50%, -50%)';
        }, TIMING.pupilResetDelay);
    }
}

function clearTerminalOnRefresh() {
    const terminalContent = document.querySelector('.terminal-content');
    if (terminalContent) terminalContent.innerHTML = '';
}

function createScrollMoreInitializer() {
    const scrollMoreBtn = document.getElementById('scroll-more');
    if (!scrollMoreBtn) return () => {};

    let initialized = false;

    return () => {
        if (initialized) return;
        initialized = true;

        const firstSection = document.querySelector('.section');

        scrollMoreBtn.addEventListener('click', () => {
            if (firstSection) firstSection.scrollIntoView({ behavior: 'smooth' });
        });

        const updateScrollMoreVisibility = () => {
            scrollMoreBtn.classList.toggle('visible', window.scrollY < 80);
        };

        window.addEventListener('scroll', updateScrollMoreVisibility, { passive: true });
        updateScrollMoreVisibility();
    };
}

function waitForLoadingScreenToHide(loadingManager, onHidden) {
    const screen = loadingManager.loadingScreen;
    if (!screen) {
        onHidden();
        return;
    }

    const observer = new MutationObserver(() => {
        if (screen.style.display === 'none') {
            observer.disconnect();
            onHidden();
        }
    });

    observer.observe(screen, { attributes: true, attributeFilter: ['style', 'class'] });
}

document.addEventListener('DOMContentLoaded', () => {
    const loadingManager = new LoadingScreenManager();
    const terminalAnimation = new TerminalAnimation(loadingManager);
    const initScrollMore = createScrollMoreInitializer();

    new ScrollIndicator();
    new GooglyEyes();

    if (loadingManager.isRefresh()) {
        loadingManager.hide({ immediate: true });
        clearTerminalOnRefresh();
        initScrollMore();
        return;
    }

    loadingManager.show();

    setTimeout(() => {
        terminalAnimation.start();
    }, TIMING.animationStartDelay);

    waitForLoadingScreenToHide(loadingManager, initScrollMore);
});
