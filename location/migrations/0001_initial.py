# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Uf'
        db.create_table(u'location_uf', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('abreviatura', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('descricao', self.gf('django.db.models.fields.CharField')(max_length=255)),
        ))
        db.send_create_signal(u'location', ['Uf'])

        # Adding unique constraint on 'Uf', fields ['abreviatura', 'descricao']
        db.create_unique(u'location_uf', ['abreviatura', 'descricao'])

        # Adding model 'Cidade'
        db.create_table(u'location_cidade', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('descricao', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('uf', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['location.Uf'])),
        ))
        db.send_create_signal(u'location', ['Cidade'])

        # Adding unique constraint on 'Cidade', fields ['descricao', 'uf']
        db.create_unique(u'location_cidade', ['descricao', 'uf_id'])

        # Adding model 'Bairro'
        db.create_table(u'location_bairro', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('descricao', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('cidade', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['location.Cidade'])),
        ))
        db.send_create_signal(u'location', ['Bairro'])

        # Adding unique constraint on 'Bairro', fields ['descricao', 'cidade']
        db.create_unique(u'location_bairro', ['descricao', 'cidade_id'])


    def backwards(self, orm):
        # Removing unique constraint on 'Bairro', fields ['descricao', 'cidade']
        db.delete_unique(u'location_bairro', ['descricao', 'cidade_id'])

        # Removing unique constraint on 'Cidade', fields ['descricao', 'uf']
        db.delete_unique(u'location_cidade', ['descricao', 'uf_id'])

        # Removing unique constraint on 'Uf', fields ['abreviatura', 'descricao']
        db.delete_unique(u'location_uf', ['abreviatura', 'descricao'])

        # Deleting model 'Uf'
        db.delete_table(u'location_uf')

        # Deleting model 'Cidade'
        db.delete_table(u'location_cidade')

        # Deleting model 'Bairro'
        db.delete_table(u'location_bairro')


    models = {
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

    complete_apps = ['location']