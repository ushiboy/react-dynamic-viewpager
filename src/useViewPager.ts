import {
  useCallback,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  MouseEventHandler,
  useMemo,
  TouchEventHandler,
} from "react";
import { ViewPagerRef, OnChangeEventHandler } from "./type";

type Props<T> = {
  data: T[];
  index?: number;
  ref?: ViewPagerRef;
  duration?: number;
  minDelta?: number;
  onChange?: OnChangeEventHandler;
};

type UserSelect = "none" | undefined;

type DraggingGesture = {
  isDragging: boolean;
  start: {
    x: number;
    y: number;
    time: number;
  };
  before: {
    x: number;
    y: number;
  };
  delta: {
    x: number;
    y: number;
  };
  diff: number;
  isVerticalScrolling?: boolean;
  enableNext: boolean;
  enableBack: boolean;
};

export function useViewPager<T>({
  index,
  ref,
  data,
  duration,
  minDelta,
  onChange,
}: Props<T>) {
  duration = duration || 250;
  minDelta = minDelta || 20;

  const refContainer = useRef<HTMLDivElement>(null);
  const refWrapper = useRef<HTMLDivElement>(null);
  const currentPosition = useRef(0);

  const [internalIndex, setInternalIndex] = useState(index || 0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [userSelect, setUserSelect] = useState<UserSelect>();
  const [transitionDuration, setTransitionDuration] = useState("");
  const [transform, setTransform] = useState("");

  const enableBack = useMemo(() => internalIndex - 1 >= 0, [internalIndex]);

  const enableNext = useMemo(
    () => data[internalIndex + 1] != null,
    [data, internalIndex],
  );

  const translate = useCallback((translateX: number, duration: number = 0) => {
    currentPosition.current = translateX;
    setTransitionDuration(`${duration}ms`);
    setTransform(`translate(${translateX}px, 0)`);
  }, []);

  const changeInternalIndex = useCallback(
    (newIndex: number, oldIndex: number, animation: () => void) => {
      if (!data[newIndex]) return;

      animation();
      setInternalIndex(newIndex);
      if (onChange) {
        onChange(newIndex, oldIndex);
      }
    },
    [data, onChange],
  );

  const reset = useCallback(() => {
    setTimeout(() => {
      translate(-containerWidth, 0);
    }, 160);
  }, [containerWidth, translate]);

  const forward = useCallback(() => {
    changeInternalIndex(internalIndex + 1, internalIndex, () => {
      translate(-2 * containerWidth, 150);
      reset();
    });
  }, [internalIndex, containerWidth, changeInternalIndex, translate, reset]);

  const back = useCallback(() => {
    changeInternalIndex(internalIndex - 1, internalIndex, () => {
      translate(0, 150);
      reset();
    });
  }, [internalIndex, changeInternalIndex, translate, reset]);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const el = refContainer.current;
      if (!el) return;
      setUserSelect("none");

      let params = startGesture(e.pageX, e.pageY, enableNext, enableBack);

      const handleMouseMove = (e: MouseEvent) => {
        const next = moveGesture(params, e.pageX, e.pageY);
        if (isValid(next)) {
          e.preventDefault();
          translate(next.diff + currentPosition.current);
          params = next;
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        setUserSelect(undefined);
        el.removeEventListener("mousemove", handleMouseMove, false);
        el.removeEventListener("mouseup", handleMouseUp, false);
        if (!params.isDragging) {
          const rect = el.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          if (e.clientX < center) {
            back();
          } else {
            forward();
          }
        } else if (isValid(params)) {
          const vector = calculateVector(params, duration, minDelta);
          if (vector === 0) {
            reset();
          } else if (vector > 0) {
            forward();
          } else {
            back();
          }
        }
      };

      el.addEventListener("mousemove", handleMouseMove, false);
      el.addEventListener("mouseup", handleMouseUp, false);
    },
    [
      enableBack,
      enableNext,
      duration,
      minDelta,
      forward,
      back,
      reset,
      translate,
    ],
  );

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const el = refContainer.current;
      if (!el) return;
      setUserSelect("none");

      const touch = e.touches[0];
      let params = startGesture(
        touch.pageX,
        touch.pageY,
        enableNext,
        enableBack,
      );

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const next = moveGesture(params, touch.pageX, touch.pageY);
        if (isValid(next)) {
          e.preventDefault();
          translate(next.diff + currentPosition.current);
          params = next;
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        setUserSelect(undefined);
        el.removeEventListener("touchmove", handleTouchMove, false);
        el.removeEventListener("touchend", handleTouchEnd, false);
        if (!params.isDragging) {
          const rect = el.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const touch = e.touches[0];
          if (touch.clientX < center) {
            back();
          } else {
            forward();
          }
        } else if (isValid(params)) {
          const vector = calculateVector(params, duration, minDelta);
          if (vector === 0) {
            reset();
          } else if (vector > 0) {
            forward();
          } else {
            back();
          }
        }
      };

      el.addEventListener("touchmove", handleTouchMove, false);
      el.addEventListener("touchend", handleTouchEnd, false);
    },
    [
      enableBack,
      enableNext,
      duration,
      minDelta,
      forward,
      back,
      reset,
      translate,
    ],
  );

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

  useImperativeHandle(ref, () => {
    return {
      forward,
      back,
    };
  }, [forward, back]);

  return {
    internalIndex,
    containerWidth,
    transitionDuration,
    transform,
    refContainer,
    refWrapper,
    userSelect,
    forward,
    back,
    handleMouseDown,
    handleTouchStart,
  };
}

