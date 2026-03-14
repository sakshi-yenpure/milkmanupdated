from django.conf import settings
from django.http import HttpResponse


class SimpleCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.META.get("HTTP_ORIGIN")
        allowed = getattr(settings, "CORS_ALLOWED_ORIGINS", [])
        allow_origin = origin if origin in allowed else None

        if request.method == "OPTIONS":
            response = HttpResponse()
            if allow_origin:
                response["Access-Control-Allow-Origin"] = allow_origin
            response["Vary"] = "Origin"
            response["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response["Access-Control-Allow-Credentials"] = "true"
            return response

        response = self.get_response(request)
        if allow_origin:
            response["Access-Control-Allow-Origin"] = allow_origin
        response["Vary"] = "Origin"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
