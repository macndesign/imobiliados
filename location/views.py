# coding: utf-8
from __future__ import unicode_literals, absolute_import
import json
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic.edit import FormView
from .forms import GMapsForm
from .forms import Endereco, endereco_por_nome
from .models import Bairro, Uf, Cidade


def set(request, redirect_to='core:home'):
    if ('uf' in request.POST) and ('cidade' in request.POST) and ('bairro' in request.POST):
        uf = request.POST['uf']
        cidade = request.POST['cidade']
        bairro = request.POST['bairro']
        
        if (int(uf) > 0) and (int(cidade) > 0) and (int(bairro) > 0):
            try:
                endereco = Endereco()
                
                endereco.uf = get_object_or_404(Uf, pk=uf)
                endereco.cidade = get_object_or_404(Cidade, pk=cidade)
                endereco.bairro = get_object_or_404(Bairro, pk=bairro)
    
                request.session['endereco'] = endereco
            except ValueError:
                return redirect(reverse(redirect_to))
        else:
            messages.add_message(request, messages.ERROR, message=u'Erro no preenchimento dos os campos')
    else:
        messages.add_message(request, messages.ERROR, message=u'Preencha todos os campos')

    return redirect(reverse(redirect_to))


def get(request, redirect_to='core:home'):
    if not request.is_ajax():
        return HttpResponse('Não é possível acessar este recurso por este meio.', status=400)

    if not (('u' in request.GET) and ('c' in request.GET) and ('b' in request.GET)):
        return HttpResponse(json.dumps(Endereco.as_dict()), content_type='application/json')
        
    endereco = endereco_por_nome(request.GET['u'], request.GET['c'], request.GET['b'])

    return HttpResponse(json.dumps(endereco.as_dict()), content_type='application/json')


def clear(request):
    if 'endereco' in request.session:
        del request.session['endereco']

    return redirect(reverse('core:home'))


class GMapsTemplateView(FormView):
    template_name = 'form_cadastrar_endereco.html'
    form_class = GMapsForm

    def get_success_url(self):
        return reverse('location:cadastrar-endereco')

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(GMapsTemplateView, self).dispatch(*args, **kwargs)

    def form_valid(self, form):
        # Salvar a UF
        uf_descricao = form.cleaned_data['administrative_area_level_1_long_name']
        uf_abreviatura = form.cleaned_data['administrative_area_level_1']
        uf, uf_created = Uf.objects.get_or_create(abreviatura=uf_abreviatura, descricao=uf_descricao)

        if uf_created:
            messages.add_message(self.request, messages.SUCCESS, u'Estado cadastrado com sucesso.')
        else:
            messages.add_message(self.request, messages.WARNING, u'O estado informado já foi cadastrado.')

        # Salvar a cidade associada a UF
        cidade_descricao = form.cleaned_data['locality']
        cidade, cidade_created = Cidade.objects.get_or_create(descricao=cidade_descricao, uf=uf)

        if cidade_created:
            messages.add_message(self.request, messages.SUCCESS, u'Cidade cadastrada com sucesso.')
        else:
            messages.add_message(self.request, messages.WARNING, u'A cidade informada já foi cadastrada.')

        # Salvar o bairro associado a uma cidade
        bairro_descricao = form.cleaned_data['neighborhood']
        bairro, bairro_created = Bairro.objects.get_or_create(descricao=bairro_descricao, cidade=cidade)

        if bairro_created:
            messages.add_message(self.request, messages.SUCCESS, u'Bairro cadastrado com sucesso.')
        else:
            messages.add_message(self.request, messages.WARNING, u'O bairro informado já foi cadastrado.')

        return redirect(reverse('location:cadastrar-endereco'))
