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
  duration = duration || 250;
  minDelta = minDelta || 20;

  const {
    internalIndex,
    refContainer,
    refWrapper,
    containerWidth,
    transitionDuration,
    transform,
  } = useViewPager({
    index,
    ref,
    data,
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
        }}
        onTransitionEnd={() => {
          // TODO
        }}
      >
        <Page width={containerWidth}>
          {renderPage(internalIndex - 1, data, ItemComponent)}
        </Page>
        <Page width={containerWidth}>
          {renderPage(internalIndex, data, ItemComponent)}
        </Page>
        <Page width={containerWidth}>
          {renderPage(internalIndex + 1, data, ItemComponent)}
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

function renderPage<T>(
  index: number,
  data: T[],
  Component: ViewPagerItemComponent<T>,
) {
  if (!data || !data[index]) return null;

  return <Component index={index} data={data[index]} />;
}
