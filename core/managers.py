# coding: utf-8
from django.db import models


class AtivoManager(models.Manager):
    use_for_related_fields = True

    def ativos(self, **kwargs):
        return self.filter(ativo=True, **kwargs)


class ImovelManager(models.Manager):
    use_for_related_fields = True

    def ativos(self, **kwargs):
        return self.filter(ativo=True, **kwargs)

    def destaques(self, **kwargs):
        return self.ativos().filter(destaque=True, **kwargs)
