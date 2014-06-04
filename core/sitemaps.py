# coding: utf-8
from __future__ import unicode_literals, absolute_import
from django.core.urlresolvers import reverse
from django.contrib.sitemaps import Sitemap
from .models import Imovel, Texto


class ImovelSitemap(Sitemap):
    changefreq = "never"
    priority = 0.5

    def items(self):
        return Imovel.objects.ativos()

    def lastmod(self, obj):
        return obj.modificado_em


class TextoSitemap(Sitemap):
    changefreq = "never"
    priority = 0.5

    def items(self):
        return Texto.objects.ativos()

    def lastmod(self, obj):
        return obj.modificado_em


class ViewSitemap(Sitemap):
    """Reverse static views for XML sitemap."""
    def items(self):
        # Return list of url names for views to include in sitemap
        return ['core:home', 'core:imoveis', 'core:fale-conosco']

    def location(self, item):
        return reverse(item)
