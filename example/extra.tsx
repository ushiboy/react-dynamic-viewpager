/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useState, useEffect, useRef, KeyboardEvent } from "react";
import { createRoot } from "react-dom/client";
import { ViewPager, ViewPagerRef } from "../src/";

type Props = {
  index: number;
  data: string;
};

function Page(props: Props) {
  const { index, data } = props;
  return (
    <div>
      <p>Page {index + 1}</p>
      <p>{data}</p>
    </div>
  );
}

const data = ["test 1", "test 2", "test 3", "test 4", "test 5"];

const index = 0;

function App(props: { index: number; data: string[] }) {
  const { data } = props;
  const [index, setIndex] = useState(props.index);
  const ref = useRef<ViewPagerRef>(null);

  useEffect(() => {
    const handle = (evt: KeyboardEvent<HTMLInputElement>) => {
      const { code } = evt;
      if (code === "ArrowLeft") {
        ref.current?.back();
      } else if (code === "ArrowRight") {
        ref.current?.forward();
      }
    };
    window.addEventListener("keydown", handle, false);

    return () => {
      window.removeEventListener("keydown", handle, false);
    };
  }, []);

  return (
    <div>
      <input
        type="range"
        value={index}
        max={data.length - 1}
        onChange={(evt) => setIndex(Number(evt.target.value))}
      />
      <ViewPager
        index={index}
        data={data}
        ItemComponent={Page}
        onChange={(nextIndex) => setIndex(nextIndex)}
        ref={ref}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App index={index} data={data} />
  </StrictMode>,
);
