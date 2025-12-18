import type { NameItem } from "./types";

const RAW = [
  "Albert Einstein","Taylor Swift","Cristiano Ronaldo","Lionel Messi","Beyoncé","Barack Obama",
  "Oprah Winfrey","Elon Musk","Ariana Grande","Bill Gates","Michael Jackson","Madonna",
  "Leonardo da Vinci","Marie Curie","Walt Disney","Tom Cruise","Angelina Jolie","Brad Pitt",
  "Lady Gaga","Rihanna","Drake","Eminem","Adele","Ed Sheeran",
  "Dwayne Johnson","Kanye West","Kim Kardashian","Selena Gomez","Justin Bieber","Katy Perry",
  "Johnny Depp","Robert Downey Jr.","Scarlett Johansson","Chris Hemsworth","Morgan Freeman","Keanu Reeves",
  "Jennifer Lawrence","Emma Watson","Daniel Radcliffe","Rupert Grint","J.K. Rowling","Stephen King",
  "George Clooney","Meryl Streep","Will Smith","Samuel L. Jackson","Natalie Portman","Anne Hathaway",
  "Serena Williams","Usain Bolt","Michael Jordan","LeBron James","Kobe Bryant","Roger Federer",
  "Novak Djokovic","Rafael Nadal","Tiger Woods","Lewis Hamilton","Max Verstappen","Neymar",
  "David Beckham","Zlatan Ibrahimović","Kylian Mbappé","Erling Haaland","Virgil van Dijk","Kevin De Bruyne",
  "Steve Jobs","Mark Zuckerberg","Jeff Bezos","Warren Buffett","Nikola Tesla","Isaac Newton",
  "Galileo Galilei","Charles Darwin","Stephen Hawking","Ada Lovelace","Alan Turing","Katherine Johnson",
  "Frida Kahlo","Pablo Picasso","Vincent van Gogh","Claude Monet","Salvador Dalí","Andy Warhol",
  "Nelson Mandela","Martin Luther King Jr.","Mahatma Gandhi","Winston Churchill","Angela Merkel","Vladimir Putin",
  "Donald Trump","Joe Biden","Emmanuel Macron","Volodymyr Zelenskyy","Pope Francis","Dalai Lama",
  "Harry Potter","Sherlock Holmes","James Bond","Darth Vader","Yoda","Spider-Man",
  "Batman","Superman","Wonder Woman","Homer Simpson","Mario","Pikachu",
];

export function builtInNames(): NameItem[] {
  return RAW.map((label, idx) => ({ id: `n_${idx}`, label }));
}

export function customNamesFromText(text: string): NameItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return lines.map((label, i) => ({
    id: `custom_${i}_${label.toLowerCase().replace(/\s+/g, "_")}`,
    label,
  }));
}

export function mergeNamePools(builtIn: NameItem[], custom: NameItem[]): NameItem[] {
  return [...builtIn, ...custom];
}
