import type { CSSProperties } from 'react';
import React, { forwardRef, useMemo, useState, useRef } from 'react';
import { ColorPickerPrefixCls, defaultColor, generateColor } from '../utils';

import classNames from 'classnames';
import ColorBlock from '@/components/ColorBlock';
import Picker from '@/components/Picker';
import Slider from '@/components/Slider';
import useColorState from '@/hooks/useColorState';
import type { BaseColorPickerProps, ColorGenInput } from './interface';

const hueColor = [
  'rgb(255, 0, 0) 0%',
  'rgb(255, 255, 0) 17%',
  'rgb(0, 255, 0) 33%',
  'rgb(0, 255, 255) 50%',
  'rgb(0, 0, 255) 67%',
  'rgb(255, 0, 255) 83%',
  'rgb(255, 0, 0) 100%',
];


const colorConfig = [
  {
    value: 'hex',
    key: 'hex'
  },
  {
    value: 'rgba',
    key: 'rgba'
  },
  {
    value: 'hsva',
    key: 'hsva'
  },
]

export interface ColorPickerProps extends BaseColorPickerProps {
  value?: ColorGenInput;
  defaultValue?: ColorGenInput;
  className?: string;
  style?: CSSProperties;
  /** Get panel element  */
  panelRender?: (panel: React.ReactElement) => React.ReactElement;
  /** Disabled alpha selection */
  disabledAlpha?: boolean;
}

export default forwardRef<HTMLDivElement, ColorPickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    prefixCls = ColorPickerPrefixCls,
    onChange,
    onChangeComplete,
    className,
    style,
    panelRender,
    disabledAlpha = false,
    disabled = false,
  } = props;
  const [colorValue, setColorValue] = useColorState(defaultColor, {
    value,
    defaultValue,
  });

  const [selectValue, setSelectValue] = useState('hex');
  const [alphaValue, setAlphaValue] = useState(100)

  const alphaColor = useMemo(() => {
    const rgb = generateColor(colorValue.toRgbString());
    // alpha color need equal 1 for base color
    rgb.setAlpha(1);
    return rgb.toRgbString();
  }, [colorValue]);

  const mergeCls = classNames(`${prefixCls}-panel`, className, {
    [`${prefixCls}-panel-disabled`]: disabled,
  });
  const basicProps = {
    prefixCls,
    onChangeComplete,
    disabled,
  };

  const handleChange: BaseColorPickerProps['onChange'] = (data, type) => {
    if (!value) {
      setColorValue(data);
    }

    if (type === 'alpha') {
      const alphaVal = ((data.a * 100) / 100).toFixed(2) * 100;
      console.log(alphaVal, 'alphaVal');

      setAlphaValue(alphaVal)
    }

    onChange?.(data, type);
  };


  // TODO: 为啥这部分不生效？
  const handleSuffix = (e: any) => {
    const { value } = e.target;
    setAlphaValue(Number(value));
  }


  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setSelectValue(value);
  }



  const selectModeNode = useMemo(() => {
    switch (selectValue) {
      case 'hex':
        return colorValue.toHexString()
      case 'rgba':
        const { r, g, b } = colorValue.toRgb()
        return [r, g, b].join(',');
      default:
        const { h, s, v } = colorValue.toHsv();
        return [h, s, v].map(item => Math.ceil(Number(item))).join(',');
    }
  }, [selectValue, colorValue])

  const defaultPanel = (
    <>
      {/* 面板 */}
      <Picker color={colorValue} onChange={handleChange} {...basicProps} />
      {/* 颜色滑块 */}
      <div className={`${prefixCls}-slider-container`}>
        <div
          className={classNames(`${prefixCls}-slider-group`, {
            [`${prefixCls}-slider-group-disabled-alpha`]: disabledAlpha,
          })}
        >
          <Slider
            gradientColors={hueColor}
            color={colorValue}
            value={`hsl(${colorValue.toHsb().h},100%, 50%)`}
            onChange={color => handleChange(color, 'hue')}
            {...basicProps}
          />
          {!disabledAlpha && (
            <Slider
              type="alpha"
              gradientColors={['rgba(255, 0, 4, 0) 0%', alphaColor]}
              color={colorValue}
              // value={colorValue.toRgbString()}
              value={alphaValue}
              onChange={color => handleChange(color, 'alpha')}
              {...basicProps}
            />
          )}
        </div>
        {/* 色块 */}
        {/* <ColorBlock color={colorValue.toRgbString()} prefixCls={prefixCls} /> */}
      </div>

      <div className={`${prefixCls}-colorPart`}>
        {/* 色块 */}
        <ColorBlock color={colorValue.toRgbString()} prefixCls={prefixCls} />
        {/* 输入框 */}
        <div className={`${prefixCls}-colorPart-inputGroup`}>
          <div className={`${prefixCls}-input-warp`}>
            <input type="text" className={`${prefixCls}-colorValue-inputTxt`} value={selectModeNode} />
          </div>
          <div className={`${prefixCls}-input-number`}>
            <div className={`${prefixCls}-input-warp ${prefixCls}-input-suffix`}>
              <input type="text" step={1} aria-aria-valuemin={0} aria-valuemax="100" value={alphaValue} aria-valuenow={100} className={`${prefixCls}-colorValue-inputNum`} onChange={handleSuffix} />
              <div className={`${prefixCls}-suffix`}>
                <span className={`${prefixCls}-inputNumberSuffix`}>%</span>
              </div>
            </div>
          </div>
        </div>
        {/* 选择抗 */}
        <div className={`${prefixCls}-colorPart-select`}>
          <select onChange={(e) => onSelectChange(e)}>
            {
              colorConfig.map(item => (
                <option key={item.key} value={item.value}>{item.value}</option>
              ))
            }
          </select>
        </div>
      </div>
    </>
  );

  return (
    <div className={mergeCls} style={style} ref={ref}>
      {typeof panelRender === 'function'
        ? panelRender(defaultPanel)
        : defaultPanel}
    </div>
  );
});
