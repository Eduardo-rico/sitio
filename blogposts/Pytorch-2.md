---
title: "Fundamentos de PyTorch: Notación tensorial"
date: "2024-04-24"
---
# Tensores y PyTorch
Veremos ejemplos de cómo instanciar tensores en PyTorch y cómo es la notación tensorial de los mismos.

## Tensores en PyTorch

En un notebook de Google Colab haremos la siguiente importación de librerías, esto será genérico para posteriores entradas:

```python
import torch
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
print(torch.__version__)
```

La primer linea es la importación de la librería de torch. La segunda es una librería para manipular datos, generalmente en tablas, también llamadas DataFrames (df) Pandas es una contracción del término “panel data” porque originalmente estaba hecho para series de datos que incluyen observaciones a lo largo de varios periodos de tiempo. La tercera linea es Numerical Python, numpy es una librería que ya tiene funciones y clases con métodos que nos ayudan a hacer operaciones matemáticas de una manera óptima. Matplotlib es una librería de visualización de datos, sirve para hacer gráficas.

Por último el print statement imprime el método mágico (*dunder method*) que nos permite ver con qué version de torch estamos trabajando. 

En Colab muchas librerías ya están instaladas en el ambiente virtual de la misma, no hay mucho más que hacer.

Los tensores son una famila de objetos en los que podemos encontrar los escalares, los vectores, las matrices y matrices multidimensionales.

Empecemos por el tensor de dimension 0.

```python
# Inicializando un escalar o tensor de orden 0 (o dimensiones)
scalar = torch.tensor(7)
scalar
```

Un escalar es un número normal, de toda la vida, como la cantidad de años que tienes o la cantidad de pelitos que se te pegan cuando abrazas a un gato, claramente pueden ser elementos a cualquier conjunto, los naturales, reales, racionales, etc.

No sobra decir, que, en general no inicializamos los tensores así, son un objeto que utiliza PyTorch para poder operar.

Un vector, es un arreglo de escalares que en conjunto representan una magnitud con alguna dirección. Típicamente tienen dos o tres direcciones.

```python
vector = torch.tensor([3, 4.01])
vector
```

Si consultamos el número de dimensiones para un vector por médio del método ndim, veremos que nos regresa un 1, es decir, es un tensor de primer orden porque sólo tiene una dimensión.

```python
vector.ndim
# >>> 1
```

Por otro lado .shape nos regresa la longitud de cada dimensión del tensor, para nuestro vector, será de (2,) lo que indica que tiene dos elementos en su unica dimensión.

```python
vector.shape
# >>> (2,)
```

Para el caso de una matriz, digamos de 2x2 haríamos algo así:

```python
matriz = torch.tensor([[1, 2],
											 [3, 4]])
```

Es claro que el número de dimensiones de este tensor es 2 y que la matriz tiene un shape de [2,2], es decir, 2 dimensiones y cada dimension tiene 2 elementos.

```python
matriz.ndim
# >>> 2
matriz.shape
# >>> torch.Size([2,2])
```

### Interludio Matemático: Notación de índices de Einstein

La notación de índices de Einstein es una forma compacta y elegante de representar objetos matemáticos con múltiples dimensiones (o índices). Fue introducida por Albert Einstein en su teoría de la relatividad general.

Un escalar es un objeto matemático con cero índices, por lo que se representa sin índices:

$$
S
$$

Un vector es un objeto matemático con sólo un índice, se representa con índice superior:

$$
V^{i}
$$

Donde el índice *i* generalmente es de 2 o tres dimensiones, así sus componentes, para cuando *i = 3* sería:

$$
V^{1}, V^{2}, V^{3}
$$

Las matrices tienen dos índices, se representa con índice superior y otro inferior:

$$
M^{i}_{j}
$$

Veamos un ejemplo de una matriz de 2x2:

$$
M^{1}_{1}, M^{1}_{2}, M^{2}_{1}, M^{2}_{2}
$$

Ahora para una matriz de 3x3:

$$
M^{1}_{1}, M^{1}_{2}, M^{1}_{3},M^{2}_{1}, M^{2}_{2}, M^{2}_{3},M^{3}_{1}, M^{3}_{2}, M^{3}_{3},
$$

Aquí podemos observar que el superíndice representa las filas y el subíndice las columnas, sin embargo esto depende de la notación, muchas veces el índice superior también describe para indicar contravarianza y un tensor en una base específica, además para indicar el índice de las filas.

Los subíndices (índices inferiores) se escriben debajo de la letra y se utilizan para indicar covariancia, componentes de un vector o tensor en la base dual, e índices de columna en una matriz o tensor.

Un tensor es un objeto matemático con tres o más índices. Se representa con índices superiores e inferiores:

$$
T^{ijk}_{lmn}
$$

Un tensor con una fila que tiene una matriz de 3x3 se vería algo así:

$$
T^{1}_{11}, T^{1}_{12}, T^{1}_{13},T^{2}_{21}, T^{2}_{22}, T^{2}_{23},T^{3}_{31}, T^{3}_{32}, T^{3}_{33},  
$$

Es importante mencionar que los índices que se repiten implican una suma, como podemos ver en la notación de un simple producto punto:

$$
a_{i} = (a_{1}, a_{2}, a_{3})
$$

$$
b_{i} = (b_{1}, b_{2}, b_{3})
$$

$$
a_{i}b^{i} = a_{1}b^{1}+ a_{2}b^{2}+a_{3}b^{3} = \sum_{i}(a_{i}b_{i})
$$

De igual manera, se puede comprobar que para la multiplicación de dos matrices, se puede usar esta notación y resulta útil:

$$
A^{i}_{j}B^{j}_{k} = \sum_{j}A_{ij}B_{jk}
$$

y muchas veces, por convención de la suma:

$$
A_{ij}B_{jk}
$$

### Fin del interludio

Referencias:

Tutorialsteacher. (s.f.). Magic Methods in Python. Recuperado el [fecha de acceso], de [https://www.tutorialsteacher.com/python/magic-methods-in-python](https://www.tutorialsteacher.com/python/magic-methods-in-python)
Linear Algebra Basics. (s.f.). Vector Basic Operations. Recuperado el [fecha de acceso], de [https://medium.com/linear-algebra-basics/vector-basic-operations-5f084ecee391](https://medium.com/linear-algebra-basics/vector-basic-operations-5f084ecee391)