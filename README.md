# Diluciones seriadas: titulación por hemaglutinación

Calculadora y simulador paso a paso, en español, para preparar diluciones seriadas en placa y leer títulos de anticuerpos por hemaglutinación. Funciona en celulares, tablets y computadoras, sin instalar nada.

## Qué hace

- Calcula volúmenes, suero necesario y puntas, y recomienda la micropipeta para cada volumen.
- Explica el procedimiento paso a paso sobre una placa de pocillos interactiva: de qué pocillo se toma, cuánto se pasa y cuándo se cambia de punta.
- Permite método en cascada o directo, controles opcionales (negativo y positivo) y una fila por semana de inmunización.
- Avisa si el suero disponible alcanza y para cuántos µL por pocillo.
- Permite marcar botón, malla o parcial y calcula el título de cada fila.

## Cómo usarlo

Abre el enlace de GitHub Pages del proyecto, o descarga los archivos y abre `index.html` en el navegador.

## Estructura

- `index.html`: contenido de la página.
- `estilos.css`: colores, tamaños y diseño. Los colores principales están en las variables de `:root`.
- `app.js`: lógica. Las fórmulas están en `calc()` y `sim()`, los textos de cada paso en `stx()` y el dibujo en `render()`.

Mantén los tres archivos en la misma carpeta.

## Cómo publicarlo con GitHub Pages

1. Sube los archivos al repositorio.
2. Ve a Settings, luego Pages.
3. En Source elige «Deploy from a branch», rama `main` y carpeta `/ (root)`.
4. Guarda y espera uno o dos minutos: aparecerá el enlace.

## Aviso

Herramienta educativa. Las ilustraciones de lectura son aproximadas. Verifica volúmenes, concentración de glóbulos rojos, temperatura y tiempos con la guía de tu práctica y con tu docente.
