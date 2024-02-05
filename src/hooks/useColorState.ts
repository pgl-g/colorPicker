import { useEffect, useState } from 'react';
import type { Color } from '../pages/color';
import type { ColorGenInput } from '../pages/interface';
import { generateColor } from '../pages/util';

type ColorValue = ColorGenInput | undefined;

function hasValue(value: ColorValue) {
  return value !== undefined;
}

const useColorState = (
  defaultStateValue: ColorValue,
  option: {
    defaultValue?: ColorValue;
    value?: ColorValue;
  },
): [Color, React.Dispatch<React.SetStateAction<Color>>] => {
  const { defaultValue, value } = option;
  const [colorValue, setColorValue] = useState(() => {
    let mergeState;
    if (hasValue(value)) {
      mergeState = value;
    } else if (hasValue(defaultValue)) {
      mergeState = defaultValue;
    } else {
      mergeState = defaultStateValue;
    }
    return generateColor(mergeState);
  });

  useEffect(() => {
    if (value) {
      setColorValue(generateColor(value));
    }
  }, [value]);

  return [colorValue, setColorValue];
};

export default useColorState;
