---
title: "Mi primer proyecto real"
date: "2023-10-09"
---

# Mi descubrimiento personal: La programación sí sirve

Hace unos 3 años ya, en medio de la pandemia de COVID-19, estaba encerrado en mi cuarto, en Celaya, con mi mamá y mis dos perritas. Había terminado mi carrera y ya estaba en proceso de titulación, solo unos meses atrás en diciembre de 2019 había presentado mi examen profesional para titularme como químico y me seguía llevando con mis amigos químicos.

En pocas, _muy pocas_ palabras, la química computacional es una disciplina que emplea métodos informáticos (computacionales) y herramientas matemáticas para modelar y analizar sistemas químicos, desde moléculas simples hasta materiales complejos. Generalmente se analizan los cálculos energéticos y simulaciones moleculares (y otra clase de predicciones teóricas como la teoría de átomos en moléculas), esta rama de la química contribuye significativamente a la comprensión y diseño de moléculas, reacciones químicas, materiales y fármacos, facilitando avances en campos que van desde la química farmacéutica hasta la nanotecnología y la investigación de materiales.

Había un problema simple, rotar una molécula bien es complicado, generalmente lo hacíamos con excel, pero en ese momento estaba estudiando JavaScript y quería dejar de hacer química computacional para centrarme en la computación, ya sabía algo de Python, así que me centré en tomar lo que ya sabía y adentrarme en la solución de este pequeño problema.

Este es el resultado de experimentar un problema y resolverlo para después compartir la solución con mis compañeros y fue mi momento eureka para enamorarme de la computación y su manera de solucionar problemas, a partir de ahí me enamoré de la programación.

## Rotate Molecule Axis

Este script de Python permite rotar una molécula en un archivo de coordenadas XYZ alrededor de los ejes X, Y o Z. Utiliza la biblioteca `tinyQuaternion` para realizar las rotaciones.

## Instalación de Dependencias

Asegúrate de que tienes instalada la biblioteca `tinyQuaternion` antes de ejecutar este script. Puedes encontrar más información sobre cómo instalarla en [este enlace](https://pypi.org/project/tinyquaternion/).

## Uso

Ejecuta el script con los siguientes argumentos:

```bash
python script.py archivo.xyz gradosX gradosY gradosZ
```

- archivo.xyz: El archivo de coordenadas XYZ que deseas rotar.
- gradosX: Ángulo de rotación en grados alrededor del eje X.
- gradosY: Ángulo de rotación en grados alrededor del eje Y.
- gradosZ: Ángulo de rotación en grados alrededor del eje Z.

## Funciones

- abrir_archivo(file)
  Esta función abre y lee el contenido del archivo especificado y devuelve una lista de líneas.

- to_arreglo(contenido)
  Convierte el contenido del archivo en una lista de vectores y una lista de nombres de los vectores.

- a_np(matriz)
  Convierte la lista de vectores en una lista de matrices NumPy.

- rotar_prro(np_matriz, gradosX=0, gradosY=0, gradosZ=0)
  Realiza una rotación de los vectores en la matriz alrededor de los ejes X, Y o Z según los ángulos especificados. Devuelve la matriz rotada.

- rehacer_XYZ(matriz, nombres)
  Convierte la matriz de vectores en un archivo XYZ con el nombre "out.xyz".

- run()
  Función principal que ejecuta el flujo del programa. Abre el archivo de entrada, realiza la rotación y guarda el resultado en "out.xyz".

## Ejemplo de Uso

```bash
python script.py molecule.xyz 30 0 0
```

Este comando rotará la molécula en el archivo "molecule.xyz" 30 grados alrededor del eje X.

## Repositorio de GitHub

Puedes encontrar el código fuente de este proyecto en [Github](https://github.com/Eduardo-rico/rotate-molecule-axis/tree/master).
Este proyecto está desarrollado por [Eduardo Rico](ricosotomayor.tech).
