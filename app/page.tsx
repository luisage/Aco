import Navbar from "./components/Navbar";
import Carrusel from "./components/Carrusel";
import InfoEscuela from "./components/InfoEscuela";
import Novedades from "./components/Novedades";
import Videos from "./components/Videos";
import Productos from "./components/Productos";
import Resenas from "./components/Resenas";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Carrusel />
        <InfoEscuela />
        <Novedades />
        <Videos />
        <Productos />
        <Resenas />
      </main>
      <Footer />
    </>
  );
}
