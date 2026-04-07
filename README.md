<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=flat-square&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/JUnit-5-25A162?style=flat-square&logo=junit5&logoColor=white" />
  <img src="https://img.shields.io/badge/Mockito-5.x-78C257?style=flat-square" />
  <img src="https://img.shields.io/badge/Testes-100%25_passando-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

# LabFlow

**LabFlow** é uma plataforma web completa para gerenciamento de disciplinas de laboratório em instituições de ensino superior. O sistema permite que professores criem disciplinas e projetos, alunos façam submissões de trabalhos (links e/ou textos) e avaliadores (TAs e professores) realizem reviews com atribuição de notas.

A aplicação segue uma **arquitetura de microsserviços**, com backend em **Java 21 / Spring Boot 3.2**, frontend em **Vanilla JavaScript** (SPA) e toda a infraestrutura orquestrada via **Docker Compose**.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Modelo de Dados](#modelo-de-dados)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar](#como-executar)
- [Build Local (sem Docker)](#build-local-sem-docker)
- [Endpoints da API](#endpoints-da-api)
- [Usuários Padrão](#usuários-padrão)
- [Papéis e Permissões](#papéis-e-permissões)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Frontend](#frontend)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Importação de Usuários em Lote](#importação-de-usuários-em-lote)

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Autenticação** | Registro, login com JWT, gerenciamento de perfil (nome, telefone, afiliação) |
| **Gestão de Usuários** | Listagem, busca, promoção de papéis, cadastro individual e importação em lote via CSV (admin) |
| **Disciplinas** | Criação e listagem de disciplinas (cursos) com código, título e período letivo |
| **Projetos** | Criação de projetos vinculados a disciplinas, gerenciamento de membros |
| **Submissões** | Envio de trabalhos por link (URL) e/ou conteúdo de texto |
| **Reviews** | Avaliações com comentários e notas, edição e exclusão |
| **Controle de Acesso** | Permissões granulares por papel (Admin, Professor, Monitor, Aluno) |

---

## Arquitetura

A aplicação é composta por **4 containers de aplicação** + **3 bancos de dados** + **1 utilitário de administração**:

```
┌─────────────────────────────────────────────────────────┐
│                     NGINX (frontend)                     │
│                      :3000 → :80                        │
│   Serve SPA + Reverse Proxy para os microsserviços      │
└────────────┬──────────────┬──────────────┬──────────────┘
             │              │              │
     ┌───────▼───────┐ ┌───▼──────────┐ ┌─▼──────────────┐
     │ auth-service  │ │project-service│ │ review-service │
     │    :8081      │ │    :8082     │ │     :8083      │
     └───────┬───────┘ └──────┬───────┘ └───────┬────────┘
             │                │                  │
     ┌───────▼───────┐ ┌─────▼────────┐ ┌──────▼─────────┐
     │ postgres_auth │ │postgres_project│ │ postgres_review│
     │    :5432      │ │    :5433     │ │     :5434      │
     └───────────────┘ └──────────────┘ └────────────────┘
```

| Serviço | Porta | Banco de Dados | Descrição |
|---------|-------|----------------|-----------|
| **auth-service** | 8081 | `postgres_auth` (:5432) | Autenticação JWT, usuários, perfis e controle de papéis |
| **project-service** | 8082 | `postgres_project` (:5433) | Disciplinas, projetos, membros e submissões |
| **review-service** | 8083 | `postgres_review` (:5434) | Avaliações (reviews) e notas |
| **frontend** | 3000 | — | SPA + NGINX reverse proxy |
| **adminer** | 9090 | — | Interface web para inspecionar os bancos de dados |

---

## Modelo de Dados

### auth-service
```
users (id, username, email, password_hash, role, created_at)
  └── profiles (id, user_id, full_name, phone, affiliation)    [1:1]
```

### project-service
```
courses (id, code, title, term, created_at)
  └── projects (id, title, description, course_id)              [1:N]
        ├── project_members (id, project_id, user_id, role)     [N:N]
        └── submissions (id, project_id, submitter_user_id,     [1:N]
                         file_url, content, created_at)
```

### review-service
```
reviews (id, submission_id, reviewer_user_id, comment, created_at)
  └── grades (id, review_id, score, max_score)                  [1:1]
```

---

## Stack Tecnológica

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Java (OpenJDK) | 21 LTS | Linguagem principal |
| Spring Boot | 3.2.5 | Framework web |
| Spring Data JPA | 3.2.x | Persistência / ORM (Hibernate) |
| Spring Security | 6.2.x | Autenticação e autorização |
| JJWT | 0.12.5 | Geração e validação de tokens JWT |
| PostgreSQL | 16-alpine | Banco de dados relacional |
| Flyway | 9.x | Versionamento de schema (migrations) |
| Lombok | 1.18.38 | Redução de boilerplate |
| SpringDoc OpenAPI | 2.x | Documentação Swagger UI |
| Maven | 3.9 | Build e gerenciamento de dependências |
| **JUnit** | **5** | **Framework de testes unitários** |
| **Mockito** | **5.x** | **Mocking de dependências em testes** |
| **H2** | **2.x** | **Banco em memória para testes de integração** |

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| JavaScript (ES Modules) | ES2022 | SPA — Vanilla JS, sem frameworks |
| Vite | 5.4 | Bundler e dev server |
| CSS3 Custom Properties | — | Design system com variáveis CSS |
| NGINX | 1.27-alpine | Servidor web + reverse proxy |

### Infraestrutura
| Tecnologia | Uso |
|------------|-----|
| Docker | Containerização (multi-stage builds) |
| Docker Compose | Orquestração de todos os serviços |
| Adminer | UI de administração dos bancos |

---

## Pré-requisitos

| Requisito | Versão Mínima | Obrigatório |
|-----------|---------------|-------------|
| **Docker** | 20.10+ | ✅ |
| **Docker Compose** | 2.0+ (ou plugin v2) | ✅ |
| Java JDK | 21 | Apenas para build local |
| Maven | 3.9+ | Apenas para build local |
| Node.js | 20+ | Apenas para dev frontend local |

> **Nota:** Se você utilizar apenas Docker, não há necessidade de instalar Java, Maven ou Node.js na máquina.

---

## Como Executar

### 1. Clonar o repositório

```bash
git clone https://github.com/traue/LabFlow.git
cd LabFlow
```

### 2. Subir todos os serviços com Docker Compose

```bash
docker compose up -d --build
```

O primeiro build pode levar alguns minutos (download de imagens e dependências Maven). Builds subsequentes usam cache.

### 3. Acompanhar o status

```bash
# Verificar se todos os containers estão healthy
docker compose ps

# Acompanhar logs em tempo real
docker compose logs -f
```

### 4. Acessar a aplicação

| Interface | URL |
|-----------|-----|
| **Frontend (aplicação)** | http://localhost:3000 |
| **Swagger — auth-service** | http://localhost:8081/swagger-ui.html |
| **Swagger — project-service** | http://localhost:8082/swagger-ui.html |
| **Swagger — review-service** | http://localhost:8083/swagger-ui.html |
| **Adminer (DB admin)** | http://localhost:9090 |

### 5. Parar os serviços

```bash
# Parar mantendo os dados (volumes)
docker compose down

# Parar e remover todos os dados (reset completo)
docker compose down -v
```

---

## Build Local (sem Docker)

Para desenvolvimento local, é necessário ter **Java 21**, **Maven 3.9+** e **PostgreSQL 16** instalados.

### Backend

```bash
# Compilar todos os módulos a partir da raiz
mvn clean package -DskipTests

# Executar cada serviço individualmente
# (requer PostgreSQL rodando nas portas configuradas)
cd auth-service    && mvn spring-boot:run
cd project-service && mvn spring-boot:run
cd review-service  && mvn spring-boot:run
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Servidor de desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Preview do build de produção
npm run preview
```

### Testes

```bash
# Executar testes de todos os módulos do reactor (a partir da raiz)
mvn clean test

# Executar testes de um serviço específico
cd auth-service    && mvn test
cd project-service && mvn test
cd review-service  && mvn test
```

---

## Testes

Todos os microserviços de backend possuem **testes unitários** com JUnit 5 + Mockito,
integrados ao ciclo de vida do Maven (fase `test` — executada automaticamente por `mvn package`,
`mvn verify` e `mvn install`).

### Contagem de testes por módulo

| Módulo | Total de testes | Classes de teste |
|--------|:--------------:|------------------|
| **auth-service** | **37** | `AuthServiceTest`, `UserServiceTest`, `ProfileServiceTest`, `JwtTokenProviderTest`, `AuthServiceApplicationTests` |
| **project-service** | **46** | `CourseServiceTest`, `ProjectServiceTest`, `ProjectMemberServiceTest`, `SubmissionServiceTest`, `ProjectServiceApplicationTests` |
| **review-service** | **17** | `ReviewServiceTest`, `ReviewServiceApplicationTests` |
| **Total** | **100** | — |

### Estratégia de testes

| Tipo | Tecnologia | Descrição |
|------|-----------|----------|
| **Testes unitários de serviço** | JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`) | Repositórios são mockados; testa a lógica de negócio isoladamente, sem banco de dados |
| **Testes de integração (smoke)** | JUnit 5 + `@SpringBootTest` + MockMvc | Sobe o contexto Spring completo com banco H2 em memória; valida os endpoints HTTP de ponta a ponta |

### Cobertura de domínio

- **`AuthService`** — registro (sucesso, username duplicado, e-mail duplicado, role padrão) e login (sucesso, credenciais inválidas)
- **`UserService`** — findAll, findByIds, findById, findByUsername, updateRole, busca textual e importação em lote
- **`ProfileService`** — getByUserId, updateProfile (perfil existente, criação automática, campos nulos)
- **`JwtTokenProvider`** — geração de token, extração de claims, validação, token adulterado
- **`CourseService`** — CRUD completo com regras de autorização (criador, admin, acesso negado)
- **`ProjectService`** — CRUD, busca por membro, criação em curso, controle de acesso
- **`ProjectMemberService`** — listagem, adição (novo, duplicado, projeto inexistente), remoção, role padrão
- **`SubmissionService`** — listagem, busca por ID, criação via projectId e via request
- **`ReviewService`** — listagem, busca, criação com/sem nota, atualização e exclusão com controle de acesso

### Configuração do Maven (surefire)

O plugin `maven-surefire-plugin` está configurado explicitamente em cada POM de serviço:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <useModulePath>false</useModulePath>
        <!-- Necessário para ByteBuddy/Mockito em Java 21+ -->
        <argLine>
            -XX:+EnableDynamicAgentLoading
            --add-opens java.base/java.lang=ALL-UNNAMED
            --add-opens java.base/java.lang.reflect=ALL-UNNAMED
            --add-opens java.base/java.util=ALL-UNNAMED
        </argLine>
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>
    </configuration>
</plugin>
```

> **Nota sobre Java 25:** O projeto usa o Mockito com o **SubclassByteBuddyMockMaker** (configurado em
> `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker` em cada módulo)
> para garantir compatibilidade com Java 21+ sem depender de instrumentação JVM inline.

### Banco de dados em testes

Os testes unitários **não precisam de banco de dados** — repositórios são mockados com Mockito.
Os testes de integração (`@SpringBootTest`) usam **H2 em memória**, configurado em
`src/test/resources/application.yml` de cada módulo (Flyway desabilitado, DDL `create-drop`).

---

## Endpoints da API

### auth-service (`:8081`)

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| `POST` | `/api/auth/register` | Público | Registrar novo usuário |
| `POST` | `/api/auth/login` | Público | Login → JWT |
| `GET` | `/api/users` | ADMIN | Listar todos os usuários |
| `GET` | `/api/users/{id}` | ADMIN ou próprio | Detalhes do usuário |
| `GET` | `/api/users/search?q=` | ADMIN, PROF, TA | Buscar usuários |
| `GET` | `/api/users/batch?ids=` | Autenticado | Buscar por lista de IDs |
| `POST` | `/api/users` | ADMIN | Criar usuário |
| `POST` | `/api/users/import` | ADMIN | Importar usuários em lote |
| `PATCH` | `/api/users/{id}/role` | ADMIN | Alterar papel do usuário |
| `PUT` | `/api/users/{id}/profile` | ADMIN ou próprio | Atualizar perfil |
| `GET` | `/api/profiles/me` | Autenticado | Perfil do usuário logado |
| `PUT` | `/api/profiles/me` | Autenticado | Atualizar próprio perfil |

### project-service (`:8082`)

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| `GET` | `/api/courses` | Autenticado | Listar disciplinas |
| `POST` | `/api/courses` | ADMIN, PROF | Criar disciplina |
| `GET` | `/api/courses/{id}` | Autenticado | Detalhes da disciplina |
| `GET` | `/api/courses/{id}/projects` | Autenticado | Projetos de uma disciplina |
| `POST` | `/api/courses/{id}/projects` | ADMIN, PROF | Criar projeto |
| `GET` | `/api/projects/{id}` | Autenticado | Detalhes do projeto |
| `GET` | `/api/projects/my` | Autenticado | Projetos do usuário logado |
| `PUT` | `/api/projects/{id}` | ADMIN, PROF | Editar projeto |
| `DELETE` | `/api/projects/{id}` | ADMIN, PROF | Excluir projeto |
| `GET` | `/api/projects/{id}/members` | Autenticado | Membros do projeto |
| `POST` | `/api/projects/{id}/members` | ADMIN, PROF, TA | Adicionar membro |
| `DELETE` | `/api/projects/{id}/members/{userId}` | ADMIN, PROF | Remover membro |
| `GET` | `/api/projects/{id}/submissions` | Autenticado | Submissões do projeto |
| `POST` | `/api/projects/{id}/submissions` | Autenticado | Criar submissão |

### review-service (`:8083`)

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| `GET` | `/api/submissions/{id}/reviews` | Autenticado | Reviews de uma submissão |
| `POST` | `/api/reviews` | ADMIN, PROF, TA | Criar review |
| `GET` | `/api/reviews/{id}` | Autenticado | Detalhes da review |
| `PUT` | `/api/reviews/{id}` | ADMIN, PROF, TA | Editar review |
| `DELETE` | `/api/reviews/{id}` | ADMIN, PROF | Excluir review |

---

## Usuários Padrão

O sistema é inicializado (via Flyway seed) com os seguintes usuários:

| Usuário | Senha | Papel | Descrição |
|---------|-------|-------|-----------|
| `admin` | `admin123` | ROLE_ADMIN | Administrador do sistema |
| `prof` | `prof1234` | ROLE_PROF | Professor de demonstração |

Novos usuários registrados via interface recebem automaticamente o papel `ROLE_STUDENT`.

---

## Papéis e Permissões

| Papel | Código | Permissões |
|-------|--------|------------|
| **Administrador** | `ROLE_ADMIN` | Acesso total: gerenciamento de usuários, disciplinas, projetos, submissões e reviews |
| **Professor** | `ROLE_PROF` | Criar disciplinas e projetos, gerenciar membros, avaliar submissões |
| **Monitor (TA)** | `ROLE_TA` | Adicionar membros a projetos, avaliar submissões |
| **Aluno** | `ROLE_STUDENT` | Visualizar disciplinas e projetos em que está matriculado, enviar submissões |

---

## Estrutura do Projeto

```
LabFlow/
├── docker-compose.yml          # Orquestração de todos os serviços
├── pom.xml                     # POM pai (módulos Maven)
├── README.md
│
├── auth-service/               # Microsserviço de autenticação
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/.../auth/
│       │   │   ├── controller/    # AuthController, UserController
│       │   │   ├── dto/           # Request/Response DTOs
│       │   │   ├── entity/        # User, Profile (JPA)
│       │   │   ├── repository/    # Spring Data JPA repos
│       │   │   ├── security/      # JWT filter, provider, config
│       │   │   └── service/       # AuthService, UserService, ProfileService
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/  # V1__init_auth.sql, V2__seed_data.sql
│       └── test/
│
├── project-service/            # Microsserviço de projetos
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/.../project/
│       │   │   ├── controller/    # CourseController, ProjectController
│       │   │   ├── dto/           # Request/Response DTOs
│       │   │   ├── entity/        # Course, Project, ProjectMember, Submission
│       │   │   ├── repository/    # Spring Data JPA repos
│       │   │   └── service/       # CourseService, ProjectService, etc.
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/  # V1__init_project.sql, V2__seed_data.sql, V3__add_submission_content.sql
│       └── test/
│
├── review-service/             # Microsserviço de avaliações
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/.../review/
│       │   │   ├── controller/    # ReviewController
│       │   │   ├── dto/           # Request/Response DTOs
│       │   │   ├── entity/        # Review, Grade
│       │   │   ├── repository/    # Spring Data JPA repos
│       │   │   └── service/       # ReviewService
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/  # V1__init_review.sql
│       └── test/
│
└── frontend/                   # SPA (Vanilla JS)
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── nginx.conf              # Reverse proxy config
    ├── index.html
    ├── css/                    # Estilos (design system)
    └── js/
        ├── api.js              # HTTP client + métodos da API
        ├── router.js           # Hash-based SPA router
        ├── icons.js            # Ícones SVG inline
        ├── ui.js               # Componentes (toast, modal, etc.)
        └── views/              # Páginas (login, dashboard, etc.)
            ├── layout.js
            ├── login.js
            ├── dashboard.js
            ├── courses.js
            ├── projects.js
            ├── users.js
            ├── reviews.js
            └── profile.js
```

---

## Frontend

O frontend é uma **Single Page Application (SPA)** construída com JavaScript puro (ES Modules), sem frameworks. Utiliza roteamento baseado em hash (`#/login`, `#/dashboard`, etc.) e se comunica com os microsserviços via NGINX reverse proxy.

### Principais Telas

| Rota | Tela | Acesso |
|------|------|--------|
| `#/login` | Login / Registro | Público |
| `#/dashboard` | Painel com resumo | Autenticado |
| `#/courses` | Listagem de disciplinas | Autenticado |
| `#/courses/:id` | Detalhe da disciplina + projetos | Autenticado |
| `#/projects/:id` | Detalhe do projeto (membros, submissões) | Autenticado |
| `#/submissions/:id/reviews` | Reviews de uma submissão | Autenticado |
| `#/users` | Gerenciamento de usuários | ADMIN |
| `#/profile` | Meu perfil | Autenticado |

---

## Variáveis de Ambiente

As seguintes variáveis são utilizadas pelos microsserviços (configuráveis no `docker-compose.yml`):

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DB_HOST` | (nome do container) | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | (varia por serviço) | Nome do banco de dados |
| `DB_USER` | `labflow` | Usuário do banco |
| `DB_PASS` | `labflow` | Senha do banco |
| `JWT_SECRET` | (definido no compose) | Chave secreta para geração de tokens JWT |

> **Importante:** Em ambiente de produção, altere `JWT_SECRET` e as credenciais do banco para valores seguros.

---

## Importação de Usuários em Lote

Administradores podem importar múltiplos usuários de uma vez via arquivo CSV pela interface web (`#/users` → botão "Importar CSV").

### Formato do CSV

```csv
username,email,password,role
jsilva,joao.silva@uni.br,senha123,ROLE_STUDENT
maria,maria.souza@uni.br,senha456,ROLE_TA
profa.ana,ana.prof@uni.br,prof789,ROLE_PROF
```

| Coluna | Obrigatória | Padrão |
|--------|-------------|--------|
| `username` | ✅ | — |
| `email` | ✅ | — |
| `password` | Não | `{username}123` |
| `role` | Não | `ROLE_STUDENT` |

Um arquivo de exemplo pode ser baixado diretamente pela interface (botão "Baixar planilha de exemplo" no modal de importação).

---

## Fluxo Básico de Uso

```bash
# 1. Registrar um novo aluno
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"aluno1","email":"aluno1@lab.com","password":"senha123"}'

# 2. Login → obter token JWT
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"aluno1","password":"senha123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

# 3. Listar disciplinas
curl http://localhost:8082/api/courses -H "Authorization: Bearer $TOKEN"

# 4. Listar projetos em que estou matriculado
curl http://localhost:8082/api/projects/my -H "Authorization: Bearer $TOKEN"
```

---

## Conexão ao Adminer

Para inspecionar os bancos de dados via [Adminer](http://localhost:9090):

| Campo | Valor |
|-------|-------|
| **Sistema** | PostgreSQL |
| **Servidor** | `postgres_auth`, `postgres_project` ou `postgres_review` |
| **Usuário** | `labflow` |
| **Senha** | `labflow` |
| **Base de dados** | `postgres_auth`, `postgres_project` ou `postgres_review` |

---

## Licença

Este projeto é distribuído para fins acadêmicos.
