/**
 * MiniDev ONE Template - UI Module Index
 * 
 * Export all UI utilities and components.
 */

// Grid System
export {
  GridSystem,
  GridCSSGenerator,
  BreakpointHelper,
  DEFAULT_GRID_CONFIG,
  useBreakpoint,
  createGrid,
  responsiveClass,
  type GridConfig,
} from './grid';

// Motion & Animation
export {
  EASING,
  Spring,
  SPRING_PRESETS,
  Timeline,
  TransitionManager,
  AnimatedList,
  StaggerAnimation,
  MotionPreference,
  type SpringConfig,
  type SpringValue,
  type Keyframe,
  type AnimationOptions,
} from './motion';

// UI Components
export {
  Button,
  Input,
  Card,
  Modal,
  Toast,
  Tabs,
  createBadge,
  createSkeleton,
  Dropdown,
  createTooltip,
  type ButtonProps,
  type InputProps,
  type CardProps,
  type ModalProps,
  type ToastOptions,
  type ToastType,
  type Tab,
  type TabsProps,
  type BadgeProps,
  type SkeletonProps,
  type DropdownProps,
  type TooltipProps,
} from './components';

// Pre-built Animations
export {
  entranceAnimations,
  exitAnimations,
  attentionAnimations,
  interactionAnimations,
  backgroundEffects,
  textEffects,
  loadingAnimations,
  AnimationController,
  MorphAnimation,
  ParallaxEffect,
  ScrollReveal,
} from './animations';

// Design System
export {
  DesignSystem,
  ColorUtils,
  GradientUtils,
  BorderUtils,
  TypographyUtils,
  AnimationUtils,
  GlassUtils,
  ThemeManager,
  themes,
  type ThemeConfig,
  type GlassOptions,
} from './design-system';

// Re-export everything as default
import { GridSystem } from './grid';
import { EASING } from './motion';
import { Button } from './components';
import { AnimationController } from './animations';
import { DesignSystem, ThemeManager, themes } from './design-system';

export default {
  Grid: GridSystem,
  Easing: EASING,
  Button,
  Animation: AnimationController,
  Design: DesignSystem,
  Theme: ThemeManager,
  themes,
};