// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

type Summary = {
  backbone_nodes: number;
  ixp_sites: number;
  regions: number;
  total_capacity_gbps: number;
  active_links: number;
  peak_utilization_pct: number;
};

type Region = {
  name: string;
  nodes: number;
  traffic_index: number;
  dependency?: string;
};

type Node = {
  id: string;
  name: string;
  region: string;
  capacity_gbps: number;
};

type IxpSite = {
  id: string;
  name: string;
  country: string;
  region: string;
  members: number;
  lat: number;
  lng: number;
};

type Facility = {
  id: string;
  facility_name: string;
  country: string;
  region: string;
  operator: string;
  connected_networks: number;
  capacity: number;
  importance_score: number;
  lat: number;
  lng: number;
};

type Operator = {
  name: string;
  ownership: string;
  influence: string;
};

type PathConcentration = {
  most_critical: Array<{
    name: string;
    congestion_score: number;
    regional_dependency: string;
    redundancy_score: number;
  }>;
  dependency_index: number;
  redundancy_rating: number;
};

type SimulationResult = {
  status: string;
  selected_ixp: string;
  selected_facility: string;
  selected_cable: string;
  failed_route?: string;
  affected_traffic: string;
  impacted_regions: string[];
  impacted_facilities: string[];
  recalculated_paths: Array<{ route: string; status: string }>;
  metrics: {
    new_congestion: number;
    redundancy_drop: number;
    regional_impact: string;
    recovery_window_hours: number;
  };
};

const defaultSummary: Summary = {
  backbone_nodes: 6,
  ixp_sites: 5,
  regions: 5,
  total_capacity_gbps: 6200,
  active_links: 6,
  peak_utilization_pct: 84,
};

const defaultTopology = {
  regions: [
    { name: "Europe", nodes: 2, traffic_index: 94, dependency: "High" },
    { name: "North America", nodes: 2, traffic_index: 91, dependency: "High" },
    { name: "Asia Pacific", nodes: 1, traffic_index: 88, dependency: "Moderate" },
    { name: "Middle East", nodes: 1, traffic_index: 76, dependency: "Moderate" },
    { name: "Africa", nodes: 1, traffic_index: 69, dependency: "Elevated" },
  ] as Region[],
  backbone: [
    { id: "LON-01", name: "London Core", region: "Europe", capacity_gbps: 1200 },
    { id: "FRA-02", name: "Frankfurt Transit", region: "Europe", capacity_gbps: 980 },
    { id: "JFK-03", name: "New York Gateway", region: "North America", capacity_gbps: 1400 },
    { id: "SJC-04", name: "San Jose Edge", region: "North America", capacity_gbps: 890 },
    { id: "DXB-05", name: "Dubai Hub", region: "Middle East", capacity_gbps: 760 },
    { id: "SIN-06", name: "Singapore Exchange", region: "Asia Pacific", capacity_gbps: 1100 },
  ] as Node[],
  ixps: [
    { id: "IXP-101", name: "London", country: "United Kingdom", region: "Europe", members: 220, lat: 51.5074, lng: -0.1278 },
    { id: "IXP-202", name: "Frankfurt", country: "Germany", region: "Europe", members: 190, lat: 50.1109, lng: 8.6821 },
    { id: "IXP-303", name: "New York", country: "United States", region: "North America", members: 260, lat: 40.7128, lng: -74.006 },
    { id: "IXP-404", name: "Johannesburg", country: "South Africa", region: "Africa", members: 130, lat: -26.2041, lng: 28.0473 },
    { id: "IXP-505", name: "Singapore", country: "Singapore", region: "Asia Pacific", members: 210, lat: 1.3521, lng: 103.8198 },
  ] as IxpSite[],
  landing_stations: [
    { id: "LS-01", name: "Bude Landing Station", country: "United Kingdom", region: "Europe", lat: 50.8333, lng: -4.55 },
    { id: "LS-02", name: "Virginia Beach Landing", country: "United States", region: "North America", lat: 36.8528, lng: -75.978 },
    { id: "LS-03", name: "Mumbai Landing Station", country: "India", region: "Asia Pacific", lat: 19.076, lng: 72.8777 },
  ],
  corridors: [
    { id: "C-101", name: "SEA-ME-WE-3", from: "London", to: "Singapore", capacity_gbps: 480, congestion_score: 76, regional_dependency: "Europe-Asia", redundancy_score: 68 },
    { id: "C-102", name: "Atlantic Crossing", from: "London", to: "New York", capacity_gbps: 430, congestion_score: 71, regional_dependency: "Europe-North America", redundancy_score: 74 },
    { id: "C-103", name: "Pacific Transit", from: "Singapore", to: "San Jose", capacity_gbps: 520, congestion_score: 82, regional_dependency: "Asia-Pacific", redundancy_score: 62 },
  ],
} as const;

