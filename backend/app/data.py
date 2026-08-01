from __future__ import annotations
from app.network_graph import NetworkGraph

NETWORK_DATASET = {
    "summary": {
        "backbone_nodes": 6,
        "ixp_sites": 5,
        "regions": 5,
        "total_capacity_gbps": 6200,
        "active_links": 6,
        "peak_utilization_pct": 84,
    },
    "regions": [
        {"name": "Europe", "nodes": 2, "traffic_index": 94, "dependency": "High"},
        {"name": "North America", "nodes": 2, "traffic_index": 91, "dependency": "High"},
        {"name": "Asia Pacific", "nodes": 1, "traffic_index": 88, "dependency": "Moderate"},
        {"name": "Middle East", "nodes": 1, "traffic_index": 76, "dependency": "Moderate"},
        {"name": "Africa", "nodes": 1, "traffic_index": 69, "dependency": "Elevated"},
    ],
    "asns": [
        {"asn": 3356, "name": "Level 3", "region": "Global", "role": "Transit"},
        {"asn": 1299, "name": "Arelion", "region": "Europe", "role": "Carrier"},
        {"asn": 6939, "name": "Hurricane Electric", "region": "North America", "role": "Carrier"},
        {"asn": 15169, "name": "Google", "region": "Global", "role": "Hyperscale"},
        {"asn": 13335, "name": "Cloudflare", "region": "Global", "role": "Edge"},
        {"asn": 6453, "name": "Tata Communications", "region": "Global", "role": "Backbone"},
    ],
    "operators": [
        {"name": "Equinix", "ownership": "Carrier-neutral colocation", "influence": "High"},
        {"name": "Digital Realty", "ownership": "Wholesale data center operator", "influence": "High"},
        {"name": "Google", "ownership": "Hyperscale infrastructure", "influence": "Very High"},
        {"name": "Cloudflare", "ownership": "Edge delivery network", "influence": "High"},
        {"name": "LINX", "ownership": "Internet exchange operator", "influence": "Medium"},
        {"name": "AMS-IX", "ownership": "Regional exchange hub", "influence": "Medium"},
        {"name": "DE-CIX", "ownership": "Global exchange provider", "influence": "High"},
        {"name": "NTT", "ownership": "Global telecom backbone", "influence": "High"},
    ],
    "ixps": [
        {"id": "IXP-101", "name": "London", "country": "United Kingdom", "region": "Europe", "lat": 51.5074, "lng": -0.1278, "members": 220},
        {"id": "IXP-202", "name": "Frankfurt", "country": "Germany", "region": "Europe", "lat": 50.1109, "lng": 8.6821, "members": 190},
        {"id": "IXP-303", "name": "New York", "country": "United States", "region": "North America", "lat": 40.7128, "lng": -74.0060, "members": 260},
        {"id": "IXP-404", "name": "Johannesburg", "country": "South Africa", "region": "Africa", "lat": -26.2041, "lng": 28.0473, "members": 130},
        {"id": "IXP-505", "name": "Singapore", "country": "Singapore", "region": "Asia Pacific", "lat": 1.3521, "lng": 103.8198, "members": 210},
    ],
    "facilities": [
        {"id": "FAC-01", "facility_name": "Equinix LD8", "country": "United Kingdom", "region": "Europe", "operator": "Equinix", "connected_networks": 118, "capacity": 2400, "importance_score": 98, "lat": 51.5201, "lng": -0.1234},
        {"id": "FAC-02", "facility_name": "Telehouse North", "country": "United Kingdom", "region": "Europe", "operator": "Digital Realty", "connected_networks": 94, "capacity": 1800, "importance_score": 92, "lat": 51.527, "lng": -0.074},
        {"id": "FAC-03", "facility_name": "MDC NYC", "country": "United States", "region": "North America", "operator": "Digital Realty", "connected_networks": 141, "capacity": 2800, "importance_score": 96, "lat": 40.7359, "lng": -74.0037},
        {"id": "FAC-04", "facility_name": "Google DC 1", "country": "United States", "region": "North America", "operator": "Google", "connected_networks": 104, "capacity": 3150, "importance_score": 95, "lat": 37.7749, "lng": -122.4194},
        {"id": "FAC-05", "facility_name": "JINX Data Hub", "country": "South Africa", "region": "Africa", "operator": "NTT", "connected_networks": 52, "capacity": 1100, "importance_score": 77, "lat": -26.12, "lng": 28.03},
        {"id": "FAC-06", "facility_name": "SIN-IX Core", "country": "Singapore", "region": "Asia Pacific", "operator": "LINX", "connected_networks": 96, "capacity": 2200, "importance_score": 91, "lat": 1.289, "lng": 103.851},
    ],
    "landing_stations": [
        {"id": "LS-01", "name": "Bude Landing Station", "country": "United Kingdom", "region": "Europe", "lat": 50.8333, "lng": -4.55},
        {"id": "LS-02", "name": "Virginia Beach Landing", "country": "United States", "region": "North America", "lat": 36.8528, "lng": -75.978},
        {"id": "LS-03", "name": "Mumbai Landing Station", "country": "India", "region": "Asia Pacific", "lat": 19.076, "lng": 72.8777},
    ],
    "corridors": [
        {"id": "C-101", "name": "SEA-ME-WE-3", "from": "London", "to": "Singapore", "capacity_gbps": 480, "congestion_score": 76, "regional_dependency": "Europe-Asia", "redundancy_score": 68},
        {"id": "C-102", "name": "Atlantic Crossing", "from": "London", "to": "New York", "capacity_gbps": 430, "congestion_score": 71, "regional_dependency": "Europe-North America", "redundancy_score": 74},
        {"id": "C-103", "name": "Pacific Transit", "from": "Singapore", "to": "San Jose", "capacity_gbps": 520, "congestion_score": 82, "regional_dependency": "Asia-Pacific", "redundancy_score": 62},
        {"id": "C-104", "name": "Red Sea Link", "from": "Dubai", "to": "Frankfurt", "capacity_gbps": 380, "congestion_score": 69, "regional_dependency": "Middle East-Europe", "redundancy_score": 71},
    ],
    "path_concentration": {
        "most_critical": [
            {"name": "SEA-ME-WE-3", "congestion_score": 82, "regional_dependency": "High", "redundancy_score": 64},
            {"name": "Atlantic Crossing", "congestion_score": 75, "regional_dependency": "Medium", "redundancy_score": 76},
            {"name": "Pacific Transit", "congestion_score": 88, "regional_dependency": "High", "redundancy_score": 58},
        ],
        "dependency_index": 7.4,
        "redundancy_rating": 71,
    },
    "backbone": [
        {"id": "LON-01", "name": "London Core", "region": "Europe", "capacity_gbps": 1200},
        {"id": "FRA-02", "name": "Frankfurt Transit", "region": "Europe", "capacity_gbps": 980},
        {"id": "JFK-03", "name": "New York Gateway", "region": "North America", "capacity_gbps": 1400},
        {"id": "SJC-04", "name": "San Jose Edge", "region": "North America", "capacity_gbps": 890},
        {"id": "DXB-05", "name": "Dubai Hub", "region": "Middle East", "capacity_gbps": 760},
        {"id": "SIN-06", "name": "Singapore Exchange", "region": "Asia Pacific", "capacity_gbps": 1100},
    ],
    "links": [
        {"from": "LON-01", "to": "FRA-02", "capacity_gbps": 480},
        {"from": "FRA-02", "to": "DXB-05", "capacity_gbps": 380},
        {"from": "DXB-05", "to": "SIN-06", "capacity_gbps": 440},
        {"from": "SIN-06", "to": "JFK-03", "capacity_gbps": 520},
        {"from": "JFK-03", "to": "SJC-04", "capacity_gbps": 360},
        {"from": "LON-01", "to": "JFK-03", "capacity_gbps": 430},
    ],
}


