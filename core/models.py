# coding: utf-8
from django.db import models
from location.models import Uf, Cidade, Bairro


class TimeStampedModel(models.Model):
    criado_em = models.DateTimeField(auto_now_add=True)
    modificado_em = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Imovel(TimeStampedModel):
    nome = models.CharField(max_length=75, blank=True)

    uf = models.ForeignKey(Uf)
    cidade = models.ForeignKey(Cidade)
    bairro = models.ForeignKey(Bairro)
    endereco = models.CharField(max_length=255, verbose_name='Endereço')
    numero = models.CharField(max_length=30, verbose_name='Número', blank=True)
    incorporar_mapa = models.TextField(blank=True)

    descricao = models.TextField()
    destaque = models.BooleanField()
    valor = models.DecimalField(blank=True, decimal_places=2, max_digits=16)
    alugado = models.BooleanField()
    ativo = models.BooleanField()
    data_chegada = models.DateTimeField(blank=True, null=True)
    data_saida = models.DateTimeField(blank=True, null=True)

    def codigo_imovel(self):
        """
        Código do imóvel. Ex.: MOB0001, MOB0123
        """
        return 'MOB{0:04d}'.format(self.pk)

    def __unicode__(self):
        return self.nome if self.nome else self.pk


class TipoImovel(models.Model):
    descricao = models.CharField(max_length=75)
    imovel = models.ForeignKey(Imovel)

    def __unicode__(self):
        return self.descricao


class Imagem(models.Model):
    descricao = models.CharField(max_length=75)
    imagem = models.ImageField(upload_to='images')
    imovel = models.ForeignKey(Imovel)

    def __unicode__(self):
        return self.descricao


class Texto(TimeStampedModel):
    """
    Qualquer texto do site como: Sobre, Condições de Locação, etc.
    """
    titulo = models.CharField(max_length=75)
    descricao = models.TextField()

    def __unicode__(self):
        return self.titulo


class Slider(TimeStampedModel):
    titulo = models.CharField(max_length=75)
    descricao = models.TextField(blank=True)
    imagem = models.ImageField(upload_to='sliders')

    def __unicode__(self):
        return self.titulo


class Parceiro(TimeStampedModel):
    titulo = models.CharField(max_length=75)
    descricao = models.TextField(blank=True)
    imagem = models.ImageField(upload_to='parceiros')

    def __unicode__(self):
        return self.titulo
