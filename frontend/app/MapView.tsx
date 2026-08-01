// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from "react-leaflet";
import { useMap } from "react-leaflet";

const MapContainerAny: any = MapContainer;
const TileLayerAny: any = TileLayer;
const PolylineAny: any = Polyline;
const CircleMarkerAny: any = CircleMarker;
const TooltipAny: any = Tooltip;

function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [map]);

  return null;
}

type MapViewProps = {
  topology: any;
  facilities: any[];
  simulation: any;
  setSimulation: any;
  filters: any;
  setFilters: any;
  mapFilters: any;
  setMapFilters: any;
  pathConcentration: any;
};

export default function MapView({
  topology,
  facilities,
  simulation,
  setSimulation,
  filters,
  setFilters,
  mapFilters,
  setMapFilters,
  pathConcentration,
}: MapViewProps) {
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);

  const routeAnchors: Record<string, [number, number]> = {
    London: [51.5074, -0.1278],
    Frankfurt: [50.1109, 8.6821],
    "New York": [40.7128, -74.006],
    Singapore: [1.3521, 103.8198],
    Dubai: [25.2048, 55.2708],
    "San Jose": [37.3382, -121.8863],
  };

  const mapRoutes = topology.corridors
    .map((corridor: any) => ({
      id: corridor.id,
      name: corridor.name,
      from: corridor.from,
      to: corridor.to,
      capacity_gbps: corridor.capacity_gbps,
      congestion_score: corridor.congestion_score,
      regional_dependency: corridor.regional_dependency,
      redundancy_score: corridor.redundancy_score,
      positions: [routeAnchors[corridor.from], routeAnchors[corridor.to]].filter(Boolean) as [number, number][],
    }))
    .filter((route: any) => route.positions.length === 2);

  const getRiskLevel = (route: any) => {
    if (route.congestion_score >= 80 || route.redundancy_score <= 60) {
      return "Critical";
    }

    if (route.congestion_score >= 70 || route.redundancy_score <= 70) {
      return "High";
    }

    if (route.congestion_score >= 50) {
      return "Moderate";
    }

    return "Low";
  };

  return (
    <>
      <div className="map-filters">
        <label className="map-filter">
          <span>Region</span>
          <select
            value={mapFilters.region}
            onChange={(event) => setMapFilters((prev: any) => ({ ...prev, region: event.target.value }))}
          >
            <option>All regions</option>
            {topology.regions.map((region: any) => (
              <option key={region.name} value={region.name}>{region.name}</option>
            ))}
          </select>
        </label>
        <label className="map-filter">
          <span>ASN</span>
          <select value={mapFilters.asn} onChange={(event) => setMapFilters((prev: any) => ({ ...prev, asn: event.target.value }))}>
            <option>All ASNs</option>
            <option>3356</option>
            <option>1299</option>
            <option>6939</option>
            <option>15169</option>
          </select>
        </label>
        <label className="map-filter">
          <span>Facility</span>
          <select
            value={mapFilters.facility}
            onChange={(event) => {
              setMapFilters((prev: any) => ({ ...prev, facility: event.target.value }));
              if (event.target.value !== "All facilities") {
                setSimulation((prev: any) => ({ ...prev, selected_facility: event.target.value }));
              }
            }}
          >
            <option>All facilities</option>
            {facilities.map((facility: any) => (
              <option key={facility.id} value={facility.facility_name}>{facility.facility_name}</option>
            ))}
          </select>
        </label>
        <label className="map-filter">
          <span>Capacity</span>
          <select value={mapFilters.capacity} onChange={(event) => setMapFilters((prev: any) => ({ ...prev, capacity: event.target.value }))}>
            <option>All capacities</option>
            <option>500 Gbps+</option>
            <option>1000 Gbps+</option>
            <option>2000 Gbps+</option>
          </select>
        </label>
      </div>

      <div className="real-map" aria-label="Interconnection map">
        <MapContainerAny center={[18, 12]} zoom={2} minZoom={2} maxZoom={6} scrollWheelZoom={false} className="leaflet-map-shell" style={{ height: "100%", width: "100%" }}>
          <MapInvalidator />
          <TileLayerAny
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {mapRoutes.map((route) => (
            <PolylineAny
              key={route.id}
              positions={route.positions}
              eventHandlers={{
                click: () => {
                  setSimulation((prev: any) => ({
                    ...prev,
                    selected_cable: route.name,
                    failed_route: undefined,
                    status: prev.failed_route === route.name ? "degraded" : prev.status,
                  }));
                },
                mouseover: () => setHoveredRouteId(route.id),
                mouseout: () => setHoveredRouteId((currentId) => (currentId === route.id ? null : currentId)),
              }}
              pathOptions={{
                className: [
                  "corridor-route",
                  simulation.selected_cable === route.name ? "corridor-route--selected" : "",
                  hoveredRouteId === route.id ? "corridor-route--hovered" : "",
                  simulation.failed_route === route.name ? "corridor-route--failed" : "",
                ]
                  .filter(Boolean)
                  .join(" "),
                color: simulation.failed_route === route.name
                  ? "#f87171"
                  : hoveredRouteId === route.id
                    ? "#fbbf24"
                    : simulation.selected_cable === route.name
                      ? "#38bdf8"
                      : "#818cf8",
                weight: simulation.failed_route === route.name ? 5 : hoveredRouteId === route.id || simulation.selected_cable === route.name ? 4 : 3,
                opacity: simulation.failed_route === route.name ? 0.35 : simulation.selected_cable === route.name ? 1 : 0.82,
                dashArray: simulation.failed_route === route.name ? "8 12" : simulation.selected_cable === route.name ? "12 10" : "16 14",
              }}
            >
              <TooltipAny direction="top" sticky opacity={1} className="route-tooltip">
                <div className="map-marker-tooltip route-tooltip-content">
                  <strong>{route.name}</strong>
                  <span>
                    {route.from} to {route.to}
                  </span>
                  <span>Capacity: {route.capacity_gbps} Gbps</span>
                  <span>Traffic utilization: {route.congestion_score}%</span>
                  <span>Risk level: {getRiskLevel(route)}</span>
                </div>
              </TooltipAny>
            </PolylineAny>
          ))}

          {topology.ixps.map((ixp: any) => {
            const isSelected = simulation.selected_ixp === ixp.name;
            return (
              <CircleMarker
                key={ixp.id}
                center={[ixp.lat, ixp.lng]}
                radius={isSelected ? 10 : 8}
                pathOptions={{
                  className: isSelected ? "ixp-marker ixp-marker--selected" : "ixp-marker",
                  color: isSelected ? "#fbbf24" : "#38bdf8",
                  fillColor: "#38bdf8",
                  fillOpacity: 0.95,
                  weight: isSelected ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => {
                    setSimulation((prev: any) => ({ ...prev, selected_ixp: ixp.name }));
                    setFilters((prev: any) => ({ ...prev, ixp: ixp.name }));
                    setMapFilters((prev: any) => ({ ...prev, region: ixp.region }));
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                  <div className="map-marker-tooltip">
                    <strong>{ixp.name}</strong><br />
                    {ixp.region}<br />
                    Capacity: {ixp.members * 2.5} Gbps<br />
                    Connected ASNs: {ixp.members}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {facilities.map((facility: any) => {
            const isSelected = simulation.selected_facility === facility.facility_name;
            return (
              <CircleMarker
                key={facility.id}
                center={[facility.lat, facility.lng]}
                radius={isSelected ? 8 : 6}
                pathOptions={{
                  className: isSelected ? "facility-marker facility-marker--selected" : "facility-marker",
                  color: isSelected ? "#fbbf24" : "#818cf8",
                  fillColor: "#818cf8",
                  fillOpacity: 0.95,
                  weight: isSelected ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => {
                    setSimulation((prev: any) => ({ ...prev, selected_facility: facility.facility_name }));
                    setMapFilters((prev: any) => ({ ...prev, facility: facility.facility_name }));
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                  <div className="map-marker-tooltip">
                    <strong>{facility.facility_name}</strong><br />
                    {facility.region}<br />
                    Capacity: {facility.capacity} Gbps<br />
                    Connected ASNs: {facility.connected_networks}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {topology.landing_stations.map((station: any) => (
            <CircleMarker
              key={station.id}
              center={[station.lat, station.lng]}
              radius={5}
              pathOptions={{
                color: "#34d399",
                fillColor: "#34d399",
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="map-marker-tooltip">
                  <strong>{station.name}</strong><br />
                  {station.region}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainerAny>
      </div>

      <div className="mini-stats-grid">
        <div className="mini-stat">
          <span>Critical corridor</span>
          <strong>{pathConcentration.most_critical[0]?.name ?? "SEA-ME-WE-3"}</strong>
        </div>
        <div className="mini-stat">
          <span>Dependency index</span>
          <strong>{pathConcentration.dependency_index.toFixed(1)}</strong>
        </div>
        <div className="mini-stat">
          <span>Redundancy</span>
          <strong>{pathConcentration.redundancy_rating}%</strong>
        </div>
      </div>
    </>
  );
}
