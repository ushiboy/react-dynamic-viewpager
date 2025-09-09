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
  const content1 = "Content 1";
  const content2 = "Content 2";
  const content3 = "Content 3";

  const run = (data: string[]) =>
    render(<ViewPager data={data} ItemComponent={Page} />);

  it("should render viewpager structure elements", () => {
    const v = run([]);
    expect(v.container.querySelectorAll(".viewpager-container")).toHaveLength(
      1,
    );
    expect(v.container.querySelectorAll(".viewpager-wrapper")).toHaveLength(1);
    expect(v.container.querySelectorAll(".viewpager-page")).toHaveLength(3);
  });

  it("should render some page", () => {
    const v = run([content1, content2, content3]);

    const pageIndexes = v.container.querySelectorAll(".page-index");
    const pageDatas = v.container.querySelectorAll(".page-data");

    expect(pageIndexes).toHaveLength(2);
    expect(pageDatas).toHaveLength(2);

    expect(pageIndexes[0].textContent).toBe("0");
    expect(pageDatas[0].textContent).toBe(content1);

    expect(pageIndexes[1].textContent).toBe("1");
    expect(pageDatas[1].textContent).toBe(content2);
  });
});
