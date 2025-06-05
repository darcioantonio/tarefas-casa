# Tarefas da Chácara

Aplicativo simples para gerenciar as tarefas diárias da chácara.

## Funcionalidades

- Lista de tarefas diárias
- Registro de horário de conclusão de cada tarefa
- Sistema de login com senha
- Relatório diário das tarefas realizadas
- Salvamento automático no Firebase

## Configuração

1. Crie uma conta no [Firebase](https://firebase.google.com)
2. Crie um novo projeto no Firebase
3. Ative o Firestore Database no seu projeto
4. Substitua as credenciais do Firebase no arquivo `script.js` com suas próprias credenciais
5. Abra o arquivo `index.html` em um navegador

## Uso

1. A senha padrão é "admin"
2. Marque as tarefas conforme forem sendo realizadas
3. Registre o horário de conclusão de cada tarefa
4. Use o botão "Ver Relatório" para visualizar o resumo do dia
5. As tarefas são salvas automaticamente quando marcadas ou quando o horário é registrado

## Estrutura do Projeto

- `index.html` - Interface do usuário
- `styles.css` - Estilos da aplicação
- `script.js` - Lógica da aplicação e integração com Firebase

## Segurança

- A senha é armazenada localmente no código
- Os dados são salvos no Firebase com regras de segurança
- Cada dia tem seu próprio documento no Firestore 