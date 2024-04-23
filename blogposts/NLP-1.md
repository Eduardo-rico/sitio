---
title: "Procesamiento del lenguaje natural (NLP). Parte 1"
date: "2024-04-22"
---

# Definición del análisis morfológico del lenguaje, características y ejemplos de Morfemas, Morfología, Segmentación y Etiquetado

- **Definición de análisis morfológico:**
    - La morfología es la sub disciplina de la lingüística que lidia con la estructura interna de las palabras. Las otros dos sub-dominios de la morfología son la creación de palabras y la inflexión.
    - Los lenguajes pueden ser clasificados de acuerdo al tipo de morfología que hagan uso.
    - Las regularidades morfológicas son explicadas como esquemas que generalizan sobre un conjunto de palabras complejas relacionadas que son almacenadas en el lexico.
    - Estos esquemas indican cómo se pueden formar nuevas palabras complejas
    - La estructura morfológica de una palabra juega un rol esencial determinando su forma fonética, sus propiedades sintácticas y su significado.

- **Segmentación:**
    - Es el proceso de dividir palabras en morfemas, permitiendo entender la estructura interna de las palabras.

- **Morfemas:**
    - Son la unidad mínima con significado en las que se puede dividir una palabra.
    - Ejemplo:
        - **Divertidísimo**
            - **divert-**. Se refiere a algo que divierte.
            - **id(o)**. Indica que algo posee una cualidad.
            - **ísim(o)**. Indica que una característica se presenta en grado superlativo.
            - **o**. Indica género masculino.
        - **Relojería**
            - **reloj-**. Se refiere a un objeto que marca la hora.
            - **ería**. Indica el lugar en el que se realiza una actividad.
        - **Habilidades**
            - **habil-**. Se refiere a que alguien tiene la capacidad de hacer algo.
            - **idad**. Indica una cualidad de manera abstracta.
            - **es**. Indica número plural.
    - Quiero destacar la importancia del lexema (o raíz) como ejemplo de morfema pues un lexema es el morfema o parte de una palabra que lleva el significado referencial, es decir, aporta a la palabra una idea o concepto interpretable fácilmente por los hablantes, eso lo distingue de otros morfemas gramaticales abstractos o gramemas cuyo significado es más difícil de precisar para los hablantes. El verbo se compone de un lexema y de morfemas constituyentes o gramaticales denominados desinencias que indican tiempo, modo, aspecto, voz, número y persona. Estas variaciones constituyen la llamada conjugación. También puede recibir morfemas derivativos afíjales o afijos.

- **Etiquetado:**
    - También llamado etiquetado gramatical, es el proceso de marcar una palabra en un texto (corpus) como correspondiente a una parte específica del discurso, basado tanto en su definición como en su contexto. Una forma simplificada de esto se enseña comúnmente a niños en edad escolar, en la identificación de palabras como sustantivos, verbos, adjetivos, adverbios, etc.

**Referencias:**
1. arXiv:1503.07283v1 [cs.CL] 25 Mar 2015; Morphological Analyzer and Generator for Russian and Ukrainian Languages [PDF](https://arxiv.org/pdf/1503.07283.pdf)
2. Booij, Geert E., 'Morphological Analysis', in Bernd Heine, and Heiko Narrog (eds), The Oxford Handbook of Linguistic Analysis, 2nd edn (2015; online edn, Oxford Academic, 9 July 2015), [Accessed 22 Apr. 2024.](https://doi.org/10.1093/oxfordhb/9780199677078.013.0020)
3. [Morphological analysis in strongly inflected languages](https://towardsdatascience.com/morphological-analysis-in-strongly-inflected-languages-623e2cc8a443)
4. Bubeník, Vit. (1999). An introduction to the study of morphology. LINCOM coursebooks in linguistics, 07. Muenchen: LINCOM Europa. ISBN 3-89586-570-2.
