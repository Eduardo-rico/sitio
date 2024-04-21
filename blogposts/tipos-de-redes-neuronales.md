---
title: "Tipos de redes neuronales, un resumen."
date: "2024-04-20"
---

# Principales Arquitecturas de Redes Neuronales y sus Aplicaciones

1. **Perceptrón:**
  - *Aplicación:* Problemas de clasificación binaria linealmente separables.
   ![Perceptrón](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Perceptr%C3%B3n_5_unidades.svg/1920px-Perceptr%C3%B3n_5_unidades.svg.png)
  - Fue inventado en 1943 por Warren McCulloch y Walter Pitts y su primer implementación fue hecha en hardware por Frank Rosenblatt.
  - En la actualidad el perceptron es un algoritmo para clasificación binaria. Es el producto de multiplicar una matriz de pesos y una matriz de valores, sumarles un bias y haciendolas pasar por una función que discrimine la salida, generalemente llamada función de activación.

2. **Redes Neuronales Feedforward (FNN):**
  - *Aplicación:* Clasificación y regresión en datos linealmente no separables.
  - Una red neuronal feedforward, también conocida como red neuronal de propagación hacia adelante, es un tipo de red neuronal artificial que se utiliza en la mayoría de las aplicaciones de aprendizaje automático y reconocimiento de patrones. Es una red neuronal en la que la información fluye en una sola dirección, desde la entrada hasta la salida, sin bucles ni conexiones hacia atrás.

3. **Redes Neuronales Convolucionales (CNN):**
  - *Aplicación:* Reconocimiento de imágenes, segmentación de imágenes, visión por computadora.
  - Las Redes neuronales convolucionales son  un tipo de redes neuronales artificiales  donde las “neuronas”  corresponden a campos receptivos de una manera muy similar a las neuronas en la corteza visual primaria (V1) de un cerebro biológico.  Este tipo de red es una variación de un perceptrón multicapa, sin embargo, debido a que su aplicación es realizada en matrices bidimensionales, son muy efectivas para tareas de visión artificial, como en la clasificación y segmentación de imágenes, entre otras aplicaciones.

4. **Redes Neuronales Recurrentes (RNN):**
  - *Aplicación:* Predicción de series temporales, traducción automática, reconocimiento de voz, generación de texto.
  - Una red neuronal recurrente (RNN) es un modelo de aprendizaje profundo que está entrenado para procesar y convertir una entrada de datos secuencial en una salida de datos secuencial específica. Los datos secuenciales son datos, como palabras, oraciones o datos de serie temporal, en los que los componentes secuenciales se interaccionan en función de reglas semánticas y sintácticas complejas. Una RNN es un sistema de software que consta de muchos componentes interconectados que imitan la forma en que los humanos realizan conversiones de datos secuenciales, como la traducción de texto de un idioma a otro. Las RNN están siendo reemplazadas en gran medida por la inteligencia artificial (IA) basada en transformadores y modelos de lenguaje de gran tamaño (LLM), que son mucho más eficientes en el procesamiento secuencial de datos.

5. **Redes Neuronales de Memoria a Corto Plazo (LSTM) y Redes Neuronales de Memoria a Largo Plazo (GRU):**
  - *Aplicación:* Procesamiento del lenguaje natural, generación de texto.
  - Una red neuronal recurrente (RNN) es un modelo de aprendizaje profundo que está entrenado para procesar y convertir una entrada de datos secuencial en una salida de datos secuencial específica. Los datos secuenciales son datos, como palabras, oraciones o datos de serie temporal, en los que los componentes secuenciales se interaccionan en función de reglas semánticas y sintácticas complejas. Una RNN es un sistema de software que consta de muchos componentes interconectados que imitan la forma en que los humanos realizan conversiones de datos secuenciales, como la traducción de texto de un idioma a otro. Las RNN están siendo reemplazadas en gran medida por la inteligencia artificial (IA) basada en transformadores y modelos de lenguaje de gran tamaño (LLM), que son mucho más eficientes en el procesamiento secuencial de datos.
  - En teoría, las celdas LSTM tienen una puerta adicional y, por lo tanto, son más complejas y tardan más en entrenarse. Esta complejidad añadida debería facilitar recordar secuencias más largas. Sin embargo, no hay evidencia empírica clara de que una de un tipo de redes supere a al otro en todos los casos. Andrew Ng recomienda comenzar con GRU, ya que son más simples y escalables que las celdas LSTM.