const defaultFacilities: Facility[] = [
  { id: "FAC-01", facility_name: "Equinix LD8", country: "United Kingdom", region: "Europe", operator: "Equinix", connected_networks: 118, capacity: 2400, importance_score: 98, lat: 51.5201, lng: -0.1234 },
  { id: "FAC-02", facility_name: "Telehouse North", country: "United Kingdom", region: "Europe", operator: "Digital Realty", connected_networks: 94, capacity: 1800, importance_score: 92, lat: 51.527, lng: -0.074 },
  { id: "FAC-03", facility_name: "MDC NYC", country: "United States", region: "North America", operator: "Digital Realty", connected_networks: 141, capacity: 2800, importance_score: 96, lat: 40.7359, lng: -74.0037 },
  { id: "FAC-04", facility_name: "Google DC 1", country: "United States", region: "North America", operator: "Google", connected_networks: 104, capacity: 3150, importance_score: 95, lat: 37.7749, lng: -122.4194 },
  { id: "FAC-05", facility_name: "JINX Data Hub", country: "South Africa", region: "Africa", operator: "NTT", connected_networks: 52, capacity: 1100, importance_score: 77, lat: -26.12, lng: 28.03 },
  { id: "FAC-06", facility_name: "SIN-IX Core", country: "Singapore", region: "Asia Pacific", operator: "LINX", connected_networks: 96, capacity: 2200, importance_score: 91, lat: 1.289, lng: 103.851 },
];

const defaultOperators: Operator[] = [
  { name: "Equinix", ownership: "Carrier-neutral colocation", influence: "High" },
  { name: "Digital Realty", ownership: "Wholesale data center operator", influence: "High" },
  { name: "Google", ownership: "Hyperscale infrastructure", influence: "Very High" },
  { name: "Cloudflare", ownership: "Edge delivery network", influence: "High" },
  { name: "LINX", ownership: "Internet exchange operator", influence: "Medium" },
  { name: "AMS-IX", ownership: "Regional exchange hub", influence: "Medium" },
  { name: "DE-CIX", ownership: "Global exchange provider", influence: "High" },
  { name: "NTT", ownership: "Global telecom backbone", influence: "High" },
];

const defaultPathConcentration: PathConcentration = {
  most_critical: [
    { name: "SEA-ME-WE-3", congestion_score: 82, regional_dependency: "High", redundancy_score: 64 },
    { name: "Atlantic Crossing", congestion_score: 75, regional_dependency: "Medium", redundancy_score: 76 },
    { name: "Pacific Transit", congestion_score: 88, regional_dependency: "High", redundancy_score: 58 },
  ],
  dependency_index: 7.4,
  redundancy_rating: 71,
};

