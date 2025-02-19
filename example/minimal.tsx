import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ViewPager } from "../src/";

type Props = {
  index: number;
  data: string;
};

function Page(props: Props) {
  const { index, data } = props;
  return (
    <div style={{ minHeight: 480 }}>
      <p>Page {index + 1}</p>
      <p>{data}</p>
    </div>
  );
}

const data = ["test 1", "test 2", "test 3", "test 4", "test 5"];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ViewPager data={data} ItemComponent={Page} />
  </StrictMode>,
);
