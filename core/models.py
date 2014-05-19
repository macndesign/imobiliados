# coding: utf-8
from __future__ import unicode_literals, absolute_import
from django.db import models
from location.models import Uf, Cidade, Bairro
from django.utils.translation import ugettext_lazy as _


class TimeStampedModel(models.Model):
    criado_em = models.DateTimeField(_('Criado em'), auto_now_add=True)
    modificado_em = models.DateTimeField(_('Modificado em'), auto_now=True)

    class Meta:
        abstract = True


class TipoImovel(models.Model):
    titulo = models.CharField(_('Título'), max_length=75)

    class Meta:
        verbose_name = _('Tipo de imóvel')
        verbose_name_plural = _('Tipos de imóveis')

    def __unicode__(self):
        return self.titulo


class Imovel(TimeStampedModel):
    nome = models.CharField(_('Nome'), max_length=75, blank=True)
    tipo_imovel = models.ForeignKey(TipoImovel, verbose_name=_('Tipo de imóvel'))

    uf = models.ForeignKey(Uf, verbose_name=_('UF'))
    cidade = models.ForeignKey(Cidade, verbose_name=_('Cidade'))
    bairro = models.ForeignKey(Bairro, verbose_name=_('Bairro'))
    endereco = models.CharField(_('Endereço'), max_length=255)
    numero = models.CharField(_('Número'), max_length=30, blank=True)
    incorporar_mapa = models.TextField(_('Incorporar o mapa'), blank=True)

    descricao = models.TextField(_('Descrição'), blank=True)
    destaque = models.BooleanField(_('Destaque'))
    valor = models.DecimalField(_('Valor'), blank=True, decimal_places=2, max_digits=16)
    alugado = models.BooleanField(_('Alugado'))
    ativo = models.BooleanField(_('Ativo'))
    data_chegada = models.DateTimeField(_('Data de chegada'), blank=True, null=True)
    data_saida = models.DateTimeField(_('Data de saída'), blank=True, null=True)

    class Meta:
        verbose_name = _('Imóvel')
        verbose_name_plural = _('Imóveis')

    def codigo_imovel(self):
        """
        Código do imóvel. Ex.: MOB0001, MOB0123
        """
        return 'MOB{0:04d}'.format(self.pk)

    def __unicode__(self):
        return self.nome if self.nome else self.pk


class Imagem(models.Model):
    descricao = models.CharField(_('Descrição'), max_length=75)
    imagem = models.ImageField(_('Imagem'), upload_to='images')
    imovel = models.ForeignKey(Imovel, verbose_name=_('Imóvel'))

    class Meta:
        verbose_name = _('Imagem')
        verbose_name_plural = _('Imagens')

    def __unicode__(self):
        return self.descricao


class Texto(TimeStampedModel):
    """
    Qualquer texto do site como: Sobre, Condições de Locação, etc.
    """
    titulo = models.CharField(_('Título'), max_length=75)
    descricao = models.TextField(_('Descrição'))

    class Meta:
        verbose_name = _('Texto')
        verbose_name_plural = _('Textos')

    def __unicode__(self):
        return self.titulo


class ImagemRotativa(TimeStampedModel):
    """
    Imagens grandes que ficam em modo rotativo na página inicial
    """
    titulo = models.CharField(_('Título'), max_length=75)
    descricao = models.TextField(_('Descrição'), blank=True)
    imagem = models.ImageField(_('Imagem'), upload_to='rotativas')

    class Meta:
        verbose_name = _('Imagem rotativa')
        verbose_name_plural = _('Imagens rotativas')

    def __unicode__(self):
        return self.titulo


class Parceiro(TimeStampedModel):
    titulo = models.CharField(_('Título'), max_length=75)
    descricao = models.TextField(_('Descrição'), blank=True)
    imagem = models.ImageField(_('Imagem'), upload_to='parceiros')

    def __unicode__(self):
        return self.titulo
