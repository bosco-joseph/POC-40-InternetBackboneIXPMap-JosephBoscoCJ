"use client";

import { useEffect, useState } from "react";

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
};

type Node = {
  id: string;
  name: string;
  region: string;
  capacity_gbps: number;
};

type IxpSite = {
  id: string;
  city: string;
  region: string;
  members: number;
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
    { name: "Europe", nodes: 2, traffic_index: 94 },
    { name: "North America", nodes: 2, traffic_index: 91 },
    { name: "Asia Pacific", nodes: 1, traffic_index: 88 },
    { name: "Middle East", nodes: 1, traffic_index: 76 },
    { name: "Africa", nodes: 1, traffic_index: 69 },
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
    { id: "IXP-101", city: "London", region: "Europe", members: 220 },
    { id: "IXP-202", city: "Frankfurt", region: "Europe", members: 190 },
    { id: "IXP-303", city: "New York", region: "North America", members: 260 },
    { id: "IXP-404", city: "Johannesburg", region: "Africa", members: 130 },
    { id: "IXP-505", city: "Singapore", region: "Asia Pacific", members: 210 },
  ] as IxpSite[],
};

export default function Home() {
  const [summary, setSummary] = useState<Summary>(defaultSummary);
  const [topology, setTopology] = useState(defaultTopology);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryResponse, topologyResponse] = await Promise.all([
          fetch("http://localhost:8000/api/network/summary"),
          fetch("http://localhost:8000/api/network/topology"),
        ]);

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        }

        if (topologyResponse.ok) {
          const topologyData = await topologyResponse.json();
          setTopology(topologyData);
        }
      } catch (error) {
        console.error("Unable to load network telemetry:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <main className="page-shell">
      <section className="hero-panel">
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

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Regional load</h2>
            <span>Peak {summary.peak_utilization_pct}%</span>
          </div>

          <div className="network-map">
            <div className="map-node node-1">LON</div>
            <div className="map-node node-2">JFK</div>
            <div className="map-node node-3">SIN</div>
            <div className="map-node node-4">DXB</div>
            <div className="map-node node-5">FRA</div>
            <div className="map-node node-6">SJC</div>
            <div className="map-line line-1" />
            <div className="map-line line-2" />
            <div className="map-line line-3" />
            <div className="map-line line-4" />
            <div className="map-line line-5" />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Backbone corridors</h2>
            <span>{summary.active_links} active</span>
          </div>
          <ul className="list-stack">
            {topology.backbone.map((node) => (
              <li key={node.id}>
                <div>
                  <strong>{node.name}</strong>
                  <small>{node.region}</small>
                </div>
                <span>{node.capacity_gbps} Gbps</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Region health</h2>
          </div>
          <div className="region-list">
            {topology.regions.map((region) => (
              <div className="region-item" key={region.name}>
                <div>
                  <strong>{region.name}</strong>
                  <small>{region.nodes} backbone nodes</small>
                </div>
                <div className="bar-wrap">
                  <span style={{ width: `${region.traffic_index}%` }} />
                </div>
                <em>{region.traffic_index}%</em>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>IXP hotspots</h2>
          </div>
          <ul className="list-stack compact">
            {topology.ixps.map((site) => (
              <li key={site.id}>
                <div>
                  <strong>{site.city}</strong>
                  <small>{site.region}</small>
                </div>
                <span>{site.members} members</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
