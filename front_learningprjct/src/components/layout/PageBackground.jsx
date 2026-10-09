/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */

// Fondo de la app: lienzo grafito con un resplandor ambiental fijo detrás del contenido.
// `overflow-x-clip` (y no `hidden`) para no romper `position: sticky` en las escenas.
const PageBackground = ({ children }) => {
  return (
    <div className="relative isolate min-h-screen bg-canvas text-ink overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-[-30vh] h-[80vh] w-[120vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(161_219_135/0.10),transparent)]" />
        <div className="absolute bottom-[-40vh] right-[-20vw] h-[70vh] w-[70vw] rounded-[50%] bg-[radial-gradient(closest-side,rgb(161_219_135/0.05),transparent)]" />
      </div>
      {children}
    </div>
  );
};

export default PageBackground;
