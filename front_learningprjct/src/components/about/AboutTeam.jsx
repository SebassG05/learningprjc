/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Equipo: las cinco personas en una sola fila en escritorio (sin filas huérfanas) y en lista en móvil.
import Reveal from '../ui/Reveal';
import SplitText from '../ui/SplitText';
import TeamMember from './TeamMember';
import { TEAM, TEAM_TITLE } from './aboutCopy';
import { stagger } from '../../lib/motion';

export default function AboutTeam({ className = '' }) {
  return (
    <section className={className}>
      <SplitText as="h2" className="block text-title-1 font-bold text-ink">{TEAM_TITLE}</SplitText>
      <Reveal as="ul" group step={stagger.list} className="mt-12 grid grid-cols-1 sm:mt-16 lg:grid-cols-5 lg:gap-x-10">
        {TEAM.map((member) => (
          <TeamMember key={member.name} {...member} />
        ))}
      </Reveal>
    </section>
  );
}
