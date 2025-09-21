// Everything Zambia Color Palette Viewer
// p5.js Interactive Color Palette Visualization

let canvas;
let colorPalettes;
let hoveredColor = null;
let selectedColor = null;
let animationOffset = 0;
let layout = null; // computed y-positions for titles/descriptions/swatches
let tooltip = { visible: false, x: 0, y: 0, textLines: [], bg: null, copiedAt: 0 };

// Font objects for proper loading
let playfairDisplay, lato, montserrat;

// Avoid blocking preload; fonts will be loaded non-blocking in setup()
function preload() {}

// Swatch sizing constants
const SWATCH_WIDTH = 120;
const SWATCH_HEIGHT = 80;
const SWATCH_SPACING = 20;

// Color palette data from visual identity guidelines
const colorData = {
    primary: {
        name: "Primary Palette: The National Soul",
        description: "Drawn from the Zambian flag and copper resources",
        colors: [
            { name: "Zambian Green", hex: "#198A00", description: "Natural resources and agricultural wealth" },
            { name: "Copper Orange", hex: "#EF7D00", description: "Mineral wealth and warmth of our people" },
            { name: "Freedom Red", hex: "#DE2010", description: "Struggle for freedom" },
            { name: "Sable Black", hex: "#000000", description: "The people of Zambia" },
            { name: "Unity White", hex: "#FFFFFF", description: "Peace and unity" }
        ]
    },
    secondary: {
        name: "Secondary Palette: The Zambian Landscape",
        description: "Inspired by the natural environment",
        colors: [
            { name: "Savanna Khaki", hex: "#C4B998", description: "Dry season plains" },
            { name: "Zambezi Blue", hex: "#2E4374", description: "Major rivers and lakes" },
            { name: "Rich Soil", hex: "#59322B", description: "Fertile farmlands" },
            { name: "Charcoal", hex: "#36454F", description: "Mopane woodlands" }
        ]
    },
    tertiary: {
        name: "Tertiary Palette: The Modern & Urban",
        description: "For future, innovation, and youth content",
        colors: [
            { name: "Kitenge Teal", hex: "#008080", description: "Modern Chitenge designs" },
            { name: "Graphite Grey", hex: "#424449", description: "Professional tech content" },
            { name: "Sunrise Gold", hex: "#FFC107", description: "Vibrant highlights" },
            { name: "Off-White Cream", hex: "#F5F5DC", description: "Sophisticated background" }
        ]
    }
};

function getTargetCanvasWidth() {
    const el = document.getElementById('p5-canvas');
    const byRect = el && el.getBoundingClientRect ? el.getBoundingClientRect().width : 0;
    if (byRect && byRect > 0) return Math.max(320, Math.floor(byRect));
    const parent = el && el.parentElement;
    const parentRect = parent && parent.getBoundingClientRect ? parent.getBoundingClientRect().width : 0;
    if (parentRect && parentRect > 0) return Math.max(320, Math.floor(parentRect));
    const container = document.querySelector('.container');
    const containerRect = container && container.getBoundingClientRect ? container.getBoundingClientRect().width : 0;
    if (containerRect && containerRect > 0) return Math.max(320, Math.floor(containerRect));
    return Math.max(320, window.innerWidth || 800);
}

class ColorSwatch {
    constructor(x, y, width, height, color, name, hex, description) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.name = name;
        this.hex = hex;
        this.description = description;
        this.hovered = false;
        this.scale = 1;
        this.targetScale = 1;
    }
    
    update() {
        // Smooth scaling animation
        this.scale = lerp(this.scale, this.targetScale, 0.1);
    }
    
    draw() {
        push();
        translate(this.x + this.width/2, this.y + this.height/2);
        scale(this.scale);
        
        // Main color rectangle
        fill(this.color);
        stroke(0, 0, 0, 50);
        strokeWeight(1);
        rect(-this.width/2, -this.height/2, this.width, this.height, 8);
        
        // Hover effect - glow
        if (this.hovered) {
            drawingContext.shadowColor = this.color;
            drawingContext.shadowBlur = 20;
            fill(this.color);
            rect(-this.width/2, -this.height/2, this.width, this.height, 8);
            drawingContext.shadowBlur = 0;
        }
        
        // Calculate text color based on background brightness
        let bgColor = this.color;
        let brightness = (red(bgColor) + green(bgColor) + blue(bgColor)) / 3;
        let textColor = brightness > 128 ? color(0, 0, 0) : color(255, 255, 255);
        
        // Color name and hex - using Lato as per guidelines for body text
        textAlign(CENTER, CENTER);
        textSize(12);
        if (lato) textFont(lato);
        textStyle(BOLD);
        
        // Text shadow for better readability
        fill(0, 0, 0, 50);
        text(this.name, 1, -8);
        text(this.hex, 1, 5);
        
        fill(255, 255, 255, 50);
        text(this.name, -1, -10);
        text(this.hex, -1, 3);
        
        // Main text with better spacing
        fill(textColor);
        text(this.name, 0, -9);
        text(this.hex, 0, 4);
        
        pop();
    }
    
    isMouseOver() {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= this.y && mouseY <= this.y + this.height;
    }
    
    setHovered(hovered) {
        this.hovered = hovered;
        this.targetScale = hovered ? 1.1 : 1.0;
    }
}

