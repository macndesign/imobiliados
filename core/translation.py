from __future__ import unicode_literals, absolute_import
from modeltranslation.translator import translator, TranslationOptions
from .models import Imovel, TipoImovel, Imagem, Texto, ImagemRotativa, Parceiro


class ImovelTranslationOptions(TranslationOptions):
    fields = ('nome', 'descricao')

translator.register(Imovel, ImovelTranslationOptions)


class TipoImovelTranslationOptions(TranslationOptions):
    fields = ('titulo',)

translator.register(TipoImovel, TipoImovelTranslationOptions)


class ImagemTranslationOptions(TranslationOptions):
    fields = ('descricao',)

translator.register(Imagem, ImagemTranslationOptions)


class TextoTranslationOptions(TranslationOptions):
    fields = ('titulo', 'descricao')

translator.register(Texto, TextoTranslationOptions)


class ImagemRotativaTranslationOptions(TranslationOptions):
    fields = ('titulo', 'descricao')

translator.register(ImagemRotativa, ImagemRotativaTranslationOptions)


class ParceiroTranslationOptions(TranslationOptions):
    fields = ('titulo', 'descricao')

translator.register(Parceiro, ParceiroTranslationOptions)
