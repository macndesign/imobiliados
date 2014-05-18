# coding=utf-8
# API JSON para qualquer objeto
from django.http import HttpResponse
import json
from django.views.generic.detail import SingleObjectTemplateResponseMixin, BaseDetailView


class JSONResponseMixin(object):
    def render_to_response(self, context):
        return self.to_response(self.to_json(context))

    def to_response(self, content, **httpresponse_kwargs):
        return HttpResponse(content, content_type='application/json', **httpresponse_kwargs)

    def to_json(self, context):
        return json.dumps(context)


class HybridDetailView(JSONResponseMixin, SingleObjectTemplateResponseMixin, BaseDetailView):
    def render_to_response(self, context):
        if self.request.is_ajax():
            obj = context['object'].as_dict()
            return JSONResponseMixin.render_to_response(self, obj)
        else:
            return SingleObjectTemplateResponseMixin.render_to_response(self, context)
