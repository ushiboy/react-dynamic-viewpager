import {
  useCallback,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { ViewPagerRef, OnChangeEventHandler } from "./type";

type Props<T> = {
  index?: number;
  ref?: ViewPagerRef;
  onChange?: OnChangeEventHandler;
  data: T[];
};

export function useViewPager<T>({ index, ref, data, onChange }: Props<T>) {
  const refContainer = useRef<HTMLDivElement>(null);
  const refWrapper = useRef<HTMLDivElement>(null);

  const [internalIndex, setInternalIndex] = useState(index || 0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState("");
  const [transform, setTransform] = useState("");

  const translate = useCallback((translateX: number, duration: number = 0) => {
    setTransitionDuration(`${duration}ms`);
    setTransform(`translate(${translateX}px, 0)`);
  }, []);

  useEffect(() => {
    if (index != null) {
      setInternalIndex(index);
    }
  }, [index]);

  useEffect(() => {
    const handle = () => {
      const w = calculateWidth(refContainer.current);
      setContainerWidth(w);
      translate(-w);
    };
    window.addEventListener("resize", handle, false);

    return () => {
      window.removeEventListener("resize", handle, false);
    };
  }, [translate]);

  useEffect(() => {
    const w = calculateWidth(refContainer.current);
    setContainerWidth(w);
    translate(-w);
  }, [translate]);

  const changeInternalIndex = useCallback(
    (newIndex: number, oldIndex: number, animation: () => void) => {
      if (!data[newIndex]) return;

      animation();
      setInternalIndex(newIndex);
      if (onChange) {
        onChange(newIndex, oldIndex);
      }
    },
    [data, onChange, containerWidth],
  );

  useImperativeHandle(ref, () => {
    const reset = () => {
      setTimeout(() => {
        translate(-containerWidth, 0);
      }, 160);
    };

    return {
      forward() {
        changeInternalIndex(internalIndex + 1, internalIndex, () => {
          translate(-2 * containerWidth, 150);
          reset();
        });
      },
      back() {
        changeInternalIndex(internalIndex - 1, internalIndex, () => {
          translate(0, 150);
          reset();
        });
      },
    };
  }, [internalIndex, changeInternalIndex, containerWidth, translate]);

  return {
    internalIndex,
    containerWidth,
    transitionDuration,
    transform,
    refContainer,
    refWrapper,
  };
}

function calculateWidth(el: HTMLDivElement | null): number {
  if (!el) return 0;
  return el.getBoundingClientRect().width || el.offsetWidth;
}