function setup() {
    // Create canvas (width from container, fallback to 800)
    const containerWidth = getTargetCanvasWidth();
    pixelDensity(Math.min(2, displayDensity()));
    canvas = createCanvas(containerWidth, 600);
    canvas.parent('p5-canvas');

    // Compute layout and resize canvas to fit all content
    computeLayout();
    resizeCanvas(containerWidth, layout.totalHeight);

    // Non-blocking font loads; when ready, recompute layout for accurate metrics
    loadFont('https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDYbtXK-F2qO0s.woff2', f => {
        playfairDisplay = f;
        computeLayout();
        resizeCanvas(width, layout.totalHeight);
    });
    loadFont('https://fonts.gstatic.com/s/lato/v24/S6u_w4BMUTPHjxsI9w2_FQftx9897sxZ.woff2', f => {
        lato = f;
        computeLayout();
        resizeCanvas(width, layout.totalHeight);
    });
    loadFont('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2', f => {
        montserrat = f;
    });

    // Initialize color swatches using computed swatch Y positions
    initializeColorSwatches();

    // Setup button event listeners
    setupButtons();
}

function draw() {
    background(255);
    
    // Update animation
    animationOffset += 0.02;
    
    // If swatches not ready (e.g., after font load/resize), ensure they exist
    if (!colorPalettes || colorPalettes.length === 0) {
        computeLayout();
        initializeColorSwatches();
    }

    // Draw title
    drawTitle();
    
    // Draw color palettes
    drawColorPalettes();
    
    // Update hovered color info
    updateHoverStateAndTooltip();

    // Draw tooltip if needed
    drawTooltip();
}

function initializeColorSwatches() {
    colorPalettes = [];
    
    // Calculate total width needed for each palette row and position using layout
    Object.keys(colorData).forEach((paletteKey, paletteIndex) => {
        let palette = colorData[paletteKey];
        let totalWidth = palette.colors.length * SWATCH_WIDTH + (palette.colors.length - 1) * SWATCH_SPACING;
        let startX = (width - totalWidth) / 2;
        
        let paletteSwatches = [];
        palette.colors.forEach((colorInfo, colorIndex) => {
            let x = startX + colorIndex * (SWATCH_WIDTH + SWATCH_SPACING);
            let y = layout.paletteBlocks[paletteIndex].swatchTopY;
            
            let swatch = new ColorSwatch(
                x, y, SWATCH_WIDTH, SWATCH_HEIGHT,
                color(colorInfo.hex),
                colorInfo.name,
                colorInfo.hex,
                colorInfo.description
            );
            
            paletteSwatches.push(swatch);
        });
        
        colorPalettes.push({
            name: palette.name,
            description: palette.description,
            swatches: paletteSwatches
        });
    });
}

function drawTitle() {
    // Main title - Playfair Display Bold as per guidelines for headings
    fill(25, 138, 0); // Zambian Green
    textAlign(CENTER, BASELINE);
    textSize(24);
    if (playfairDisplay) textFont(playfairDisplay);
    textStyle(BOLD);
    text("Everything Zambia Color Palettes", width/2, layout.titleBaselineY);
    
    // Subtitle / instructions - Lato Regular as per guidelines for body text
    fill(100, 100, 100);
    textSize(14);
    if (lato) textFont(lato);
    textStyle(NORMAL);
    text("Hover over colors to see details • Click to copy hex codes", width/2, layout.instructionsBaselineY);
}

