# traductor/views.py
from django.shortcuts import render
from django.http import JsonResponse
from deep_translator import GoogleTranslator
import json

from .models import Idioma, TraduccionPalabra # Asegúrate de importar ambos modelos
from django.db.models import Q # Para búsquedas OR si fuera necesario, aunque aquí no lo es directamente


def inicio(request):
    # Aquí puedes pasar idiomas si los tienes en un modelo, por ejemplo
    return render(request, 'inicio.html', {"idiomas": listaIdiomas(request)})


def traducitContenido(request):
    # Esta vista usa GoogleTranslator, la mantenemos como está
    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            texto_a_traducir = data.get('texto')
            lenguaje_origen = data.get('lenguajeOrigen')
            lenguaje_destino = data.get('lenguajeDestino')

           

            return JsonResponse({'status': 200, 'data': traduccion})
        else:
            return JsonResponse({'error': 'Método no permitido'}, status=405)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# Nueva función para buscar traducciones desde tu base de datos
def buscar_traduccion_bd(request):
    """
    Busca una traducción específica por país desde la base de datos (modelo TraduccionPalabra).
    Requiere un GET request con 'palabra_original' y 'pais_destino'.
    """
    # Siempre usa .get() para obtener parámetros, con un valor por defecto si no existen
    # y .strip() para eliminar espacios en blanco al inicio o al final
    palabra_original = request.GET.get('palabra_original', '').strip()
    pais_destino = request.GET.get('pais_destino', '').strip()

    if not palabra_original or not pais_destino:
        return JsonResponse({'error': 'Parámetros "palabra_original" y "pais_destino" son requeridos.'}, status=400)

    try:
        # Intenta obtener la palabra original. Si no existe, lanzará TraduccionPalabra.DoesNotExist
        # Nota: Usamos .get() aquí para asegurar que solo hay una coincidencia exacta.
        # Si esperas múltiples o quieres usar .filter() como te sugerí antes, cambia a .filter().first()
        traduccion_obj = TraduccionPalabra.objects.get(palabra_original_mexico__iexact=palabra_original)

        # Construir el nombre de la columna dinámicamente
        # Asegúrate de que los valores de los <option> en HTML (ej. 'argentina')
        # coincidan con los sufijos de las columnas en tu modelo (ej. 'traduccion_argentina')
        nombre_columna_traduccion = f"traduccion_{pais_destino}"

        # Verifica si el atributo (columna) existe en el modelo para evitar errores de acceso
        if not hasattr(traduccion_obj, nombre_columna_traduccion):
            # Si el país de destino no mapea a una columna válida en el modelo
            return JsonResponse({'error': f'País destino "{pais_destino}" no válido o columna de traducción no encontrada en el modelo.'}, status=400)

        traduccion_encontrada = getattr(traduccion_obj, nombre_columna_traduccion)

        # Si la traducción existe (no es None o cadena vacía)
        if traduccion_encontrada:
            return JsonResponse({
                'palabra_original': palabra_original,
                'pais_destino': pais_destino,
                'traduccion': traduccion_encontrada
            })
        else:
            # Si la columna existe, pero el valor en esa columna es nulo o vacío
            return JsonResponse({'error': f'No hay traducción para "{palabra_original}" en {pais_destino} (la traducción está vacía).'}, status=404)

    except TraduccionPalabra.DoesNotExist:
        # Se captura si Traduccio
        # nPalabra.objects.get() no encuentra ninguna coincidencia
        return JsonResponse({'error': f'Palabra original "{palabra_original}" no encontrada en la base de datos.'}, status=404)
    except Exception as e:
        # Captura cualquier otro error inesperado (ej. problemas de base de datos, etc.)
        return JsonResponse({'error': f'Ocurrió un error inesperado en el servidor: {str(e)}'}, status=500)


# Función que retorna una lista de todos los idiomas disponibles para traducir (del modelo Idioma)
def listaIdiomas(request): # Cambié el parámetro a 'request' para consistencia con Django
    return Idioma.objects.all().order_by('idioma')