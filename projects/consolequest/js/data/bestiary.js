import { ASCII } from '../utils/ascii.js'; // Can re-use ascii if needed, or define here

export const BESTIARY = {
    SLIME: {
        id: 'slime',
        name: 'Green Slime',
        hp: 20,
        damage: 3,
        xp: 10,
        symbol: 's',
        color: '#00ff00',
        art: `
  _____
 /  O  \\
|   O   |
 \\_____/
        `
    },
    GOBLIN: {
        id: 'goblin',
        name: 'Goblin Scout',
        hp: 35,
        damage: 6,
        xp: 25,
        symbol: 'g',
        color: '#aa5500',
        art: `
  <|o.o|>
   ( : )
   /   \\
  ^     ^
        `
    },
    SKELETON: {
        id: 'skeleton',
        name: 'Rattlebones',
        hp: 30,
        damage: 8,
        xp: 30,
        symbol: 'S',
        color: '#eeeeee',
        art: ASCII.SKULL || `[Skull Art]`
    },
    ORC: {
        id: 'orc',
        name: 'Orc Warrior',
        hp: 60,
        damage: 12,
        xp: 50,
        symbol: 'O',
        color: '#008800',
        art: `
   ____
  (o__o)
  /|  |\\
 / |__| \\
   /  \\
  /    \\
        `
    },
    DRAGON: {
        id: 'dragon',
        name: 'Red Dragon',
        hp: 200,
        damage: 25,
        xp: 500,
        symbol: 'D',
        color: '#ff0000',
        art: `
      ,   ,
     / \\_/ \\
    ( ^ . ^ )
     \\  ^  /
     |||||||
    (_| | |_)
        `
    },
    BAT: {
        id: 'bat',
        name: 'Giant Bat',
        hp: 15,
        damage: 2,
        xp: 8,
        symbol: 'b',
        color: '#666666',
        art: `
   /\\^/\\
  ( o o )
   \\_v_/
        `
    },
    WOLF: {
        id: 'wolf',
        name: 'Dire Wolf',
        hp: 45,
        damage: 9,
        xp: 35,
        symbol: 'w',
        color: '#aaaaaa',
        art: `
    /|
   / |___
  /  O  O\\
 (    W   )
  \\______/
        `
    }
};
