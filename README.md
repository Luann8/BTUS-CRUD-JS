# Calculadora de BTUs

Uma aplicação web para calcular a potência ideal de ar-condicionado (em BTUs) com base na área, número de pessoas e aparelhos eletrônicos. Inclui autenticação de usuários (login e registro) e histórico de cálculos salvos.

## Funcionalidades
- **Cálculo de BTUs**: Insira área (m²), número de pessoas e aparelhos para calcular a potência necessária.
- **Autenticação**: Registro e login de usuários com sessões persistentes.
- **Histórico**: Visualize, edite e delete cálculos salvos.
- **Design Responsivo**: Interface adaptável para desktops e dispositivos móveis.

## Tecnologias Utilizadas
- **Frontend**: React.js, CSS
- **Backend**: Node.js (assumido, ajustar conforme seu servidor)
- **API**: Fetch nativo para comunicação com o servidor
- **Estilização**: CSS customizado com transições e sombras

## Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) (geralmente incluído com o Node.js)
- Um servidor backend configurado em `http://localhost:5000` com endpoints `/login`, `/register`, `/history`, `/logout`, etc.

## Dependências
O projeto utiliza as seguintes bibliotecas, que serão instaladas automaticamente com o `npm install`:

| Biblioteca       | Versão       | Descrição                                      |
|------------------|--------------|------------------------------------------------|
| `react`          | ^18.2.0      | Biblioteca principal para construção de UI    |
| `react-dom`      | ^18.2.0      | Renderização de componentes React no DOM      |
| `react-scripts`  | ^5.0.1       | Scripts e configurações para o React (Create React App) |

### Dependências no `package.json`
Aqui está um exemplo do trecho relevante do `package.json`:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  }
}
```
### Comandos de inicialização
```
npm install

npm start
```

