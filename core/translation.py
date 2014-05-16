from modeltranslation.translator import translator, TranslationOptions
from .models import Coisa


class CoisaTranslationOptions(TranslationOptions):
    fields = ('nome',)


translator.register(Coisa, CoisaTranslationOptions)
