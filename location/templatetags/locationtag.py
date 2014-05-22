from __future__ import unicode_literals, absolute_import
from django import template
from django.conf import settings

register = template.Library()

@register.inclusion_tag('location_tag.html')
def location():
    return {'STATIC_URL': settings.STATIC_URL}
