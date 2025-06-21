import json
import math
import os
import random
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Tuple

# Set a deterministic seed for reproducibility
random.seed(42)

# ---------------------------
# Data-classes
# ---------------------------

@dataclass
class Node:
    id: int
    lat: float  # degrees
    lon: float  # degrees

    def to_json(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Edge:
    source: int
    target: int
    distance_nm: float  # nautical miles
    weather_factor: float  # multiplier ∈ [1, 2]

    def to_json(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------
# Helpers
# ---------------------------

def haversine(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Return great-circle distance in nautical miles between two (lat, lon) points."""
    # Radius of Earth in nautical miles
    R = 3440.065
    lat1, lon1 = map(math.radians, coord1)
    lat2, lon2 = map(math.radians, coord2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def arctic_coord() -> Tuple[float, float]:
    """Generate a (lat, lon) roughly within the Arctic/High North region."""
    lat = random.uniform(60, 80)  # degrees North
    lon = random.uniform(-150, 50)  # wrap around Northern hemisphere
    return lat, lon


# ---------------------------
# Core generation logic
# ---------------------------

def generate_network(n_nodes: int = 50, k_nearest: int = 3):
    # 1. Nodes
    nodes: List[Node] = []
    for i in range(n_nodes):
        lat, lon = arctic_coord()
        nodes.append(Node(id=i, lat=lat, lon=lon))

    # 2. Build distance matrix
    coords = [(n.lat, n.lon) for n in nodes]
    dist_matrix = [
        [haversine(coords[i], coords[j]) for j in range(n_nodes)]
        for i in range(n_nodes)
    ]

    # 3. Edges – connect each node to its k nearest neighbours (undirected / duplicate OK for now)
    edges: List[Edge] = []
    for i in range(n_nodes):
        # Exclude self, get sorted indices
        neighbors = sorted(range(n_nodes), key=lambda j: dist_matrix[i][j] if j != i else float("inf"))[:k_nearest]
        for j in neighbors:
            distance_nm = dist_matrix[i][j]
            weather_factor = random.uniform(1.0, 2.0)  # simplistic weather multiplier
            edges.append(Edge(source=i, target=j, distance_nm=distance_nm, weather_factor=weather_factor))

    return nodes, edges


def serialize_network(nodes: List[Node], edges: List[Edge]) -> Dict[str, Any]:
    return {
        "nodes": [n.to_json() for n in nodes],
        "edges": [e.to_json() for e in edges],
    }


# ---------------------------
# CLI entry-point
# ---------------------------

def main():
    import argparse

    parser = argparse.ArgumentParser(description="Generate synthetic Arctic logistics network JSON.")
    parser.add_argument("--n", type=int, default=50, help="Number of nodes to generate (default 50)")
    parser.add_argument(
        "--out",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "..", "data", "arctic_net_50.json"),
        help="Output JSON path (default data/arctic_net_50.json)",
    )
    args = parser.parse_args()

    nodes, edges = generate_network(n_nodes=args.n)
    network_json = serialize_network(nodes, edges)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(network_json, f, indent=2)

    print(f"✅ Generated network with {len(nodes)} nodes → {args.out}")


if __name__ == "__main__":
    main() 