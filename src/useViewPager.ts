import { useState, useRef, useEffect, useImperativeHandle } from "react";
import { ViewPagerRef, OnChangeEventHandler } from "./type";

type Props<T> = {
  index?: number;
  ref?: ViewPagerRef;
  onChange?: OnChangeEventHandler;
  data: T[];
};

export function useViewPager<T>({ index, ref, data, onChange }: Props<T>) {
  const [internalIndex, setInternalIndex] = useState(index || 0);
  const [containerWidth, setContainerWidth] = useState(0);
  const refContainer = useRef<HTMLDivElement>(null);
  const refWrapper = useRef<HTMLDivElement>(null);

  const transitionDuration = "0ms";
  const transform = `translate(${-containerWidth}px,0)`;

  useEffect(() => {
    if (index != null) {
      setInternalIndex(index);
    }
  }, [index]);

  useEffect(() => {
    const handle = () => {
      setContainerWidth(calculateWidth(refContainer.current));
    };
    window.addEventListener("resize", handle, false);

    return () => {
      window.removeEventListener("resize", handle, false);
    };
  }, []);

  useEffect(() => {
    setContainerWidth(calculateWidth(refContainer.current));
  }, []);

  useImperativeHandle(ref, () => {
    return {
      forward() {
        const newIndex = internalIndex + 1;
        const hasNextPage = data[newIndex] != null;
        if (hasNextPage) {
          setInternalIndex(newIndex);
          if (onChange) {
            onChange(newIndex, internalIndex);
          }
        }
      },
      back() {
        const newIndex = internalIndex - 1;
        const hasBeforePage = data[newIndex] != null;
        if (hasBeforePage) {
          setInternalIndex(newIndex);
          if (onChange) {
            onChange(newIndex, internalIndex);
          }
        }
      },
    };
  }, [data, internalIndex, onChange]);

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
