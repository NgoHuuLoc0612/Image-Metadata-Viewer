export class ThemeManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentTheme = 'light';
        this.themeToggleBtn = null;
    }
    
    init() {
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.loadTheme();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.themeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    loadTheme() {
        const savedTheme = this.storageManager.get('theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        const icon = this.themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        this.storageManager.set('theme', theme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
    
    getTheme() {
        return this.currentTheme;
    }
}