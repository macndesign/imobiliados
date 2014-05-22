# coding: utf-8
from __future__ import unicode_literals, absolute_import
from django.conf.urls import patterns, url
from location.mixin import HybridDetailView
from .views import (HomeTemplateView, TextoDetailView, ImovelListView, ImovelDetailView, ContactFormView,
                    FaleConoscoFormView, AvaliarEstadiaFormView)
from .models import Imovel

urlpatterns = patterns('',
                       url(r'^$', HomeTemplateView.as_view(), name='home'),
                       url(r'^imoveis/$', ImovelListView.as_view(), name='imoveis'),
                       url(r'^imovel/(?P<pk>\d)/$', ImovelDetailView.as_view(), name='imovel'),
                       url(r'^imovel-json/(?P<pk>\d)/$', HybridDetailView.as_view(model=Imovel)),
                       url(r'^imoveis-json/$', 'core.views.imoveis_json'),
                       url(r'^contato/$', ContactFormView.as_view(), name='contato'),
                       url(r'^fale-conosco/$', FaleConoscoFormView.as_view(), name='fale-conosco'),
                       url(r'^avaliar-estadia/$', AvaliarEstadiaFormView.as_view(), name='avaliar-estadia'),

                       # Sempre o ultimo das urls
                       url(r'^(?P<slug>[-\w]+)/$', TextoDetailView.as_view(), name='texto'),
                       )
