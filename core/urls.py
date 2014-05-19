# coding: utf-8
from __future__ import unicode_literals, absolute_import
from django.conf.urls import patterns, include, url, i18n

from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
                       url(r'^$', 'core.views.home', name='home'))
