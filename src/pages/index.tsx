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

import { useOverpass } from "../hooks/overpass";

import { OSM_RASTER_TILE_STYLE } from "../maps/OsmRasterTileStyle";
import { BUILDINGS_FILL_STYLE } from "../maps/BuildingsFillStyle";
import { LastEditUserIconView } from "../components/LastEditUserIconView";
import { MESH_FILL_STYLE } from "../maps/MeshFillStyleUTokyo";

const UsageGuide = () => {
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
      }}
    >
      <div
        style={{
          textAlign: "center",
          backgroundColor: "rgba(128, 128, 128, 0.4)",
          fontWeight: "bold",
          padding: "4px",
        }}
      >
        おそらく空き家ではない建物
      </div>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "rgba(0, 255, 0, 0.4)",
          fontWeight: "bold",
          padding: "4px",
        }}
      >
        空き家の可能性がある建物
      </div>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 0, 0.4)",
          fontWeight: "bold",
          padding: "4px",
        }}
      >
        空き家の可能性が高い建物
      </div>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "rgba(255, 0, 0, 0.4)",
          fontWeight: "bold",
          padding: "4px",
        }}
      >
        確実に空き家である建物
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState<ViewState>();
  const debouncedViewState = useDebounce<ViewState>(viewState, 2500);

  const geolocateControlRef = useRef<GeolocateControlRef>(null);

  const [buldingsGeoJSON, setBuildingsGeoJSON] = useState<
    FeatureCollection<GeometryObject>
  >({
    type: "FeatureCollection",
    features: [],
  });

  const [meshGeoJSON, setMeshGeoJSON] = useState<
    FeatureCollection<GeometryObject>
  >({
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

  const { fetchOverpassBuildings, loadingOverpass } = useOverpass();

  //
  // initial load
  //
  useEffect(() => {
    (async () => {
      const res = await fetch("data/nerima_mesh.geojson");
      const json = await res.json();
      console.log(json);
      setMeshGeoJSON(json);
    })();
    setTimeout(() => {
      setViewState({
        zoom: 14,
        latitude: 35.681464,
        longitude: 139.764074,
        bearing: 0,
        pitch: 0,
        padding: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      });
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

  //
  // fetch building
  //
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
      setBuildingsGeoJSON(newGeojson);
    })();
  }, [debouncedViewState, fetchOverpassBuildings]);

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

  const onReset = useCallback(() => {
    mapRef.current?.querySourceFeatures("buildings-source").map((feature) => {
      mapRef.current?.setFeatureState(
        { source: "buildings-source", id: feature.id },
        { select: false }
      );
    });
    setSelectedFeatures([]);
  }, []);

  const onClick = useCallback(
    (event: any) => {
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
    },
    [onReset]
  );

  //
  // icons
  //
  const pins = useMemo(() => {
    let size = 25;
    if (viewState) {
      size = viewState.zoom < 18 ? 10 : viewState.zoom < 19 ? 25 : 35;
    }
    return buldingsGeoJSON.features.map((feature, i) => {
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
          <LastEditUserIconView feature={feature} size={size} />
        </Marker>
      );
    });
  }, [buldingsGeoJSON, viewState]);

  return (
    <div className={styles.container}>
      <Head>
        <title>
          SpaceEats - 近所の困った空き家で生活が豊かに - （プロトタイプ）
        </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h2>SpaceEats - 近所の困った空き家で生活が豊かに -</h2>
        <div
          style={{
            fontSize: "0.7em",
            margin: "5px",
            border: "1px black solid",
          }}
        >
          <p>
            衛星データや航空写真の解析に基づいた、空き家の可能性が高い建物を推定して地図上で表示しています。
            「確実に空き家である建物」以外はあくまでも推定によるものであるため、精度向上に協力していただきたいです。
            空き家であると確定した建物は、複数のオープンデータを組み合わせ、最適な活用法を提案します。
            <mark>注意：現時点ではプロトタイプであり適当な表示です</mark>
          </p>
        </div>
        <UsageGuide />
        <div
          style={{
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
          }}
        >
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
            <Source id="mesh-source" type="geojson" data={meshGeoJSON}>
              <Layer {...MESH_FILL_STYLE} />
            </Source>
            <Source id="buildings-source" type="geojson" data={buldingsGeoJSON}>
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
              fitBoundsOptions={{ zoom: 14 }}
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
                height: "50px",
                width: "50px",
              }}
            >
              {!viewState || (viewState?.zoom && viewState.zoom < 13) ? (
                <FontAwesomeIcon size="2x" icon={faSearchPlus} />
              ) : loadingOverpass ? (
                <FontAwesomeIcon
                  size="2x"
                  icon={faSpinner}
                  spin={true}
                  className="spinner"
                />
              ) : (
                <FontAwesomeIcon size="2x" icon={faXmark} />
              )}
            </div>
            {pins}
          </Map>
        </div>
      </main>
    </div>
  );
};

export default Home;
