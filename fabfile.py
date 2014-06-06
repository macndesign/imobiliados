import os
from fabric.api import local, run
STATIC_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'core', 'static')


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


def commit_push():
    local('git add -p && git commit')
    local('git push')


def prepare_deploy():
    test()
    minify()
    commit_push()


def push_heroku():
    local('git push heroku master')
    run('heroku run python manage.py syncdb')
    run('heroku run python manage.py migrate')


def deploy():
    prepare_deploy()
    push_heroku()