from rest_framework import authentication, exceptions
from .models import APIKey, APIKeyUsageLog
from django.utils import timezone

class APIKeyAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # 1. Check headers
        key = request.headers.get('X-Api-Key') or request.META.get('HTTP_X_API_KEY')
        if not key:
            # Check Authorization: Api-Key <key>
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Api-Key '):
                key = auth_header.split(' ')[1]
        
        if not key:
            return None

        # 2. Validate Key
        try:
            api_key = APIKey.objects.get(key=key)
        except APIKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid API Key')

        if not api_key.is_active:
             raise exceptions.AuthenticationFailed('API Key is revoked')

        if api_key.valid_until and api_key.valid_until < timezone.now().date():
             raise exceptions.AuthenticationFailed('API Key has expired')
        
        # 3. Rate Limiting Check
        one_minute_ago = timezone.now() - timezone.timedelta(minutes=1)
        recent_requests = APIKeyUsageLog.objects.filter(
            api_key=api_key,
            timestamp__gte=one_minute_ago
        ).count()
        
        if recent_requests >= api_key.rate_limit:
            raise exceptions.Throttled(detail=f'Rate limit exceeded ({api_key.rate_limit} requests/min). Please try again in a minute.')
        
        # 3. Update Stats (Log usage)
        api_key.usage_count += 1
        api_key.last_used = timezone.now()
        api_key.save(update_fields=['usage_count', 'last_used'])

        # Create usage log
        try:
            APIKeyUsageLog.objects.create(
                api_key=api_key,
                ip_address=request.META.get('REMOTE_ADDR'),
                endpoint=request.path,
                method=request.method,
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
        except Exception as e:
            # Don't fail the request if logging fails, but maybe log it to console
            print(f"Failed to log API Key usage: {str(e)}")

        # 4. Return User and Key
        # We return the Creator as the content_object user, but the 'auth' object is the key itself
        return (api_key.user, api_key)
