# coding: utf-8
from __future__ import unicode_literals, absolute_import
from .models import Bairro, Cidade, Uf
from django.contrib import admin
from django.contrib.admin.options import ModelAdmin, TabularInline


#Endereços
class BairroAdmin(ModelAdmin):
    list_display = ('descricao', 'cidade',)
    
admin.site.register(Bairro, BairroAdmin)


class BairroInline (TabularInline):
    model = Bairro
    extra = 1


class CidadeAdmin(ModelAdmin):
    list_display = ('descricao', 'uf')
    inlines = [BairroInline]
    
admin.site.register(Cidade, CidadeAdmin)


class CidadeInline (TabularInline):
    model = Cidade
    extra = 1


class UfAdmin(ModelAdmin):
    list_display = ('abreviatura', 'descricao',)
    inlines = [CidadeInline, ]
    
admin.site.register(Uf, UfAdmin)
