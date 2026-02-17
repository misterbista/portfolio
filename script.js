
const SESSION_KEY = 'portfolio-loaded';
const TYPING_SPEED_MIN = 8;
const TYPING_SPEED_VARIANCE = 4;
const COMMAND_DELAY = 100;
const LINE_DELAY = 200;
const LOADING_SEQUENCE_DELAY = 200;
const LOADING_DOTS_INTERVAL = 300;
const LOADING_DURATION = 1500;
const FINAL_MESSAGE_DELAY = 800;
const HIDE_LOADING_DELAY = 500;
const SCROLL_INDICATOR_TIMEOUT = 1500;
const BLINK_DURATION = 150;
const BLINK_DELAY_MIN = 3000;
const BLINK_DELAY_MAX = 8000;
const PUPIL_RESET_DELAY = 500;

// Immediate check to hide loading screen on refresh to prevent flash
if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
}
///testing a hook

// Loading Screen
class LoadingScreenManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
    }

    hide() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 600);
        }
    }

    show() {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '1';
            this.loadingScreen.style.visibility = 'visible';
            this.loadingScreen.classList.remove('fade-out');
            sessionStorage.setItem(SESSION_KEY, 'true');
        }
    }

    isRefresh() {
        return sessionStorage.getItem(SESSION_KEY) === 'true';
    }
}

// Terminal Typing Animation
class TerminalAnimation {
    constructor(loadingManager) {
        this.terminalContent = document.querySelector('.terminal-content');
        this.loadingManager = loadingManager;
        this.steps = [
            {
                cmd: 'git clone https://github.com/misterbista/portfolio.git',
                output: [
                    { text: "Cloning into 'portfolio'...", cls: 'dim', delay: 350 },
                    { text: 'remote: Enumerating objects: 47, done.', cls: 'dim', delay: 160 },
                    { text: 'remote: Counting objects: 100% (47/47), done.', cls: 'dim', delay: 120 },
                    { text: 'remote: Compressing objects: 100% (31/31), done.', cls: 'dim', delay: 200 },
                    { text: 'Receiving objects: 100% (47/47), 18.4 KiB | 3.2 MiB/s, done.', cls: 'dim', delay: 480 },
                    { text: 'Resolving deltas: 100% (12/12), done.', cls: 'dim', delay: 220 },
                ],
            },
            {
                cmd: 'cd portfolio',
                output: [],
                changeDir: true,
            },
            {
                cmd: 'npm i && npm run dev',
                output: [
                    { text: 'detected 3 file in 0.2s', cls: 'success', delay: 1100 },
                    { text: '', cls: 'blank', delay: 80 },
                    { text: '  VITE v5.4.2  ready in 287 ms', cls: 'vite', delay: 220 },
                    { text: '', cls: 'blank', delay: 50 },
                    { text: '  ➜  Remote:  https://piyushrajbista.com.np', cls: 'url', delay: 130 },
                    
                ],
            },
        ];
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

    typeCommand(command, onComplete) {
        const line = this.terminalContent.lastElementChild;
        const textSpan = line.querySelector('.terminal-text');
        let i = 0;
        const type = () => {
            if (i < command.length) {
                textSpan.textContent += command[i++];
                setTimeout(type, TYPING_SPEED_MIN + Math.random() * TYPING_SPEED_VARIANCE);
            } else {
                setTimeout(onComplete, COMMAND_DELAY);
            }
        };
        setTimeout(type, 30);
    }

    showOutputLines(lines, index, onAllDone) {
        if (index >= lines.length) { onAllDone(); return; }
        const { text, cls = '', delay = 80 } = lines[index];
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = `terminal-line ${cls}`;
            line.textContent = text;
            this.terminalContent.appendChild(line);
            this.showOutputLines(lines, index + 1, onAllDone);
        }, delay);
    }

    processStep() {
        if (this.stepIndex >= this.steps.length) {
            setTimeout(() => this.loadingManager.hide(), 800);
            return;
        }
        const step = this.steps[this.stepIndex];
        this.typeCommand(step.cmd, () => {
            const currentLine = this.terminalContent.lastElementChild;
            currentLine.innerHTML = `${this.getPromptHTML()}${step.cmd}`;

            if (step.changeDir) {
                this.inGitRepo = true;
                this.currentDir = '~/portfolio';
            }

            this.stepIndex++;

            this.showOutputLines(step.output, 0, () => {
                if (this.stepIndex < this.steps.length) {
                    setTimeout(() => {
                        this.terminalContent.appendChild(this.createPromptLine());
                        setTimeout(() => this.processStep(), LINE_DELAY);
                    }, 200);
                } else {
                    setTimeout(() => this.loadingManager.hide(), 800);
                }
            });
        });
    }

    start() {
        this.terminalContent.innerHTML = '';
        this.stepIndex = 0;
        this.inGitRepo = false;
        this.currentDir = '~';
        this.terminalContent.appendChild(this.createPromptLine());
        this.processStep();
    }
}

