export class PreviewController {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.previewContainer = document.getElementById('imagePreview');
        this.currentImage = null;
        this.scale = 1;
        this.rotation = 0;
        this.isFullscreen = false;
    }
    
    init() {
        this.setupControls();
        this.eventBus.on('image:selected', (imageId) => {
            this.handleImageSelected(imageId);
        });
    }
    
    setupControls() {
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('rotateBtn').addEventListener('click', () => this.rotate());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
    }
    
    handleImageSelected(imageId) {
        this.eventBus.emit('image:get', imageId);
    }
    
    displayImage(imageData) {
        this.currentImage = imageData;
        this.scale = 1;
        this.rotation = 0;
        
        this.previewContainer.innerHTML = '';
        
        const img = document.createElement('img');
        img.className = 'preview-image';
        img.src = imageData.dataUrl;
        img.alt = imageData.name;
        
        this.previewContainer.appendChild(img);
        this.updateTransform();
        this.enableControls();
    }
    
    zoomIn() {
        this.scale = Math.min(this.scale + 0.1, 3);
        this.updateTransform();
    }
    
    zoomOut() {
        this.scale = Math.max(this.scale - 0.1, 0.5);
        this.updateTransform();
    }
    
    rotate() {
        this.rotation = (this.rotation + 90) % 360;
        this.updateTransform();
    }
    
    updateTransform() {
        const img = this.previewContainer.querySelector('.preview-image');
        if (img) {
            img.style.transform = `scale(${this.scale}) rotate(${this.rotation}deg)`;
        }
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (this.previewContainer.requestFullscreen) {
                this.previewContainer.requestFullscreen();
            } else if (this.previewContainer.webkitRequestFullscreen) {
                this.previewContainer.webkitRequestFullscreen();
            } else if (this.previewContainer.msRequestFullscreen) {
                this.previewContainer.msRequestFullscreen();
            }
            this.isFullscreen = true;
            document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
            document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
    
    enableControls() {
        document.getElementById('zoomInBtn').disabled = false;
        document.getElementById('zoomOutBtn').disabled = false;
        document.getElementById('rotateBtn').disabled = false;
        document.getElementById('fullscreenBtn').disabled = false;
    }
    
    reset() {
        this.scale = 1;
        this.rotation = 0;
        this.updateTransform();
    }
}