export interface Experiencia {
  ano: string;
  empresa: string;
  cargo: string;
  resumo: string;
}

export interface Projeto {
  nome: string;
  descricao: string;
  stack: string[];
  github: string;
  /** deploy público do projeto (Website → não renderiza sem ele) */
  website?: string;
  /** tipo do mock de screenshot: editor | browser | table (default: browser) */
  mock?: "editor" | "browser" | "table";
}

export interface Hobby {
  nome: string;
  texto: string;
}

export interface Profile {
  nome: string;
  role: string;
  /** frase curta da intro (logo abaixo do role) */
  intro: string;
  /** parágrafos da seção "Sobre mim" */
  bio: string[];
  experiencia: Experiencia[];
  projetos: Projeto[];
  hobbies: Hobby[];
  contato: {
    github: string;
    linkedin: string;
    /** mailto: só quando você decidir expor */
    email?: string;
    /** caminho do PDF quando existir (ex: /cv.pdf) */
    cv?: string;
  };
}

export const profile: Profile = {
  nome: "RENAN",
  role: "Desenvolvedor de software",
  intro:
    "Trabalho com Django e React e escrevo aqui sobre o que aprendo construindo software: decisões de arquitetura, ferramentas que testei e erros que cometi.",
  bio: [
    "Comecei a programar por curiosidade e nunca parei de achar graça em fazer uma máquina obedecer. Hoje trabalho de ponta a ponta: modelo o banco, escrevo a API e monto a interface. Gosto de saber o que acontece em cada camada.",
    "Aprendo melhor construindo. Quando quero entender uma tecnologia, abro um projeto pequeno, quebro, conserto e anoto o que deu errado. Boa parte dos posts do blog nasce dessas anotações.",
    "Escrevo porque explicar por escrito mostra o que eu ainda não entendi. Aqui você vai encontrar textos sobre desenvolvimento web, Linux, organização de notas e alguns experimentos que não deram certo.",
  ],
  experiencia: [
    {
      ano: "2026",
      empresa: "Empresa / Projeto",
      cargo: "Desenvolvedor Fullstack",
      resumo:
        "APIs em Django e interfaces em React. Filas de tarefas assíncronas e geração de relatórios.",
    },
    {
      ano: "2024",
      empresa: "Empresa / Projeto",
      cargo: "Desenvolvedor Backend",
      resumo:
        "Migração de um monólito legado e testes automatizados para os módulos mais críticos.",
    },
    {
      ano: "2021",
      empresa: "Empresa / Projeto",
      cargo: "Desenvolvedor Júnior",
      resumo:
        "Primeiro emprego na área. Manutenção de sistemas internos e correção de bugs.",
    },
  ],
  projetos: [
    {
      nome: "website",
      descricao: "Site pessoal feito com Astro",
      stack: ["astro", "typescript"],
      github: "https://github.com/lmaoclost/website",
      website: "https://lmaoclost.dev",
      mock: "editor",
    },
    {
      nome: "para-zettel-obsidian",
      descricao: "Vault do Obsidian que combina PARA e Zettelkasten",
      stack: ["obsidian", "markdown"],
      github: "https://github.com/lmaoclost/para-zettel-obsidian",
      mock: "editor",
    },
    {
      nome: "reporthub",
      descricao: "Plataforma para gerar relatórios de forma assíncrona",
      stack: ["django", "react"],
      github: "https://github.com/lmaoclost/reporthub",
      mock: "table",
    },
  ],
  hobbies: [
    {
      nome: "RPG",
      texto:
        "Jogo Pathfinder 2e com amigos. Gosto de montar personagens e de planejar táticas para os combates.",
    },
    {
      nome: "Música",
      texto:
        "Ouço música quase o dia inteiro, de trilhas de jogos a rock. Programo melhor com algo tocando ao fundo.",
    },
    {
      nome: "Games",
      texto:
        "Prefiro jogos com sistemas profundos e boa narrativa. Gosto de entender as regras e de achar jeitos de quebrá-las.",
    },
  ],
  contato: {
    github: "https://github.com/lmaoclost",
    linkedin: "https://www.linkedin.com/in/renansmoliveira/",
  },
};
