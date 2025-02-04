# Skytok Theme System

## Color Theory and Design Decisions

The Skytok theme system is built around the brand's core visual identity, drawing inspiration from the logo's vibrant and modern color palette. The theme system supports both light and dark modes, ensuring optimal readability and visual comfort across different lighting conditions.

### Core Brand Colors

- Primary Pink (`#FF69B4`): Represents energy and creativity
- Deep Purple (`#6A5ACD`): Conveys trust and sophistication
- Bright Blue (`#1E90FF`): Symbolizes technology and innovation

### Theme Design Principles

1. **Accessibility First**
   - All color combinations meet WCAG 2.1 contrast requirements
   - Text remains readable in both light and dark modes

2. **Semantic Color Usage**
   - Primary actions use the brand's signature pink
   - Secondary actions utilize purple and blue tones
   - System feedback colors (success, warning, error) complement the brand palette

3. **Color Harmony**
   - Colors are balanced across the interface
   - Gradients smoothly transition between brand colors
   - Neutral grays are tinted with brand colors for cohesion

### Dark Mode Adaptation

The dark mode theme inverts the luminosity while maintaining brand recognition:

- Background colors use deep, rich tones instead of pure black
- Text and UI elements maintain proper contrast
- Brand colors are adjusted for optimal visibility in dark environments

### Implementation

The theme system is implemented using:
- Tailwind CSS for utility-based styling
- CSS Custom Properties for dynamic theme switching
- next-themes for seamless theme management
- CSS-in-JS for complex component styles

### Color Scale

#### Light Mode
- Primary: #FF69B4 (Pink)
- Secondary: #6A5ACD (Purple)
- Accent: #1E90FF (Blue)
- Background: #FFFFFF
- Surface: #F8F9FA
- Text: #1A1A1A

#### Dark Mode
- Primary: #FF8DC7 (Lighter Pink)
- Secondary: #8B7FE8 (Lighter Purple)
- Accent: #47A3FF (Lighter Blue)
- Background: #121212
- Surface: #1E1E1E
- Text: #FFFFFF
