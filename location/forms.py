# coding: utf-8
from __future__ import unicode_literals, absolute_import
from .models import Uf, Cidade, Bairro
from django import forms


class EnderecoForm(forms.Form):
    uf = forms.ModelChoiceField(
        label="",
        empty_label="-- Selecione --",
        queryset=Uf.objects.order_by('descricao'),
        widget=forms.Select(attrs={'id': 'uf', 'class': 'full-width'}),
    )

    cidade = forms.ChoiceField(
        label="",
        widget=forms.Select(attrs={'id': 'cidade', 'class': 'full-width'})
    )

    bairro = forms.ChoiceField(
        label="",
        widget=forms.Select(attrs={'id': 'bairro', 'class': 'full-width'})
    )


class Endereco(object):
    def __init__(self, uf=None, cidade=None, bairro=None):
        self.uf = uf
        self.cidade = cidade
        self.bairro = bairro

    def as_dict(self):
        uf_dict = {}
        cidade_dict = {}
        bairro_dict = {}

        if self.uf:
            uf_dict = self.uf.as_dict()

        if self.cidade:
            cidade_dict = self.cidade.as_dict()

        if self.bairro:
            bairro_dict = self.bairro.as_dict()

        return {
            'uf': uf_dict,
            'cidade': cidade_dict,
            'bairro': bairro_dict,
        }

    def get_form(self):
        form = EnderecoForm()

        form.fields['uf'].initial = self.uf.pk

        cidades = [(o.id, str(o)) for o in self.uf.cidade_set.all()]
        form.fields['cidade'].choices = cidades

        form.fields['cidade'].initial = self.cidade.pk

        bairros = [(o.id, str(o)) for o in self.cidade.bairro_set.all()]
        form.fields['bairro'].choices = bairros

        form.fields['bairro'].initial = self.bairro.pk

        return form

    def __unicode__(self):
        return 'uf: %s, cidade: %s, bairro: %s' % (self.uf, self.cidade, self.bairro)


def endereco_por_nome(uf, cidade, bairro):
    endereco = Endereco()

    try:
        endereco.uf = Uf.objects.get(abreviatura=uf)

        try:
            endereco.cidade = Cidade.objects.get(uf=endereco.uf, descricao=cidade)

            try:
                endereco.bairro = Bairro.objects.get(cidade=endereco.cidade, descricao=bairro)
            except:
                endereco.bairro = None
        except:
            endereco.cidade = None
            endereco.bairro = None
    except:
        endereco.uf = None
        endereco.cidade = None
        endereco.bairro = None

    return endereco


# Test Form Maps
class GMapsForm(forms.Form):
    neighborhood = forms.CharField(
        label='Bairro',
        help_text='Propriedade "sublocality" da API do Google Maps.',
        widget=forms.TextInput(attrs={'readonly': 'readonly'}),
    )
    locality = forms.CharField(
        label='Cidade',
        help_text='Propriedade "locality" da API do Google Maps.',
        widget=forms.TextInput(attrs={'readonly': 'readonly'}),
    )
    administrative_area_level_1 = forms.CharField(
        label='UF',
        help_text='Propriedade "administrative_area_level_1" da API do Google Maps.',
        widget=forms.TextInput(attrs={'readonly': 'readonly'}),
    )

    administrative_area_level_1_long_name = forms.CharField(
        label=u'UF Descrição',
        help_text='Propriedade "administrative_area_level_1" da API do Google Maps.',
        widget=forms.TextInput(attrs={'readonly': 'readonly'}),
    )