const defaultSimulation: SimulationResult = {
  status: "degraded",
  selected_ixp: "London",
  selected_facility: "Equinix LD8",
  selected_cable: "SEA-ME-WE-3",
  failed_route: undefined,
  affected_traffic: "842 Gbps",
  impacted_regions: ["Europe", "Middle East"],
  impacted_facilities: ["Equinix LD8", "Telehouse North", "SIN-IX Core"],
  recalculated_paths: [
    { route: "London -> Frankfurt -> Dubai", status: "rerouted" },
    { route: "Singapore -> New York", status: "degraded" },
  ],
  metrics: {
    new_congestion: 69,
    redundancy_drop: 22,
    regional_impact: "High",
    recovery_window_hours: 4,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCorridorRiskLevel(corridor?: { congestion_score: number; redundancy_score: number }) {
  if (!corridor) {
    return "Moderate";
  }

  if (corridor.congestion_score >= 80 || corridor.redundancy_score <= 60) {
    return "Critical";
  }

  if (corridor.congestion_score >= 70 || corridor.redundancy_score <= 70) {
    return "High";
  }

  if (corridor.congestion_score >= 50) {
    return "Moderate";
  }

  return "Low";
}

function getCorridorImpactRegions(corridor?: { regional_dependency: string; from: string; to: string }) {
  if (!corridor) {
    return ["Global"];
  }

  const dependencyMap: Record<string, string[]> = {
    "Europe-Asia": ["Europe", "Asia Pacific"],
    "Europe-North America": ["Europe", "North America"],
    "Asia-Pacific": ["Asia Pacific", "North America"],
    "Middle East-Europe": ["Middle East", "Europe"],
  };

  return dependencyMap[corridor.regional_dependency] ?? [corridor.from, corridor.to];
}

function buildAlternativePaths(routeName: string) {
  switch (routeName) {
    case "Atlantic Crossing":
      return [
        { route: "London -> Frankfurt -> Dubai", status: "rerouted" },
        { route: "London -> Singapore -> New York", status: "degraded" },
      ];
    case "SEA-ME-WE-3":
      return [
        { route: "London -> New York -> Singapore", status: "rerouted" },
        { route: "London -> Frankfurt -> Dubai", status: "degraded" },
      ];
    case "Pacific Transit":
      return [
        { route: "Singapore -> Dubai -> Frankfurt", status: "rerouted" },
        { route: "San Jose -> New York -> London", status: "degraded" },
      ];
    case "Red Sea Link":
      return [
        { route: "Dubai -> London -> New York", status: "rerouted" },
        { route: "Dubai -> Singapore -> San Jose", status: "degraded" },
      ];
    default:
      return [
        { route: `${routeName} alternate path`, status: "rerouted" },
        { route: `${routeName} fallback path`, status: "degraded" },
      ];
  }
}

export default function Home() {
  const [summary, setSummary] = useState<Summary>(defaultSummary);
  const [topology, setTopology] = useState(defaultTopology);
  const [facilities, setFacilities] = useState<Facility[]>(defaultFacilities);
  const [operators, setOperators] = useState<Operator[]>(defaultOperators);
  const [pathConcentration, setPathConcentration] = useState<PathConcentration>(defaultPathConcentration);
  const [why, setWhy] = useState({ headline: "The internet is a shared operating system for the modern economy.", copy: ["When a single exchange or cable corridor is interrupted, the impact spreads beyond one city or region. Traffic reroutes across broader transit systems, driving congestion and delay in markets that depend on digital commerce and cloud access.", "This dashboard helps identify where internet infrastructure is concentrated, who owns the critical nodes, and which routes are most exposed to service disruption."] });
  const [simulation, setSimulation] = useState<SimulationResult>(defaultSimulation);
  const [filters, setFilters] = useState({ region: "All regions", operator: "All operators", ixp: "All IXPs" });
  const [mapFilters, setMapFilters] = useState({ region: "All regions", asn: "All ASNs", facility: "All facilities", capacity: "All capacities" });
  const [loading, setLoading] = useState(true);

  const handleDownloadSampleData = async () => {
    const sampleData = {
      summary,
      topology,
      facilities,
      operators,
      pathConcentration,
      why,
      simulation,
      filters,
      mapFilters,
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "real-rails-sample-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryResponse, topologyResponse, facilityResponse, operatorsResponse, pathResponse, whyResponse] = await Promise.all([
          fetch("http://localhost:8000/api/network/summary"),
          fetch("http://localhost:8000/api/network/topology"),
          fetch("http://localhost:8000/api/network/facilities"),
          fetch("http://localhost:8000/api/network/operators"),
          fetch("http://localhost:8000/api/network/path-concentration"),
          fetch("http://localhost:8000/api/network/why-this-matters"),
        ]);

        if (summaryResponse.ok) {
          setSummary(await summaryResponse.json());
        }
        if (topologyResponse.ok) {
          setTopology(await topologyResponse.json());
        }
        if (facilityResponse.ok) {
          setFacilities(await facilityResponse.json());
        }
        if (operatorsResponse.ok) {
          setOperators(await operatorsResponse.json());
        }
        if (pathResponse.ok) {
          setPathConcentration(await pathResponse.json());
        }
        if (whyResponse.ok) {
          const whyData = await whyResponse.json();
          setWhy(whyData);
        }
      } catch (error) {
        console.error("Unable to load network telemetry:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const effectiveRegion = mapFilters.region === "All regions" ? filters.region : mapFilters.region;
      const regionMatches = effectiveRegion === "All regions" || facility.region === effectiveRegion;
      const operatorMatches = filters.operator === "All operators" || facility.operator === filters.operator;
      const ixpMatches = filters.ixp === "All IXPs" || topology.ixps.some((ixp) => ixp.name === filters.ixp && ixp.region === facility.region);
      const facilityMatches = mapFilters.facility === "All facilities" || facility.facility_name === mapFilters.facility;
      const capacityMatches = mapFilters.capacity === "All capacities" ||
        (mapFilters.capacity === "500 Gbps+" && facility.capacity >= 500) ||
        (mapFilters.capacity === "1000 Gbps+" && facility.capacity >= 1000) ||
        (mapFilters.capacity === "2000 Gbps+" && facility.capacity >= 2000);
      return regionMatches && operatorMatches && ixpMatches && facilityMatches && capacityMatches;
    });
  }, [facilities, filters, mapFilters, topology.ixps]);

  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const params = new URLSearchParams({
          ixp: filters.ixp === "All IXPs" ? "London" : filters.ixp,
          facility: filteredFacilities[0]?.facility_name ?? "Equinix LD8",
          cable: "SEA-ME-WE-3",
        });
        const response = await fetch(`http://localhost:8000/api/network/route-simulation?${params.toString()}`);
        if (response.ok) {
          const nextSimulation = await response.json();
          setSimulation(nextSimulation);
        }
      } catch (error) {
        console.error("Simulation error:", error);
      }
    };

    loadSimulation();
  }, [filters.ixp, filteredFacilities]);

  const mapMarkers = useMemo(() => {
    return [
      ...topology.ixps.map((ixp) => ({ ...ixp, type: "IXP" as const, name: ixp.name })),
      ...topology.landing_stations.map((station) => ({ ...station, type: "Cable Landing" as const, name: station.name })),
      ...facilities.map((facility) => ({ ...facility, type: "Facility" as const, name: facility.facility_name })),
    ] as Array<{ id: string; name: string; type: "IXP" | "Cable Landing" | "Facility"; lat: number; lng: number; region?: string; capacity?: number; connected_networks?: number; members?: number }>;
  }, [facilities, topology.ixps, topology.landing_stations]);

  const selectedFacility = useMemo(
    () => facilities.find((facility) => facility.facility_name === simulation.selected_facility) ?? filteredFacilities[0] ?? facilities[0],
    [facilities, filteredFacilities, simulation.selected_facility],
  );

  const selectedCorridor = useMemo(
    () => topology.corridors.find((corridor) => corridor.name === simulation.selected_cable) ?? topology.corridors[0],
    [simulation.selected_cable, topology.corridors],
  );

  const simulateSelectedCorridorFailure = () => {
    if (!selectedCorridor) {
      return;
    }

    const riskLevel = getCorridorRiskLevel(selectedCorridor);
    const impactRegions = getCorridorImpactRegions(selectedCorridor);
    const trafficUtilization = clamp(selectedCorridor.congestion_score + 11, 0, 100);

    setSimulation((prev) => ({
      ...prev,
      status: "critical",
      failed_route: selectedCorridor.name,
      selected_cable: selectedCorridor.name,
      affected_traffic: `${Math.round(selectedCorridor.capacity_gbps * 1.8)} Gbps`,
      impacted_regions: impactRegions,
      impacted_facilities: [selectedFacility?.facility_name ?? prev.selected_facility, "Telehouse North", "SIN-IX Core"].filter(Boolean).slice(0, 3),
      recalculated_paths: buildAlternativePaths(selectedCorridor.name),
      metrics: {
        new_congestion: trafficUtilization,
        redundancy_drop: clamp(100 - selectedCorridor.redundancy_score, 0, 100),
        regional_impact: riskLevel,
        recovery_window_hours: selectedCorridor.capacity_gbps >= 500 ? 6 : 4,
      },
    }));

    setSummary((prev) => ({
      ...prev,
      active_links: Math.max(0, prev.active_links - 1),
      peak_utilization_pct: clamp(prev.peak_utilization_pct + 8, 0, 100),
      total_capacity_gbps: Math.max(0, prev.total_capacity_gbps - selectedCorridor.capacity_gbps),
    }));
  };

  const updateSimulationSelection = (field: "selected_ixp" | "selected_facility" | "selected_cable", value: string) => {
    setSimulation((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "selected_cable" ? { failed_route: undefined, status: prev.status === "critical" ? "degraded" : prev.status } : {}),
    }));

    if (field === "selected_ixp") {
      setFilters((prev) => ({ ...prev, ixp: value }));
    }

    if (field === "selected_facility") {
      setMapFilters((prev) => ({ ...prev, facility: value }));
    }
  };

  const mapRoutes = [
    { id: "LON-FRA", name: "Atlantic Crossing", positions: [[51.5074, -0.1278], [50.1109, 8.6821]] as [number, number][] },
    { id: "FRA-DXB", name: "Red Sea Link", positions: [[50.1109, 8.6821], [25.2048, 55.2708]] as [number, number][] },
    { id: "DXB-SIN", name: "SEA-ME-WE-3", positions: [[25.2048, 55.2708], [1.3521, 103.8198]] as [number, number][] },
    { id: "LON-NYC", name: "Atlantic Crossing", positions: [[51.5074, -0.1278], [40.7128, -74.006]] as [number, number][] },
    { id: "SIN-JHB", name: "SEA-ME-WE-3", positions: [[1.3521, 103.8198], [-26.2041, 28.0473]] as [number, number][] },
  ];

  return (
    <main className="page-shell real-rails-shell">
      <section className="hero-panel real-rails-header">
        <div>
          <p className="eyebrow">Real Rails Intelligence Library</p>
          <h1>Internet Backbone & IXP Map</h1>
          <p className="subtitle">
            Monitoring global routing health, interconnection density, and transit capacity across major
            backbone corridors.
          </p>
        </div>
        <div className="status-pill">{loading ? "Syncing" : "Live"}</div>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <span>Backbone nodes</span>
          <strong>{summary.backbone_nodes}</strong>
        </article>
        <article className="metric-card">
          <span>IXP sites</span>
          <strong>{summary.ixp_sites}</strong>
        </article>
        <article className="metric-card">
          <span>Regions</span>
          <strong>{summary.regions}</strong>
        </article>
        <article className="metric-card">
          <span>Total capacity</span>
          <strong>{summary.total_capacity_gbps} Gbps</strong>
        </article>
      </section>

      <section className="main-layout">
        <div className="map-panel panel">
          <div className="panel-header">
            <h2>Global interconnection map</h2>
            <span>Peak {summary.peak_utilization_pct}%</span>
          </div>

          <MapView
            topology={topology}
            facilities={facilities}
            simulation={simulation}
            setSimulation={setSimulation}
            filters={filters}
            setFilters={setFilters}
            mapFilters={mapFilters}
            setMapFilters={setMapFilters}
            pathConcentration={pathConcentration}
          />
        </div>

        <aside className="sidebar panel">
          <div className="sidebar-section">
            <h3>Key Metrics</h3>
            <div className="sidebar-kpis">
              <div>
                <span>Active links</span>
                <strong>{summary.active_links}</strong>
              </div>
              <div>
                <span>Traffic</span>
                <strong>{simulation.affected_traffic}</strong>
              </div>
              <div>
                <span>Risk</span>
                <strong>{simulation.metrics.regional_impact}</strong>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Selected IXP</h3>
            <p>
              <strong>{simulation.selected_ixp}</strong> is the active route anchor, with operational exposure concentrated in {simulation.impacted_regions.join(", ")}.
            </p>
            <div className="sidebar-kpis">
              <div>
                <span>Facility</span>
                <strong>{selectedFacility?.facility_name ?? simulation.selected_facility}</strong>
              </div>
              <div>
                <span>Capacity</span>
                <strong>{selectedFacility?.capacity ?? 2400} Gbps</strong>
              </div>
              <div>
                <span>Connected networks</span>
                <strong>{selectedFacility?.connected_networks ?? 118}</strong>
              </div>
              <div>
                <span>Importance score</span>
                <strong>{selectedFacility?.importance_score ?? 98}</strong>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Selected Corridor</h3>
            <p>
              <strong>{selectedCorridor?.name ?? simulation.selected_cable}</strong> is the active backbone route in the intelligence layer.
            </p>
            <div className="sidebar-kpis">
              <div>
                <span>Source</span>
                <strong>{selectedCorridor?.from ?? "Unknown"}</strong>
              </div>
              <div>
                <span>Destination</span>
                <strong>{selectedCorridor?.to ?? "Unknown"}</strong>
              </div>
              <div>
                <span>Capacity</span>
                <strong>{selectedCorridor?.capacity_gbps ?? 0} Gbps</strong>
              </div>
              <div>
                <span>Traffic utilization</span>
                <strong>{selectedCorridor ? clamp(selectedCorridor.congestion_score + 11, 0, 100) : 0}%</strong>
              </div>
              <div>
                <span>Risk level</span>
                <strong>{getCorridorRiskLevel(selectedCorridor)}</strong>
              </div>
              <div>
                <span>Regional dependency</span>
                <strong>{selectedCorridor?.regional_dependency ?? "Unknown"}</strong>
              </div>
            </div>
            <button type="button" className="download-button corridor-action-button" onClick={simulateSelectedCorridorFailure}>
              Simulate Failure
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Why This Matters</h3>
            <p>{why.copy[0]}</p>
            <p>{why.copy[1]}</p>
          </div>

          <div className="sidebar-section">
            <h3>Who Controls the Rail</h3>
            <ul className="operator-list">
              {operators.slice(0, 6).map((operator) => (
                <li key={operator.name}>
                  <strong>{operator.name}</strong>
                  <span>{operator.influence}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Functional Filters</h3>
            <div className="filter-list">
              <label>
                <span>Region</span>
                <select value={filters.region} onChange={(event) => setFilters((prev) => ({ ...prev, region: event.target.value }))}>
                  <option>All regions</option>
                  {topology.regions.map((region) => (
                    <option key={region.name} value={region.name}>{region.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Operator</span>
                <select value={filters.operator} onChange={(event) => setFilters((prev) => ({ ...prev, operator: event.target.value }))}>
                  <option>All operators</option>
                  {operators.map((operator) => (
                    <option key={operator.name} value={operator.name}>{operator.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>IXP</span>
                <select value={filters.ixp} onChange={(event) => setFilters((prev) => ({ ...prev, ixp: event.target.value }))}>
                  <option>All IXPs</option>
                  {topology.ixps.map((ixp) => (
                    <option key={ixp.id} value={ixp.name}>{ixp.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <button type="button" className="download-button" onClick={handleDownloadSampleData}>Download Sample Data</button>
        </aside>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Facility cards</h2>
            <span>{filteredFacilities.length} active</span>
          </div>
          <div className="facility-grid">
            {filteredFacilities.slice(0, 4).map((facility) => (
              <article key={facility.id} className="facility-card">
                <div className="facility-header">
                  <strong>{facility.facility_name}</strong>
                  <span>{facility.country}</span>
                </div>
                <div className="facility-meta">
                  <div>
                    <label>Operator</label>
                    <p>{facility.operator}</p>
                  </div>
                  <div>
                    <label>Connected Networks</label>
                    <p>{facility.connected_networks}</p>
                  </div>
                  <div>
                    <label>Capacity</label>
                    <p>{facility.capacity} Gbps</p>
                  </div>
                  <div>
                    <label>Importance Score</label>
                    <p>{facility.importance_score}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Path concentration</h2>
          </div>
          <div className="concentration-list">
            {pathConcentration.most_critical.map((item) => (
              <div key={item.name} className="concentration-item">
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.regional_dependency}</small>
                </div>
                <div className="concentration-score">
                  <span>{item.congestion_score}</span>
                  <small>Congestion</small>
                </div>
                <div className="concentration-score">
                  <span>{item.redundancy_score}</span>
                  <small>Redundancy</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bottom-grid simulation-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Route failure simulation</h2>
            <span>{simulation.status}</span>
          </div>
          <div className="simulation-controls">
            <label>
              <span>IXP</span>
              <select value={simulation.selected_ixp} onChange={(event) => updateSimulationSelection("selected_ixp", event.target.value)}>
                {topology.ixps.map((ixp) => (
                  <option key={ixp.id} value={ixp.name}>{ixp.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Facility</span>
              <select value={simulation.selected_facility} onChange={(event) => updateSimulationSelection("selected_facility", event.target.value)}>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.facility_name}>{facility.facility_name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Cable</span>
              <select value={simulation.selected_cable} onChange={(event) => updateSimulationSelection("selected_cable", event.target.value)}>
                {topology.corridors.map((corridor) => (
                  <option key={corridor.id} value={corridor.name}>{corridor.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="impact-box">
            <div>
              <span>Affected traffic</span>
              <strong>{simulation.affected_traffic}</strong>
            </div>
            <div>
              <span>Impacted regions</span>
              <strong>{simulation.impacted_regions.join(", ")}</strong>
            </div>
          </div>
          <ul className="recalculated-list">
            {simulation.recalculated_paths.map((path) => (
              <li key={path.route}>
                <span>{path.route}</span>
                <em>{path.status}</em>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Who controls the rail</h2>
          </div>
          <ul className="owner-list">
            {operators.map((operator) => (
              <li key={operator.name}>
                <div>
                  <strong>{operator.name}</strong>
                  <small>{operator.ownership}</small>
                </div>
                <span>{operator.influence}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
