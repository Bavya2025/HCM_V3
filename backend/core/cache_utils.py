"""
Performance optimization utilities for caching API responses.
This dramatically reduces database load and improves response times.
"""
from functools import wraps
from django.core.cache import cache
from django.utils.encoding import force_str
import hashlib
import json


def cache_api_response(timeout=300, key_prefix='api'):
    """
    Decorator to cache API view responses.
    
    Args:
        timeout: Cache timeout in seconds (default: 5 minutes)
        key_prefix: Prefix for cache keys
    
    Usage:
        @cache_api_response(timeout=300)
        def my_view(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Build cache key from request path, query params, and user
            cache_key_parts = [
                key_prefix,
                request.path,
                request.GET.urlencode(),
                str(request.user.id) if request.user.is_authenticated else 'anon'
            ]
            cache_key_raw = ':'.join(cache_key_parts)
            cache_key = hashlib.md5(cache_key_raw.encode()).hexdigest()
            
            # Try to get from cache
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                return cached_response
            
            # Execute view and cache the response
            response = view_func(request, *args, **kwargs)
            
            # Only cache successful responses (200-299 status codes)
            if 200 <= response.status_code < 300:
                cache.set(cache_key, response, timeout)
            
            return response
        return wrapper
    return decorator


def invalidate_cache_pattern(pattern):
    """
    Invalidate all cache keys matching a pattern.
    Useful when data is updated and cache needs to be cleared.
    
    Args:
        pattern: String pattern to match cache keys
    """
    # Note: This is a simple implementation
    # For production, consider using Redis with pattern-based deletion
    cache.delete_pattern(f'*{pattern}*')


def get_cache_key_for_model(model_name, user_id=None, filters=None):
    """
    Generate a consistent cache key for model data.
    
    Args:
        model_name: Name of the model (e.g., 'offices', 'employees')
        user_id: Optional user ID for user-specific caching
        filters: Optional dict of filters applied
    
    Returns:
        String cache key
    """
    parts = ['model', model_name]
    
    if user_id:
        parts.append(f'user_{user_id}')
    
    if filters:
        filter_str = json.dumps(filters, sort_keys=True)
        filter_hash = hashlib.md5(filter_str.encode()).hexdigest()[:8]
        parts.append(filter_hash)
    
    return ':'.join(parts)
