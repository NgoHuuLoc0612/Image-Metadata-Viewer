export class Validator {
    static validateImageFile(file) {
        const errors = [];
        
        if (!file) {
            errors.push('No file provided');
            return { valid: false, errors };
        }
        
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];
        
        if (!validTypes.includes(file.type)) {
            errors.push(`Invalid file type: ${file.type}. Supported types: ${validTypes.join(', ')}`);
        }
        
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            errors.push(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
        }
        
        if (file.size === 0) {
            errors.push('File is empty');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    static validateMetadata(metadata) {
        const warnings = [];
        
        if (!metadata) {
            warnings.push('No metadata available');
            return { valid: false, warnings };
        }
        
        if (!metadata.exif || Object.keys(metadata.exif).length === 0) {
            warnings.push('No EXIF data found');
        }
        
        if (!metadata.gps || !metadata.gps.hasLocation) {
            warnings.push('No GPS data found');
        }
        
        if (!metadata.iptc || Object.keys(metadata.iptc).length === 0) {
            warnings.push('No IPTC data found');
        }
        
        return {
            valid: true,
            warnings
        };
    }
    
    static validateExport(data, format) {
        const errors = [];
        
        if (!data) {
            errors.push('No data to export');
            return { valid: false, errors };
        }
        
        if (!['json', 'csv', 'html'].includes(format)) {
            errors.push(`Invalid export format: ${format}`);
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    static sanitizeFilename(filename) {
        return filename
            .replace(/[^a-z0-9_\-\.]/gi, '_')
            .replace(/_{2,}/g, '_')
            .toLowerCase();
    }
    
    static validateCoordinates(lat, lng) {
        const errors = [];
        
        if (typeof lat !== 'number' || isNaN(lat)) {
            errors.push('Invalid latitude');
        } else if (lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }
        
        if (typeof lng !== 'number' || isNaN(lng)) {
            errors.push('Invalid longitude');
        } else if (lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
}