function calculateWidth(el: HTMLDivElement | null): number {
  if (!el) return 0;
  return el.getBoundingClientRect().width || el.offsetWidth;
}

function startGesture(
  x: number,
  y: number,
  enableNext: boolean,
  enableBack: boolean,
): DraggingGesture {
  return {
    isDragging: false,
    start: {
      x,
      y,
      time: Date.now(),
    },
    before: {
      x,
      y,
    },
    delta: {
      x: 0,
      y: 0,
    },
    diff: 0,
    enableNext,
    enableBack,
  };
}

function moveGesture(
  params: DraggingGesture,
  x: number,
  y: number,
): DraggingGesture {
  const delta = {
    x: x - params.start.x,
    y: y - params.start.y,
  };
  const isForward = delta.x < 0;
  let isVerticalScrolling = params.isVerticalScrolling;
  if (isVerticalScrolling == null) {
    isVerticalScrolling = Math.abs(delta.x) < Math.abs(delta.y);
  }

  let before = {
    x: params.before.x,
    y: params.before.y,
  };

  if ((isForward && params.enableNext) || (!isForward && params.enableBack)) {
    const diff = x - before.x;
    before = { x, y };
    return {
      ...params,
      isDragging: true,
      delta,
      before,
      isVerticalScrolling,
      diff,
    };
  }

  return {
    ...params,
    isDragging: true,
    delta,
    before,
    isVerticalScrolling,
    diff: 0,
  };
}

function calculateVector(
  gesture: DraggingGesture,
  limitDuration: number,
  limitDeltaX: number,
): number {
  if (gesture.isVerticalScrolling) return 0;

  const deltaX = gesture.delta.x;
  const absDeltaX = Math.abs(deltaX);
  const duration = Date.now() - gesture.start.time;
  const isValidSlide = duration < limitDuration && absDeltaX > limitDeltaX;
  const isForward = deltaX < 0;

  if (isValidSlide) {
    if (isForward && gesture.enableNext) {
      return 1;
    } else if (!isForward && gesture.enableBack) {
      return -1;
    }
  }
  return 0;
}

function isValid(gesture: DraggingGesture): boolean {
  return gesture.isVerticalScrolling === false;
}
