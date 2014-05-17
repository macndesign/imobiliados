# coding: utf-8
from django.db import models


class TimeStampedModel(models.Model):
    criado_em = models.DateTimeField(auto_now_add=True)
    modificado_em = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Imovel(TimeStampedModel):
    nome = models.CharField(max_length=75, blank=True)
    # TODO: Fazer cadastro de endereço como no Boralanchar
    descricao = models.TextField()
    destaque = models.BooleanField()
    valor = models.DecimalField(blank=True)
    alugado = models.BooleanField()
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
        return self.desc


class Imagem(models.Model):
    descricao = models.CharField(max_length=75)
    imovel = models.ForeignKey(Imovel)

    def __unicode__(self):
        return self.desc
