# -*- coding: utf-8 -*-
from .models import Texto, Parceiro, Imovel, TipoImovel


def shared_context_processor(request):
    textos = Texto.objects.ativos()
    parceiros = Parceiro.objects.ativos()
    imoveis = Imovel.objects.ativos()
    pk_tipo_imoveil_ativos = [imovel.tipo_imovel.pk for imovel in imoveis if imoveis.count()] or []
    tipo_imoveis = TipoImovel.objects.filter(pk__in=pk_tipo_imoveil_ativos)
    return {'textos': textos, 'parceiros': parceiros, 'tipo_imoveis': tipo_imoveis}
