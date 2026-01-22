export const CONSTANTS = {
    APP_NAME: 'Image Metadata Viewer',
    APP_VERSION: '1.0.0',
    
    SUPPORTED_FORMATS: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/svg+xml'
    ],
    
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    
    EXIF_TAGS: {
        CAMERA: ['Make', 'Model', 'LensModel', 'LensMake'],
        EXPOSURE: ['ExposureTime', 'FNumber', 'ISO', 'ExposureMode', 'ExposureProgram', 'ExposureBias'],
        FOCUS: ['FocalLength', 'FocalLengthIn35mmFormat', 'MaxApertureValue'],
        FLASH: ['Flash', 'FlashMode', 'FlashEnergy'],
        WHITE_BALANCE: ['WhiteBalance', 'ColorSpace', 'ColorMode'],
        DATE_TIME: ['DateTimeOriginal', 'CreateDate', 'ModifyDate', 'DateTimeDigitized'],
        IMAGE: ['Orientation', 'XResolution', 'YResolution', 'ResolutionUnit', 'Compression'],
        OTHER: ['Software', 'Artist', 'Copyright', 'ImageDescription', 'UserComment']
    },
    
    GPS_TAGS: [
        'GPSLatitude',
        'GPSLongitude',
        'GPSAltitude',
        'GPSAltitudeRef',
        'GPSDateStamp',
        'GPSTimeStamp',
        'GPSSpeedRef',
        'GPSSpeed',
        'GPSImgDirectionRef',
        'GPSImgDirection'
    ],
    
    IPTC_TAGS: [
        'ObjectName',
        'Caption',
        'Writer',
        'Headline',
        'Instructions',
        'Creator',
        'Credit',
        'Source',
        'Copyright',
        'City',
        'State',
        'Country',
        'Category',
        'Keywords',
        'DateCreated',
        'TimeCreated'
    ],
    
    XMP_TAGS: [
        'Rating',
        'Label',
        'Title',
        'Description',
        'Subject',
        'CreatorTool',
        'CreateDate',
        'ModifyDate',
        'Format',
        'DocumentID',
        'InstanceID',
        'OriginalDocumentID',
        'History'
    ],
    
    COLOR_SPACES: [
        'RGB',
        'sRGB',
        'Adobe RGB',
        'ProPhoto RGB',
        'CMYK',
        'Grayscale'
    ],
    
    COMPRESSION_TYPES: {
        'image/jpeg': 'JPEG (Lossy)',
        'image/png': 'PNG (Lossless)',
        'image/gif': 'GIF (Lossless)',
        'image/webp': 'WebP (Variable)',
        'image/bmp': 'BMP (Uncompressed)',
        'image/tiff': 'TIFF (Variable)'
    },
    
    THEMES: ['light', 'dark'],
    
    DEFAULT_SETTINGS: {
        theme: 'light',
        autoLoadMetadata: true,
        showWarnings: true,
        preserveOriginal: true,
        exportFormat: 'json',
        mapProvider: 'openstreetmap',
        histogramChannels: ['red', 'green', 'blue', 'luminosity'],
        colorPaletteSize: 10
    },
    
    EVENTS: {
        IMAGE_LOADED: 'image:loaded',
        IMAGE_SELECTED: 'image:selected',
        IMAGE_REMOVED: 'image:removed',
        IMAGES_CLEARED: 'images:cleared',
        METADATA_EXTRACTED: 'metadata:extracted',
        METADATA_UPDATED: 'metadata:updated',
        TAB_CHANGED: 'tab:changed',
        THEME_CHANGED: 'theme:changed',
        EXPORT_STARTED: 'export:started',
        EXPORT_COMPLETED: 'export:completed',
        ERROR_OCCURRED: 'error:occurred'
    },
    
    ERROR_MESSAGES: {
        FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
        INVALID_FILE_TYPE: 'Invalid file type. Please upload an image file',
        NO_METADATA: 'No metadata found in the image',
        EXPORT_FAILED: 'Failed to export metadata',
        LOAD_FAILED: 'Failed to load image',
        PARSE_FAILED: 'Failed to parse metadata'
    },
    
    HISTOGRAM_CONFIG: {
        width: 800,
        height: 400,
        bins: 256,
        colors: {
            red: 'rgba(255, 99, 132, 0.8)',
            green: 'rgba(75, 192, 192, 0.8)',
            blue: 'rgba(54, 162, 235, 0.8)',
            luminosity: 'rgba(128, 128, 128, 0.8)'
        }
    },
    
    MAP_CONFIG: {
        defaultZoom: 13,
        maxZoom: 18,
        minZoom: 1,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
    },
    
    METADATA_CATEGORIES: [
        'exif',
        'iptc',
        'xmp',
        'technical',
        'gps',
        'histogram',
        'color',
        'raw'
    ],
    
    TABS: [
        { id: 'exif', label: 'EXIF', icon: 'fa-camera' },
        { id: 'iptc', label: 'IPTC', icon: 'fa-tags' },
        { id: 'xmp', label: 'XMP', icon: 'fa-file-code' },
        { id: 'technical', label: 'Technical', icon: 'fa-microchip' },
        { id: 'gps', label: 'GPS', icon: 'fa-map-marker-alt' },
        { id: 'histogram', label: 'Histogram', icon: 'fa-chart-bar' },
        { id: 'color', label: 'Color Analysis', icon: 'fa-palette' },
        { id: 'raw', label: 'Raw Data', icon: 'fa-database' }
    ]
};