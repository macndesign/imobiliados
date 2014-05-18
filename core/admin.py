from django.contrib import admin
from .models import Imovel, Imagem


class ImagemInline(admin.TabularInline):
    model = Imagem


class ImovelAdmin(admin.ModelAdmin):
    inlines = [ImagemInline]


admin.site.register(Imovel, ImovelAdmin)
