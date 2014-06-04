# coding: utf-8
from __future__ import unicode_literals, absolute_import
from django.conf.urls import patterns, url
from location.mixin import HybridDetailView
from .views import (HomeTemplateView, TextoDetailView, ImovelListView, ImovelDetailView, ContactFormView,
                    FaleConoscoFormView, AvaliarEstadiaFormView, GoogleSiteVerificationView)
from .models import Imovel

urlpatterns = patterns('',
                       url(r'^$', HomeTemplateView.as_view(), name='home'),
                       url(r'^imoveis/$', ImovelListView.as_view(), name='imoveis'),
                       url(r'^imovel/(?P<pk>\d+)/$', ImovelDetailView.as_view(), name='imovel'),
                       url(r'^imovel-json/(?P<pk>\d+)/$', HybridDetailView.as_view(model=Imovel)),
                       url(r'^imoveis-json/$', 'core.views.imoveis_json', name='imoveis-json'),
                       url(r'^imoveis-por-tipo-json/(?P<pk>\d+)/$', 'core.views.imoveis_por_tipo_json', name='imoveis-por-tipo-json'),
                       url(r'^contato/$', ContactFormView.as_view(), name='contato'),
                       url(r'^fale-conosco/$', FaleConoscoFormView.as_view(), name='fale-conosco'),
                       url(r'^googledd36cd796f1a8b05.html$', GoogleSiteVerificationView.as_view(), name='google-site-verification'),

                       url(r'^seo/$', AvaliarEstadiaFormView.as_view(), name='avaliar-estadia'),

                       # Sempre o ultimo das urls
                       url(r'^(?P<slug>[-\w]+)/$', TextoDetailView.as_view(), name='texto'),
                       )
