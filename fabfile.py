import os
from fabric.api import local, env

PROJECT_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)))
STATIC_DIR = os.path.join(PROJECT_DIR, 'core', 'static')
FIXTURES_DIR = os.path.join(PROJECT_DIR, 'fixtures/')

env.user = 'vagrant'
env.password = 'vagrant'
env.hosts = ['127.0.0.1']
port = 2222


def runserver():
    local('./manage.py runserver 88.88.88.88:8000')


def build_string_paths(static_dir, file_type):
    if os.path.isdir(static_dir):
        path_list = [static_dir + static_file for static_file in os.listdir(static_dir)
                     if static_file.split('.')[-1] == file_type]
        string_js_dir = ' '.join(sorted(path_list))
        return string_js_dir


def concat_and_minify(base_dir, app_all, app_min, file_type):
    if os.path.isfile(os.path.join(base_dir, app_all)):
        local('rm ' + os.path.join(base_dir, app_all))
    local('cat ' + build_string_paths(base_dir, file_type) + ' > ' +
          os.path.join(base_dir, app_all))
    local('java -jar bin/yuicompressor-2.4.8.jar ' + os.path.join(base_dir, app_all) +
          ' -o ' + os.path.join(base_dir, app_min) + ' --charset utf-8')


def minify():
    concat_and_minify(os.path.join(STATIC_DIR, 'js/'), 'app.all.js', 'app.min.js', 'js')
    concat_and_minify(os.path.join(STATIC_DIR, 'css/'), 'style.all.css', 'style.min.css', 'css')
    concat_and_minify(os.path.join(STATIC_DIR, 'libs', 'maps/'), 'app.all.js', 'app.min.js', 'js')
    concat_and_minify(os.path.join(STATIC_DIR, 'libs', 'flexslider/'), 'style.all.css', 'style.min.css', 'css')


def test():
    local('./manage.py test core')
    local('./manage.py test location')


def dumpdata_from_heroku():
    # Location
    local('heroku run python manage.py dumpdata --format=json --indent=4 location > '
          'fixtures/location.json --app mobiliados')
    # Core
    local('heroku run python manage.py dumpdata --format=json --indent=4 core.TipoImovel > '
          'fixtures/coreTipoImovel.json --app mobiliados')
    local('heroku run python manage.py dumpdata --format=json --indent=4 core.Imovel > '
          'fixtures/coreImovel.json --app mobiliados')
    local('heroku run python manage.py dumpdata --format=json --indent=4 core.Imagem > '
          'fixtures/coreImagem.json --app mobiliados')
    local('heroku run python manage.py dumpdata --format=json --indent=4 core.Texto > '
          'fixtures/coreTexto.json --app mobiliados')
    local('heroku run python manage.py dumpdata --format=json --indent=4 core.ImagemRotativa > '
          'fixtures/coreImagemRotativa.json --app mobiliados')
    local('heroku run python manage.py dumpdata --format=json --indent=4 core.Parceiro > '
          'fixtures/coreParceiro.json --app mobiliados')


def loaddata_from_fixtures():
    for fixture_file in os.listdir(FIXTURES_DIR):
        if fixture_file.split('.')[-1] == 'json':
            local('./manage.py loaddata ' + FIXTURES_DIR + fixture_file)


def push_heroku():
    local('git push heroku master')
    local('heroku run python manage.py syncdb --app mobiliados')
    local('heroku run python manage.py migrate --app mobiliados')


def deploy():
    test()
    minify()
    local('git push')
    push_heroku()


def simple_deploy():
    test()
    local('git push')
    push_heroku()
