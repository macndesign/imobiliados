# coding: utf-8
from __future__ import unicode_literals, absolute_import
from django.conf.urls import patterns, url
from .views import HomeTemplateView, TextoDetailView, ImovelListView

urlpatterns = patterns('',
                       url(r'^$', HomeTemplateView.as_view(), name='home'),
                       url(r'^imoveis/$', ImovelListView.as_view(), name='imoveis'),

                       # Sempre o ultimo das urls
                       url(r'^(?P<slug>[-\w]+)/$', TextoDetailView.as_view(), name='texto'),
                       )
