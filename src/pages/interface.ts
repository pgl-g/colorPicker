import type { Color } from './color';

/**
 * @description HSB颜色
 * @h 色相
 * @s 饱和度
 * @b 亮度
 */
export interface HSB {
  h: number | string; // 色相
  s: number | string; // 饱和度
  b: number | string; // 亮度
}

/**
 * @description RGB颜色
 * @r 红色
 * @g 绿色
 * @b 蓝色
 *
 */
export interface RGB {
  r: number | string; // 红色
  g: number | string; // 绿色
  b: number | string; // 蓝色
}

// 度
export interface HSBA extends HSB {
  a: number;
}

// 度
export interface RGBA extends RGB {
  a: number;
}

export type ColorGenInput<T = Color> =
  | string
  | number
  | RGB
  | RGBA
  | HSB
  | HSBA
  | T;

export type HsbaColorType = 'hue' | 'alpha';

/**
 * @x x 偏移量
 * @y y 偏移量
 */
export type TransformOffset = {
  x: number;
  y: number;
};



/**
 * @color 颜色
 * @prefixCls 样式前缀 
*/
export interface BaseColorPickerProps {
  color?: Color;
  prefixCls?: string;
  disabled?: boolean;
  onChange?: (color: Color, type?: HsbaColorType) => void;
  onChangeComplete?: (value: Color, type?: HsbaColorType) => void;
}
