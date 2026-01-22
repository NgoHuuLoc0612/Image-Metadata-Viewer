export class StorageManager {
    constructor() {
        this.storage = {};
        this.prefix = 'img_metadata_';
    }
    
    set(key, value) {
        try {
            const prefixedKey = this.prefix + key;
            const serialized = JSON.stringify(value);
            this.storage[prefixedKey] = serialized;
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        try {
            const prefixedKey = this.prefix + key;
            const item = this.storage[prefixedKey];
            
            if (item === undefined) {
                return defaultValue;
            }
            
            return JSON.parse(item);
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }
    
    remove(key) {
        try {
            const prefixedKey = this.prefix + key;
            delete this.storage[prefixedKey];
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
    
    clear() {
        try {
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    delete this.storage[key];
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
    
    has(key) {
        const prefixedKey = this.prefix + key;
        return this.storage.hasOwnProperty(prefixedKey);
    }
    
    keys() {
        return Object.keys(this.storage)
            .filter(key => key.startsWith(this.prefix))
            .map(key => key.substring(this.prefix.length));
    }
    
    size() {
        return this.keys().length;
    }
}