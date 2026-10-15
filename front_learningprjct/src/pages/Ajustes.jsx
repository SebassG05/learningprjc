import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import usePageMeta from '../hooks/usePageMeta';
import { stagger, staggerGroup } from '../lib/motion';
import SettingsHeader from '../components/settings/SettingsHeader';
import SecuritySection from '../components/settings/SecuritySection';
import PrivacySection from '../components/settings/PrivacySection';
import { PAGE_DESCRIPTION, PAGE_TITLE } from '../components/settings/settingsCopy';

const page = staggerGroup(stagger.cards);

export default function Ajustes() {
  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);
  const user = useUser()?.user;

  return (
    // El recorte va en un envoltorio a todo el ancho: el halo de la cabecera puede salir de
    // la columna sin crear scroll horizontal (overflow-x: clip no rompe la barra sticky)
    <div className="overflow-x-clip">
      <motion.div
        variants={page}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-2xl space-y-10 px-4 pb-24 pt-10 sm:pt-14"
      >
        <SettingsHeader user={user} />
        <SecuritySection />
        <PrivacySection />
      </motion.div>
    </div>
  );
}
