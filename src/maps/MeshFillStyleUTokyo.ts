import { LayerProps } from "react-map-gl";

// https://tech-blog.optim.co.jp/entry/2019/05/14/173000

// 人口から10段階のカテゴリ別に分類するためのフィルタ
let PT0_2050_1 = ["<", ["get", "PopT"], 100];
let PT0_2050_2 = [
  "all",
  [">=", ["get", "PopT"], 100],
  ["<", ["get", "PopT"], 200],
];
let PT0_2050_3 = [
  "all",
  [">=", ["get", "PopT"], 200],
  ["<", ["get", "PopT"], 300],
];
let PT0_2050_4 = [
  "all",
  [">=", ["get", "PopT"], 300],
  ["<", ["get", "PopT"], 400],
];
let PT0_2050_5 = [
  "all",
  [">=", ["get", "PopT"], 400],
  ["<", ["get", "PopT"], 500],
];
let PT0_2050_6 = [
  "all",
  [">=", ["get", "PopT"], 500],
  ["<", ["get", "PopT"], 600],
];
let PT0_2050_7 = [
  "all",
  [">=", ["get", "PopT"], 600],
  ["<", ["get", "PopT"], 700],
];
let PT0_2050_8 = [
  "all",
  [">=", ["get", "PopT"], 700],
  ["<", ["get", "PopT"], 800],
];
let PT0_2050_9 = [
  "all",
  [">=", ["get", "PopT"], 800],
  ["<", ["get", "PopT"], 900],
];
let PT0_2050_10 = [
  "all",
  [">=", ["get", "PopT"], 900],
  ["<", ["get", "PopT"], 1000],
];

// 色の設定
let colors = [
  "rgba(215, 25, 28, 0.3)",
  "rgba(232, 91, 580, 0.3)",
  "rgba(249, 158, 89, 0.3)",
  "rgba(254, 201, 128, 0.3)",
  "rgba(255, 237, 170, 0.3)",
  "rgba(237, 247, 201, 0.3)",
  "rgba(199, 230, 219, 0.3)",
  "rgba(157, 207, 228, 0.3)",
  "rgba(100, 165, 205, 0.3)",
  "rgba(44, 123, 182, 0.3)",
];

export const MESH_FILL_STYLE: LayerProps = {
  id: "mesh-layer-fill",
  type: "fill",
  source: "mesh-source",
  paint: {
    "fill-color": [
      "case",
      PT0_2050_1,
      colors[0],
      PT0_2050_2,
      colors[1],
      PT0_2050_3,
      colors[2],
      PT0_2050_4,
      colors[3],
      PT0_2050_5,
      colors[4],
      PT0_2050_6,
      colors[5],
      PT0_2050_7,
      colors[6],
      PT0_2050_8,
      colors[7],
      PT0_2050_9,
      colors[8],
      PT0_2050_10,
      colors[9],
      colors[9],
    ],
    "fill-outline-color": "white",
  },
};
