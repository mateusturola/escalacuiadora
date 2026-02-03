# EscalaCuidadora

Sistema de gerenciamento de escalas para cuidadoras desenvolvido em Next.js.

## Funcionalidades

### Painel Administrativo
- Login seguro para administradores
- Cadastro de cuidadoras (nome, email, telefone)
- Configuração de carga horária semanal
- Definição de dias de trabalho
- Configuração de horários padrão
- Criação de escalas (trabalho e folgas)
- Gerenciamento completo de cuidadoras

### Portal da Cuidadora
- Acesso por email
- Visualização de escalas futuras
- Histórico de escalas anteriores
- Visualização de configurações de trabalho
- Interface simples e intuitiva

## Tecnologias

- **Next.js 14+** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **File-based Storage** - Armazenamento em JSON

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/mateusturola/escalacuiadora.git
cd escalacuiadora
```

2. Instale as dependências:
```bash
npm install
```

3. Execute em modo de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:3000
```

## Credenciais Padrão

### Admin
- **Usuário:** admin
- **Senha:** admin123

### Cuidadora
- Use o email cadastrado pelo admin

## Estrutura do Projeto

```
/app
  /admin              # Páginas de administração
  /cuidadora          # Páginas para cuidadoras
  /api                # API Routes
    /auth             # Autenticação
    /cuidadoras       # CRUD de cuidadoras
    /escalas          # CRUD de escalas
/lib
  types.ts            # Definições de tipos
  db.ts               # Funções de banco de dados
/data                 # Armazenamento JSON (criado automaticamente)
```

## Como Usar

### Como Administrador

1. Acesse `/admin`
2. Faça login com as credenciais de admin
3. No painel administrativo você pode:
   - Adicionar novas cuidadoras
   - Configurar horários de trabalho para cada cuidadora
   - Criar escalas de trabalho e folgas
   - Gerenciar cuidadoras existentes

### Como Cuidadora

1. Acesse `/cuidadora`
2. Digite seu email cadastrado
3. Visualize suas próximas escalas
4. Consulte suas configurações de trabalho

## Produção

Para build de produção:

```bash
npm run build
npm start
```

## Licença

ISC

## Autor

Mateus Turola
