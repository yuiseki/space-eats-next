export const NERIMA_BUILDINGS_STYLE: mapboxgl.Style = {
  version: 8,
  sources: {
    "nerima-buildings": {
      type: "vector",
      tiles: [
        "https://space-eats.yuiseki.net/nerima_buildings/{z}/{x}/{y}.pbf",
      ],
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "buildings-layer-fill",
      type: "fill",
      source: "nerima-buildings",
      "source-layer": "nerima_buildings",
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
    },
  ],
};
