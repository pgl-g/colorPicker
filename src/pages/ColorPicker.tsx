import type { CSSProperties } from 'react';
import React, { forwardRef, useMemo, useState, useRef, useEffect } from 'react';
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


function CheckIsColor(colorValue: { match: (arg0: RegExp) => null; }) {
  var type = "^\#[0-9a-fA-F]{6}{1}$";
  var re = new RegExp(type);
  if (colorValue.match(re) == null) {
      type = "^[rR][gG][Bb][\(]((2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),){2}(2[0-4]\\d|25[0-5]|[01]?\\d\\d?)[\)]{1}$";
      re = new RegExp(type);
      if (colorValue.match(re) == null) {
          alert("no");
      } else {
          alert("yes");
      }
  } else {
      alert("yes");
  }
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
  const [modeNode, setModeNode] = useState<string>('');

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


  const handleChangeVal = (e: any) => {
    const { value: v } = e.target;
    // TODO：目前处理rgb后期可能会出现其他格式
    const rgb = colorValue.toRgb();
    var rgbRegex = /^(\d+),\s*(\d+),\s*(\d+)$/; 
    const partsRGB = v.match(rgbRegex);
    if (partsRGB && partsRGB.length > 0) {
      rgb.r = partsRGB?.[1];
      rgb.g = partsRGB?.[2];
      rgb.b = partsRGB?.[3];

      const genColor = generateColor(rgb);
      if (!value) {
        setColorValue(genColor)
      }
    }
    setModeNode(v);
  }


  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setSelectValue(value);
  }


  // TODO: 后期处理
  // const selectModeNode = useMemo(() => {
  //   switch (selectValue) {
  //     case 'HEX':
  //       return colorValue.toHexString();
  //     case 'RGB':
  //       const { r, g, b: rB } = colorValue.toRgb();
  //       return [r, g, rB].join(',');
  //     default:
  //       const { h, s, b } = colorValue.toHsb();
  //       // TODO: 这里还需要进行处理
  //       const hsbH = Math.floor(Number(h));
  //       const hsbS = `${Math.floor(Number(s) * 100)}%`;
  //       const hsbB = `${Math.floor(Number(b) * 100)}%`;
  //       return [hsbH, hsbS, hsbB].join(',');
  //   }
  // }, [selectValue, colorValue]);


  useEffect(() => {
  if (selectValue === 'RGB') {
    const { r, g, b: rB } = colorValue.toRgb();
    const rgbStr = [r, g, rB].join(',');
    setModeNode(rgbStr)
  }
  }, [selectValue, colorValue])


  // console.log(selectModeNode, '=-=-=-=')

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
        {/* config inp */}
        <div className={`${prefixCls}-colorPart-inputGroup`}>
          <div className={`${prefixCls}-input-warp`}>
            <input type="text" className={`${prefixCls}-colorValue-inputTxt`} value={modeNode} onChange={handleChangeVal} />
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
