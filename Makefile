
fuck-sjis:
	find ./data -name '*.csv' -type f -print0 | xargs -0 nkf -u --overwrite -w

csv2geojson:
	find ./data -name '*.csv' -type f | xargs csv2geojson --lat "緯度" --lon "経度" > ./data/csv2.geojson
