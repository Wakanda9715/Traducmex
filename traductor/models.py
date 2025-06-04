# traductor/models.py

from django.db import models

class Idioma(models.Model):
    idIdioma = models.AutoField(primary_key=True, db_column='idIdioma')
    prefijo = models.CharField(max_length=5, db_column='prefijo')
    idioma = models.CharField(max_length=50, db_column='idioma')

    class Meta:
        db_table = 'tbl_idiomas'

class TraduccionPalabra(models.Model):
    # Ya tienes palabra_original_mexico, lo cual está bien.
    palabra_original_mexico = models.CharField(max_length=100, unique=True)

    # ¡CAMBIAR ESTAS LÍNEAS!
    # Los nombres deben ser 'traduccion_' + 'prefijo' (ej. 'ar', 'ca', 'vz', 'cl')
    traduccion_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name='Traducción Argentina') # Añadido blank=True, null=True
    traduccion_ca = models.CharField(max_length=100, blank=True, null=True, verbose_name='Traducción Colombia')
    traduccion_vz = models.CharField(max_length=100, blank=True, null=True, verbose_name='Traducción Venezuela')
    traduccion_cl = models.CharField(max_length=100, blank=True, null=True, verbose_name='Traducción Chile')

    def __str__(self):
        return self.palabra_original_mexico

    class Meta:
        verbose_name = "Traducción de Palabra"
        verbose_name_plural = "Traducciones de Palabras"
        db_table = 'tbl_traducciones' # Se recomienda especificar el nombre de la tabla si no es el default de Django