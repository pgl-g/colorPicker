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
  // {
  //   value: 'HEX',
  //   key: 'HEX'
  // },
  {
    value: 'RGB',
    key: 'RGB'
  },
  // {
  //   value: 'HSB',
  //   key: 'HSB'
  // },
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

  const [selectValue, setSelectValue] = useState('RGB');
  const [alphaValue, setAlphaValue] = useState('100') as any;

  const alphaColor = useMemo(() => {
    const rgb = generateColor(colorValue.toRgbString());
    // alpha color need equal 1 for base color
    // console.log(rgb, 'rgb')
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
      setAlphaValue(alphaVal)
    }
    onChange?.(data, type);
  };


  // TODO: 可优
  const handleSuffix = (e: any, type: string) => {
    const { value: val } = e.target;


    if (val < 0 || val > 100) return false;


    const hsb = colorValue.toHsb();

    hsb.a = (val || 0) / 100;

    const genColor = generateColor(hsb)

    if (!value) {
      setColorValue(genColor);
    }

    setAlphaValue(val);
  }


  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setSelectValue(value);
  }



  const selectModeNode = useMemo(() => {
    switch (selectValue) {
      case 'HEX':
        return colorValue.toHexString()
      case 'RGB':
        const { r, g, b: rB } = colorValue.toRgb()
        return [r, g, rB].join(',');
      default:
        const { h, s, b } = colorValue.toHsb();
        // TODO: 这里还需要进行处理
        const hsbH = Math.floor(Number(h));
        const hsbS = `${Math.floor(Number(s) * 100)}%`;
        const hsbB = `${Math.floor(Number(b) * 100)}%`;
        return [hsbH, hsbS, hsbB].join(',');
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
              value={colorValue.toRgbString()}
              // value={alphaValue}
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
              <input 
                type="number" 
                step={1} 
                value={alphaValue}
                min={0}
                max={100} 
                className={`${prefixCls}-colorValue-inputNum`} 
                onChange={(e: any) => handleSuffix(e, 'alpha')}
              />
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
