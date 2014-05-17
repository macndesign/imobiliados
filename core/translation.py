from modeltranslation.translator import translator, TranslationOptions
from .models import Imovel, TipoImovel


class CoisaTranslationOptions(TranslationOptions):
    fields = ('nome', 'descricao')


translator.register(Imovel, CoisaTranslationOptions)
