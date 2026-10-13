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
    title: 'CAT CHESS',
    tagline: 'Ajedrez gatuno',
    description: 'Ajedrez para caracolis.',
    emoji: '🐱',
    gradient: 'linear-gradient(135deg, #fdba74 0%, #f97316 100%)',
    component: CatChess,
  },
];