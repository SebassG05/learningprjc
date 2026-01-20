import { Briefcase, Users, Award, HeartHandshake, Star, Globe, MessageCircle, Target, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const team = [
  { name: 'Maria Anaya Romero', role: 'CEO & Fundador', img: '', linkedin: '#' },
  { name: 'Javier Bravo Garcia', role: 'Responsable en GIS, Teledetección y Medio Ambiente', img: '', linkedin: '#' },
  { name: 'Francisco José Blanco-Velázquez', role: 'Project Manager', img: '', linkedin: '#' },
  { name: 'Sebastián Gandía Gutiérrez', role: 'Desarrollador Full Stack', img: '', linkedin: '#' },
  { name: 'Jesús Manuel Vázquez Herrera', role: 'Desarrollador Full Stack', img: '', linkedin: '#' },
];

const values = [
  { icon: <Star className="w-6 h-6 text-[#a1db87]" />, title: 'Innovación', desc: 'Siempre a la vanguardia en tecnología educativa.' },
  { icon: <HeartHandshake className="w-6 h-6 text-[#a1db87]" />, title: 'Cercanía', desc: 'Acompañamos a cada alumno en su camino.' },
  { icon: <Award className="w-6 h-6 text-[#a1db87]" />, title: 'Calidad', desc: 'Cursos y soporte de máxima calidad.' },
  { icon: <Globe className="w-6 h-6 text-[#a1db87]" />, title: 'Accesibilidad', desc: 'Formación para todos, sin barreras.' },
];

export default function SobreNosotros() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Encabezado animado */}
      <section className="mb-20">
        {/* Header Principal animado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="inline-flex items-center px-4 py-2 bg-[#2a2a2a] border border-[#a1db87]/30 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-[#a1db87] mr-2" />
            <span className="text-xs sm:text-sm font-semibold text-[#a1db87]">
              Sobre Nosotros
            </span>
          </motion.div>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center">Sobre Evenor-Tech</h1>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {values.map((v, i) => (
            <div key={i} className="bg-[#181b20] rounded-xl p-6 w-64 flex flex-col items-center shadow-md border border-[#a1db87]/10">
              {v.icon}
              <h3 className="text-lg font-bold text-[#a1db87] mt-2 mb-1">{v.title}</h3>
              <p className="text-gray-400 text-sm text-center">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Nuestra Esencia */}
      <section className="mb-20">
        <div className="flex flex-col items-center mb-8">
          <span className="inline-block bg-[#a1db87]/80 text-[#23272f] font-semibold px-6 py-1 rounded-full mb-2 text-sm tracking-wide shadow">NUESTRA ESENCIA</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-2" style={{fontFamily: 'inherit'}}>Misión, Visión y Valores</h2>
          <div className="w-24 h-1 bg-[#a1db87] rounded mx-auto mt-2 mb-2"></div>
        </div>
        <div className="w-full max-w-6xl mx-auto mb-10">
          <div className="rounded-2xl overflow-hidden shadow-lg relative">
            <img src="https://res.cloudinary.com/dgbmy60sc/image/upload/v1768909817/free-photo-of-naturaleza-animal-insecto-libelula_l4rvk6.jpg" alt="Biodiversidad y sostenibilidad" className="w-full h-64 object-cover object-center opacity-90" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white text-2xl font-bold mb-1">Biodiversidad y sostenibilidad</h3>
              <p className="text-white text-base font-medium">Nuestro compromiso con el medio ambiente y la protección de recursos naturales</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center mb-12">
          {/* Misión */}
          <div className="bg-[#181b20] rounded-2xl shadow-xl border border-[#a1db87]/20 p-8 flex-1 min-w-[380px] max-w-3xl flex flex-col items-center text-center hover:scale-[1.03] transition-transform duration-300 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-8 h-8 text-[#a1db87]" />
              <span className="text-2xl font-bold text-[#a1db87]">Misión</span>
            </div>
            <p className="text-gray-300 text-base font-medium leading-relaxed text-justify">
              Nuestra misión es ayudar a gestionar todo el uso del territorio de una manera sostenible y bajo herramientas sensibilizadas con la innovación, la calidad y el medio ambiente.<br /><br />
              En Evenor-Tech aplicamos tecnologías avanzadas y metodologías innovadoras para promover una gestión territorial que respete los ecosistemas naturales, maximice la eficiencia de los recursos y contribuya a la mitigación del cambio climático a través de soluciones tecnológicas accesibles para todos.
            </p>
          </div>
          {/* Visión */}
          <div className="bg-[#181b20] rounded-2xl shadow-xl border border-blue-400/20 p-8 flex-1 min-w-[380px] max-w-3xl flex flex-col items-center text-center hover:scale-[1.03] transition-transform duration-300 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">Visión</span>
            </div>
            <p className="text-gray-300 text-base font-medium leading-relaxed text-justify">
              Nuestro objetivo es ser reconocido como una organización capaz de poner remedio a la deficiente gestión de los recursos naturales.<br /><br />
              Evenor-Tech cree firmemente que se puede lograr una gestión del territorio en la que todas las personas tengan acceso a las últimas técnicas de gestión sostenible, adaptando para ello la información necesaria para el desarrollo de su actividad, mediante el uso de las TIC. Esto lograría realmente una gestión eficiente del territorio.
            </p>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-[#a1db87]" />Nuestro Equipo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {team.slice(0, 3).map((m, i) => (
            <div key={i} className="bg-[#23272f] rounded-xl p-5 flex flex-col items-center shadow border border-[#a1db87]/10">
              <div className="w-16 h-16 rounded-full bg-[#a1db87]/20 flex items-center justify-center text-2xl font-bold text-[#a1db87] mb-2">
                {m.img ? <img src={m.img} alt={m.name} className="w-full h-full rounded-full object-cover" /> : m.name.charAt(0)}
              </div>
              <div className="text-white font-semibold text-base text-center">{m.name}</div>
              <div className="text-gray-400 text-xs text-center mb-1">{m.role}</div>
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#a1db87] text-xs hover:underline">LinkedIn</a>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {team.slice(3).map((m, i) => (
            <div key={i} className="bg-[#23272f] rounded-xl p-5 flex flex-col items-center shadow border border-[#a1db87]/10">
              <div className="w-16 h-16 rounded-full bg-[#a1db87]/20 flex items-center justify-center text-2xl font-bold text-[#a1db87] mb-2">
                {m.img ? <img src={m.img} alt={m.name} className="w-full h-full rounded-full object-cover" /> : m.name.charAt(0)}
              </div>
              <div className="text-white font-semibold text-base text-center">{m.name}</div>
              <div className="text-gray-400 text-xs text-center mb-1">{m.role}</div>
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#a1db87] text-xs hover:underline">LinkedIn</a>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><MessageCircle className="w-6 h-6 text-[#a1db87]" />Testimonios</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#181b20] rounded-xl p-6 border border-[#a1db87]/10 shadow">
            <p className="text-gray-300 italic mb-2">“Gracias a Evenor-Tech conseguí mi primer trabajo en tecnología. El soporte y la comunidad son increíbles.”</p>
            <div className="text-[#a1db87] font-bold">Lucía M., Alumna</div>
          </div>
          <div className="bg-[#181b20] rounded-xl p-6 border border-[#a1db87]/10 shadow">
            <p className="text-gray-300 italic mb-2">“Como empresa, hemos encontrado en Evenor-Tech un partner de confianza para formar a nuestros equipos.”</p>
            <div className="text-[#a1db87] font-bold">Pedro S., CTO en TechCorp</div>
          </div>
        </div>
      </section>

      {/* Contacto directo */}
      <section className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 justify-center"><HeartHandshake className="w-6 h-6 text-[#a1db87]" />¿Quieres colaborar o tienes dudas?</h2>
        <p className="text-gray-300 mb-4">Escríbenos a <a href="mailto:info@evenor-tech.com" className="text-[#a1db87] underline">info@evenor-tech.com</a> o rellena nuestro <a href="/contacto" className="text-[#a1db87] underline">formulario de contacto</a>.</p>
      </section>
    </div>
  );
}
