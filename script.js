// Dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const darkModeKey = 'portfolio-dark-mode';

// Initialize theme on page load
function initializeTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem(darkModeKey);

    if (savedTheme !== null) {
        // Use saved preference
        if (savedTheme === 'true') {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            enableDarkMode();
        }
    }
}

function enableDarkMode() {
    htmlElement.classList.add('dark-mode');
    localStorage.setItem(darkModeKey, 'true');
}

function disableDarkMode() {
    htmlElement.classList.remove('dark-mode');
    localStorage.setItem(darkModeKey, 'false');
}

function toggleDarkMode() {
    if (htmlElement.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Event listener for toggle button
themeToggle.addEventListener('click', toggleDarkMode);

// Listen for system theme changes
if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem(darkModeKey)) {
            if (e.matches) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeTheme);
initializeTheme();


//hellog