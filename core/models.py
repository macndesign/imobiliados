from django.db import models

# Create your models here.
class Coisa(models.Model):
	nome = models.CharField(max_length=75)

	def __unicode__(self):
		return self.nome
