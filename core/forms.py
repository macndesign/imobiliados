# coding: utf-8
from __future__ import unicode_literals, absolute_import
import re
from django import forms
from django.utils.translation import ugettext_lazy as _
from django.forms.fields import Field
from django.core.validators import EMPTY_VALUES
from django.forms import ValidationError

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


class ContactForm(forms.Form):
    u"""
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
        )
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
        max_length=25,
        help_text=_('Seu telefone para contato. Ex: 88-8888-8888'),
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            }
        )
    )

    # Assunto referente ao setor
    subject = forms.CharField(
        label=_('Assunto'),
        max_length=75,
        help_text=_('Título do email'),
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            }
        )
    )

    # Redigir mensagem
    message = forms.CharField(
        label=_('Mensagem'),
        max_length=255,
        help_text=_('Escreva sua mensagem.'),
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            }
        )
    )
