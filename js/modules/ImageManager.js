export class ImageManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.images = new Map();
        this.currentImageId = null;
    }
    
    async loadImage(file) {
        const imageId = this.generateId();
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = {
                id: imageId,
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl: e.target.result,
                lastModified: file.lastModified,
                metadata: null,
                timestamp: Date.now()
            };
            
            this.images.set(imageId, imageData);
            this.currentImageId = imageId;
            
            this.eventBus.emit('image:loaded', imageData);
        };
        
        reader.readAsDataURL(file);
    }
    
    getImage(imageId) {
        return this.images.get(imageId);
    }
    
    getCurrentImage() {
        return this.images.get(this.currentImageId);
    }
    
    getAllImages() {
        return Array.from(this.images.values());
    }
    
    setCurrentImage(imageId) {
        if (this.images.has(imageId)) {
            this.currentImageId = imageId;
            const imageData = this.images.get(imageId);
            this.eventBus.emit('image:selected', imageData);
            return imageData;
        }
        return null;
    }
    
    updateImageMetadata(imageId, metadata) {
        const image = this.images.get(imageId);
        if (image) {
            image.metadata = metadata;
            this.images.set(imageId, image);
        }
    }
    
    removeImage(imageId) {
        this.images.delete(imageId);
        
        if (this.currentImageId === imageId) {
            const firstImage = this.images.values().next().value;
            this.currentImageId = firstImage ? firstImage.id : null;
        }
        
        this.eventBus.emit('image:removed', imageId);
    }
    
    clearAll() {
        this.images.clear();
        this.currentImageId = null;
        this.eventBus.emit('images:cleared');
    }
    
    getImageCount() {
        return this.images.size;
    }
    
    generateId() {
        return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    getImageDimensions(imageData) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height
                });
            };
            img.src = imageData.dataUrl;
        });
    }
}