/*
 * SIMPLE JSON-BASED GALLERY
 * 
 * To add images with ANY filename:
 * 1. Put your image files in 'gallery/' folder (any name, any extension)
 * 2. Add them to image-metadata.json (in root directory)
 * 
 * Example:
 * "my_vacation_photo.jpg": { "title": "Beach Day", "category": "Travel" }
 * "wedding_2024.png": { "title": "Wedding", "category": "Family" }  
 * "IMG_20240315_143022.jpg": { "title": "Sunset", "category": "Nature" }
 * "any_filename_works.gif": { "title": "Animation", "category": "Fun" }
 * 
 * Supports: .jpg, .jpeg, .png, .gif, .webp, .bmp, .svg
 * No filename restrictions - use ANY name you want!
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Navigation functionality
    initializeNavigation();
    
    // Portfolio filtering
    initializePortfolioFilter();
    
    // Gallery functionality
    window.galleryInstance = initializeGallery();
    
    // Skills animation
    initializeSkillsAnimation();
    
    // Contact form
    initializeContactForm();
    
    // Scroll animations
    initializeScrollAnimations();
    
    // Smooth scrolling for navigation links
    initializeSmoothScrolling();
    
    // Hero typing animation
    initializeTypingAnimation();
    
    // Floating elements animation
    initializeFloatingElements();

    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Intersection Observer for sections
    initializeIntersectionObserver();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    });
}

// Portfolio filtering functionality
function initializePortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// All images will be loaded dynamically from JSON and auto-detection
// No hardcoded images - everything comes from image-metadata.json

// Auto-detection patterns for additional images
const autoDetectionPatterns = [
    { pattern: 'gallery/photo{n}.jpg', max: 20 },
    { pattern: 'gallery/pic{n}.jpg', max: 20 },
    { pattern: 'gallery/img{n}.jpg', max: 20 },
    { pattern: 'gallery/image{n}.jpeg', max: 20 },
    { pattern: 'gallery/photo{n}.jpeg', max: 20 },
    { pattern: 'gallery/picture{n}.jpg', max: 20 }
];

// Simple global variables
let imageCategories = {};
let subcategories = {};
let currentCategory = 'all';
let currentSubcategory = 'all';
let currentPhotoIndex = 0; // Track current photo within subcategory
let modalCurrentSubcategory = null; // Track which subcategory is open in modal
let modalPhotoIndex = 0; // Track current photo index in modal
let isSliding = false;

// No embedded data - system relies entirely on JSON file
// Works perfectly on web servers (including S3 static hosting)

// Load image metadata - ONLY from JSON file
async function loadImageMetadata() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`image-metadata.json?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const metadata = await response.json();
        return metadata;
        
    } catch (error) {
        return {};
    }
}

// Load images from JSON metadata
async function loadAllImagesFromJSON() {
    const metadata = await loadImageMetadata();
    
    // Reset arrays to avoid old data
    imageCategories = {};
    subcategories = {};
    const allImages = [];
    
    // Process images from JSON metadata
    if (Object.keys(metadata).length > 0) {
        for (const [filename, imageData] of Object.entries(metadata)) {
            if (filename.startsWith('_')) continue; // Skip metadata fields
            
            const image = await processImageWithMetadata(filename, imageData);
            if (image) {
                allImages.push(image);
            }
        }
    }
    
    return allImages;
}

// Process a single image with metadata
async function processImageWithMetadata(filename, imageData) {
    const category = imageData.category || 'Other';
    const subcategory = imageData.subcategory || null;
    
    const image = {
        src: `gallery/${filename}`,
        title: imageData.title || generateTitleFromFilename(filename),
        description: imageData.description || 'No description available',
        category: category,
        subcategory: subcategory
    };
    
    // Check if image actually exists
    const exists = await checkImageExists(image.src);
    if (!exists) {
        return null;
    }
    
    // Organize by category
    if (!imageCategories[category]) {
        imageCategories[category] = [];
    }
    imageCategories[category].push(image);
    
    // Organize by subcategory if exists
    if (subcategory) {
        const subKey = `${category} > ${subcategory}`;
        if (!subcategories[subKey]) {
            subcategories[subKey] = [];
        }
        subcategories[subKey].push(image);
    }
    
    return image;
}


// Generate title from filename
function generateTitleFromFilename(filename) {
    const name = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    
    // Convert common patterns to readable titles
    let title = name
        .replace(/IMG_?(\d+)/i, 'Image $1')
        .replace(/DSC_?(\d+)/i, 'Photo $1')
        .replace(/DSCN(\d+)/i, 'Photo $1')
        .replace(/photo_?(\d+)/i, 'Photo $1')
        .replace(/image_?(\d+)/i, 'Image $1')
        .replace(/pic_?(\d+)/i, 'Picture $1')
        .replace(/^(\d+)$/, 'Photo $1')
        .replace(/[\-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letters
    
    return title || 'Untitled Photo';
}

// Generate description from filename
function generateDescriptionFromFilename(filename) {
    const name = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    
    if (/IMG_?\d+/i.test(name)) return 'Camera captured image';
    if (/DSC_?\d+/i.test(name)) return 'Digital camera photo';
    if (/photo/i.test(name)) return 'Photography image';
    if (/pic/i.test(name)) return 'Picture from gallery';
    if (/^\d+$/.test(name)) return 'Numbered photo';
    
    return 'Auto-discovered image from gallery folder';
}

// Combined array for all detected images - will be populated dynamically
let allPhotographyImages = [];

// Simple gallery initialization
function initializeGallery() {
    const galleryModal = document.getElementById('galleryModal');
    const modalClose = document.querySelector('.modal-close');
    
    // Load simple gallery
    loadPhotographyImages();
    
    // Setup modal close functionality
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal on overlay click
    if (galleryModal) {
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                closeModal();
            }
        });
    }

    // Modal functionality now handled by enhanced modal system

}

// Simple gallery loading function
async function loadPhotographyImages() {
    try {
        // Load images from JSON
        allPhotographyImages = await loadAllImagesFromJSON();
        
        if (allPhotographyImages.length === 0) {
            return;
        }
        
        // Generate simple filters
        generateSimpleFilters();
        
        // Load images into gallery
        loadAllImages();
        
    } catch (error) {
        // Silent error handling
    }
}

// Force refresh function (you can call this in browser console)
window.refreshGallery = async function() {
    // Clear all data
    allPhotographyImages = [];
    imageCategories = {};
    subcategories = {};
    
    // Reload everything
    await loadPhotographyImages();
};

// Fallback gallery loading in case of errors
async function loadFallbackGallery() {
    // Reset arrays
    allPhotographyImages = [];
    imageCategories = {};
    
    // Use hardcoded fallback
    const fallbackMetadata = getFallbackImageMetadata();
    
    // Process fallback metadata
    for (const [filename, imageData] of Object.entries(fallbackMetadata)) {
        if (filename.startsWith('_')) continue;
        
        const imagePath = `gallery/${filename}`;
        const enhancedImage = {
            src: imagePath,
            title: imageData.title,
            description: imageData.description,
            category: imageData.category,
            tags: imageData.tags || [],
            featured: imageData.featured || false,
            order: imageData.order || 999
        };
        
        const cat = enhancedImage.category;
        if (!imageCategories[cat]) {
            imageCategories[cat] = [];
        }
        imageCategories[cat].push(enhancedImage);
        allPhotographyImages.push(enhancedImage);
    }
    
    // Load fallback category data
    categoryData = fallbackMetadata._categories;
    
    generateGalleryFilters();
    loadAllImages();
}

// Function to load representative images (one per subcategory) into the gallery
function loadAllImages() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) {
        return;
    }
    
    // Clear existing content
    galleryGrid.innerHTML = '';
    
    if (Object.keys(subcategories).length === 0) {
        galleryGrid.innerHTML = '<p style="text-align: center; color: #666;">No images found. Check your image-metadata.json file.</p>';
        return;
    }
    
    let representativeIndex = 0;
    
    // Create one representative item per subcategory
    Object.entries(subcategories).forEach(([subcategoryKey, photos]) => {
        const representativePhoto = photos[0]; // Use first photo as representative
        const photoCount = photos.length;
        
        // Create enhanced gallery item with subcategory info
        const galleryItem = createRepresentativeGalleryItem(representativePhoto, subcategoryKey, photoCount, representativeIndex);
        galleryGrid.appendChild(galleryItem);
        
        representativeIndex++;
    });
    
    // Also add any photos without subcategories (category only)
    allPhotographyImages.forEach((image, index) => {
        if (!image.subcategory) {
            const galleryItem = createGalleryItem(image, representativeIndex);
            galleryGrid.appendChild(galleryItem);
            representativeIndex++;
        }
    });
    
    // Reinitialize gallery functionality
    setTimeout(() => {
        reinitializeGalleryAfterLoad();
    }, 100);
}

// Dynamic title/description generation rules
const titleDescriptionRules = {
    // Filename-based rules (case insensitive)
    patterns: [
        { match: /sunset|sunrise/i, title: 'Golden Hour', description: 'Captured during the magical golden hour' },
        { match: /landscape|mountain|nature/i, title: 'Natural Beauty', description: 'Stunning landscape photography' },
        { match: /portrait|person|people/i, title: 'Portrait', description: 'Beautiful portrait photography' },
        { match: /street|urban|city/i, title: 'Urban Life', description: 'Street photography capturing city life' },
        { match: /wedding|bride|groom/i, title: 'Wedding Moments', description: 'Special wedding day memories' },
        { match: /travel|vacation|trip/i, title: 'Travel Photography', description: 'Adventures from around the world' },
        { match: /macro|close.*up/i, title: 'Macro Photography', description: 'Detailed close-up photography' },
        { match: /night|dark|evening/i, title: 'Night Photography', description: 'Captured in low light conditions' }
    ],
    // Default templates
    defaults: {
        title: 'Photography Collection',
        description: 'Professional photography work'
    }
};

// Enhanced function to generate dynamic title, description, and category from filename
function generateTitleFromFilename(imagePath) {
    const filename = imagePath.split('/').pop().replace(/\.(jpg|jpeg|png|gif)$/i, '');
    
    // Enhanced patterns with category suggestions
    const enhancedPatterns = [
        { match: /sunset|sunrise|golden.*hour/i, title: 'Golden Hour', description: 'Captured during the magical golden hour', category: 'nature' },
        { match: /landscape|mountain|nature|forest|ocean/i, title: 'Natural Beauty', description: 'Stunning landscape photography', category: 'nature' },
        { match: /portrait|person|people|face|model/i, title: 'Portrait', description: 'Beautiful portrait photography', category: 'portraits' },
        { match: /street|urban|city|building|architecture/i, title: 'Urban Life', description: 'Street photography capturing city life', category: 'urban' },
        { match: /wedding|bride|groom|ceremony/i, title: 'Wedding Moments', description: 'Special wedding day memories', category: 'events' },
        { match: /travel|vacation|trip|adventure/i, title: 'Travel Photography', description: 'Adventures from around the world', category: 'travel' },
        { match: /macro|close.*up|detail/i, title: 'Macro Photography', description: 'Detailed close-up photography', category: 'nature' },
        { match: /night|dark|evening|stars/i, title: 'Night Photography', description: 'Captured in low light conditions', category: 'urban' },
        { match: /product|commercial|studio/i, title: 'Commercial Work', description: 'Professional commercial photography', category: 'commercial' },
        { match: /event|party|celebration/i, title: 'Event Photography', description: 'Capturing special moments and celebrations', category: 'events' }
    ];
    
    // Check against enhanced patterns
    for (const rule of enhancedPatterns) {
        if (rule.match.test(filename)) {
            return {
                title: rule.title,
                description: rule.description,
                category: rule.category
            };
        }
    }
    
    // Generate title from filename if no pattern matches
    const cleanName = filename
        .replace(/[-_]/g, ' ')  // Replace dashes/underscores with spaces
        .replace(/\d+/g, '')    // Remove numbers
        .trim()
        .replace(/\s+/g, ' ')   // Normalize spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Title case
        .join(' ');
    
    return {
        title: cleanName || titleDescriptionRules.defaults.title,
        description: titleDescriptionRules.defaults.description,
        category: 'photography'
    };
}

// Function to auto-detect images using common naming patterns
async function autoDetectImages() {
    const detectedImages = [];
    
    for (const pattern of autoDetectionPatterns) {
        for (let i = 1; i <= pattern.max; i++) {
            const imagePath = pattern.pattern.replace('{n}', i);
            const filename = imagePath.split('/').pop();
            
            // Skip if already in our main array
            if (allPhotographyImages.some(img => img.src === imagePath)) {
                continue;
            }
            
            try {
                const exists = await checkImageExists(imagePath);
                if (exists) {
                    // Generate dynamic title, description, and category
                    const { title, description, category } = generateTitleFromFilename(imagePath);
                    
                    const detectedImage = {
                        src: imagePath,
                        title: title,
                        description: description,
                        category: category || 'uncategorized',
                        tags: [],
                        featured: false,
                        order: 999
                    };
                    
                    // Organize by category
                    const cat = detectedImage.category;
                    if (!imageCategories[cat]) {
                        imageCategories[cat] = [];
                    }
                    imageCategories[cat].push(detectedImage);
                    
                    detectedImages.push(detectedImage);
                }
            } catch (error) {
                // Image doesn't exist, continue to next
            }
        }
    }
    
    // Add detected images to the combined array
    allPhotographyImages.push(...detectedImages);
}

// Simple function to generate category filters
function generateSimpleFilters() {
    const galleryFilters = document.querySelector('.gallery-filters');
    if (!galleryFilters) {
        return;
    }
    
    // Clear existing filters
    galleryFilters.innerHTML = '';
    
    // Add "All" filter
    const allBtn = document.createElement('button');
    allBtn.className = 'gallery-filter-btn active';
    allBtn.textContent = `All (${allPhotographyImages.length})`;
    allBtn.onclick = () => showCategory('all');
    galleryFilters.appendChild(allBtn);
    
    // Add filter for each category found in images
    Object.keys(imageCategories).forEach(category => {
        const imageCount = imageCategories[category].length;
        const btn = document.createElement('button');
        btn.className = 'gallery-filter-btn';
        btn.textContent = `${category} (${imageCount})`;
        btn.onclick = () => showCategory(category);
        galleryFilters.appendChild(btn);
    });
}

// Simple function to show category
function showCategory(category) {
    // Update active button
    document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === category || (category === 'all' && btn.textContent === 'All'));
    });
    
    // Show/hide images
    document.querySelectorAll('.gallery-item').forEach(item => {
        const shouldShow = category === 'all' || item.classList.contains(category.toLowerCase().replace(' ', '-'));
        item.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) {
            item.style.animation = 'fadeInUp 0.5s ease forwards';
        }
    });
    
    currentCategory = category;
}







// Function to check if image exists
function checkImageExists(imagePath) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imagePath;
    });
}

// Quiet version for auto-discovery (same as regular but with different name for clarity)
function checkImageExistsQuietly(imagePath) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        // Set src last to avoid race conditions
        img.src = imagePath;
    });
}

// Function to reinitialize gallery after loading
function reinitializeGalleryAfterLoad() {
    setTimeout(() => {
        // Reinitialize gallery functionality for new items
        if (window.galleryInstance && window.galleryInstance.reinitializeGalleryItems) {
            window.galleryInstance.reinitializeGalleryItems();
        }
        
        // Re-initialize AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }, 100);
}

// Create representative gallery item (one per subcategory with photo count)
function createRepresentativeGalleryItem(image, subcategoryKey, photoCount, index) {
    const galleryItem = document.createElement('div');
    
    // Simple classes
    const classes = ['gallery-item', 'representative-item'];
    if (image.category) {
        classes.push(image.category.toLowerCase().replace(' ', '-'));
    }
    
    galleryItem.className = classes.join(' ');
    galleryItem.setAttribute('data-filename', image.src.split('/').pop());
    galleryItem.setAttribute('data-subcategory', subcategoryKey);
    galleryItem.setAttribute('data-aos', 'fade-up');
    
    const [category, subcategory] = subcategoryKey.split(' > ');
    
    galleryItem.innerHTML = `
        <div class="gallery-image">
            <img src="${image.src}" alt="${image.title}" class="gallery-img">
            <div class="photo-count-badge">${photoCount}</div>
            <div class="gallery-overlay">
                <div class="gallery-overlay-content">
                    <h4>${subcategory}</h4>
                    <p>${photoCount} photo${photoCount > 1 ? 's' : ''}</p>
                    <small>📁 ${category}</small>
                    <button class="gallery-zoom" onclick="openSubcategoryModal('${subcategoryKey}')">
                        <i class="fas fa-images"></i>
                        <span>View All</span>
                    </button>
                </div>
            </div>
        </div>
`;
    
    return galleryItem;
}

// Simple function to create gallery item HTML (for single photos)
function createGalleryItem(image, index) {
    const galleryItem = document.createElement('div');
    
    // Simple classes
    const classes = ['gallery-item'];
    if (image.category) {
        classes.push(image.category.toLowerCase().replace(' ', '-'));
    }
    
    galleryItem.className = classes.join(' ');
    galleryItem.setAttribute('data-filename', image.src.split('/').pop());
    galleryItem.setAttribute('data-aos', 'fade-up');
    
    galleryItem.innerHTML = `
        <div class="gallery-image">
            <img src="${image.src}" alt="${image.title}" class="gallery-img">
            <div class="gallery-overlay">
                <div class="gallery-overlay-content">
                    <h4>${image.title}</h4>
                    <p>${image.description}</p>
                    ${image.subcategory ? `<small>📁 ${image.subcategory}</small>` : ''}
                    <button class="gallery-zoom" onclick="openImageModal('${image.src}', '${image.title}', '${image.description}', '${image.category}', '${image.subcategory || ''}')">
                        <i class="fas fa-search-plus"></i>
                    </button>
                </div>
            </div>
        </div>
`;
    
    return galleryItem;
}

// Enhanced modal function with subcategory tracking
function openImageModal(src, title, description, category, subcategory) {
    const modal = document.getElementById('galleryModal');
    if (!modal) return;
    
    // Set modal context
    if (subcategory) {
        modalCurrentSubcategory = `${category} > ${subcategory}`;
        // Find the photo index within this subcategory
        const photos = subcategories[modalCurrentSubcategory];
        if (photos) {
            modalPhotoIndex = photos.findIndex(photo => photo.src === src);
            if (modalPhotoIndex === -1) modalPhotoIndex = 0;
        }
    } else {
        modalCurrentSubcategory = null;
        modalPhotoIndex = 0;
    }
    
    // Update modal content
    updateModalContent(src, title, description);
    
    // Setup modal navigation event listeners
    setupModalNavigation();
    
    // Setup keyboard navigation
    setupModalKeyboardNavigation();
    
    // Show modal
    modal.classList.add('active');
        document.body.style.overflow = 'hidden';
}

// Update modal content
function updateModalContent(src, title, description) {
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    if (modalImage) modalImage.src = src;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDescription) modalDescription.textContent = description;
}

// Setup modal navigation functionality
function setupModalNavigation() {
    const prevBtn = document.querySelector('.modal-nav-prev');
    const nextBtn = document.querySelector('.modal-nav-next');
    
    // Remove existing listeners to avoid duplicates
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    
    // Add new listeners
    newPrevBtn.addEventListener('click', () => navigateModalPhoto(-1));
    newNextBtn.addEventListener('click', () => navigateModalPhoto(1));
    
    // Show/hide navigation based on availability
    if (modalCurrentSubcategory && subcategories[modalCurrentSubcategory]) {
        const photos = subcategories[modalCurrentSubcategory];
        const canNavigate = photos.length > 1;
        newPrevBtn.style.display = canNavigate ? 'block' : 'none';
        newNextBtn.style.display = canNavigate ? 'block' : 'none';
    } else {
        newPrevBtn.style.display = 'none';
        newNextBtn.style.display = 'none';
    }
}

// Navigate between photos in modal
function navigateModalPhoto(direction) {
    if (!modalCurrentSubcategory || !subcategories[modalCurrentSubcategory]) return;
    
    const photos = subcategories[modalCurrentSubcategory];
    if (photos.length <= 1) return;
    
    // Update photo index
    modalPhotoIndex += direction;
    if (modalPhotoIndex >= photos.length) modalPhotoIndex = 0;
    if (modalPhotoIndex < 0) modalPhotoIndex = photos.length - 1;
    
    // Get new photo data
    const newPhoto = photos[modalPhotoIndex];
    
    // Update modal content with new photo
    updateModalContent(newPhoto.src, newPhoto.title, newPhoto.description);
}

// Setup keyboard navigation for modal
function setupModalKeyboardNavigation() {
    // Remove any existing modal keyboard listeners
    document.removeEventListener('keydown', handleModalKeyboard);
    
    // Add new listener
    document.addEventListener('keydown', handleModalKeyboard);
}

// Handle keyboard navigation in modal
function handleModalKeyboard(e) {
    const modal = document.getElementById('galleryModal');
    if (!modal || !modal.classList.contains('active')) return;
    
    switch(e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            navigateModalPhoto(-1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            navigateModalPhoto(1);
            break;
    }
}

// Open modal with all photos from a subcategory
function openSubcategoryModal(subcategoryKey) {
    if (!subcategories[subcategoryKey]) {
        return;
    }
    
    const photos = subcategories[subcategoryKey];
    const firstPhoto = photos[0];
    
    // Set modal context for subcategory
    modalCurrentSubcategory = subcategoryKey;
    modalPhotoIndex = 0;
    
    // Update modal content with first photo
    updateModalContent(firstPhoto.src, firstPhoto.title, firstPhoto.description);
    
    // Setup modal navigation
    setupModalNavigation();
    
    // Setup keyboard navigation
    setupModalKeyboardNavigation();
    
    // Show modal
    const modal = document.getElementById('galleryModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('galleryModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset modal context
        modalCurrentSubcategory = null;
        modalPhotoIndex = 0;
    }
}

// Utility function to add new images dynamically (for future use)
function addPhotographyImage(imagePath, title, description) {
    const newImage = {
        src: imagePath,
        title: title || `Photography ${allPhotographyImages.length + 1}`,
        description: description || 'New photography image'
    };
    
    allPhotographyImages.push(newImage);
    
    // Add to gallery if it's already initialized
    if (document.querySelector('.gallery-grid')) {
        const img = new Image();
        img.onload = function() {
            const galleryGrid = document.querySelector('.gallery-grid');
            const galleryItem = createGalleryItem(newImage, allPhotographyImages.length - 1);
            galleryGrid.appendChild(galleryItem);
            
            // Reinitialize gallery functionality
            if (window.galleryInstance && window.galleryInstance.reinitializeGalleryItems) {
                window.galleryInstance.reinitializeGalleryItems();
            }
            
            // Refresh AOS animations
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        };
        img.onerror = function() {
            // Image failed to load
        };
        img.src = imagePath;
    }
    
    return newImage;
}

// Setup category navigation system - only show categories with images
function setupCategoryNavigation() {
    const gallerySection = document.querySelector('#gallery');
    if (!gallerySection) return;
    
    // Only create navigation if we have categories with images
    const categoriesWithImages = Object.keys(imageCategories).filter(cat => 
        imageCategories[cat] && imageCategories[cat].length > 0
    );
    
    if (categoriesWithImages.length === 0) return; // No categories to show
    
    // Create category navigation container
    const categoryNav = document.createElement('div');
    categoryNav.className = 'category-navigation';
    categoryNav.innerHTML = `
        <div class="category-nav-container">
            <h3 class="category-nav-title">Browse by Category</h3>
            <div class="category-buttons">
                <button class="category-btn active" data-category="all">
                    <i class="fas fa-th-large"></i>
                    <span>All Photos</span>
                    <small>${allPhotographyImages.length} photos</small>
                </button>
            </div>
        </div>
    `;
    
    // Insert category navigation before gallery filters
    const galleryFilters = gallerySection.querySelector('.gallery-filters');
    gallerySection.insertBefore(categoryNav, galleryFilters);
    
    // Generate category buttons only for categories that have images
    const categoryButtonsContainer = categoryNav.querySelector('.category-buttons');
    
    categoriesWithImages.forEach(categoryKey => {
        const categoryInfo = categoryData[categoryKey];
        const imageCount = imageCategories[categoryKey].length;
        
        const categoryBtn = document.createElement('button');
        categoryBtn.className = 'category-btn';
        categoryBtn.setAttribute('data-category', categoryKey);
        
        if (categoryInfo) {
            categoryBtn.innerHTML = `
                <i class="fas ${categoryInfo.icon}"></i>
                <span>${categoryInfo.name}</span>
                <small>${imageCount} photos</small>
            `;
            categoryBtn.style.setProperty('--category-color', categoryInfo.color);
        } else {
            // Fallback for undefined categories
            const displayName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
            categoryBtn.innerHTML = `
                <i class="fas fa-images"></i>
                <span>${displayName}</span>
                <small>${imageCount} photos</small>
            `;
            categoryBtn.style.setProperty('--category-color', '#666');
        }
        
        categoryButtonsContainer.appendChild(categoryBtn);
    });
    
    // Add event listeners for category buttons
    const categoryButtons = categoryNav.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            slideToCategory(category);
            
            // Update active state
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentCategory = category;
        });
    });
}

// Setup category slideshow functionality
function setupCategorySlideshow() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Add slideshow controls
    const slideshowControls = document.createElement('div');
    slideshowControls.className = 'slideshow-controls';
    slideshowControls.innerHTML = `
        <button class="slide-btn slide-prev" title="Previous Category">
            <i class="fas fa-chevron-left"></i>
        </button>
        <div class="slide-indicators">
            <span class="current-category-name">All Photos</span>
        </div>
        <button class="slide-btn slide-next" title="Next Category">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // Insert before gallery grid
    galleryGrid.parentNode.insertBefore(slideshowControls, galleryGrid);
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'ArrowLeft') {
            slideToNextCategory(-1);
        } else if (e.key === 'ArrowRight') {
            slideToNextCategory(1);
        }
    });
    
    // Add slide button listeners
    const prevBtn = slideshowControls.querySelector('.slide-prev');
    const nextBtn = slideshowControls.querySelector('.slide-next');
    
    prevBtn.addEventListener('click', () => slideToNextCategory(-1));
    nextBtn.addEventListener('click', () => slideToNextCategory(1));
}

// Slide to a specific category
function slideToCategory(targetCategory) {
    if (isSliding || currentCategory === targetCategory) return;
    
    isSliding = true;
    const galleryGrid = document.querySelector('.gallery-grid');
    const currentCategoryName = document.querySelector('.current-category-name');
    
    // Update category name display
    if (targetCategory === 'all') {
        currentCategoryName.textContent = 'All Photos';
    } else if (categoryData[targetCategory]) {
        currentCategoryName.textContent = categoryData[targetCategory].name;
    } else {
        currentCategoryName.textContent = 'Photography';
    }
    
    // Add sliding animation
    galleryGrid.style.transform = 'translateX(-100%)';
    galleryGrid.style.opacity = '0';
    
    setTimeout(() => {
        // Filter images by category
        const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            const shouldShow = targetCategory === 'all' || 
                              item.classList.contains(targetCategory) ||
                              item.classList.contains('photography');
            
            if (shouldShow) {
                item.style.display = 'block';
                item.style.animation = 'slideInRight 0.6s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Slide back in
        galleryGrid.style.transform = 'translateX(0)';
        galleryGrid.style.opacity = '1';
        
        isSliding = false;
        
        // Re-initialize AOS for visible items
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }, 300);
}

// Navigate to next/previous category - only use categories that have images
function slideToNextCategory(direction) {
    const categoriesWithImages = Object.keys(imageCategories).filter(cat => 
        imageCategories[cat] && imageCategories[cat].length > 0
    );
    const categories = ['all', ...categoriesWithImages];
    const currentIndex = categories.indexOf(currentCategory);
    let nextIndex = currentIndex + direction;
    
    if (nextIndex < 0) nextIndex = categories.length - 1;
    if (nextIndex >= categories.length) nextIndex = 0;
    
    const nextCategory = categories[nextIndex];
    
    // Update active category button
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === nextCategory);
    });
    
    slideToCategory(nextCategory);
}

// Skills animation
function initializeSkillsAnimation() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            bar.style.width = progress + '%';
        });
    };

    // Trigger animation when skills section is in view
    const skillsSection = document.getElementById('skills');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(animateSkillBars, 500);
                observer.unobserve(skillsSection);
            }
        });
    }, { threshold: 0.5 });

    if (skillsSection) {
        observer.observe(skillsSection);
    }
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formInputs = contactForm.querySelectorAll('input, textarea');

    // Add floating label functionality
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value !== '') {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });

        // Check if field has value on load
        if (input.value !== '') {
            input.classList.add('has-value');
        }
    });

    // Form submission
    contactForm.addEventListener('submit', function(e) {
       // e.preventDefault();
        
        const formData = new FormData(this);
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual form handling)
        setTimeout(() => {
            // Success state
            submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Message Sent!</span>';
            submitBtn.style.background = 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
            
            // Reset form
            this.reset();
            formInputs.forEach(input => input.classList.remove('has-value'));
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
            
            // Show success message
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        }, 2000);
    });
}

// Scroll animations
function initializeScrollAnimations() {
    const animateElements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Smooth scrolling for navigation
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Hero typing animation
function initializeTypingAnimation() {
    const heroName = document.querySelector('.hero-name .text-gradient');
    const originalText = heroName.textContent;
    let i = 0;
    
    // Clear text initially
    heroName.textContent = '';
    
    function typeWriter() {
        if (i < originalText.length) {
            heroName.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    
    // Start typing animation after a delay
    setTimeout(typeWriter, 1000);
}

// Floating elements animation
function initializeFloatingElements() {
    const floatingElements = document.querySelectorAll('.element');
    
    floatingElements.forEach((element, index) => {
        // Add random movement
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            
            element.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 500);
    });
}

// Navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Intersection Observer for active navigation links
function initializeIntersectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSection = entry.target.getAttribute('id');
                
                // Remove active class from all nav links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSection}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-70px 0px -70px 0px'
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: auto;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Parallax effect for hero section
function initializeParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
        
        const floatingShapes = document.querySelectorAll('.shape');
        floatingShapes.forEach((shape, index) => {
            const rate = scrolled * (-0.2 - index * 0.1);
            shape.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Initialize parallax effect
initializeParallaxEffect();

// Add smooth reveal animation for elements
function addRevealAnimation() {
    const revealElements = document.querySelectorAll('.portfolio-item, .gallery-item, .skill-category');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(element);
    });
}

// Initialize reveal animations
addRevealAnimation();

// Add magnetic effect to buttons
function initializeMagneticEffect() {
    const buttons = document.querySelectorAll('.btn, .social-link, .project-link');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

// Initialize magnetic effect
initializeMagneticEffect();

// Add cursor trail effect
function initializeCursorTrail() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        mix-blend-mode: difference;
    `;
    
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = '0.7';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';
        
        requestAnimationFrame(updateCursor);
    }
    
    updateCursor();
}

// Initialize cursor trail (only on desktop)
if (window.innerWidth > 768) {
    initializeCursorTrail();
}

// Add loading animation
function initializeLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p>Loading Portfolio...</p>
        </div>
    `;
    
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    `;
    
    const loaderContent = loader.querySelector('.loader-content');
    loaderContent.style.cssText = `
        text-align: center;
        color: white;
    `;
    
    const spinner = loader.querySelector('.loader-spinner');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255,255,255,0.3);
        border-top: 3px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loader);
    
    // Hide loader after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1000);
    });
}

// Certificate data mapping
const certificateData = {
    'software-engineering': {
        title: 'NEP Certification',
        issuer: 'Tech Institute',
        image: 'Certificates/certificate2.png'
    },
    'aws-cloud-practitioner': {
        title: 'AWS Cloud Practitioner',
        issuer: 'Amazon Web Services',
        image: 'Certificates/certificate-aws.jpg'
    },
    'python-programming': {
        title: 'Python Programming',
        issuer: 'Programming Institute',
        image: 'Certificates/certificate-python.jpg'
    },
    'react-development': {
        title: 'React.js Development',
        issuer: 'Frontend Academy',
        image: 'Certificates/certificate-react.jpg'
    },
    'database-management': {
        title: 'Database Management',
        issuer: 'Data Science Institute',
        image: 'Certificates/certificate-database.jpg'
    },
    'cybersecurity-fundamentals': {
        title: 'Cybersecurity Fundamentals',
        issuer: 'Security Academy',
        image: 'Certificates/certificate-cybersecurity.jpg'
    }
};

let currentCertificateId = null;
let savedScrollPosition = 0;

// View certificate function
function viewCertificate(certificateId) {
    const certificate = certificateData[certificateId];
    if (!certificate) return;
    
    currentCertificateId = certificateId;
    
    // Save current scroll position
    savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Update modal content
    document.getElementById('certificateModalTitle').textContent = certificate.title;
    document.getElementById('certificateModalIssuer').textContent = certificate.issuer;
    
    const certificateImage = document.getElementById('certificateImage');
    const certificatePlaceholder = document.querySelector('.certificate-placeholder');
    
    // Try to load the certificate image
    const img = new Image();
    img.onload = function() {
        certificateImage.src = certificate.image;
        certificateImage.style.display = 'block';
        certificatePlaceholder.style.display = 'none';
    };
    img.onerror = function() {
        certificateImage.style.display = 'none';
        certificatePlaceholder.style.display = 'block';
    };
    img.src = certificate.image;
    
    // Show modal and preserve scroll position
    const modal = document.getElementById('certificateModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollPosition}px`;
    document.body.style.width = '100%';
}

// Close certificate modal
function closeCertificateModal() {
    const modal = document.getElementById('certificateModal');
    modal.classList.remove('active');
    
    // Temporarily disable smooth scrolling to avoid jump animation
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Restore scroll position
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restore the exact scroll position instantly (no smooth scroll)
    window.scrollTo(0, savedScrollPosition);
    
    // Restore smooth scrolling after a brief delay
    setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 50);
    
    currentCertificateId = null;
}

// Download certificate
function downloadCertificate() {
    if (!currentCertificateId) return;
    
    const certificate = certificateData[currentCertificateId];
    if (!certificate) return;
    
    // Download the certificate image
    const link = document.createElement('a');
    link.href = certificate.image;
    link.download = `${certificate.title.replace(/\s+/g, '_')}_Certificate.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('certificateModal');
    if (e.target === modal) {
        closeCertificateModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('certificateModal');
        if (modal && modal.classList.contains('active')) {
            closeCertificateModal();
        }
    }
});

// Initialize loading animation
initializeLoadingAnimation();
