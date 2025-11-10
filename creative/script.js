// script.js
class ImageToolsApp {
    constructor() {
        this.currentImage = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupClipboard();
        this.loadAdSense();
    }

    setupEventListeners() {
        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Upload zone click
        document.getElementById('uploadZone').addEventListener('click', (e) => {
            if (e.target === document.getElementById('uploadZone') || 
                e.target.classList.contains('upload-content')) {
                document.getElementById('fileInput').click();
            }
        });
    }

    setupDragAndDrop() {
        const uploadZone = document.getElementById('uploadZone');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        uploadZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files);
        }, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    setupClipboard() {
        // Handle paste event anywhere on the page
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    this.handleFiles([file]);
                    break;
                }
            }
        });
    }

    handleFiles(files) {
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.match('image.*')) {
            this.showError('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    loadImage(dataUrl) {
        const img = new Image();
        img.onload = () => {
            this.currentImage = img;
            this.showPreview(dataUrl);
            this.showSuccess('Image loaded successfully!');
        };
        img.onerror = () => {
            this.showError('Failed to load image');
        };
        img.src = dataUrl;
    }

    showPreview(imageSrc) {
        document.getElementById('previewImage').src = imageSrc;
        document.getElementById('previewSection').style.display = 'block';
        
        // Scroll to preview section
        document.getElementById('previewSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    loadFromUrl() {
        const url = document.getElementById('imageUrl').value.trim();
        if (!url) {
            this.showError('Please enter an image URL');
            return;
        }

        // Basic URL validation
        if (!url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i)) {
            this.showError('Please enter a valid image URL');
            return;
        }

        this.loadImage(url);
    }

    openTool(toolName) {
        if (!this.currentImage) {
            this.showError('Please load an image first');
            return;
        }

        const toolUrls = {
            crop: 'tools/image-cropper.html',
            format: 'tools/format-converter.html',
            adjust: 'tools/color-adjustment.html',
            background: 'tools/background-generator.html',
            abstract: 'tools/abstract-generator.html',
            gradient: 'tools/gradient-generator.html',
            logo: 'tools/logo-generator.html'
        };

        const url = toolUrls[toolName];
        if (url) {
            // In a real implementation, we'd pass the image data to the tool
            // For now, just navigate to the tool page
            window.location.href = url;
        } else {
            this.showError('Tool not available yet');
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    loadAdSense() {
        // AdSense ads are loaded automatically by the script in head
        // This is where we could add additional ad management logic
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('AdSense error:', e);
        }
    }
}

// Global functions for HTML onclick handlers
function showUrlInput() {
    document.getElementById('urlInput').style.display = 'flex';
}

function loadFromUrl() {
    window.imageToolsApp.loadFromUrl();
}

function openTool(toolName) {
    window.imageToolsApp.openTool(toolName);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageToolsApp = new ImageToolsApp();
});
