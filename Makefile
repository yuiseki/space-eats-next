
fuck-sjis:
	find ./data/geocsv -name '*.csv' -type f -print0 | xargs -0 nkf -u --overwrite -w

csv2geojson:
	find ./data/geocsv -name '*.csv' -type f | xargs csv2geojson --lat "緯度" --lon "経度" > ./data/geojson/csv2.geojson

public/nerima_buildings/metadata.json:
	tippecanoe -e public/nerima_buildings -l nerima_buildings -rg -z18 -Z6 --no-tile-compression tmp/nerima_buildings.geojson