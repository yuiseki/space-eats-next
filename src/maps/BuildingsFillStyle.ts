import { LayerProps } from "react-map-gl";

export const BUILDINGS_FILL_STYLE: LayerProps = {
  id: "buildings-layer-fill",
  type: "fill",
  source: "buildings-source",
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "select"], false],
      "green",
      ["any", ["boolean", ["has", "building:levels"], false]],
      "red",
      ["any", ["boolean", ["has", "source_ref"], false]],
      "yellow",
      "blue",
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "select"], false],
      0.8,
      ["boolean", ["feature-state", "hover"], false],
      0.8,
      0.4,
    ],
  },
  filter: ["==", "$type", "Polygon"],
};
