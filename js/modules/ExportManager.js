export class ExportManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.currentData = null;
        this.notificationManager = null;
        
        this.eventBus.on('metadata:extracted', (imageData) => {
            this.currentData = imageData;
        });
        
        if (window.app && window.app.notificationManager) {
            this.notificationManager = window.app.notificationManager;
        }
    }
    
    setNotificationManager(manager) {
        this.notificationManager = manager;
    }
    
    exportAsJSON() {
        if (!this.currentData || !this.currentData.metadata) {
            if (this.notificationManager) {
                this.notificationManager.warning('No metadata to export');
            }
            return;
        }
        
        const exportData = {
            fileName: this.currentData.name,
            fileSize: this.currentData.size,
            fileType: this.currentData.type,
            exportDate: new Date().toISOString(),
            metadata: this.prepareMetadataForExport(this.currentData.metadata)
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        this.downloadFile(blob, `${this.getBaseName(this.currentData.name)}_metadata.json`);
        
        if (this.notificationManager) {
            this.notificationManager.success('JSON exported successfully!');
        }
    }
    
    exportAsCSV() {
        if (!this.currentData || !this.currentData.metadata) {
            if (this.notificationManager) {
                this.notificationManager.warning('No metadata to export');
            }
            return;
        }
        
        const flatData = this.flattenMetadata(this.currentData.metadata);
        const csv = Papa.unparse([flatData]);
        
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadFile(blob, `${this.getBaseName(this.currentData.name)}_metadata.csv`);
        
        if (this.notificationManager) {
            this.notificationManager.success('CSV exported successfully!');
        }
    }
    
    batchExport(images) {
        const allMetadata = images.map(img => ({
            fileName: img.name,
            fileSize: img.size,
            fileType: img.type,
            ...this.flattenMetadata(img.metadata)
        }));
        
        const csv = Papa.unparse(allMetadata);
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadFile(blob, `batch_metadata_${Date.now()}.csv`);
    }
    
    prepareMetadataForExport(metadata) {
        const exportData = {};
        
        for (const [category, data] of Object.entries(metadata)) {
            if (category === 'histogram') {
                exportData[category] = {
                    hasData: true,
                    channels: ['red', 'green', 'blue', 'luminosity']
                };
            } else if (category === 'color') {
                exportData[category] = {
                    averageColor: data.averageColor,
                    dominantColors: data.dominantColors,
                    totalColors: data.totalColors
                };
            } else {
                exportData[category] = data;
            }
        }
        
        return exportData;
    }
    
    flattenMetadata(metadata) {
        const flat = {};
        
        const flatten = (obj, prefix = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const newKey = prefix ? `${prefix}_${key}` : key;
                
                if (value === null || value === undefined) {
                    flat[newKey] = '';
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    flatten(value, newKey);
                } else if (Array.isArray(value)) {
                    flat[newKey] = JSON.stringify(value);
                } else {
                    flat[newKey] = value;
                }
            }
        };
        
        if (metadata) {
            flatten(metadata);
        }
        
        return flat;
    }
    
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    getBaseName(filename) {
        return filename.replace(/\.[^/.]+$/, '');
    }
    
    exportMetadataReport(imageData) {
        const report = this.generateHTMLReport(imageData);
        const blob = new Blob([report], { type: 'text/html' });
        this.downloadFile(blob, `${this.getBaseName(imageData.name)}_report.html`);
    }
    
    generateHTMLReport(imageData) {
        const metadata = imageData.metadata;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Metadata Report - ${imageData.name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 { color: #2563eb; }
        h2 { 
            color: #475569;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 8px;
            margin-top: 30px;
        }
        .metadata-section {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background: #f8fafc;
            font-weight: 600;
        }
        .preview {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <h1>Image Metadata Report</h1>
    <div class="metadata-section">
        <h2>Image Preview</h2>
        <img src="${imageData.dataUrl}" class="preview" alt="${imageData.name}">
    </div>
    
    <div class="metadata-section">
        <h2>File Information</h2>
        <table>
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>File Name</td><td>${imageData.name}</td></tr>
            <tr><td>File Size</td><td>${metadata.technical.fileSize}</td></tr>
            <tr><td>File Type</td><td>${imageData.type}</td></tr>
            <tr><td>Dimensions</td><td>${metadata.technical.width} × ${metadata.technical.height}</td></tr>
            <tr><td>Megapixels</td><td>${metadata.technical.megapixels} MP</td></tr>
        </table>
    </div>
    
    ${this.generateMetadataSection('EXIF Data', metadata.exif)}
    ${this.generateMetadataSection('Technical Data', metadata.technical)}
    ${metadata.gps.hasLocation ? this.generateMetadataSection('GPS Data', metadata.gps) : ''}
    
    <div class="metadata-section">
        <p style="text-align: center; color: #64748b; margin-top: 40px;">
            Generated on ${new Date().toLocaleString()}
        </p>
    </div>
</body>
</html>
        `;
    }
    
    generateMetadataSection(title, data) {
        if (!data || Object.keys(data).length === 0) return '';
        
        let rows = '';
        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) {
                rows += `<tr><td>${key}</td><td>${value}</td></tr>`;
            }
        }
        
        return `
    <div class="metadata-section">
        <h2>${title}</h2>
        <table>
            <tr><th>Property</th><th>Value</th></tr>
            ${rows}
        </table>
    </div>
        `;
    }
}