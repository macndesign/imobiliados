# coding: utf-8
from __future__ import unicode_literals, absolute_import
from django.db import models
from django.template.defaultfilters import slugify
from django.utils.translation import ugettext_lazy as _
from location.models import Uf, Cidade, Bairro
from imagekit.models import ImageSpecField
from pilkit.processors import ResizeToFill
import moneyed
from djmoney.models.fields import MoneyField
from .managers import AtivoManager, ImovelManager
from ckeditor.fields import RichTextField


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

    # Localidade
    uf = models.ForeignKey(Uf, verbose_name=_('UF'))
    cidade = models.ForeignKey(Cidade, verbose_name=_('Cidade'))
    bairro = models.ForeignKey(Bairro, verbose_name=_('Bairro'))
    endereco = models.CharField(_('Endereço'), max_length=255)
    numero = models.CharField(_('Número'), max_length=30, blank=True)
    complemento = models.CharField(_('Complemento'), max_length=75, blank=True)
    incorporar_mapa = models.TextField(_('Incorporar o mapa'), blank=True)

    # Latitude e Longitude
    latitude = models.CharField(_('Latitude'), max_length=75, blank=True)
    longitude = models.CharField(_('Longitude'), max_length=75, blank=True)

    descricao = RichTextField(_('Descrição'), blank=True, config_name='mobiliados_ckeditor')
    destaque = models.BooleanField(_('Destaque'))
    valor = MoneyField(_('Valor da diária'), blank=True, default=0.00, decimal_places=2,
                       max_digits=16, default_currency='BRL')
    valor_mensal = MoneyField(_('Valor mensal'), blank=True, default=0.00, decimal_places=2,
                              max_digits=16, default_currency='BRL')
    alugado = models.BooleanField(_('Alugado'))
    ativo = models.BooleanField(_('Ativo'))
    data_chegada = models.DateTimeField(_('Data de chegada'), blank=True, null=True)
    data_saida = models.DateTimeField(_('Data de saída'), blank=True, null=True)

    objects = ImovelManager()

    class Meta:
        verbose_name = _('Imóvel')
        verbose_name_plural = _('Imóveis')

    def codigo(self):
        """
        Código do imóvel. Ex.: MOB0001, MOB0123
        """
        return 'M{0:04d}'.format(self.pk)

    def as_dict(self):
        return {
            'Id': self.pk,
            'Latitude': self.latitude,
            'Longitude': self.longitude,
            'Descricao': self.descricao
        }

    def __unicode__(self):
        return self.nome if self.nome else self.pk


class Imagem(models.Model):
    descricao = models.CharField(_('Descrição'), max_length=75)
    imagem = models.ImageField(_('Imagem'), upload_to='images')
    display = ImageSpecField(source='imagem', processors=[ResizeToFill(400, 300)], format='JPEG', options={'quality': 60})
    thumb = ImageSpecField(source='imagem', processors=[ResizeToFill(100, 75)], format='JPEG', options={'quality': 60})
    imovel = models.ForeignKey(Imovel, verbose_name=_('Imóvel'))

    class Meta:
        ordering = ['descricao', 'imagem']
        verbose_name = _('Imagem')
        verbose_name_plural = _('Imagens')

    def __unicode__(self):
        return self.descricao


class Texto(TimeStampedModel):
    """
    Qualquer texto do site como: Sobre, Condições de Locação, etc.
    """
    titulo = models.CharField(_('Título'), max_length=75)
    slug = models.SlugField(blank=True)
    descricao = RichTextField(_('Descrição'), config_name='mobiliados_ckeditor')
    ativo = models.BooleanField(_('Ativo'), default=True)

    objects = AtivoManager()

    class Meta:
        verbose_name = _('Texto')
        verbose_name_plural = _('Textos')

    @models.permalink
    def get_absolute_url(self):
        return 'core:texto', [self.slug]

    def save(self, *args, **kwargs):
        self.slug = slugify(self.titulo)
        return super(Texto, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.titulo


class ImagemRotativa(TimeStampedModel):
    """
    Imagens grandes que ficam em modo rotativo na página inicial
    """
    titulo = models.CharField(_('Título'), max_length=75)
    descricao = models.TextField(_('Descrição'), blank=True)
    imagem = models.ImageField(_('Imagem'), upload_to='rotativas')
    display = ImageSpecField(source='imagem', processors=[ResizeToFill(960, 338)], format='JPEG',
                             options={'quality': 60})
    ativo = models.BooleanField(_('Ativo'), default=True)

    objects = AtivoManager()

    class Meta:
        verbose_name = _('Imagem rotativa')
        verbose_name_plural = _('Imagens rotativas')

    def __unicode__(self):
        return self.titulo


class Parceiro(TimeStampedModel):
    titulo = models.CharField(_('Título'), max_length=75)
    descricao = models.TextField(_('Descrição'), blank=True)
    imagem = models.ImageField(_('Imagem'), upload_to='parceiros')
    display = ImageSpecField(source='imagem', processors=[ResizeToFill(253, 77)], format='JPEG',
                             options={'quality': 60})
    site = models.URLField(_('Site'), blank=True)
    ativo = models.BooleanField(_('Ativo'), default=True)

    objects = AtivoManager()

    def __unicode__(self):
        return self.titulo
