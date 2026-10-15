import { KeyRound } from 'lucide-react';
import Button from '../ui/Button';
import SettingsRow from '../ui/SettingsRow';
import SettingsSection from '../ui/SettingsSection';
import { SECURITY } from './settingsCopy';

// Seguridad: la contraseña se restablece en /forgot-password, como hasta ahora.
// Esta fila solo lleva hasta allí; el envío del email y sus estados viven en esa página.
export default function SecuritySection() {
  const { password } = SECURITY;
  return (
    <SettingsSection title={SECURITY.title}>
      <SettingsRow
        icon={KeyRound}
        title={password.title}
        description={password.description}
        layout="stack"
        control={
          <Button to="/forgot-password" variant="secondary" className="w-full sm:w-auto">
            {password.action}
          </Button>
        }
      />
    </SettingsSection>
  );
}
