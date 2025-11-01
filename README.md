# Student Portfolio Website

A modern, creative, and fully responsive student portfolio website showcasing projects, skills, and creativity. Built with HTML5, CSS3, and JavaScript with advanced animations and interactive features.

## 🌟 Features

### Design & Layout
- **Modern Gradient Design** - Beautiful gradient backgrounds and color schemes
- **Responsive Layout** - Works perfectly on all devices (desktop, tablet, mobile)
- **Smooth Animations** - AOS (Animate On Scroll) library integration
- **Interactive Elements** - Hover effects, magnetic buttons, and floating animations

### Sections Included
1. **Hero Section** - Eye-catching introduction with animated typing effect
2. **About Section** - Personal information and highlights
3. **Skills Section** - Animated progress bars for different technologies
4. **Portfolio Section** - Filterable project showcase
5. **Gallery Section** - Interactive image gallery with modal lightbox
6. **Contact Section** - Contact form with floating labels and social links

### Advanced Features
- **Portfolio Filtering** - Filter projects by category (Web, Mobile, Design, Graphics)
- **Gallery Modal** - Full-screen image viewer with navigation
- **Smooth Scrolling** - Seamless navigation between sections
- **Loading Animation** - Professional loading screen
- **Cursor Trail Effect** - Interactive cursor following (desktop only)
- **Floating Shapes** - Animated background elements
- **Parallax Effects** - Depth and movement on scroll

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- Basic text editor (VS Code recommended)
- Local server (optional, for development)

### Installation
1. Download or clone the project files
2. Ensure you have these files:
   - `index.html` - Main HTML structure
   - `styles.css` - All styling and animations
   - `script.js` - Interactive functionality
   - `README.md` - This documentation

3. Open `index.html` in your web browser
4. For development, use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using VS Code Live Server extension
   Right-click index.html → "Open with Live Server"
   ```

## 🎨 Customization Guide

### Personal Information
Edit the following in `index.html`:

**Hero Section:**
```html
<span class="hero-greeting">Hello, I'm</span>
<h1 class="hero-name">
    <span class="text-gradient">Your Name</span>
</h1>
<p class="hero-title">Your Title</p>
<p class="hero-description">Your description...</p>
```

**Contact Information:**
```html
<span class="contact-value">your.email@email.com</span>
<span class="contact-value">+1 (555) 123-4567</span>
<span class="contact-value">Your Location</span>
```

### Colors and Branding
Modify CSS variables in `styles.css`:
```css
:root {
    --primary-color: #667eea;     /* Main brand color */
    --secondary-color: #764ba2;   /* Secondary brand color */
    --accent-color: #f093fb;      /* Accent color */
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Adding Your Projects
Replace placeholder projects in the Portfolio section:
```html
<div class="portfolio-item web">
    <div class="portfolio-image">
        <!-- Replace with your project image -->
        <img src="your-project-image.jpg" alt="Project Name">
    </div>
    <div class="portfolio-content">
        <h3>Your Project Name</h3>
        <p>Your project description</p>
        <div class="project-tags">
            <span class="tag">Technology 1</span>
            <span class="tag">Technology 2</span>
        </div>
    </div>
</div>
```

### Adding Gallery Images
Replace placeholder gallery items:
```html
<div class="gallery-item photography">
    <div class="gallery-image">
        <img src="your-gallery-image.jpg" alt="Gallery Item">
        <div class="gallery-overlay">
            <div class="gallery-overlay-content">
                <h4>Image Title</h4>
                <p>Image description</p>
                <button class="gallery-zoom" data-image="1">
                    <i class="fas fa-search-plus"></i>
                </button>
            </div>
        </div>
    </div>
</div>
```

### Skills Configuration
Update your skills in the Skills section:
```html
<div class="skill-item">
    <span class="skill-name">Skill Name</span>
    <div class="skill-bar">
        <div class="skill-progress" data-progress="85"></div>
    </div>
    <span class="skill-percentage">85%</span>
</div>
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🎯 Browser Support

- ✅ Chrome (60+)
- ✅ Firefox (60+)
- ✅ Safari (12+)
- ✅ Edge (79+)
- ❌ Internet Explorer

## 🔧 Dependencies

### External Libraries (CDN):
- **Font Awesome 6.0.0** - Icons
- **Google Fonts (Poppins)** - Typography
- **AOS (Animate On Scroll)** - Scroll animations

### No Build Process Required
This is a static website that runs directly in the browser without any build tools or compilation steps.

## 🎨 Design Elements

### Color Palette
- **Primary**: `#667eea` (Blue-Purple)
- **Secondary**: `#764ba2` (Purple)
- **Accent**: `#f093fb` (Pink)
- **Text**: `#333` (Dark Gray)
- **Light Text**: `#666` (Medium Gray)

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights Used**: 300, 400, 500, 600, 700

### Animation Effects
- **AOS Animations**: Fade, slide, zoom effects
- **CSS Transitions**: Smooth hover states
- **Transform Effects**: Scale, translate, rotate
- **Keyframe Animations**: Typing, floating, pulsing

## 📈 Performance Tips

1. **Optimize Images**: Compress images before adding them
2. **Lazy Loading**: Consider implementing lazy loading for gallery images
3. **CDN Usage**: External libraries are loaded from CDN for better caching
4. **Minification**: For production, consider minifying CSS and JS files

## 🐛 Troubleshooting

### Common Issues

**Animations not working:**
- Check if AOS library is loaded properly
- Ensure JavaScript is enabled in browser

**Layout broken on mobile:**
- Check viewport meta tag is present
- Verify responsive CSS rules

**Form not submitting:**
- The contact form is currently set up with placeholder functionality
- Implement server-side form handling for actual email sending

**Images not displaying:**
- Replace placeholder images with actual image files
- Check file paths are correct

## 🔮 Future Enhancements

Consider adding these features:
- [ ] Dark/Light mode toggle
- [ ] Multi-language support
- [ ] Blog integration
- [ ] Advanced project filtering
- [ ] Animation control settings
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] Progressive Web App features

## 📝 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 🤝 Support

If you need help customizing this portfolio:
1. Check this README for common customization tasks
2. Look at the code comments for guidance
3. Search online for specific CSS/JavaScript questions
4. Consider hiring a web developer for major modifications

---

**Made with ❤️ for students to showcase their amazing work!**
# MyWebsite
