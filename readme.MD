# Image Metadata Viewer

## Overview
Web application for comprehensive image metadata extraction, analysis, and visualization. Built with vanilla JavaScript using modular architecture and modern web technologies.

## Features

### Core Functionality
- **Multi-format Support**: JPEG, PNG, GIF, WebP, BMP, TIFF, SVG
- **Comprehensive Metadata Extraction**: EXIF, IPTC, XMP data
- **GPS Visualization**: Interactive maps with location data
- **Color Analysis**: Dominant color extraction and palette generation
- **Histogram Analysis**: RGB and luminosity channel visualization
- **Technical Analysis**: Detailed file and image specifications

### Advanced Features
- **Batch Processing**: Handle multiple images simultaneously
- **Image Comparison**: Side-by-side metadata comparison
- **Export Options**: JSON, CSV, HTML report generation
- **Image Preview**: Zoom, rotate, fullscreen capabilities
- **Dark Mode**: Theme switching with persistence
- **Responsive Design**: Mobile, tablet, and desktop support

### Technical Capabilities
- **Modular Architecture**: Clean separation of concerns
- **Event-Driven**: EventBus pattern for component communication
- **Storage Management**: In-memory data persistence
- **Validation**: Comprehensive input and data validation
- **Error Handling**: Robust error management and logging
- **Performance Optimized**: Efficient data processing

## Project Structure

```
Image-Metadata-Viewer/
│
├── index.html                  # Main HTML file
│
├── styles/                     # CSS Modules
│   ├── main.css               # Core styles and variables
│   ├── components.css         # Component-specific styles
│   ├── layout.css             # Layout and grid system
│   └── themes.css             # Theme definitions
│
├── js/
│   ├── main.js                # Application entry point
│   │
│   ├── modules/               # Core modules
│   │   ├── ImageManager.js    # Image handling and storage
│   │   ├── MetadataExtractor.js   # Metadata parsing and extraction
│   │   ├── UIController.js    # UI rendering and updates
│   │   ├── TabManager.js      # Tab navigation
│   │   ├── ThemeManager.js    # Theme switching
│   │   ├── ExportManager.js   # Data export functionality
│   │   └── PreviewController.js   # Image preview controls
│   │
│   ├── utils/                 # Utility modules
│   │   ├── EventBus.js        # Event management system
│   │   ├── StorageManager.js  # Data storage abstraction
│   │   ├── Helpers.js         # Helper functions
│   │   ├── Validator.js       # Input validation
│   │   └── Logger.js          # Logging system
│   │
│   └── config/                # Configuration
│       └── constants.js       # Application constants
│
└── README.md                  # Documentation
```

## Technology Stack

### Core Technologies
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript ES6+**: Modular, class-based architecture

### External Libraries (CDN)
- **exifr** (v7.1.3): EXIF data extraction
- **Leaflet** (v1.9.4): Interactive maps
- **Chart.js** (v4.4.0): Histogram visualization
- **Chroma.js** (v2.4.2): Color manipulation
- **Lodash** (v4.17.21): Utility functions
- **Moment.js** (v2.29.4): Date/time handling
- **PapaParse** (v5.4.1): CSV parsing
- **Font Awesome** (v6.4.0): Icons

## Module Descriptions

### ImageManager
Manages image lifecycle, storage, and retrieval.
- Load and store images
- Maintain current image state
- Generate unique IDs
- Calculate dimensions and file sizes

### MetadataExtractor
Extracts and processes all metadata types.
- EXIF parsing (camera, exposure, GPS)
- IPTC extraction (copyright, keywords)
- XMP data retrieval
- Color analysis and histogram generation
- Technical specifications

### UIController
Handles all UI rendering and user interactions.
- Display metadata in organized groups
- Render GPS maps
- Generate histogram charts
- Create color palettes
- Modal management

### TabManager
Manages tab navigation and state.
- Switch between metadata categories
- Maintain active tab state
- Emit tab change events

### ThemeManager
Controls application theming.
- Light/dark mode switching
- Theme persistence
- Dynamic CSS variable updates

### ExportManager
Handles data export in multiple formats.
- JSON export with full metadata
- CSV export with flattened data
- HTML report generation
- Batch export capabilities

### PreviewController
Controls image preview functionality.
- Zoom in/out
- Rotation
- Fullscreen mode
- Transform management

## Utilities

### EventBus
Central event management system.
- Subscribe to events
- Emit events with data
- Unsubscribe functionality
- One-time event handlers

### StorageManager
In-memory storage abstraction.
- Set/get key-value pairs
- JSON serialization
- Namespaced keys
- Clear and remove operations

### Helpers
Collection of utility functions.
- File size formatting
- Date formatting
- Debounce/throttle
- Array operations
- String manipulation
- Color utilities

### Validator
Input and data validation.
- Image file validation
- Metadata validation
- Export validation
- Coordinate validation
- Filename sanitization

### Logger
Development and debugging tool.
- Multiple log levels (debug, info, warn, error)
- Log persistence
- Export capabilities
- Grouped logging
- Performance timing

## Usage

### Basic Usage
1. Use Live Server or host to use.
2. Drag and drop images or click to upload
3. View extracted metadata across different tabs
4. Export data in desired format

### Image Upload
- Supports drag-and-drop
- Multiple file selection
- Format validation
- Size limit: 50MB per file

### Metadata Viewing
Navigate through tabs to view different metadata categories:
- **EXIF**: Camera settings, exposure data
- **IPTC**: Copyright, keywords, descriptions
- **XMP**: Adobe metadata
- **Technical**: File specifications
- **GPS**: Location with interactive map
- **Histogram**: Color channel distribution
- **Color Analysis**: Dominant colors
- **Raw Data**: Complete JSON view

### Export Options
- **JSON**: Full metadata structure
- **CSV**: Flattened data for spreadsheets
- **Batch CSV**: Multiple images combined

### Image Comparison
1. Load at least 2 images
2. Click "Compare Images"
3. View side-by-side metadata

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations
- Efficient color sampling for large images
- Histogram binning optimization
- Debounced UI updates
- Lazy loading of map tiles
- Memory-efficient storage

## Security
- Client-side processing only
- No data transmission to servers
- Input validation and sanitization
- XSS prevention measures

## Future Enhancements
- Additional metadata formats (MakerNotes, ICC profiles)
- Metadata editing capabilities
- Batch metadata operations
- Custom metadata templates
- Plugin system for extensibility
- PWA capabilities
- IndexedDB integration

## Development Notes

### Adding New Modules
1. Create module file in appropriate directory
2. Export class or object
3. Import in `main.js`
4. Initialize in App constructor
5. Wire up event listeners

### Event System
Use EventBus for inter-module communication:
```javascript
this.eventBus.on('event:name', handler);
this.eventBus.emit('event:name', data);
```

### Storage
Use StorageManager for data persistence:
```javascript
this.storageManager.set('key', value);
const value = this.storageManager.get('key', defaultValue);
```

### Styling
Follow BEM-like naming convention:
```css
.component-name { }
.component-name__element { }
.component-name--modifier { }
```

## License
MIT License - Feel free to use in your projects

## Support
For issues and feature requests, please refer to the project repository.

---

Built with ❤️ using modern web technologies