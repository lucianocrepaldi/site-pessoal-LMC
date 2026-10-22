# Site Pessoal — LMC

Site pessoal de **Luciano Mendes Crepaldi** — Gerente de Contabilidade na Lee Hecht Harrison, Contador CRC-SP e desenvolvedor em formação.

Estética de finanças/controladoria (ticker, balanço patrimonial, livro razão, candlesticks) misturada com dev (terminal, código digitado, console interativo).

## Estrutura

- `index.html` — conteúdo e seções
- `styles.css` — visual e animações
- `script.js` — gráfico animado, digitação, contadores, portfólio e console

Site estático, sem build. Para rodar localmente basta abrir o `index.html` ou servir a pasta:

```bash
npx serve .
```

## Editando

- Projetos do Lab: array `projects` em `script.js`
- Competências do Balanço: lista `.ledger__list` em `index.html` (`data-since` = ano de início)
- Lançamentos da carreira: seção `#razao` em `index.html`

Deploy automático na Vercel a cada push na `main`.
