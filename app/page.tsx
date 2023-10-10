import Posts from "./components/Posts";

export default function Home() {
  return (
    <main className="px-6 mx-auto">
      <p className="mt-12 mb-12 text-3xl text-center dark:text-white">
        Hola&nbsp;
        <span className="whitespace-nowrap">
          Soy
          <span className="font-bold"> Lalo Rico</span>
        </span>
        <p className="mt-0 mb-0 text-xl text-center">
          Soy químico, licenciado en ciencias de datos y actualmente estoy en la
          maestría en inteligencia artificial, entre otras cosas.
        </p>
        <p className="mt-0 mb-12 text-xl text-center">
          Me gusta hacer ejercicio, salir a correr, y tengo 5 perros. También me
          gusta compartir lo que aprendo sobre todo en blogs en Medium
        </p>
      </p>
      <Posts />
    </main>
  );
}
