import { LayerProps } from "react-map-gl";

// https://tech-blog.optim.co.jp/entry/2019/05/14/173000

// 空き家推定から5段階のカテゴリ別に分類するためのフィルタ
let STEP_0 = ["<", ["get", "Estimated_Akiya"], 90];
let STEP_1 = [
  "all",
  [">=", ["get", "Estimated_Akiya"], 90],
  ["<", ["get", "Estimated_Akiya"], 95],
];
let STEP_2 = [
  "all",
  [">=", ["get", "Estimated_Akiya"], 95],
  ["<", ["get", "Estimated_Akiya"], 100],
];
let STEP_3 = [
  "all",
  [">=", ["get", "Estimated_Akiya"], 100],
  ["<", ["get", "Estimated_Akiya"], 110],
];
let STEP_4 = [
  "all",
  [">=", ["get", "Estimated_Akiya"], 110],
  ["<", ["get", "Estimated_Akiya"], 116],
];

// 色の設定
let colors = [
  "rgba(0, 0, 255, 0.4)",
  "rgba(0, 255, 0, 0.4)",
  "rgba(255, 255, 0, 0.4)",
  "rgba(255, 0, 0, 0.4)",
  "rgba(255, 0, 0, 0.8)",
];

export const BUILDINGS_AKIYA_STYLE: LayerProps = {
  id: "akiya-layer-circle",
  type: "circle",
  source: "akiya-source",
  paint: {
    "circle-radius": [
      "case",
      STEP_0,
      0,
      STEP_1,
      10,
      STEP_2,
      15,
      STEP_3,
      20,
      STEP_4,
      30,
      0,
    ],
    "circle-color": [
      "case",
      STEP_0,
      colors[0],
      STEP_1,
      colors[1],
      STEP_2,
      colors[2],
      STEP_3,
      colors[3],
      STEP_4,
      colors[4],
      colors[0],
    ],
  },
};
