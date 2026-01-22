export class MetadataExtractor {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    
    async extractMetadata(imageData) {
        try {
            const exifData = await this.extractEXIF(imageData.file);
            const technicalData = await this.extractTechnicalData(imageData);
            const colorData = await this.extractColorData(imageData.dataUrl);
            
            const metadata = {
                exif: exifData,
                iptc: this.extractIPTC(exifData),
                xmp: this.extractXMP(exifData),
                technical: technicalData,
                gps: this.extractGPS(exifData),
                color: colorData,
                histogram: await this.generateHistogram(imageData.dataUrl),
                raw: exifData
            };
            
            imageData.metadata = metadata;
            
            this.eventBus.emit('metadata:extracted', imageData);
            
            return metadata;
        } catch (error) {
            console.error('Error extracting metadata:', error);
            return null;
        }
    }
    
    async extractEXIF(file) {
        try {
            if (typeof exifr === 'undefined') {
                console.warn('exifr library not loaded yet, waiting...');
                await this.waitForLibrary('exifr');
            }
            
            const exif = await exifr.parse(file, {
                exif: true,
                gps: true,
                iptc: true,
                xmp: true,
                icc: true,
                jfif: true,
                ihdr: true,
                makerNote: true,
                userComment: true
            });
            
            return exif || {};
        } catch (error) {
            console.error('EXIF extraction error:', error);
            return {};
        }
    }
    
    waitForLibrary(libraryName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (typeof window[libraryName] !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`${libraryName} library failed to load`));
                }
            }, 100);
        });
    }
    
    extractIPTC(exifData) {
        const iptcFields = [
            'ObjectName', 'Caption', 'Writer', 'Headline', 'Instructions',
            'Creator', 'Credit', 'Source', 'Copyright', 'City', 'State',
            'Country', 'Category', 'Keywords'
        ];
        
        const iptc = {};
        
        iptcFields.forEach(field => {
            if (exifData[field]) {
                iptc[field] = exifData[field];
            }
        });
        
        return iptc;
    }
    
    extractXMP(exifData) {
        const xmpFields = [
            'Rating', 'Label', 'Title', 'Description', 'Subject',
            'CreatorTool', 'CreateDate', 'ModifyDate', 'Format',
            'DocumentID', 'InstanceID', 'OriginalDocumentID'
        ];
        
        const xmp = {};
        
        xmpFields.forEach(field => {
            if (exifData[field]) {
                xmp[field] = exifData[field];
            }
        });
        
        return xmp;
    }
    
    async extractTechnicalData(imageData) {
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = () => {
                const technical = {
                    fileName: imageData.name,
                    fileSize: this.formatBytes(imageData.size),
                    fileType: imageData.type,
                    width: img.width,
                    height: img.height,
                    aspectRatio: (img.width / img.height).toFixed(2),
                    megapixels: ((img.width * img.height) / 1000000).toFixed(2),
                    colorDepth: '24-bit (assumed)',
                    compression: this.getCompressionType(imageData.type),
                    lastModified: new Date(imageData.lastModified).toLocaleString()
                };
                
                resolve(technical);
            };
            
            img.src = imageData.dataUrl;
        });
    }
    
    extractGPS(exifData) {
        const gps = {};
        
        if (exifData.latitude && exifData.longitude) {
            gps.latitude = exifData.latitude;
            gps.longitude = exifData.longitude;
            gps.altitude = exifData.GPSAltitude || null;
            gps.altitudeRef = exifData.GPSAltitudeRef || null;
            gps.timestamp = exifData.GPSDateStamp || null;
            gps.hasLocation = true;
        } else {
            gps.hasLocation = false;
        }
        
        return gps;
    }
    
    async extractColorData(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                
                const colorMap = new Map();
                const sampleRate = Math.max(1, Math.floor(pixels.length / (4 * 10000)));
                
                for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const key = `${r},${g},${b}`;
                    
                    colorMap.set(key, (colorMap.get(key) || 0) + 1);
                }
                
                const sortedColors = Array.from(colorMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                
                const dominantColors = sortedColors.map(([color, count]) => {
                    const [r, g, b] = color.split(',').map(Number);
                    return {
                        rgb: `rgb(${r}, ${g}, ${b})`,
                        hex: this.rgbToHex(r, g, b),
                        percentage: ((count / (pixels.length / 4)) * 100).toFixed(2)
                    };
                });
                
                const avgColor = this.calculateAverageColor(pixels);
                
                resolve({
                    dominantColors,
                    averageColor: avgColor,
                    colorSpace: 'RGB',
                    totalColors: colorMap.size
                });
            };
            
            img.src = dataUrl;
        });
    }
    
    async generateHistogram(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                
                const red = new Array(256).fill(0);
                const green = new Array(256).fill(0);
                const blue = new Array(256).fill(0);
                const luminosity = new Array(256).fill(0);
                
                for (let i = 0; i < pixels.length; i += 4) {
                    red[pixels[i]]++;
                    green[pixels[i + 1]]++;
                    blue[pixels[i + 2]]++;
                    
                    const lum = Math.round(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
                    luminosity[lum]++;
                }
                
                resolve({ red, green, blue, luminosity });
            };
            
            img.src = dataUrl;
        });
    }
    
    calculateAverageColor(pixels) {
        let r = 0, g = 0, b = 0;
        const count = pixels.length / 4;
        
        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
        }
        
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        
        return {
            rgb: `rgb(${r}, ${g}, ${b})`,
            hex: this.rgbToHex(r, g, b)
        };
    }
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    getCompressionType(mimeType) {
        const compressionMap = {
            'image/jpeg': 'JPEG (Lossy)',
            'image/png': 'PNG (Lossless)',
            'image/gif': 'GIF (Lossless)',
            'image/webp': 'WebP',
            'image/bmp': 'BMP (Uncompressed)',
            'image/tiff': 'TIFF'
        };
        
        return compressionMap[mimeType] || 'Unknown';
    }
}