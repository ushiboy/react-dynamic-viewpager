import { ComponentType, Ref } from "react";

export type ViewPagerItemProps<T> = {
  index: number;
  data: T;
};

export type ViewPagerItemComponent<T> = ComponentType<ViewPagerItemProps<T>>;

export type ViewPagerRefProps = {
  forward: () => void;
  back: () => void;
};

export type ViewPagerRef = Ref<ViewPagerRefProps>;

export type OnChangeEventHandler = (
  nextIndex: number,
  oldIndex: number,
) => void;