function drawColorPalettes() {
    colorPalettes.forEach((palette, paletteIndex) => {
        const block = layout.paletteBlocks[paletteIndex];
        
        // Palette title - Playfair Display Bold as per guidelines for headings
        fill(239, 125, 0); // Copper Orange
        textAlign(CENTER, BASELINE);
        textSize(16);
        if (playfairDisplay) textFont(playfairDisplay);
        textStyle(BOLD);
        text(palette.name, width/2, block.titleBaselineY);
        
        // Palette description - Lato Regular as per guidelines for body text
        fill(100, 100, 100);
        textSize(12);
        if (lato) textFont(lato);
        textStyle(NORMAL);
        textAlign(CENTER, TOP);
        text(palette.description, width/2, block.descriptionTopY);
        
        // Draw swatches
        palette.swatches.forEach(swatch => {
            swatch.update();
            swatch.draw();
        });
    });
}

function updateHoverStateAndTooltip() {
    let found = null;
    colorPalettes.forEach(palette => {
        palette.swatches.forEach(swatch => {
            const over = swatch.isMouseOver();
            swatch.setHovered(over);
            if (over) found = swatch;
        });
    });
    hoveredColor = found;
    
    if (hoveredColor) {
        // Prepare tooltip content
        tooltip.visible = true;
        tooltip.textLines = [
            hoveredColor.name,
            hoveredColor.hex,
            hoveredColor.description
        ];
        // Position tooltip near mouse with edge avoidance
        const padding = 10;
        const tooltipWidth = 220;
        const tooltipHeight = 70;
        let tx = mouseX + 16;
        let ty = mouseY - tooltipHeight - 12;
        if (tx + tooltipWidth + padding > width) tx = mouseX - tooltipWidth - 16;
        if (ty < padding) ty = mouseY + 16;
        tooltip.x = tx;
        tooltip.y = ty;
        tooltip.bg = hoveredColor.color;
    } else {
        tooltip.visible = false;
    }
}

function drawTooltip() {
    if (!tooltip.visible) return;
    push();
    const w = 220;
    const h = 78;
    const r = 8;
    
    // Background with slight translucency and border
    noStroke();
    fill(255, 255, 255, 235);
    rect(tooltip.x, tooltip.y, w, h, r);
    stroke(0, 0, 0, 50);
    noFill();
    rect(tooltip.x, tooltip.y, w, h, r);

    // Small color chip
    noStroke();
    fill(tooltip.bg);
    rect(tooltip.x + 10, tooltip.y + 10, 18, 18, 3);

    // Text - using Lato as per guidelines for body text
    if (lato) textFont(lato);
    textAlign(LEFT, BASELINE);

    // Name
    fill(0);
    textSize(13);
    textStyle(BOLD);
    text(tooltip.textLines[0], tooltip.x + 36, tooltip.y + 23);

    // Hex
    textSize(12);
    textStyle(NORMAL);
    fill(60);
    text(tooltip.textLines[1], tooltip.x + 36, tooltip.y + 40);
    
    // Description (single line, clipped)
    let desc = tooltip.textLines[2] || '';
    if (desc.length > 38) desc = desc.slice(0, 35) + '…';
    fill(80);
    text(desc, tooltip.x + 10, tooltip.y + 60);

    // Copy button
    const btnX = tooltip.x + w - 72;
    const btnY = tooltip.y + 14;
    const btnW = 62;
    const btnH = 24;
    // Use CSS var --accent for consistency with theme
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#198A00';
    fill(accent);
    noStroke();
    rect(btnX, btnY, btnW, btnH, 6);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text( (millis() - tooltip.copiedAt < 1000) ? 'Copied!' : 'Copy', btnX + btnW/2, btnY + btnH/2 + 1);

    pop();
}

