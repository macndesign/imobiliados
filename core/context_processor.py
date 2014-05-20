# -*- coding: utf-8 -*-
from .models import Texto, Parceiro


def shared_context_processor(request):
    textos = Texto.objects.ativos()
    parceiros = Parceiro.objects.ativos()
    return {'textos': textos, 'parceiros': parceiros}
