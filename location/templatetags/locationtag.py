# -*- coding: utf:8 -*-
'''
Created on 16/07/2012

@author: ajrs
'''
from django import template
from django.conf import settings

register = template.Library()

@register.inclusion_tag('location_tag.html')
def location():
    return {'STATIC_URL': settings.STATIC_URL}
