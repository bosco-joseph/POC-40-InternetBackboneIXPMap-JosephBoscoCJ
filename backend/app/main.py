from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BACKBONE_NODES = [
    {"id": "LON-01", "name": "London Core", "region": "Europe", "capacity_gbps": 1200},
    {"id": "FRA-02", "name": "Frankfurt Transit", "region": "Europe", "capacity_gbps": 980},
    {"id": "JFK-03", "name": "New York Gateway", "region": "North America", "capacity_gbps": 1400},
    {"id": "SJC-04", "name": "San Jose Edge", "region": "North America", "capacity_gbps": 890},
    {"id": "DXB-05", "name": "Dubai Hub", "region": "Middle East", "capacity_gbps": 760},
    {"id": "SIN-06", "name": "Singapore Exchange", "region": "Asia Pacific", "capacity_gbps": 1100},
]

IXP_SITES = [
    {"id": "IXP-101", "city": "London", "region": "Europe", "members": 220},
    {"id": "IXP-202", "city": "Frankfurt", "region": "Europe", "members": 190},
    {"id": "IXP-303", "city": "New York", "region": "North America", "members": 260},
    {"id": "IXP-404", "city": "Johannesburg", "region": "Africa", "members": 130},
    {"id": "IXP-505", "city": "Singapore", "region": "Asia Pacific", "members": 210},
]

REGIONS = [
    {"name": "Europe", "nodes": 2, "traffic_index": 94},
    {"name": "North America", "nodes": 2, "traffic_index": 91},
    {"name": "Middle East", "nodes": 1, "traffic_index": 76},
    {"name": "Asia Pacific", "nodes": 1, "traffic_index": 88},
    {"name": "Africa", "nodes": 1, "traffic_index": 69},
]

LINKS = [
    {"from": "LON-01", "to": "FRA-02", "capacity_gbps": 480},
    {"from": "FRA-02", "to": "DXB-05", "capacity_gbps": 380},
    {"from": "DXB-05", "to": "SIN-06", "capacity_gbps": 440},
    {"from": "SIN-06", "to": "JFK-03", "capacity_gbps": 520},
    {"from": "JFK-03", "to": "SJC-04", "capacity_gbps": 360},
    {"from": "LON-01", "to": "JFK-03", "capacity_gbps": 430},
]

app = FastAPI(
    title="Internet Backbone & IXP Map API",
    version="0.1.0",
    description="Operational visibility for backbone transit performance and IXP connectivity.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "Internet Backbone & IXP Map",
        "status": "running",
        "description": "Real Rails Intelligence Library",
        "version": "0.1.0",
    }


@app.get("/api/network/summary")
def network_summary():
    return {
        "backbone_nodes": len(BACKBONE_NODES),
        "ixp_sites": len(IXP_SITES),
        "regions": len(REGIONS),
        "total_capacity_gbps": sum(node["capacity_gbps"] for node in BACKBONE_NODES),
        "active_links": len(LINKS),
        "peak_utilization_pct": 84,
    }


@app.get("/api/network/topology")
def network_topology():
    return {
        "regions": REGIONS,
        "backbone": BACKBONE_NODES,
        "ixps": IXP_SITES,
        "links": LINKS,
    }