import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit=50, interval=10, block_duration=30):
        super().__init__(app)
        self.limit = limit
        self.interval = interval
        self.block_duration = block_duration
        self.ip_request_data = {}  

        # ip_request_data structure:
        # {
        #   ip: {
        #       "requests": [timestamps],
        #       "blocked_until": timestamp or Null
        #   }
        # }

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host

        current_time = time.time()
        ip_data = self.ip_request_data.get(client_ip, {"requests": [], "blocked_until": None})

        if ip_data["blocked_until"] and ip_data["blocked_until"] > current_time:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests - You have been temporarily blocked. Please wait and try again."}
            )

        if ip_data["blocked_until"] and ip_data["blocked_until"] <= current_time:
            ip_data["blocked_until"] = None
            ip_data["requests"] = []

        ip_data["requests"] = [t for t in ip_data["requests"] if t > current_time - self.interval]

        ip_data["requests"].append(current_time)

        if len(ip_data["requests"]) > self.limit:
            ip_data["blocked_until"] = current_time + self.block_duration
            self.ip_request_data[client_ip] = ip_data
            return JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests - You have been temporarily blocked. Please wait and try again."}
            )

        self.ip_request_data[client_ip] = ip_data

        response = await call_next(request)
        return response

