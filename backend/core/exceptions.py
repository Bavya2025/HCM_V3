from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db.models.deletion import ProtectedError

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # If it's a ProtectedError, DRF doesn't handle it by default, so it's None
    if response is None and isinstance(exc, ProtectedError):
        # Identify what is protecting the object
        protected_objects = exc.protected_objects
        model_names = {obj._meta.verbose_name.title() for obj in protected_objects}
        
        return Response({
            'detail': f"Cannot delete this item because it is referenced by {', '.join(model_names)}.",
            'protected_objects': [str(obj) for obj in protected_objects[:5]] # Show first 5
        }, status=status.HTTP_400_BAD_REQUEST)

    return response
