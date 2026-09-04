import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings.production"

from config.wsgi import application
handler = application