6. **Redes Generativas Adversariales (GAN):**
  - *Aplicación:* Generación de imágenes realistas, arte generativo, superresolución de imágenes, síntesis de voz.
  - Una red generativa antagónica (GAN) es una arquitectura de aprendizaje profundo. Entrena dos redes neuronales de modo que compitan entre sí para generar nuevos datos más auténticos a partir de un conjunto de datos de entrenamiento determinado. Por ejemplo, es posible generar nuevas imágenes a partir de una base de datos de imágenes existente, así como música original a partir de una base de datos de canciones. Una GAN se denomina antagónica porque entrena dos redes diferentes y las enfrenta entre sí. Una red genera nuevos datos al tomar una muestra de datos de entrada y modificarla en la medida de lo posible. La otra red intenta predecir si la salida de datos generada pertenece al conjunto de datos original. En otras palabras, la red de predicción determina si los datos generados son falsos o reales. El sistema genera versiones nuevas y mejoradas de valores de datos falsos hasta que la red de predicción ya no puede distinguir el falso del original.

7. **Redes Neuronales Autoencoders:**
  - *Aplicación:* Reducción de dimensionalidad, eliminación de ruido en imágenes, reconstrucción y generación de datos.
  - Los autoencoders es un tipo de arquitectura de redes neuronales que pertenece al grupo de métodos de aprendizaje no supervisados. Esta arquitectura extrae las características más importantes del input eliminando el resto de poca relevancia.
  Esto permite que los autoencoders aprendan una representación de la información reducida siendo un perfecto método para comprimir información.
  La información completa puede ser reconstruida gracias a la arquitectura del autoencoder. Esto hace que sea un algoritmo generativo.




## Referencias

- Gamco. (s.f.). Red neuronal feedforward. Recuperado de [https://gamco.es/glosario/red-neuronal-feedforward/](https://gamco.es/glosario/red-neuronal-feedforward/)

- Barrios, J. (s.f.). Redes neuronales convolucionales. Recuperado de [https://www.juanbarrios.com/redes-neurales-convolucionales/](https://www.juanbarrios.com/redes-neurales-convolucionales/)

- Amazon Web Services. (s.f.). Recurrent Neural Network. Recuperado de [https://aws.amazon.com/es/what-is/recurrent-neural-network/#:~:text=Una%20red%20neuronal%20recurrente%20(RNN,salida%20de%20datos%20secuencial%20espec%C3%ADfica.](https://aws.amazon.com/es/what-is/recurrent-neural-network/#:~:text=Una%20red%20neuronal%20recurrente%20(RNN,salida%20de%20datos%20secuencial%20espec%C3%ADfica.)

- The Machine Learners. (s.f.). GRU vs LSTM: comparación de modelos de secuencia. Recuperado de [https://www.themachinelearners.com/modelos-secuencia/#GRU_vs_LSTM](https://www.themachinelearners.com/modelos-secuencia/#GRU_vs_LSTM)

- Amazon Web Services. (s.f.). ¿Qué es una red neuronal recurrente? Recuperado de [https://aws.amazon.com/es/what-is/recurrent-neural-network/](https://aws.amazon.com/es/what-is/recurrent-neural-network/)

- Amazon Web Services. (s.f.). ¿Qué es una red generativa antagónica (GAN)? Recuperado de [https://aws.amazon.com/es/what-is/gan/#:~:text=Una%20red%20generativa%20antag%C3%B3nica%20(GAN,de%20datos%20de%20entrenamiento%20determinado.](https://aws.amazon.com/es/what-is/gan/#:~:text=Una%20red%20generativa%20antag%C3%B3nica%20(GAN,de%20datos%20de%20entrenamiento%20determinado.)

- Codificando Bits. (s.f.). Autoencoders: explicación y tutorial en Python. Recuperado de [https://www.codificandobits.com/blog/autoencoders-explicacion-y-tutorial-python/#qu%C3%A9-es-un-autoencoder](https://www.codificandobits.com/blog/autoencoders-explicacion-y-tutorial-python/#qu%C3%A9-es-un-autoencoder)
