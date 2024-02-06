/**
 * @description 监听鼠标落点及移动的最新坐标
 */

import { useEffect, useRef, useState } from 'react';
import type { Color } from '../pages/color';
import type { TransformOffset } from '../pages/interface';

type EventType =
  | MouseEvent
  | React.MouseEvent<Element, MouseEvent>
  | React.TouchEvent<Element>
  | TouchEvent;

type EventHandle = (e: EventType) => void;

interface useColorDragProps {
  color?: Color;
  offset?: TransformOffset;
  containerRef: React.RefObject<HTMLDivElement>;
  targetRef: React.RefObject<HTMLDivElement>;
  direction?: 'x' | 'y';
  onDragChange?: (offset: TransformOffset) => void;
  onDragChangeComplete?: () => void;
  calculate?: (
    containerRef: React.RefObject<HTMLDivElement>,
  ) => TransformOffset;
  /** Disabled drag */
  disabledDrag?: boolean;
}

// 获取点位置
function getPosition(e: EventType) {
  const obj = 'touches' in e ? e.touches[0] : e;
  const scrollXOffset =
    document.documentElement.scrollLeft ||
    document.body.scrollLeft ||
    window.pageXOffset;
  const scrollYOffset =
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    window.pageYOffset;
  console.log()
  return { pageX: obj.pageX - scrollXOffset, pageY: obj.pageY - scrollYOffset };
}

function useColorDrag(
  props: useColorDragProps,
): [TransformOffset, EventHandle] {
  const {
    offset,
    targetRef,
    containerRef,
    direction,
    onDragChange,
    onDragChangeComplete,
    calculate,
    color,
    disabledDrag,
  } = props;
  const [offsetValue, setOffsetValue] = useState(offset || { x: 0, y: 0 });
  const mouseMoveRef = useRef<(event: MouseEvent) => void>(null);
  const mouseUpRef = useRef<(event: MouseEvent) => void>(null);
  const dragRef = useRef({
    flag: false,
  });

  // 记录默认初识坐标点
  useEffect(() => {
    if (dragRef.current.flag === false) {
      const calcOffset = calculate?.(containerRef);
      if (calcOffset) {
        setOffsetValue(calcOffset);
      }
    }
  }, [color, containerRef]);

  useEffect(
    () => () => {
      document.removeEventListener('mousemove', mouseMoveRef.current);
      document.removeEventListener('mouseup', mouseUpRef.current);
      document.removeEventListener('touchmove', mouseMoveRef.current);
      document.removeEventListener('touchend', mouseUpRef.current);
      mouseMoveRef.current = null;
      mouseUpRef.current = null;
    },
    [],
  );

  // 更新偏移量
  const updateOffset: EventHandle = e => {
    const { pageX, pageY } = getPosition(e);
    const {
      x: rectX,
      y: rectY,
      width,
      height,
    } = containerRef.current.getBoundingClientRect(); // 当前面板： 返回一个矩形集合，表示当前盒子在浏览器的位置及空间的大小
    const { width: targetWidth, height: targetHeight } =
      targetRef.current.getBoundingClientRect(); // 当前点击的点：


    // 获取点占据面板的偏移量
    const centerOffsetX = targetWidth / 2;
    const centerOffsetY = targetHeight / 2;
    console.log(targetWidth, targetHeight, '点的高及宽');


    const offsetX = Math.max(0, Math.min(pageX - rectX, width)) - centerOffsetX;
    const offsetY =
      Math.max(0, Math.min(pageY - rectY, height)) - centerOffsetY;

    const calcOffset = {
      x: offsetX,
      y: direction === 'x' ? offsetValue.y : offsetY,
    };

    // Exclusion of boundary cases
    if (
      (targetWidth === 0 && targetHeight === 0) ||
      targetWidth !== targetHeight
    ) {
      return false;
    }

    setOffsetValue(calcOffset);
    // 获取最新的坐标点
    console.log(calcOffset, '计算最新坐标点')
    onDragChange?.(calcOffset);
  };

  const onDragMove: EventHandle = e => {
    e.preventDefault();
    console.log('鼠标移动')
    updateOffset(e);
  };

  const onDragStop: EventHandle = e => {
    e.preventDefault();
    dragRef.current.flag = false;
    document.removeEventListener('mousemove', mouseMoveRef.current);
    document.removeEventListener('mouseup', mouseUpRef.current);
    document.removeEventListener('touchmove', mouseMoveRef.current);
    document.removeEventListener('touchend', mouseUpRef.current);
    mouseMoveRef.current = null;
    mouseUpRef.current = null;
    console.log('鼠标停下')
    onDragChangeComplete?.();
  };

  const onDragStart: EventHandle = e => {
    console.log('鼠标开始')
    // https://github.com/ant-design/ant-design/issues/43529
    document.removeEventListener('mousemove', mouseMoveRef.current);
    document.removeEventListener('mouseup', mouseUpRef.current);

    if (disabledDrag) {
      return;
    }
    updateOffset(e);
    dragRef.current.flag = true;
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragStop);
    document.addEventListener('touchmove', onDragMove);
    document.addEventListener('touchend', onDragStop);
    mouseMoveRef.current = onDragMove;
    mouseUpRef.current = onDragStop;
  };

  return [offsetValue, onDragStart];
}

export default useColorDrag;
