from __future__ import unicode_literals, absolute_import
from django.conf.urls import patterns, include, url, i18n
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from core.sitemaps import ImovelSitemap, TextoSitemap, ViewSitemap

admin.autodiscover()

sitemaps = {
    'view': ViewSitemap,
    'texto': TextoSitemap,
    'imovel': ImovelSitemap,
}

urlpatterns = patterns('',
                       url(r'^location/', include('location.urls', namespace='location')),

                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^i18n/', include(i18n)),
                       url(r'^rosetta/', include('rosetta.urls')),
                       (r'^ckeditor/', include('ckeditor.urls')),

                       url(r'^accounts/login/$', 'django.contrib.auth.views.login',
                           {'template_name': 'admin/login.html'}, name='login'),

                       url(r'^sitemap\.xml$', 'django.contrib.sitemaps.views.sitemap',
                        {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),

                       # Sempre o ultimo das urls
                       url(r'^', include('core.urls', namespace='core')),
                       ) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
