from __future__ import unicode_literals, absolute_import
from django.shortcuts import render


def home(request):
    return render(request, 'core/index.html')
