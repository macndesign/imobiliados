from django.db import models


# Create your models here.
class Imovel(models.Model):
    nome = models.CharField(max_length=75, blank=True)
    descricao = models.TextField()
    destaque = models.BooleanField()
    valor = models.DecimalField(blank=True)
    alugado = models.BooleanField()
    data_chegada = models.DateTimeField(blank=True, null=True)
    data_saida = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return self.nome


class TipoImovel(models.Model):
    desc = models.CharField(max_length=75)
    imovel = models.ForeignKey(Imovel)

    def __unicode__(self):
        return self.desc


class Imagem(models.Model):
    desc = models.CharField(max_length=75)
    imovel = models.ForeignKey(Imovel)

    def __unicode__(self):
        return self.desc
