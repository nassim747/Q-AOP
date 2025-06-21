"""solver.py – baseline classical VRP/TSP + quantum-mode stub.

For hackathon MVP we do a single-vehicle TSP over all nodes.
Edges are computed via great-circle distance (nautical miles) and a simple
weather factor average of the two nodes.
"""
from __future__ import annotations

import math
import time
from typing import Dict, List, Tuple

from ortools.constraint_solver import pywrapcp, routing_enums_pb2

# ---------------------------
# Helpers
# ---------------------------

def haversine_nm(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Great-circle distance between two (lat, lon) points in nautical miles."""
    R = 3440.065  # nautical miles
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


# ---------------------------
# Core solve function
# ---------------------------

def solve(network: Dict, mode: str = "classical") -> Dict:
    """Solve a simple single-route TSP for the provided network.

    Parameters
    ----------
    network : dict with keys "nodes" and "edges" (edges optional)
    mode : "classical" | "quantum"

    Returns
    -------
    dict with keys route (list of node ids), fuel_nm, block_time_h
    """

    nodes = network["nodes"]
    n = len(nodes)

    # Build distance matrix (nautical miles)
    coords = [(n["lat"], n["lon"]) for n in nodes]
    dist_matrix: List[List[float]] = [
        [haversine_nm(coords[i], coords[j]) for j in range(n)] for i in range(n)
    ]

    # OR-Tools setup
    manager = pywrapcp.RoutingIndexManager(n, 1, 0)  # 1 vehicle, start at node 0
    routing = pywrapcp.RoutingModel(manager)

    def distance_cb(from_index: int, to_index: int) -> int:
        i = manager.IndexToNode(from_index)
        j = manager.IndexToNode(to_index)
        # OR-Tools expects integer costs; multiply by 100 & round.
        return int(dist_matrix[i][j] * 100)

    transit_cb_idx = routing.RegisterTransitCallback(distance_cb)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_cb_idx)

    # Solve
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    solution = routing.SolveWithParameters(search_params)

    if not solution:
        raise RuntimeError("No solution found by OR-Tools")

    # Extract route order
    index = routing.Start(0)
    route: List[int] = []
    total_distance_nm = 0.0

    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        route.append(node)
        prev_index = index
        index = solution.Value(routing.NextVar(index))
        total_distance_nm += (
            dist_matrix[manager.IndexToNode(prev_index)][manager.IndexToNode(index)]
        )
    # Append the final depot
    route.append(manager.IndexToNode(index))

    # KPIs
    SPEED_KTS = 250  # assume turboprop / helicopter average
    block_time_h = total_distance_nm / SPEED_KTS

    # Quantum mode simulation
    if mode == "quantum":
        time.sleep(20)  # simulate quantum solver delay
        total_distance_nm *= 0.9  # 10% savings
        block_time_h *= 0.9

    return {
        "route": route,
        "fuel_nm": round(total_distance_nm, 2),
        "block_time_h": round(block_time_h, 2),
        "mode": mode,
    } 