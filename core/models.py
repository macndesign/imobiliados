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

    descricao = models.TextField()
    destaque = models.BooleanField()
    valor = models.DecimalField(blank=True, decimal_places=2, max_digits=16)
    alugado = models.BooleanField()
    ativo = models.BooleanField()
    data_chegada = models.DateTimeField(blank=True, null=True)
    data_saida = models.DateTimeField(blank=True, null=True)

    def codigo_imovel(self):
        # TODO: Fazer método para gerar o código do imóvel
        pass

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
