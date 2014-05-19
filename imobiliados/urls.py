from __future__ import unicode_literals, absolute_import
from django.conf.urls import patterns, include, url, i18n
from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
                       url(r'^$', include('core.urls', namespace='core')),
                       url(r'^location/', include('location.urls', namespace='location')),

                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^i18n/', include(i18n)),

                       url(r'^accounts/login/$', 'django.contrib.auth.views.login',
                           {'template_name': 'admin/login.html'}, name='login'))

urlpatterns + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
