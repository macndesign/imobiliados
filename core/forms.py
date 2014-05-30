# coding: utf-8
from __future__ import unicode_literals, absolute_import
import re
from django import forms
from django.utils.translation import ugettext_lazy as _
from django.forms.fields import Field
from django.core.validators import EMPTY_VALUES
from django.forms import ValidationError
from .models import Imovel

try:
    from django.utils.encoding import smart_text
except ImportError:
    from django.utils.encoding import smart_unicode as smart_text

phone_digits_re = re.compile(r'^(\d{2})[-\.]?(\d{4,5})[-\.]?(\d{4})$')


class BRPhoneNumberField(Field):
    default_error_messages = {
        'invalid': _('Os números de telefone deve estar em um dos seguintes '
                     'formatos: 99-9999-9999 ou 99-99999-9999, pode ser escrito sem os hífens.'),
    }

    def clean(self, value):
        super(BRPhoneNumberField, self).clean(value)
        if value in EMPTY_VALUES:
            return ''
        value = re.sub('(\(|\)|\s+)', '', smart_text(value))
        m = phone_digits_re.search(value)
        if m:
            return '%s-%s-%s' % (m.group(1), m.group(2), m.group(3))
        raise ValidationError(self.error_messages['invalid'])


SUBJECT_CHOICES = (
    ('Sugestão', _('Sugestão')),
    ('Avaliação', _('Avaliação')),
    ('Preços e disponibilidade', _('Preços e disponibilidade')),
)


def imoveis_choice():
    imoveis = Imovel.objects.ativos()
    outro = (('Outro', _('Outro')),)
    imoveis_choice = outro
    if imoveis:
        imoveis_choice = tuple((imovel.nome, imovel.nome) for imovel in imoveis)
        imoveis_choice += outro
    return imoveis_choice


class ContactForm(forms.Form):
    """
    Formulário de contato do site.
    """

    # Nome do destinatário
    name = forms.CharField(
        label=_('Nome'),
        max_length=15,
        help_text=_('Seu nome para contato.'),
        widget=forms.TextInput(attrs={
            'class': 'form-control',
        }
        )
    )

    # Sobrenome do destinatário
    surname = forms.CharField(
        label=_('Sobrenome'),
        max_length=30,
        help_text=_('Seu sobrenome para contato.'),
        widget=forms.TextInput(attrs={
            'class': 'form-control',
        }
        ),
        required=False
    )

    # Email para contato
    email = forms.EmailField(
        label=_('Email'),
        max_length=75,
        help_text=_('Seu email para contato. Ex: maria@email.com'),
        widget=forms.TextInput(attrs={
            'class': 'form-control',
        }
        )
    )

    # Telefone para contato
    phone = BRPhoneNumberField(
        label=_('Telefone'),
        help_text=_('Seu telefone para contato. Ex: 88-8888-8888'),
        widget=forms.TextInput(attrs={
            'class': 'form-control',
        }
        )
    )

    # Assunto referente ao setor
    subject = forms.ChoiceField(
        label=_('Assunto'),
        help_text=_('Assunto do email'),
        choices=SUBJECT_CHOICES,
        widget=forms.Select(attrs={
            'class': 'form-control',
        }
        )
    )

    # Imóvel
    realty = forms.ChoiceField(
        label=_('Imóvel'),
        help_text=_('Imóvel sobre o qual deseja informações'),
        choices=imoveis_choice(),
        widget=forms.Select(attrs={
            'class': 'form-control',
        }
        )
    )

    # Redigir mensagem
    message = forms.CharField(
        label=_('Mensagem'),
        max_length=1200,
        help_text=_('Escreva sua mensagem.'),
        widget=forms.Textarea(attrs={
            'class': 'form-control',
        }
        )
    )
