"""main.py – FastAPI service exposing /optimize for Q-AOP MVP."""

from typing import Any, Dict
import logging
import time  # For simple timing metrics

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import solver

# -----------------------------------------------------------------------------
# Logging setup
# -----------------------------------------------------------------------------
# We configure a simple root logger that prints timestamp-level-message. In a
# real application we might want a richer struct-logger configuration, but this
# is enough for local debugging and can easily be inspected in docker / Heroku
# logs.

logging.basicConfig(
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    level=logging.INFO,
)

logger = logging.getLogger("q-aop.backend")


app = FastAPI(title="Q-AOP Optimizer", version="0.1.0")

# Allow all origins (dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OptimizeRequest(BaseModel):
    network: Dict[str, Any]
    mode: str = "classical"  # or "quantum"


@app.post("/optimize")
async def optimize(req: OptimizeRequest):
    """Run the solver and return route & KPIs.

    We add basic timing + request-size logging so we can watch the backend logs
    while the frontend is interacting with the API and quickly spot issues such
    as missing payloads, mis-matched modes or unexpectedly long solve times.
    """

    n_nodes = len(req.network.get("nodes", []))
    logger.info("Received optimization request | mode=%s | nodes=%d", req.mode, n_nodes)

    t0 = time.perf_counter()
    try:
        result = solver.solve(req.network, mode=req.mode)
    except Exception:
        logger.exception("Solver raised an exception")
        raise
    finally:
        dt = time.perf_counter() - t0
        logger.info("Optimization completed | mode=%s | nodes=%d | %.2fs", req.mode, n_nodes, dt)

    return result 