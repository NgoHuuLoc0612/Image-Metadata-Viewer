export class UIController {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.imageList = document.getElementById('imageList');
        this.currentImageId = null;
        this.histogramChart = null;
        this.currentMap = null;
    }
    
    init() {
        this.setupModals();
    }
    
    addImageToList(imageData) {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.dataset.imageId = imageData.id;
        
        const thumbnail = document.createElement('img');
        thumbnail.className = 'image-thumbnail';
        thumbnail.src = imageData.dataUrl;
        
        const info = document.createElement('div');
        info.className = 'image-info';
        
        const name = document.createElement('div');
        name.className = 'image-name';
        name.textContent = imageData.name;
        
        const size = document.createElement('div');
        size.className = 'image-size';
        size.textContent = this.formatFileSize(imageData.size);
        
        info.appendChild(name);
        info.appendChild(size);
        item.appendChild(thumbnail);
        item.appendChild(info);
        
        item.addEventListener('click', () => {
            this.selectImage(imageData.id);
        });
        
        this.imageList.appendChild(item);
        this.selectImage(imageData.id);
    }
    
    selectImage(imageId) {
        document.querySelectorAll('.image-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-image-id="${imageId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
            this.currentImageId = imageId;
            this.eventBus.emit('ui:image-selected', imageId);
        }
    }
    
    displayMetadata(imageData) {
        if (!imageData.metadata) return;
        
        this.displayEXIF(imageData.metadata.exif);
        this.displayIPTC(imageData.metadata.iptc);
        this.displayXMP(imageData.metadata.xmp);
        this.displayTechnical(imageData.metadata.technical);
        this.displayGPS(imageData.metadata.gps);
        this.displayHistogram(imageData.metadata.histogram);
        this.displayColorAnalysis(imageData.metadata.color);
        this.displayRawData(imageData.metadata.raw);
    }
    
    clearMetadata() {
        const containers = [
            'exifData', 'iptcData', 'xmpData', 'technicalData', 
            'gpsData', 'colorData', 'rawData'
        ];
        
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <p class="loading-text">Extracting metadata...</p>
                    </div>
                `;
            }
        });
        
        const histogramCanvas = document.getElementById('histogramCanvas');
        if (histogramCanvas) {
            const ctx = histogramCanvas.getContext('2d');
            ctx.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);
        }
        
        if (this.histogramChart) {
            this.histogramChart.destroy();
            this.histogramChart = null;
        }
        
        if (this.currentMap) {
            this.currentMap.remove();
            this.currentMap = null;
        }
        
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading map...</p>
                </div>
            `;
        }
    }
    
    displayEXIF(exifData) {
        const container = document.getElementById('exifData');
        container.innerHTML = '';
        
        const groups = {
            'Camera Information': ['Make', 'Model', 'LensModel', 'LensMake'],
            'Exposure Settings': ['ExposureTime', 'FNumber', 'ISO', 'ExposureMode', 'ExposureProgram'],
            'Flash': ['Flash', 'FlashMode'],
            'White Balance': ['WhiteBalance', 'ColorSpace'],
            'Date & Time': ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
            'Image Settings': ['Orientation', 'XResolution', 'YResolution', 'ResolutionUnit'],
            'Other': ['Software', 'Artist', 'Copyright']
        };
        
        for (const [groupName, fields] of Object.entries(groups)) {
            const groupData = {};
            fields.forEach(field => {
                if (exifData[field] !== undefined && exifData[field] !== null) {
                    groupData[field] = exifData[field];
                }
            });
            
            if (Object.keys(groupData).length > 0) {
                const group = this.createMetadataGroup(groupName, groupData);
                group.classList.add('fade-in');
                container.appendChild(group);
            }
        }
        
        if (container.children.length === 0) {
            container.innerHTML = '<div class="empty-state fade-in"><i class="fas fa-info-circle"></i><p>No EXIF data available</p></div>';
        }
    }
    
    displayIPTC(iptcData) {
        const container = document.getElementById('iptcData');
        container.innerHTML = '';
        
        if (Object.keys(iptcData).length > 0) {
            container.appendChild(this.createMetadataGroup('IPTC Information', iptcData));
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle"></i><p>No IPTC data available</p></div>';
        }
    }
    
    displayXMP(xmpData) {
        const container = document.getElementById('xmpData');
        container.innerHTML = '';
        
        if (Object.keys(xmpData).length > 0) {
            container.appendChild(this.createMetadataGroup('XMP Information', xmpData));
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle"></i><p>No XMP data available</p></div>';
        }
    }
    
    displayTechnical(technicalData) {
        const container = document.getElementById('technicalData');
        container.innerHTML = '';
        
        if (technicalData) {
            container.appendChild(this.createMetadataGroup('Technical Information', technicalData));
        }
    }
    
    displayGPS(gpsData) {
        const container = document.getElementById('gpsData');
        
        if (gpsData.hasLocation) {
            this.renderMap(gpsData.latitude, gpsData.longitude);
            
            const info = document.createElement('div');
            info.className = 'metadata-content mt-md';
            info.appendChild(this.createMetadataGroup('GPS Coordinates', {
                'Latitude': gpsData.latitude.toFixed(6),
                'Longitude': gpsData.longitude.toFixed(6),
                'Altitude': gpsData.altitude ? `${gpsData.altitude}m` : 'N/A',
                'Location': `${gpsData.latitude.toFixed(4)}, ${gpsData.longitude.toFixed(4)}`
            }));
            
            container.appendChild(info);
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-map-marker-alt"></i><p>No GPS data available</p></div>';
        }
    }
    
    renderMap(lat, lng) {
        const mapContainer = document.getElementById('mapContainer');
        mapContainer.innerHTML = '';
        
        if (this.currentMap) {
            this.currentMap.remove();
            this.currentMap = null;
        }
        
        try {
            this.currentMap = L.map(mapContainer).setView([lat, lng], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.currentMap);
            
            L.marker([lat, lng]).addTo(this.currentMap)
                .bindPopup(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                .openPopup();
        } catch (error) {
            console.error('Error rendering map:', error);
            mapContainer.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load map</p></div>';
        }
    }
    
    displayHistogram(histogramData) {
        const canvas = document.getElementById('histogramCanvas');
        const ctx = canvas.getContext('2d');
        
        if (this.histogramChart) {
            this.histogramChart.destroy();
            this.histogramChart = null;
        }
        
        if (histogramData) {
            this.histogramChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 256}, (_, i) => i),
                    datasets: [
                        {
                            label: 'Red',
                            data: histogramData.red,
                            borderColor: 'rgba(255, 99, 132, 0.8)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            borderWidth: 1,
                            fill: true,
                            pointRadius: 0
                        },
                        {
                            label: 'Green',
                            data: histogramData.green,
                            borderColor: 'rgba(75, 192, 192, 0.8)',
                            backgroundColor: 'rgba(75, 192, 192, 0.1)',
                            borderWidth: 1,
                            fill: true,
                            pointRadius: 0
                        },
                        {
                            label: 'Blue',
                            data: histogramData.blue,
                            borderColor: 'rgba(54, 162, 235, 0.8)',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            borderWidth: 1,
                            fill: true,
                            pointRadius: 0
                        },
                        {
                            label: 'Luminosity',
                            data: histogramData.luminosity,
                            borderColor: 'rgba(128, 128, 128, 0.8)',
                            backgroundColor: 'rgba(128, 128, 128, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { display: false },
                        y: { display: true }
                    },
                    plugins: {
                        legend: { display: true, position: 'top' }
                    }
                }
            });
        }
    }
    
    displayColorAnalysis(colorData) {
        const container = document.getElementById('colorData');
        container.innerHTML = '';
        
        if (colorData) {
            const avgColorDiv = document.createElement('div');
            avgColorDiv.className = 'metadata-group mb-lg';
            avgColorDiv.innerHTML = `
                <h4 class="metadata-group-title">Average Color</h4>
                <div style="background: ${colorData.averageColor.hex}; height: 80px; border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                    ${colorData.averageColor.hex}
                </div>
            `;
            container.appendChild(avgColorDiv);
            
            const paletteDiv = document.createElement('div');
            paletteDiv.className = 'metadata-group';
            paletteDiv.innerHTML = '<h4 class="metadata-group-title">Dominant Colors</h4>';
            
            const palette = document.createElement('div');
            palette.className = 'color-palette';
            
            colorData.dominantColors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.background = color.hex;
                swatch.textContent = `${color.hex} (${color.percentage}%)`;
                palette.appendChild(swatch);
            });
            
            paletteDiv.appendChild(palette);
            container.appendChild(paletteDiv);
            
            const statsDiv = this.createMetadataGroup('Color Statistics', {
                'Color Space': colorData.colorSpace,
                'Total Unique Colors': colorData.totalColors.toLocaleString()
            });
            container.appendChild(statsDiv);
        }
    }
    
    displayRawData(rawData) {
        const container = document.getElementById('rawData');
        container.innerHTML = '';
        
        if (rawData && Object.keys(rawData).length > 0) {
            const pre = document.createElement('pre');
            pre.style.cssText = 'background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--border-radius); overflow-x: auto; font-size: 12px; line-height: 1.5;';
            pre.textContent = JSON.stringify(rawData, null, 2);
            container.appendChild(pre);
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-database"></i><p>No raw data available</p></div>';
        }
    }
    
    createMetadataGroup(title, data) {
        const group = document.createElement('div');
        group.className = 'metadata-group';
        
        const titleEl = document.createElement('h4');
        titleEl.className = 'metadata-group-title';
        titleEl.textContent = title;
        group.appendChild(titleEl);
        
        for (const [key, value] of Object.entries(data)) {
            const item = document.createElement('div');
            item.className = 'metadata-item';
            
            const label = document.createElement('span');
            label.className = 'metadata-label';
            label.textContent = this.formatLabel(key);
            
            const valueEl = document.createElement('span');
            valueEl.className = 'metadata-value';
            valueEl.textContent = this.formatValue(value);
            
            item.appendChild(label);
            item.appendChild(valueEl);
            group.appendChild(item);
        }
        
        return group;
    }
    
    formatLabel(key) {
        return key.replace(/([A-Z])/g, ' $1').trim();
    }
    
    formatValue(value) {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'number') return value.toLocaleString();
        return String(value);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    setupModals() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    
    showCompareModal(images) {
        const modal = document.getElementById('compareModal');
        const content = document.getElementById('compareContent');
        
        content.innerHTML = '<div class="grid-2-cols gap-lg"></div>';
        const grid = content.querySelector('.grid-2-cols');
        
        images.slice(0, 2).forEach(img => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${img.dataUrl}" style="width: 100%; border-radius: var(--border-radius); margin-bottom: var(--spacing-md);">
                <h3>${img.name}</h3>
                <div class="metadata-content mt-md">
                    ${this.createComparisonData(img).outerHTML}
                </div>
            `;
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }
    
    createComparisonData(img) {
        const data = {
            'Dimensions': `${img.metadata.technical.width} × ${img.metadata.technical.height}`,
            'File Size': img.metadata.technical.fileSize,
            'Megapixels': img.metadata.technical.megapixels,
            'Aspect Ratio': img.metadata.technical.aspectRatio
        };
        
        return this.createMetadataGroup('Quick Info', data);
    }
    
    cleanup() {
        if (this.histogramChart) {
            this.histogramChart.destroy();
            this.histogramChart = null;
        }
        
        if (this.currentMap) {
            this.currentMap.remove();
            this.currentMap = null;
        }
    }
}