# Neon Theme Guide

This guide explains how to use the neon theme styling system that has been added to the website.

## CSS Variables

The following CSS custom properties are available:

```css
:root {
  --background: #0f0f0f; /* Deep black */
  --primary: #00f6ff;   /* Neon cyan */
  --secondary: #ff00ff; /* Neon magenta */
  --accent: #00ff6a;    /* Neon green */
  --text: #e0e0e0;      /* Soft white */
}
```

## Utility Classes

### Background Colors
- `.bg-neon-dark` - Deep black background
- `.bg-neon-primary` - Neon cyan background
- `.bg-neon-secondary` - Neon magenta background
- `.bg-neon-accent` - Neon green background

### Text Colors
- `.text-neon-light` - Soft white text
- `.text-neon-primary` - Neon cyan text
- `.text-neon-secondary` - Neon magenta text
- `.text-neon-accent` - Neon green text

### Border Colors
- `.border-neon-primary` - Neon cyan border
- `.border-neon-secondary` - Neon magenta border
- `.border-neon-accent` - Neon green border

### Glow Effects
- `.glow-neon-primary` - Cyan glow box shadow
- `.glow-neon-secondary` - Magenta glow box shadow
- `.glow-neon-accent` - Green glow box shadow

### Text Glow Effects
- `.text-glow-primary` - Cyan text with glow
- `.text-glow-secondary` - Magenta text with glow
- `.text-glow-accent` - Green text with glow

### Button Styles
- `.btn-neon-primary` - Neon cyan button with hover effects
- `.btn-neon-secondary` - Neon magenta button with hover effects
- `.btn-neon-accent` - Neon green button with hover effects

### Gradients
- `.gradient-neon-primary` - Primary to accent gradient
- `.gradient-neon-secondary` - Secondary to primary gradient
- `.gradient-neon-full` - All neon colors gradient

### Animations
- `.animate-neon-pulse` - Pulsing glow effect
- `.animate-neon-flicker` - Flickering opacity effect
- `.animate-neon-glow` - Pulsing text glow
- `.animate-neon-border` - Cycling border colors

## Usage Examples

### Basic Neon Page Layout
```jsx
<div className="bg-neon-dark min-h-screen">
  <h1 className="text-glow-primary text-4xl font-bold">
    Neon Title
  </h1>
  <p className="text-neon-light">
    Regular text content
  </p>
</div>
```

### Neon Buttons
```jsx
<button className="btn-neon-primary animate-neon-pulse">
  Click Me
</button>
```

### Glowing Cards
```jsx
<div className="bg-neon-dark border-neon-primary border-2 glow-neon-primary p-6 rounded-lg">
  <h3 className="text-neon-primary">Card Title</h3>
  <p className="text-neon-light">Card content</p>
</div>
```

### Animated Elements
```jsx
<div className="border-4 animate-neon-border p-4 rounded-lg">
  <span className="text-glow-accent animate-neon-glow">
    Animated Text
  </span>
</div>
```

## Best Practices

1. **Use dark backgrounds** - The neon colors work best against dark backgrounds
2. **Don't overuse animations** - Use sparingly for key elements
3. **Maintain contrast** - Ensure text remains readable
4. **Performance** - Animations use `will-change` for optimization
5. **Accessibility** - Consider users with motion sensitivity

## Integration with Existing Components

You can easily integrate neon styling into existing components:

```jsx
// Before
<button className="btn-primary">Click Me</button>

// After (neon theme)
<button className="btn-neon-primary">Click Me</button>
```

## Custom Usage

You can also use the CSS variables directly in your styles:

```css
.custom-element {
  background-color: var(--background);
  color: var(--primary);
  border: 2px solid var(--accent);
  box-shadow: 0 0 20px var(--primary);
}
```