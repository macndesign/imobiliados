from __future__ import unicode_literals, absolute_import
from django.contrib import admin
from .models import Imovel, Imagem, TipoImovel, Texto, ImagemRotativa, Parceiro


class ImagemInline(admin.TabularInline):
    model = Imagem


class ImovelAdmin(admin.ModelAdmin):
    inlines = [ImagemInline]


class TextoAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('titulo',)}


admin.site.register(Imovel, ImovelAdmin)
admin.site.register(TipoImovel)
admin.site.register(Texto, TextoAdmin)
admin.site.register(ImagemRotativa)
admin.site.register(Parceiro)
