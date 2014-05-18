# coding: utf-8
from mixin import HybridDetailView
from models import Uf, Cidade, Bairro
from django.conf.urls import patterns, url
from views import GMapsTemplateView

urlpatterns = patterns('location.views',
    url(r'^set/', 'set', name='set'),
    url(r'^get/', 'get', name='get'),
    url(r'^clear/', 'clear', name='clear'),
    url(r'^cadastrar-endereco/$', GMapsTemplateView.as_view(), name='cadastrar-endereco'),
    
    (r'^uf/(?P<pk>\d)$', HybridDetailView.as_view(model=Uf)),
    (r'^cidade/(?P<pk>\d)$', HybridDetailView.as_view(model=Cidade)),
    (r'^bairro/(?P<pk>\d)$', HybridDetailView.as_view(model=Bairro)),
)