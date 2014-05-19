# coding: utf-8
"""
# Tests
>>> from menu.models import Item
# Verificando os filhos
>>> items = Item.objects.all()
>>> items
[<Item: Item1>, <Item: Item11>, <Item: Item12>, <Item: Item111>, <Item: Item112>, <Item: Item2>, <Item: Item21>]
>>> items_has_childs = [x for x in items if len(x.item_child_set.all())]
>>> items_has_childs
[<Item: Item1>, <Item: Item11>, <Item: Item2>]
>>> gdic = {i.name: [j.name for j in i.item_child_set.all() if i.pk < j.pk] for i in items_has_childs}
>>> gdic
{u'Item2': [u'Item21'], u'Item1': [u'Item11', u'Item12'], u'Item11': [u'Item111', u'Item112']}
"""

from __future__ import unicode_literals, absolute_import
from django.db import models


class Item(models.Model):
    name = models.CharField(max_length=75)
    item = models.ForeignKey('self', blank=True, null=True, related_name='item_child_set')

    def children(self):
        try:
            child_list = [x.name for x in self.item_child_set.all()]
        except AttributeError:
            child_list = []

        return child_list

    def __unicode__(self):
        try:
            children = self.children()
        except AttributeError:
            children = []

        return '{0}, Children: {1}'.format(
            self.name, children)
