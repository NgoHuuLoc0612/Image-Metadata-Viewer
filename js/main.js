import { ImageManager } from './modules/ImageManager.js';
import { UIController } from './modules/UIController.js';
import { MetadataExtractor } from './modules/MetadataExtractor.js';
import { TabManager } from './modules/TabManager.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { ExportManager } from './modules/ExportManager.js';
import { PreviewController } from './modules/PreviewController.js';
import { EventBus } from './utils/EventBus.js';
import { StorageManager } from './utils/StorageManager.js';

class App {
    constructor() {
        this.eventBus = new EventBus();
        this.storageManager = new StorageManager();
        this.imageManager = new ImageManager(this.eventBus);
        this.metadataExtractor = new MetadataExtractor(this.eventBus);
        this.uiController = new UIController(this.eventBus);
        this.tabManager = new TabManager(this.eventBus);
        this.themeManager = new ThemeManager(this.storageManager);
        this.exportManager = new ExportManager(this.eventBus);
        this.previewController = new PreviewController(this.eventBus);
        
        this.initialized = false;
    }
    
    async init() {
        try {
            await this.waitForLibraries();
            
            this.setupEventListeners();
            this.themeManager.init();
            this.uiController.init();
            this.tabManager.init();
            this.previewController.init();
            
            this.eventBus.on('image:loaded', this.handleImageLoaded.bind(this));
            this.eventBus.on('metadata:extracted', this.handleMetadataExtracted.bind(this));
            this.eventBus.on('ui:image-selected', this.handleImageSelected.bind(this));
            
            this.initialized = true;
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    async waitForLibraries() {
        const requiredLibraries = ['exifr', 'L', 'Chart', 'chroma', '_', 'moment', 'Papa'];
        const timeout = 10000;
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const allLoaded = requiredLibraries.every(lib => typeof window[lib] !== 'undefined');
            if (allLoaded) {
                console.log('All libraries loaded successfully');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const missing = requiredLibraries.filter(lib => typeof window[lib] === 'undefined');
        throw new Error(`Failed to load libraries: ${missing.join(', ')}`);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px; border-radius: 8px; z-index: 9999; max-width: 400px;';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
    
    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFileSelect(e);
        });
        
        document.getElementById('exportJsonBtn').addEventListener('click', 
            () => this.exportManager.exportAsJSON());
        document.getElementById('exportCsvBtn').addEventListener('click', 
            () => this.exportManager.exportAsCSV());
        document.getElementById('compareBtn').addEventListener('click', 
            () => this.handleCompare());
        document.getElementById('batchProcessBtn').addEventListener('click', 
            () => this.handleBatchProcess());
    }
    
    async handleFileSelect(e) {
        const files = e.target.files || e.dataTransfer.files;
        
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                await this.imageManager.loadImage(file);
            }
        }
    }
    
    async handleImageLoaded(imageData) {
        this.uiController.addImageToList(imageData);
        this.previewController.displayImage(imageData);
        this.uiController.clearMetadata();
        this.enableButtons();
        await this.metadataExtractor.extractMetadata(imageData);
    }
    
    handleMetadataExtracted(data) {
        this.uiController.displayMetadata(data);
    }
    
    handleImageSelected(imageId) {
        const imageData = this.imageManager.getImage(imageId);
        if (imageData) {
            this.uiController.clearMetadata();
            this.previewController.displayImage(imageData);
            if (imageData.metadata) {
                this.uiController.displayMetadata(imageData);
            }
        }
    }
    
    handleCompare() {
        const images = this.imageManager.getAllImages();
        if (images.length >= 2) {
            this.uiController.showCompareModal(images);
        } else {
            alert('Please load at least 2 images to compare');
        }
    }
    
    handleBatchProcess() {
        const images = this.imageManager.getAllImages();
        if (images.length > 0) {
            this.exportManager.batchExport(images);
        }
    }
    
    enableButtons() {
        document.getElementById('exportJsonBtn').disabled = false;
        document.getElementById('exportCsvBtn').disabled = false;
        document.getElementById('compareBtn').disabled = false;
        document.getElementById('batchProcessBtn').disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.app = new App();
    await window.app.init();
});