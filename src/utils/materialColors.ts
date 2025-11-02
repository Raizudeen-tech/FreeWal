import {
  argbFromRgb,
  themeFromSourceColor,
  applyTheme,
  Hct,
  TonalPalette,
  Scheme,
  DynamicScheme,
  SchemeExpressive,
} from '@material/material-color-utilities';
import { Platform, PlatformColor, processColor } from 'react-native';

/**
 * Converts a hex color to ARGB format
 */
export function hexToArgb(hex: string): number {
  const rgb = hexToRgb(hex);
  return argbFromRgb(rgb.r, rgb.g, rgb.b);
}

/**
 * Converts hex color to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Converts ARGB to hex color
 */
export function argbToHex(argb: number): string {
  const r = (argb >> 16) & 255;
  const g = (argb >> 8) & 255;
  const b = argb & 255;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Generates a Material 3 Expressive color scheme from a source color
 * Uses SchemeExpressive for more vibrant, dynamic colors
 * For dark mode, uses higher contrast settings for better visibility
 */
export function generateExpressiveTheme(sourceColor: string, isDark: boolean) {
  const sourceArgb = hexToArgb(sourceColor);
  
  // Create Hct color from source
  const hct = Hct.fromInt(sourceArgb);
  
  // Generate expressive scheme with higher contrast for dark mode
  // Contrast level: 0.0 = normal, 1.0 = maximum contrast
  const contrastLevel = isDark ? 0.5 : 0.0; // Increase contrast in dark mode
  const scheme = new SchemeExpressive(hct, isDark, contrastLevel);
  
  return {
    primary: argbToHex(scheme.primary),
    onPrimary: argbToHex(scheme.onPrimary),
    primaryContainer: argbToHex(scheme.primaryContainer),
    onPrimaryContainer: argbToHex(scheme.onPrimaryContainer),
    
    secondary: argbToHex(scheme.secondary),
    onSecondary: argbToHex(scheme.onSecondary),
    secondaryContainer: argbToHex(scheme.secondaryContainer),
    onSecondaryContainer: argbToHex(scheme.onSecondaryContainer),
    
    tertiary: argbToHex(scheme.tertiary),
    onTertiary: argbToHex(scheme.onTertiary),
    tertiaryContainer: argbToHex(scheme.tertiaryContainer),
    onTertiaryContainer: argbToHex(scheme.onTertiaryContainer),
    
    error: argbToHex(scheme.error),
    onError: argbToHex(scheme.onError),
    errorContainer: argbToHex(scheme.errorContainer),
    onErrorContainer: argbToHex(scheme.onErrorContainer),
    
    background: argbToHex(scheme.background),
    onBackground: argbToHex(scheme.onBackground),
    
    surface: argbToHex(scheme.surface),
    onSurface: argbToHex(scheme.onSurface),
    surfaceVariant: argbToHex(scheme.surfaceVariant),
    onSurfaceVariant: argbToHex(scheme.onSurfaceVariant),
    
    outline: argbToHex(scheme.outline),
    outlineVariant: argbToHex(scheme.outlineVariant),
    
    inverseSurface: argbToHex(scheme.inverseSurface),
    inverseOnSurface: argbToHex(scheme.inverseOnSurface),
    inversePrimary: argbToHex(scheme.inversePrimary),
    
    shadow: argbToHex(scheme.shadow),
    scrim: argbToHex(scheme.scrim),
    
    surfaceTint: argbToHex(scheme.primary),
  };
}

/**
 * Extract colors from system wallpaper or use a default seed color
 * For React Native, we'll use a default expressive color
 * In a production app, you could integrate with native modules to extract wallpaper colors
 */
export function getSystemSeedColor(): string {
  // Try Android 12+ Material You dynamic accent as seed
  if (Platform.OS === 'android') {
    try {
      // '@android:color/system_accent1_500' is the primary dynamic accent on Android 12+
      const dyn = PlatformColor('@android:color/system_accent1_500') as any;
      const processed = processColor(dyn) as number | undefined;
      if (typeof processed === 'number') {
        // processColor returns ARGB int; convert to hex
        const a = (processed >> 24) & 255;
        const r = (processed >> 16) & 255;
        const g = (processed >> 8) & 255;
        const b = processed & 255;
        const hex = `#${[r, g, b]
          .map((v) => v.toString(16).padStart(2, '0'))
          .join('')}`;
        return hex.toUpperCase();
      }
    } catch {}
  }

  // Fallback expressive seed color for iOS/older Android
  return '#0061A4';
}

/**
 * Generate tonal palette for additional colors
 */
export function generateTonalPalette(sourceColor: string) {
  const sourceArgb = hexToArgb(sourceColor);
  const hct = Hct.fromInt(sourceArgb);
  const palette = TonalPalette.fromHueAndChroma(hct.hue, hct.chroma);
  
  return {
    tone0: argbToHex(palette.tone(0)),
    tone10: argbToHex(palette.tone(10)),
    tone20: argbToHex(palette.tone(20)),
    tone30: argbToHex(palette.tone(30)),
    tone40: argbToHex(palette.tone(40)),
    tone50: argbToHex(palette.tone(50)),
    tone60: argbToHex(palette.tone(60)),
    tone70: argbToHex(palette.tone(70)),
    tone80: argbToHex(palette.tone(80)),
    tone90: argbToHex(palette.tone(90)),
    tone95: argbToHex(palette.tone(95)),
    tone99: argbToHex(palette.tone(99)),
    tone100: argbToHex(palette.tone(100)),
  };
}
