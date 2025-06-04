from django.urls import path
from . import views # Asegúrate de que este 'views' apunta a tu archivo views.py

urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('traducir-contenido/', views.traducitContenido, name='traducir-contenido'),
    # Agrega la nueva ruta para la búsqueda de traducciones en la BD
    path('buscar-traduccion-bd/', views.buscar_traduccion_bd, name='buscar-traduccion-bd'),
]