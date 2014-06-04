# coding: utf-8
from __future__ import unicode_literals, absolute_import
import json
from django.core.mail.message import EmailMessage
from django.core.urlresolvers import reverse_lazy
from django.template.loader import render_to_string
from django.views.generic.edit import FormView
from django.http.response import HttpResponse, HttpResponseRedirect
from django.views.generic.base import TemplateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.conf import settings
from django.contrib import messages
from django.utils.translation import ugettext_lazy as _
from .models import ImagemRotativa, Parceiro, Imovel, Texto, TipoImovel
from .forms import ContactForm


class HomeTemplateView(TemplateView):
    template_name = 'core/index.html'

    def get_context_data(self, **kwargs):
        context = super(HomeTemplateView, self).get_context_data(**kwargs)
        context['rotativas'] = ImagemRotativa.objects.ativos()[:6]
        context['parceiros'] = Parceiro.objects.ativos()[:3]
        context['imoveis'] = Imovel.objects.destaques()[:8]
        return context


class TextoDetailView(DetailView):
    model = Texto
    template_name = 'core/texto.html'


class ImovelListView(ListView):
    template_name = 'core/imoveis.html'
    context_object_name = 'imoveis'

    def get_queryset(self):
        tipo_imovel = self.request.GET.get('tipo', None)
        if tipo_imovel:
            tipo_imovel_selecionado = TipoImovel.objects.get(pk=tipo_imovel)
            imoveis = tipo_imovel_selecionado.imovel_set.all()
        else:
            imoveis = Imovel.objects.ativos()
        return imoveis

    def get_context_data(self, **kwargs):
        context = super(ImovelListView, self).get_context_data(**kwargs)
        tipo_imovel = self.request.GET.get('tipo', None)
        if tipo_imovel:
            tipo_imovel_selecionado = TipoImovel.objects.get(pk=tipo_imovel)
            context['tipo_imovel'] = tipo_imovel_selecionado
        return context


class ImovelDetailView(DetailView):
    model = Imovel
    template_name = 'core/imovel.html'
    context_object_name = 'imovel'


def imoveis_json(request):
    imoveis = Imovel.objects.ativos()
    imoveis_json = json.dumps(
        [imovel.as_dict() for imovel in imoveis if imovel.latitude and imovel.longitude]
    )
    return HttpResponse(imoveis_json, content_type='application/json')


def imoveis_por_tipo_json(request, pk):
    tipo_imovel_selecionado = TipoImovel.objects.get(pk=pk)
    imoveis = tipo_imovel_selecionado.imovel_set.all()
    imoveis_json = json.dumps(
        [imovel.as_dict() for imovel in imoveis if imovel.latitude and imovel.longitude]
    )
    return HttpResponse(imoveis_json, content_type='application/json')


class ContactFormView(FormView):
    """
    Controller que valida, anexa arquivos e envia email de contato do site.
    """

    form_class = ContactForm
    template_name = 'core/contato.html'
    type_message = 'Contact'
    redirect_to = 'core:contato'

    def get_success_url(self):
        return reverse_lazy(self.redirect_to)

    def form_valid(self, form):
        """
        Prepara email para envio;
        Gera template em html com imagens para o email;
        Cria o objeto de envio do email;
        E tenta enviar.
        """
        name = form.cleaned_data['name']
        surname = form.cleaned_data['surname']
        email = form.cleaned_data['email']
        phone = form.cleaned_data['phone']
        subject = form.cleaned_data['subject']
        realty = form.cleaned_data['realty']
        message = form.cleaned_data['message']
        mail = render_to_string(
            'core/email.html', {
                'name': name,
                'surname': surname,
                'email': email,
                'phone': phone,
                'subject': subject,
                'realty': realty,
                'message': message,
            }
        )

        headers = {'Reply-To': email}

        msg = EmailMessage(
            subject='[{0}] {1} - {2}'.format(self.type_message, settings.EMAIL_SUBJECT_PREFIX, subject),
            body=mail,
            from_email=email,
            to=[settings.DEFAULT_FROM_EMAIL],
            headers=headers,
        )

        msg.content_subtype = 'html'

        try:
            msg.send()
            messages.add_message(self.request, messages.SUCCESS, _('Mensagem enviada com sucesso.'))
        except Exception:
            messages.add_message(self.request, messages.ERROR, _(u'Erro: Sua mensagem não pôde ser enviada.'))

        return HttpResponseRedirect(reverse_lazy(self.redirect_to))

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR,
                             _(u'O formulário está inválido. Faltam campos que são requeridos.'))
        return self.render_to_response(self.get_context_data(form=form))


class FaleConoscoFormView(ContactFormView):
    type_message = 'Fale conosco'
    template_name = 'core/fale-conosco.html'
    redirect_to = 'core:fale-conosco'


# SEO
class GoogleSiteVerificationView(TemplateView):
    template_name = 'seo/googledd36cd796f1a8b05.html'


class RobotsTemplateView(TemplateView):
    template_name = 'robots.txt'

    def render_to_response(self, context, **response_kwargs):
        return self.response_class(
            request=self.request,
            template=self.get_template_names(),
            context=context,
            mimetype='test/plain',
            **response_kwargs
        )


class HumansTemplateView(TemplateView):
    template_name = 'humans.txt'

    def render_to_response(self, context, **response_kwargs):
        return self.response_class(
            request=self.request,
            template=self.get_template_names(),
            context=context,
            mimetype='test/plain',
            **response_kwargs
        )


class CrossDomainTemplateView(TemplateView):
    template_name = 'crossdomain.xml'

    def render_to_response(self, context, **response_kwargs):
        return self.response_class(
            request=self.request,
            template=self.get_template_names(),
            context=context,
            mimetype='application/xml',
            **response_kwargs
        )
