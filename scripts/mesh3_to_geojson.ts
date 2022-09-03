import { DataStream, StringStream } from "scramjet";
import { createReadStream, createWriteStream } from "fs";
import fs from "fs";
import * as turf from "@turf/turf";
import type { FeatureCollection, Polygon } from "geojson";

const tokyoGeoJSON = fs
  .readFileSync("./data/geojson/N03-22_13_220101.geojson")
  .toString();
console.log("tokyoGeoJSON loaded.");
const tokyo: FeatureCollection<Polygon> = JSON.parse(tokyoGeoJSON);
console.log("tokyoGeoJSON parsed.");
console.log("tokyoGeoJSON features: ", tokyo.features.length);

const main = async () => {
  await StringStream.from(createReadStream("./data/geotsv/NASA_JPN_mesh3.tsv"))
    .setOptions({ maxParallel: 4 })
    .lines()
    .distribute(
      (x) => {
        const xi = parseInt(x.replace(/^\s/, "").split("\t")[0]);
        if (isNaN(xi)) return "___" + 0;
        return "____" + (xi % 4);
      },
      (stream: StringStream) => {
        return stream
          .parse((line) => {
            return line.replace(/^\s/, "").split("\t");
          })
          .filter((entry: any) => {
            console.log(entry);
            return tokyo.features.some((feature) => {
              const point = [parseFloat(entry[2]), parseFloat(entry[3])];
              const someNaN = point.some((p) => isNaN(p));
              console.log(someNaN);
              if (someNaN) return false;
              return turf.booleanPointInPolygon(point, feature.geometry);
            });
          })
          .map((entry: any) => {
            console.log(entry);
            const id = entry[0];
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
          });
      }
    )
    .pipe(process.stdout);
  /*
  .map((result) => {
    console.log(JSON.stringify(result));
    return result;
  })
  .toJSONArray()
  .pipe(createWriteStream("./public/data/NASA_JPN_mesh3.geojson"));
  */
};

(async () => {
  await main();
})();
