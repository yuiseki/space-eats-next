import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "./index.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  GeolocateControl,
  GeolocateControlRef,
  Layer,
  MapboxEvent,
  MapboxGeoJSONFeature,
  MapLayerMouseEvent,
  MapRef,
  Marker,
  NavigationControl,
  Source,
  ViewState,
  ViewStateChangeEvent,
} from "react-map-gl";

import type { FeatureCollection, GeometryObject } from "geojson";
import { useDebounce } from "../hooks/debounce";
import { CoordinatesTextView } from "../components/CoordinatesTextView";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchPlus,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

// map style
import { OSM_RASTER_TILE_STYLE } from "../maps/OsmRasterTileStyle";
import { BUILDINGS_FILL_STYLE } from "../maps/BuildingsFillStyle";

const Home: NextPage = () => {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState<ViewState>();
  const debouncedViewState = useDebounce<ViewState>(viewState, 2500);

  const geolocateControlRef = useRef<GeolocateControlRef>(null);

  const [geojson, setGeojson] = useState<FeatureCollection<GeometryObject>>({
    type: "FeatureCollection",
    features: [],
  });

  const [cursor, setCursor] = useState<string>("auto");

  const [hoverInfo, setHoverInfo] = useState<
    { x: number; y: number; feature: MapboxGeoJSONFeature } | undefined
  >();

  const [selectedFeatures, setSelectedFeatures] = useState<
    MapboxGeoJSONFeature[]
  >([]);

  const loadingOverpass = false;

  //
  // initial load
  //
  useEffect(() => {
    setTimeout(() => {
      // trigger geolocate if map hash is /0/0
      console.log(window.location.hash);
      if (!window.location.hash.endsWith("/0/0")) {
        return;
      }
      console.log("geolocateControlRef trigger");
      geolocateControlRef.current?.trigger();
    }, 500);
  }, []);

  //
  // map events
  //
  const onMapLoad = useCallback((e: MapboxEvent) => {
    const center = e.target.getCenter();
    const zoom = e.target.getZoom();
    setViewState({
      zoom: zoom,
      latitude: center.lat,
      longitude: center.lng,
      bearing: 0,
      pitch: 0,
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    });
  }, []);

  const onMapMove = useCallback((e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  }, []);

  const onMapMoveEnd = useCallback((e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  }, []);

  /*
  useEffect(() => {
    (async () => {
      if (!debouncedViewState) {
        return;
      }
      const center = debouncedViewState;
      const newGeojson = await fetchOverpassBuildings(
        center.latitude,
        center.longitude,
        center.zoom
      );
      setGeojson(newGeojson);
    })();
  }, [debouncedViewState]);
  */

  //
  // mouse events
  //
  const onMouseEnter = useCallback((e: MapLayerMouseEvent) => {
    setCursor("pointer");
    const {
      features,
      point: { x, y },
    } = e;
    const hoveredFeature = features && features[0];
    if (hoveredFeature) {
      mapRef.current?.setFeatureState(
        { source: "buildings-source", id: hoveredFeature.id },
        { hover: true }
      );
      setHoverInfo({ feature: hoveredFeature, x, y });
    } else {
      setHoverInfo(undefined);
    }
  }, []);

  const onMouseLeave = useCallback((e: MapLayerMouseEvent) => {
    setCursor("auto");
    mapRef.current?.querySourceFeatures("buildings-source").map((feature) => {
      mapRef.current?.setFeatureState(
        { source: "buildings-source", id: feature.id },
        { hover: false }
      );
    });
    setHoverInfo(undefined);
  }, []);

  const onClick = useCallback((event: any) => {
    onReset();
    const clickedFeature = event.features && event.features[0];
    if (!clickedFeature) {
      return;
    }
    mapRef.current?.setFeatureState(
      { source: "buildings-source", id: clickedFeature.id },
      { select: true }
    );
    setSelectedFeatures([clickedFeature]);
  }, []);

  const onReset = useCallback(() => {
    mapRef.current?.querySourceFeatures("buildings-source").map((feature) => {
      mapRef.current?.setFeatureState(
        { source: "buildings-source", id: feature.id },
        { select: false }
      );
    });
    setSelectedFeatures([]);
  }, []);

  //
  // icons
  //
  const pins = useMemo(() => {
    let size = 25;
    if (viewState) {
      size = viewState.zoom < 18 ? 20 : viewState.zoom < 19 ? 25 : 35;
    }
    return geojson.features.map((feature, i) => {
      if (!feature.properties) {
        return null;
      }
      if (!feature.properties.center) {
        return null;
      }

      return (
        <Marker
          key={`marker-${i}`}
          style={{ cursor: "pointer" }}
          longitude={feature.properties.center[0]}
          latitude={feature.properties.center[1]}
          anchor="center"
        >
          <FontAwesomeIcon size="2x" icon={faXmark} />
        </Marker>
      );
    });
  }, [geojson, viewState]);

  return (
    <div className={styles.container}>
      <Head>
        <title>SpaceEats</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>SpaceEats - 近所の困った空き家で生活が豊かに -</h1>
            <div
              className="tooltip"
              style={{
                zIndex: 10,
                background: "rgba(255, 255, 255, 0.7)",
                padding: "5px",
                width: "250px",
                position: "absolute",
                left: hoverInfo.x + 5,
                top: hoverInfo.y + 5,
              }}
            >
              <CoordinatesTextView feature={hoverInfo.feature} />
            </div>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={onMapMove}
          onMoveEnd={onMapMoveEnd}
          onLoad={onMapLoad}
          interactiveLayerIds={["buildings-layer-fill"]}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          //onMouseDown={onMouseDown}
          //onMouseMove={onMouseMove}
          //onMouseUp={onMouseUp}
          //dragPan={false}
          dragRotate={false}
          boxZoom={false}
          hash={true}
          cursor={cursor}
          mapLib={maplibregl}
          style={{ width: "100%", height: "100%" }}
          mapStyle={OSM_RASTER_TILE_STYLE}
        >
          <Source id="buildings-source" type="geojson" data={geojson}>
            <Layer {...BUILDINGS_FILL_STYLE} />
          </Source>
          <NavigationControl
            position="top-left"
            style={{ marginTop: "55px" }}
            showCompass={false}
          />
          <GeolocateControl
            ref={geolocateControlRef}
            position="top-left"
            showUserLocation={true}
            showAccuracyCircle={false}
            trackUserLocation={false}
            positionOptions={{ enableHighAccuracy: true }}
            fitBoundsOptions={{ zoom: 17 }}
          />
          <div
            className="fa-2xl"
            style={{
              zIndex: 100,
              display: "flex",
              position: "absolute",
              top: "50%",
              left: "50%",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            {!viewState || (viewState?.zoom && viewState.zoom < 16) ? (
              <FontAwesomeIcon size="2x" icon={faSearchPlus} />
            ) : loadingOverpass ? (
              <FontAwesomeIcon size="2x" icon={faSpinner} spin={true} />
            ) : (
              <FontAwesomeIcon size="2x" icon={faXmark} />
            )}
          </div>
          {pins}
        </Map>
      </main>
    </div>
  );
};

export default Home;
