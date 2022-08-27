import { StringStream } from "scramjet";
import { createReadStream, createWriteStream } from "fs";
import fs from "fs";
import * as turf from "@turf/turf";
import type { FeatureCollection, Polygon } from "geojson";

const tokyoGeoJSON = fs
  .readFileSync("./data/N03-22_13_220101.geojson")
  .toString();
console.log("tokyoGeoJSON loaded.");
const tokyo: FeatureCollection<Polygon> = JSON.parse(tokyoGeoJSON);
console.log("tokyoGeoJSON parsed.");

StringStream.from(createReadStream("./data/NASA_JPN_mesh3.tsv"))
  .CSVParse({ delimiter: "\t" })
  .filter((entry) => {
    for (const feature of tokyo.features) {
      const point = [parseFloat(entry[2]), parseFloat(entry[3])];
      console.log(point);
      if (turf.booleanPointInPolygon(point, feature.geometry)) {
        console.log("is tokyo");
        return true;
      }
    }
    return false;
  })
  .map((entry) => {
    const id = entry[0].replace(" ", "");
    const lightInt = entry[1];
    const lat0 = entry[2];
    const long0 = entry[3];
    const lat1 = entry[4];
    const long1 = entry[5];
    const geojson = {
      type: "Polygon",
      crs: {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84",
          meshcode: id,
          lightInt: lightInt,
        },
        coordinates: [
          [long0, lat0],
          [long0, lat1],
          [long1, lat0],
          [long1, lat1],
        ],
      },
    };
    return geojson;
  })
  .toJSONArray()
  .pipe(createWriteStream("./public/data/NASA_JPN_mesh3.geojson"));
