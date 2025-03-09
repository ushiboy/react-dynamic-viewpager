import {
  ViewPagerItemComponent,
  ViewPagerRef,
  OnChangeEventHandler,
} from "./type";
import { useViewPager } from "./useViewPager";

type Props<T> = {
  index?: number;
  duration?: number;
  minDelta?: number;
  onChange?: OnChangeEventHandler;
  data: T[];
  ItemComponent: ViewPagerItemComponent<T>;
  ref?: ViewPagerRef;
};

export function ViewPager<T>({
  index,
  duration,
  minDelta,
  data,
  ItemComponent,
  ref,
  onChange,
}: Props<T>) {
  const {
    internalIndex,
    refContainer,
    refWrapper,
    containerWidth,
    transitionDuration,
    transform,
    userSelect,
    handleMouseDown,
    handleTouchStart,
  } = useViewPager({
    data,
    index,
    ref,
    duration,
    minDelta,
    onChange,
  });

  return (
    <div
      className="viewpager-container"
      ref={refContainer}
      style={{
        overflow: "hidden",
        position: "relative",
        margin: 0,
        padding: 0,
        cursor: "move",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className="viewpager-wrapper"
        ref={refWrapper}
        style={{
          position: "relative",
          float: "left",
          margin: 0,
          padding: 0,
          transitionProperty: "transform",
          width: containerWidth * 3,
          transitionDuration,
          transform,
          userSelect,
        }}
      >
        <Page width={containerWidth}>
          {renderContent(internalIndex - 1, data, ItemComponent)}
        </Page>
        <Page width={containerWidth}>
          {renderContent(internalIndex, data, ItemComponent)}
        </Page>
        <Page width={containerWidth}>
          {renderContent(internalIndex + 1, data, ItemComponent)}
        </Page>
      </div>
    </div>
  );
}

function Page({
  width,
  children,
}: {
  width: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="viewpager-page"
      style={{
        minHeight: 1,
        float: "left",
        margin: 0,
        padding: 0,
        top: 0,
        position: "relative",
        transitionProperty: "transform",
        width,
      }}
    >
      {children}
    </div>
  );
}

function renderContent<T>(
  index: number,
  data: T[],
  Component: ViewPagerItemComponent<T>,
) {
  if (!data || !data[index]) return null;

  return <Component index={index} data={data[index]} />;
}
