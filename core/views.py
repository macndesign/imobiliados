from __future__ import unicode_literals, absolute_import
from django.views.generic.base import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from .models import ImagemRotativa, Parceiro, Imovel, Texto


class HomeTemplateView(TemplateView):
    template_name = 'core/index.html'

    def get_context_data(self, **kwargs):
        context = super(HomeTemplateView, self).get_context_data(**kwargs)
        context['rotativas'] = ImagemRotativa.objects.ativos()[:6]
        context['parceiros'] = Parceiro.objects.ativos()[:3]
        context['imoveis'] = Imovel.objects.destaques()[:8]
        return context


class TextoDetailView(DetailView):
    model = Texto
    template_name = 'core/texto.html'


class ImovelListView(ListView):
    queryset = Imovel.objects.ativos()
    template_name = 'core/imoveis.html'
    context_object_name = 'imoveis'
