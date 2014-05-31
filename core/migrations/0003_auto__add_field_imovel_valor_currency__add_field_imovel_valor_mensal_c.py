# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Imovel.valor_currency'
        db.add_column(u'core_imovel', 'valor_currency',
                      self.gf('djmoney.models.fields.CurrencyField')(default=u'BRL'),
                      keep_default=False)

        # Adding field 'Imovel.valor_mensal_currency'
        db.add_column(u'core_imovel', 'valor_mensal_currency',
                      self.gf('djmoney.models.fields.CurrencyField')(default=u'BRL'),
                      keep_default=False)


        # Changing field 'Imovel.valor_mensal'
        db.alter_column(u'core_imovel', 'valor_mensal', self.gf('djmoney.models.fields.MoneyField')(default_currency='BRL', max_digits=16, decimal_places=2))

        # Changing field 'Imovel.valor'
        db.alter_column(u'core_imovel', 'valor', self.gf('djmoney.models.fields.MoneyField')(default_currency='BRL', max_digits=16, decimal_places=2))

    def backwards(self, orm):
        # Deleting field 'Imovel.valor_currency'
        db.delete_column(u'core_imovel', 'valor_currency')

        # Deleting field 'Imovel.valor_mensal_currency'
        db.delete_column(u'core_imovel', 'valor_mensal_currency')


        # Changing field 'Imovel.valor_mensal'
        db.alter_column(u'core_imovel', 'valor_mensal', self.gf('django.db.models.fields.DecimalField')(max_digits=16, decimal_places=2))

        # Changing field 'Imovel.valor'
        db.alter_column(u'core_imovel', 'valor', self.gf('django.db.models.fields.DecimalField')(max_digits=16, decimal_places=2))

    models = {
        u'core.imagem': {
            'Meta': {'object_name': 'Imagem'},
            'descricao': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'descricao_en': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'descricao_es': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'descricao_pt_br': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'imagem': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'imovel': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Imovel']"})
        },
        u'core.imagemrotativa': {
            'Meta': {'object_name': 'ImagemRotativa'},
            'ativo': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'criado_em': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'descricao': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'descricao_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'descricao_es': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'descricao_pt_br': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'imagem': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'modificado_em': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'titulo': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'titulo_en': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'titulo_es': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'titulo_pt_br': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'})
        },
        u'core.imovel': {
            'Meta': {'object_name': 'Imovel'},
            'alugado': ('django.db.models.fields.BooleanField', [], {}),
            'ativo': ('django.db.models.fields.BooleanField', [], {}),
            'bairro': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['location.Bairro']"}),
            'cidade': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['location.Cidade']"}),
            'complemento': ('django.db.models.fields.CharField', [], {'max_length': '75', 'blank': 'True'}),
            'criado_em': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'data_chegada': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'data_saida': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'descricao': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'descricao_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'descricao_es': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'descricao_pt_br': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'destaque': ('django.db.models.fields.BooleanField', [], {}),
            'endereco': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'incorporar_mapa': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'latitude': ('django.db.models.fields.CharField', [], {'max_length': '75', 'blank': 'True'}),
            'longitude': ('django.db.models.fields.CharField', [], {'max_length': '75', 'blank': 'True'}),
            'modificado_em': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'nome': ('django.db.models.fields.CharField', [], {'max_length': '75', 'blank': 'True'}),
            'nome_en': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'nome_es': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'nome_pt_br': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'numero': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'tipo_imovel': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.TipoImovel']"}),
            'uf': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['location.Uf']"}),
            'valor': ('djmoney.models.fields.MoneyField', [], {'default_currency': u"'BRL'", 'max_digits': '16', 'decimal_places': '2', 'blank': 'True'}),
            'valor_currency': ('djmoney.models.fields.CurrencyField', [], {'default': "u'BRL'"}),
            'valor_mensal': ('djmoney.models.fields.MoneyField', [], {'default_currency': u"'BRL'", 'max_digits': '16', 'decimal_places': '2', 'blank': 'True'}),
            'valor_mensal_currency': ('djmoney.models.fields.CurrencyField', [], {'default': "u'BRL'"})
        },
        u'core.parceiro': {
            'Meta': {'object_name': 'Parceiro'},
            'ativo': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'criado_em': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'descricao': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'descricao_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'descricao_es': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'descricao_pt_br': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'imagem': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'modificado_em': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'site': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'}),
            'titulo': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'titulo_en': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'titulo_es': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'titulo_pt_br': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'})
        },
        u'core.texto': {
            'Meta': {'object_name': 'Texto'},
            'ativo': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'criado_em': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'descricao': ('django.db.models.fields.TextField', [], {}),
            'descricao_en': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'descricao_es': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'descricao_pt_br': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modificado_em': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'blank': 'True'}),
            'titulo': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'titulo_en': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'titulo_es': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'titulo_pt_br': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'})
        },
        u'core.tipoimovel': {
            'Meta': {'object_name': 'TipoImovel'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'titulo': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'titulo_en': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'titulo_es': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'titulo_pt_br': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'})
        },
        u'location.bairro': {
            'Meta': {'ordering': "[u'descricao']", 'unique_together': "((u'descricao', u'cidade'),)", 'object_name': 'Bairro'},
            'cidade': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['location.Cidade']"}),
            'descricao': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'location.cidade': {
            'Meta': {'ordering': "[u'descricao']", 'unique_together': "((u'descricao', u'uf'),)", 'object_name': 'Cidade'},
            'descricao': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'uf': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['location.Uf']"})
        },
        u'location.uf': {
            'Meta': {'ordering': "[u'abreviatura']", 'unique_together': "((u'abreviatura', u'descricao'),)", 'object_name': 'Uf'},
            'abreviatura': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'descricao': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        }
    }

    complete_apps = ['core']