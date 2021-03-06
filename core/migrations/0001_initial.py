# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'TipoImovel'
        db.create_table(u'core_tipoimovel', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('titulo', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('titulo_pt_br', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('titulo_en', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('titulo_es', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['TipoImovel'])

        # Adding model 'Imovel'
        db.create_table(u'core_imovel', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('criado_em', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('modificado_em', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('nome', self.gf('django.db.models.fields.CharField')(max_length=75, blank=True)),
            ('nome_pt_br', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('nome_en', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('nome_es', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('tipo_imovel', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.TipoImovel'])),
            ('uf', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['location.Uf'])),
            ('cidade', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['location.Cidade'])),
            ('bairro', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['location.Bairro'])),
            ('endereco', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('numero', self.gf('django.db.models.fields.CharField')(max_length=30, blank=True)),
            ('complemento', self.gf('django.db.models.fields.CharField')(max_length=75, blank=True)),
            ('incorporar_mapa', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('latitude', self.gf('django.db.models.fields.CharField')(max_length=75, blank=True)),
            ('longitude', self.gf('django.db.models.fields.CharField')(max_length=75, blank=True)),
            ('descricao', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('descricao_pt_br', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('descricao_en', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('descricao_es', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('destaque', self.gf('django.db.models.fields.BooleanField')()),
            ('valor', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=16, decimal_places=2, blank=True)),
            ('alugado', self.gf('django.db.models.fields.BooleanField')()),
            ('ativo', self.gf('django.db.models.fields.BooleanField')()),
            ('data_chegada', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('data_saida', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['Imovel'])

        # Adding model 'Imagem'
        db.create_table(u'core_imagem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('descricao', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('descricao_pt_br', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('descricao_en', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('descricao_es', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('imagem', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
            ('imovel', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Imovel'])),
        ))
        db.send_create_signal(u'core', ['Imagem'])

        # Adding model 'Texto'
        db.create_table(u'core_texto', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('criado_em', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('modificado_em', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('titulo', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('titulo_pt_br', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('titulo_en', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('titulo_es', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=50, blank=True)),
            ('descricao', self.gf('django.db.models.fields.TextField')()),
            ('descricao_pt_br', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('descricao_en', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('descricao_es', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('ativo', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal(u'core', ['Texto'])

        # Adding model 'ImagemRotativa'
        db.create_table(u'core_imagemrotativa', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('criado_em', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('modificado_em', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('titulo', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('titulo_pt_br', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('titulo_en', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('titulo_es', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('descricao', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('descricao_pt_br', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('descricao_en', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('descricao_es', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('imagem', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
            ('ativo', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal(u'core', ['ImagemRotativa'])

        # Adding model 'Parceiro'
        db.create_table(u'core_parceiro', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('criado_em', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('modificado_em', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('titulo', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('titulo_pt_br', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('titulo_en', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('titulo_es', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('descricao', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('descricao_pt_br', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('descricao_en', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('descricao_es', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('imagem', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
            ('site', self.gf('django.db.models.fields.URLField')(max_length=200, blank=True)),
            ('ativo', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal(u'core', ['Parceiro'])


    def backwards(self, orm):
        # Deleting model 'TipoImovel'
        db.delete_table(u'core_tipoimovel')

        # Deleting model 'Imovel'
        db.delete_table(u'core_imovel')

        # Deleting model 'Imagem'
        db.delete_table(u'core_imagem')

        # Deleting model 'Texto'
        db.delete_table(u'core_texto')

        # Deleting model 'ImagemRotativa'
        db.delete_table(u'core_imagemrotativa')

        # Deleting model 'Parceiro'
        db.delete_table(u'core_parceiro')


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
            'valor': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '16', 'decimal_places': '2', 'blank': 'True'})
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