// Custom Scroll Indicator
class ScrollIndicator {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        if (this.sections.length > 0) {
            this.init();
        }
    }

    init() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'scroll-indicator';
        document.body.appendChild(this.indicator);

        this.dots = Array.from(this.sections).map((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'scroll-dot';
            dot.onclick = () => section.scrollIntoView({ behavior: 'smooth' });
            this.indicator.appendChild(dot);
            return dot;
        });

        this.timeout = null;
        window.addEventListener('scroll', () => this.updateIndicator());
        this.updateIndicator();

        // Update position on resize to handle mobile viewport changes
        this.updatePosition = () => {
            const centerY = window.innerHeight / 2;
            this.indicator.style.top = centerY + 'px';
            this.indicator.style.transform = 'translateY(-50%)';
        };
        this.updatePosition();
        window.addEventListener('resize', this.updatePosition);
    }

    updateIndicator() {
        this.indicator.classList.add('visible');
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.indicator.classList.remove('visible'), SCROLL_INDICATOR_TIMEOUT);

        const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
        let current = isBottom ? this.sections.length - 1 : 0;

        if (!isBottom) {
            let minDist = Infinity;
            this.sections.forEach((section, i) => {
                const dist = Math.abs(section.getBoundingClientRect().top);
                if (dist < minDist) {
                    minDist = dist;
                    current = i;
                }
            });
        }

        this.dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }
}

// Googly Eyes
class GooglyEyes {
    constructor() {
        this.pupils = document.querySelectorAll('.pupil');
        this.eyes = document.querySelectorAll('.eye');
        if (this.pupils.length > 0 && this.eyes.length > 0) {
            this.init();
        }
    }

    init() {
        document.addEventListener('mousemove', (e) => this.trackMouse(e));
        this.scheduleBlink();
        this.eyes.forEach((eye) => {
            eye.addEventListener('click', () => this.handleEyeClick(eye));
        });
    }

    trackMouse(e) {
        this.pupils.forEach((pupil) => {
            const eye = pupil.parentElement;
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
            const maxDistance = (eyeRect.width / 2) - 7;
            const distance = Math.min(maxDistance, Math.sqrt(
                Math.pow(e.clientX - eyeCenterX, 2) + Math.pow(e.clientY - eyeCenterY, 2)
            ) * 0.25);

            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;

            pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
        });
    }

    blink() {
        this.eyes.forEach((eye) => {
            eye.classList.add('blink');
        });
        setTimeout(() => {
            this.eyes.forEach((eye) => {
                eye.classList.remove('blink');
            });
        }, BLINK_DURATION);
    }

    scheduleBlink() {
        const delay = Math.random() * (BLINK_DELAY_MAX - BLINK_DELAY_MIN) + BLINK_DELAY_MIN;
        setTimeout(() => {
            this.blink();
            this.scheduleBlink();
        }, delay);
    }

    handleEyeClick(eye) {
        eye.classList.add('blink');
        setTimeout(() => {
            eye.classList.remove('blink');
        }, BLINK_DURATION);

        const pupil = eye.querySelector('.pupil');
        pupil.style.transform = 'translate(-50%, -60%)';
        setTimeout(() => {
            pupil.style.transform = 'translate(-50%, -50%)';
        }, PUPIL_RESET_DELAY);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const loadingManager = new LoadingScreenManager();
    const terminalAnimation = new TerminalAnimation(loadingManager);
    const scrollIndicator = new ScrollIndicator();
    const googlyEyes = new GooglyEyes();

    if (loadingManager.isRefresh()) {
        loadingManager.hide();
        // Ensure terminal content is cleared on reload
        const terminalContent = document.querySelector('.terminal-content');
        if (terminalContent) terminalContent.innerHTML = '';
    } else {
        loadingManager.show();
        setTimeout(() => terminalAnimation.start(), 100);
    }
});
