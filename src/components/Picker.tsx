import type { FC } from 'react';
import React, { useRef } from 'react';
import useColorDrag from '../hooks/useColorDrag';
import type { BaseColorPickerProps } from '../pages/interface';
import { calculateColor, calculateOffset } from '../utils';

import Handler from './Handler';
import Palette from './Palette';
import Transform from './Transform';

export type PickerProps = BaseColorPickerProps;

const Picker: FC<PickerProps> = ({
  color,
  onChange,
  prefixCls,
  onChangeComplete,
  disabled,
}) => {
  const pickerRef = useRef(); // 面板点击信息
  const transformRef = useRef();
  const colorRef = useRef(color);
  const [offset, dragStartHandle] = useColorDrag({
    color,
    containerRef: pickerRef,
    targetRef: transformRef,
    calculate: containerRef =>
      calculateOffset(containerRef, transformRef, color),
    onDragChange: offsetValue => {
      const calcColor = calculateColor({
        offset: offsetValue,
        targetRef: transformRef,
        containerRef: pickerRef,
        color,
      });
      colorRef.current = calcColor;
      onChange(calcColor);
    },
    onDragChangeComplete: () => onChangeComplete?.(colorRef.current),
    disabledDrag: disabled,
  });

  return (
    <div
      ref={pickerRef}
      className={`${prefixCls}-select`}
      onMouseDown={dragStartHandle} // 鼠标按下时进行触发
      onTouchStart={dragStartHandle} // 鼠标触碰时触发 这块是为了兼容性进行处理
    >
      <Palette prefixCls={prefixCls}>
        {/* 鼠标原点获取偏移坐标点 */}
        <Transform offset={offset} ref={transformRef}>
          <Handler color={color.toRgbString()} prefixCls={prefixCls} />
        </Transform>
        {/* 颜色面板 */}
        <div
          className={`${prefixCls}-saturation`}
          style={{
            // hsl 色相（H:hue）、饱和度（S:saturation）、亮度（L:lightness）
            backgroundColor: `hsl(${color.toHsb().h}, 100%, 50%)`,
            // 色相的实现：从左 0 度黑色到 90 度白色，饱和度 100% 为纯色，亮度 50% 为中等亮度，亮度 0% 为黑色
            // hsla 中各个部分定义说明： 
            // hue 定义色轮上的度数（从 0 到 360）- 0（或 360）为红色，120 为绿色，240 为蓝色。
            // saturation 定义饱和度 - 0％ 是灰度，而 100％ 是全彩色（完全饱和）。
            // lightness 定义亮度 - 0％ 是黑色、50％ 为正常、100％ 是白色。
            // alpha 定义不透明度，介于 0.0（完全透明）和 1.0（完全不透明）之间的数字。
            backgroundImage:
              'linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))',
          }}
        />
      </Palette>
    </div>
  );
};

export default Picker;
