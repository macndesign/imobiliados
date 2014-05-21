# coding: utf-8
from __future__ import unicode_literals, absolute_import
from django.conf.urls import patterns, url
from location.mixin import HybridDetailView
from .views import HomeTemplateView, TextoDetailView, ImovelListView, ImovelDetailView
from .models import Imovel

urlpatterns = patterns('',
                       url(r'^$', HomeTemplateView.as_view(), name='home'),
                       url(r'^imoveis/$', ImovelListView.as_view(), name='imoveis'),
                       url(r'^imovel/(?P<pk>\d)/$', ImovelDetailView.as_view(), name='imovel'),
                       url(r'^imovel-json/(?P<pk>\d)/$', HybridDetailView.as_view(model=Imovel)),
                       url(r'^imoveis-json/$', 'core.views.imoveis_json'),

                       # Sempre o ultimo das urls
                       url(r'^(?P<slug>[-\w]+)/$', TextoDetailView.as_view(), name='texto'),
                       )