function mousePressed() {
    let didCopy = false;
    colorPalettes.forEach(palette => {
        palette.swatches.forEach(swatch => {
            if (swatch.isMouseOver()) {
                selectedColor = swatch;
                
                // Quick actions:
                // - Shift-click: set background to swatch color
                // - Alt/Option-click: set accent to swatch color
                if (keyIsDown(SHIFT)) {
                    if (window.applyThemeVars) window.applyThemeVars({ '--bg': swatch.hex });
                } else if (keyIsDown(ALT)) {
                    if (window.applyThemeVars) window.applyThemeVars({ '--accent': swatch.hex });
                }
                
                // If clicking inside tooltip copy button, copy hex
                if (tooltip.visible) {
                    const w = 220, h = 78;
                    const btnX = tooltip.x + w - 72;
                    const btnY = tooltip.y + 14;
                    const btnW = 62, btnH = 24;
                    if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
                        copyToClipboard(swatch.hex);
                        tooltip.copiedAt = millis();
                        didCopy = true;
                    }
                }
                
                // If not on the button, still copy when clicking the swatch itself
                if (!didCopy) {
                    copyToClipboard(swatch.hex);
                    tooltip.copiedAt = millis();
                    didCopy = true;
                }

                // Visual feedback on swatch
                swatch.targetScale = 0.95;
                setTimeout(() => { swatch.targetScale = 1.0; }, 120);
            }
        });
    });
    
    // If not clicking on a swatch, hide tooltip
    if (!didCopy && !hoveredColor) {
        tooltip.visible = false;
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Hex code copied to clipboard:', text);
        });
    } else {
        // Fallback for older browsers
        let textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showCopyConfirmation(hex) {
    // No-op: feedback is handled inside tooltip now
}

function setupButtons() {
    select('#export-btn').mousePressed(() => {
        saveCanvas('everything_zambia_color_palettes', 'png');
    });
    
    select('#reset-btn').mousePressed(() => {
        // Reset any animations or selections
        selectedColor = null;
        hoveredColor = null;
        animationOffset = 0;
    });
}

function windowResized() {
    const containerWidth = getTargetCanvasWidth();
    computeLayout();
    resizeCanvas(containerWidth, layout.totalHeight);
    
    // Reinitialize swatches with new dimensions
    initializeColorSwatches();
}

// -------- Layout computation helpers --------

function measureTextHeight(fontObj, size, styleConst) {
    // Robustly measure text height with a fallback to approximate metrics
    try {
        if (fontObj) textFont(fontObj);
        textSize(size);
        textStyle(styleConst);
        const asc = typeof textAscent === 'function' ? textAscent() : 0;
        const desc = typeof textDescent === 'function' ? textDescent() : 0;
        const h = (asc || 0) + (desc || 0);
        return (isFinite(h) && h > 0) ? h : size * 1.2;
    } catch (e) {
        return size * 1.2;
    }
}

function computeLayout() {
    // Spacing constants
    const topMargin = 32;
    const gapTitleToInstr = 12;
    const gapInstrToPaletteTitle = 24;
    const gapPaletteTitleToDesc = 8;
    const gapDescToSwatches = 18;
    const gapBetweenPalettes = 48;
    const bottomMargin = 40;

    // Measure text heights using loaded fonts/sizes
    const titleH = measureTextHeight(playfairDisplay, 24, BOLD);
    const instrH = measureTextHeight(lato, 14, NORMAL);
    const paletteTitleH = measureTextHeight(playfairDisplay, 16, BOLD);
    const paletteDescH = measureTextHeight(lato, 12, NORMAL);

    let y = topMargin; // start at top margin
    const titleBaselineY = y + titleH; // baseline for main title
    y = titleBaselineY + gapTitleToInstr;
    const instructionsBaselineY = y + instrH; // baseline for instructions
    y = instructionsBaselineY + gapInstrToPaletteTitle; // move below instructions

    // Build palette blocks
    const paletteKeys = Object.keys(colorData);
    const paletteBlocks = [];
    paletteKeys.forEach((_, idx) => {
        const titleBaselineY = y + paletteTitleH; // palette title baseline
        const descriptionTopY = titleBaselineY + gapPaletteTitleToDesc; // description top
        const swatchTopY = descriptionTopY + paletteDescH + gapDescToSwatches; // swatches top-left y
        
        paletteBlocks.push({
            titleBaselineY,
            descriptionTopY,
            swatchTopY
        });
        
        // Move y to space for swatches and gap to next palette
        y = swatchTopY + SWATCH_HEIGHT + gapBetweenPalettes;
    });

    const totalHeight = y + bottomMargin; // final canvas height

    layout = {
        titleBaselineY,
        instructionsBaselineY,
        paletteBlocks,
        totalHeight
    };
}