def get_network_dataset():
    return NETWORK_DATASET


def get_mock_route_simulation(ixp: str | None = None, facility: str | None = None, cable: str | None = None):
    ixp_name = (ixp or "London").strip()
    facility_name = (facility or "Equinix LD8").strip()
    cable_name = (cable or "SEA-ME-WE-3").strip()
    graph = NetworkGraph(
        NETWORK_DATASET["backbone"],
        NETWORK_DATASET["links"],
    )

    failed_map = {
        "SEA-ME-WE-3": ("FRA-02", "DXB-05"),
        "Atlantic Crossing": ("LON-01", "JFK-03"),
        "Pacific Transit": ("SIN-06", "JFK-03"),
        "Red Sea Link": ("FRA-02", "DXB-05"),
    }

    failed_edge = failed_map.get(cable_name, ("FRA-02", "DXB-05"))

    simulation = graph.simulate_failure(failed_edge)

    if simulation["route_available"]:
        route_status = "rerouted"
        affected_traffic = "420 Gbps"
        congestion = 72
        redundancy = 18
    else:
        route_status = "critical"
        affected_traffic = "1.4 Tbps"
        congestion = 94
        redundancy = 47

    return {
        "status": route_status,
        "selected_ixp": ixp_name,
        "selected_facility": facility_name,
        "selected_cable": cable_name,

        "affected_traffic": affected_traffic,

        "impacted_regions": [
            "Europe",
            "North America",
            "Asia Pacific",
        ],

        "impacted_facilities": [
            facility_name,
            "Telehouse North",
            "Google DC 1",
        ],

        "recalculated_paths": [
            {
                "route": " → ".join(simulation["original_path"])
                if simulation["original_path"]
                else "Unavailable",
                "status": "failed",
            },
            {
                "route": " → ".join(simulation["rerouted_path"])
                if simulation["rerouted_path"]
                else "No Alternative Route",
                "status": route_status,
            },
        ],

        "metrics": {
            "new_congestion": congestion,
            "redundancy_drop": redundancy,
            "regional_impact": (
                "Medium"
                if simulation["route_available"]
                else "Critical"
            ),
            "recovery_window_hours": (
                2
                if simulation["route_available"]
                else 8
            ),
        },
    }