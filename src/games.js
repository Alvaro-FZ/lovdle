import Lovdle from './Lovdle';
import CatChess from './CatChess';

export const GAMES = [
  {
    id: 'lovdle',
    title: 'LOVDLE',
    tagline: 'Adivina la palabra',
    description: 'Adivina la palabra secreta para desbloquear una foto y un recuerdo nuestro.',
    emoji: '💘',
    gradient: 'linear-gradient(135deg, #fda4af 0%, #fb7185 100%)',
    component: Lovdle,
  },
  {
    id: 'catchess',
    title: 'MICHIDREZ',
    tagline: 'EL NOMBRE LO DICE TODO',
    description: 'Ajedrez para jugar con tus caracolis favoritos o contra la IA.',
    emoji: '🐱',
    gradient: 'linear-gradient(135deg, #8ad0f5 0%, #3f9fd4 100%)',
    component: CatChess,
  },
];