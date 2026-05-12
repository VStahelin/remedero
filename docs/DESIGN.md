---
name: Obsidian Health System
colors:
  surface: '#14121c'
  surface-dim: '#14121c'
  surface-bright: '#3b3743'
  surface-container-lowest: '#0f0d16'
  surface-container-low: '#1d1a24'
  surface-container: '#211e28'
  surface-container-high: '#2b2833'
  surface-container-highest: '#36333e'
  on-surface: '#e6e0ee'
  on-surface-variant: '#cac3d8'
  inverse-surface: '#e6e0ee'
  inverse-on-surface: '#322f3a'
  outline: '#948ea1'
  outline-variant: '#494455'
  surface-tint: '#cdbdff'
  primary: '#cdbdff'
  on-primary: '#370096'
  primary-container: '#7c4dff'
  on-primary-container: '#fcf6ff'
  inverse-primary: '#6833ea'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#ffb688'
  on-tertiary: '#512400'
  tertiary-container: '#b55800'
  on-tertiary-container: '#fff7f4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8deff'
  primary-fixed-dim: '#cdbdff'
  on-primary-fixed: '#20005f'
  on-primary-fixed-variant: '#4f00d0'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffdbc7'
  tertiary-fixed-dim: '#ffb688'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#733600'
  background: '#14121c'
  on-background: '#e6e0ee'
  surface-variant: '#36333e'
typography:
  display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 24px
  container-padding-desktop: 48px
  gutter: 16px
  section-gap: 40px
  element-gap: 12px
---

## Brand & Style

The design system is centered on a "Quiet Ritual" philosophy. It moves away from the anxiety-inducing, clinical nature of traditional medical apps toward a lifestyle-centric, premium wellness experience. The aesthetic is a sophisticated blend of **Minimalism** and **Glassmorphism**, prioritizing focus through heavy whitespace and a reduction of non-essential decorative elements. 

The emotional goal is to provide a sense of calm, control, and reliability. By utilizing a deep obsidian foundation, the interface recedes into the background, allowing the medication data and habit streaks to "float" as luminous objects of focus. It is designed for the modern user who views health as a high-performance habit rather than a chore.

## Colors

The palette is anchored in a deep **Obsidian (#0A0A0A)** to ensure absolute black levels on OLED displays, enhancing the premium feel. 

- **Primary Accent:** A vibrant **Soft Violet (#7C4DFF)** is used for primary actions and focus states, providing a modern, energetic contrast to the dark surfaces.
- **Secondary Accent:** An **Electric Blue (#00E5FF)** is reserved for secondary data visualizations or interactive "habit" indicators.
- **Surface Geometry:** Surfaces use **Soft Grey (#1C1C1E)** to create subtle separation from the background without losing the dark-mode immersion.
- **Functional Colors:** **Success Green (#30D158)** is used exclusively for completion states and "medication taken" confirmations, while **Error Red (#FF453A)** is used for missed doses or critical alerts.

## Typography

This design system utilizes **Inter** for its exceptional legibility in dark mode and its neutral, systematic character. 

The type scale is generous, favoring large headlines to guide the user's eye quickly. **Display** and **Headline-LG** styles use tighter letter-spacing and heavier weights to create a sense of authority and modernity. Body text is kept clean with ample line height to ensure readability for users who may be viewing the app in low-light conditions or while on the move. Labels use a slightly heavier weight to maintain hierarchy against vibrant accent colors.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with fixed outer margins. On mobile devices, a 24px container padding is strictly enforced to ensure content feels "aired out" and premium. 

Spacing follows a strict 8px base unit. 
- **Section Gaps:** 40px gaps between major content blocks (e.g., Morning Meds vs. Evening Meds) to provide clear mental separation.
- **Component Spacing:** 12px or 16px internal padding for cards and list items.
- **Whitespace:** Elements are never crowded. If a screen feels "full," the design should move toward a vertical scroll rather than compressing elements.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** and **Tonal Layering** rather than traditional shadows. 

1.  **Base Layer:** The deepest layer is the #0A0A0A background.
2.  **Surface Layer:** Cards and interactive containers use #1C1C1E.
3.  **Glass Layer:** Modals and high-priority cards utilize a backdrop-blur effect (20px-30px) with a 10% white tint and a very fine 0.5px white border (15% opacity) to simulate a "glass edge."
4.  **Interaction Depth:** When a card is pressed, it should subtly scale down (98%) and increase in brightness slightly, rather than casting a larger shadow. This maintains the sleek, flat-yet-layered aesthetic.

## Shapes

The shape language is defined by ultra-soft, **Pill-shaped (24px+)** geometry. This removes any "sharpness" or clinical coldness from the interface. 

- **Primary Cards:** 32px corner radius.
- **Buttons:** Fully pill-shaped (height/2) or 24px minimum.
- **Input Fields:** 16px corner radius to distinguish them slightly from larger container cards.
- **Icons:** Should feature rounded terminals and a consistent 2px stroke weight to match the softness of the containers.

## Components

### Buttons
- **Primary:** Solid Soft Violet fill with white text. High-contrast, pill-shaped.
- **Secondary:** Ghost style with a 1px border of Soft Violet or a subtle #1C1C1E background fill.

### Cards (Medication Items)
The hero component of the system. Cards use a subtle #1C1C1E surface with a 32px radius. To indicate a "Pending" medication, use a faint glassmorphic shimmer. For "Completed," the card can transition to a lower opacity or show a Success Green checkmark in the corner.

### Habit Rings/Streaks
Inspired by Apple Health, use circular progress indicators with the Primary Accent color. These should have a glow effect (soft outer blur) when a streak is active to celebrate the user's progress.

### Inputs
Search and dosage inputs should be oversized with a 16px radius and a dark #1C1C1E fill. The active state is indicated by a Soft Violet border glow.

### Time-Picker
A horizontal scrolling "Time-Strip" is recommended for medication scheduling, allowing users to quickly swipe through hours with haptic feedback.

### Empty States
Use large, soft-focus abstract shapes or blurred gradients in the background rather than literal "empty box" icons to maintain the lifestyle/premium feel.