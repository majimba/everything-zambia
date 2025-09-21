# Everything Zambia - Color Palette Viewer

An interactive p5.js visualization of the Everything Zambia brand color palettes, showcasing the three-tier color system from our visual identity guidelines.

## Features

### 🎨 **Interactive Color Palettes**
- **Primary Palette: The National Soul** - Colors from the Zambian flag and copper resources
- **Secondary Palette: The Zambian Landscape** - Natural environment inspired colors  
- **Tertiary Palette: The Modern & Urban** - Contemporary colors for innovation content

### 🖱️ **Interactive Features**
- **Hover Effects** - Color swatches scale and glow on hover
- **Click to Copy** - Click any color to copy its hex code to clipboard
- **Color Information** - Detailed color names, hex codes, and descriptions
- **Export Functionality** - Save the entire palette as a PNG image
- **Responsive Design** - Adapts to different screen sizes

### 🎯 **Color Details**

#### Primary Palette: The National Soul
- **Zambian Green** (#198A00) - Natural resources and agricultural wealth
- **Copper Orange** (#EF7D00) - Mineral wealth and warmth of our people
- **Freedom Red** (#DE2010) - Struggle for freedom
- **Sable Black** (#000000) - The people of Zambia
- **Unity White** (#FFFFFF) - Peace and unity

#### Secondary Palette: The Zambian Landscape
- **Savanna Khaki** (#C4B998) - Dry season plains
- **Zambezi Blue** (#2E4374) - Major rivers and lakes
- **Rich Soil** (#59322B) - Fertile farmlands
- **Charcoal** (#36454F) - Mopane woodlands

#### Tertiary Palette: The Modern & Urban
- **Kitenge Teal** (#008080) - Modern Chitenge designs
- **Graphite Grey** (#424449) - Professional tech content
- **Sunrise Gold** (#FFC107) - Vibrant highlights
- **Off-White Cream** (#F5F5DC) - Sophisticated background

## Usage

### **Getting Started**
1. Open `index.html` in a web browser
2. The interactive canvas will load automatically
3. Hover over color swatches to see detailed information
4. Click any color to copy its hex code to your clipboard

### **Controls**
- **Export Palette** - Saves the current view as a PNG image
- **Reset View** - Resets any animations or selections

### **Typography**
The viewer uses the recommended brand fonts:
- **Headings:** Playfair Display (elegant serif)
- **Body Text:** Lato (clean sans-serif)

## Technical Details

### **Built With**
- **p5.js** - Interactive graphics and animations
- **Vanilla JavaScript** - No additional frameworks
- **CSS3** - Modern styling and responsive design
- **Google Fonts** - Playfair Display and Lato

### **Browser Compatibility**
- Modern browsers with Canvas support
- Chrome, Firefox, Safari, Edge
- Mobile responsive design

### **File Structure**
```
color_palette_viewer/
├── index.html          # Main HTML file
├── sketch.js           # p5.js visualization code
├── styles.css          # CSS styling
└── README.md           # This file
```

## Development

### **Customization**
To modify colors or add new palettes, edit the `colorData` object in `sketch.js`:

```javascript
const colorData = {
    primary: {
        name: "Your Palette Name",
        description: "Description of your palette",
        colors: [
            { name: "Color Name", hex: "#HEXCODE", description: "Color description" }
        ]
    }
};
```

### **Adding New Features**
The code is organized with clear separation of concerns:
- `ColorSwatch` class handles individual color swatches
- `initializeColorSwatches()` sets up the layout
- `drawColorPalettes()` renders the visual elements
- Event handlers manage user interactions

## Brand Guidelines

This color palette viewer implements the visual identity guidelines from the Everything Zambia brand charter, ensuring consistency across all brand touchpoints.

### **Color Usage**
- **Primary colors** for main brand elements and CTAs
- **Secondary colors** for heritage and cultural content
- **Tertiary colors** for modern and innovation-focused content

### **Accessibility**
- High contrast ratios for readability
- Clear color names and hex codes
- Responsive design for all devices
- Keyboard and mouse interaction support

---

*Part of the Everything Zambia project - "Our Story, Told by Us"*
