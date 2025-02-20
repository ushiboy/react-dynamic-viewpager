import { render } from "@testing-library/react";
import { ViewPager } from "./ViewPager";

function Page(props: { index: number; data: string }) {
  const { index, data } = props;
  return (
    <div>
      <div className="page-index">{index}</div>
      <div className="page-data">{data}</div>
    </div>
  );
}

describe("ViewPager", () => {
  const run = () => render(<ViewPager data={[]} ItemComponent={Page} />);
});
