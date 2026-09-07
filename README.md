# LabControl - Sistema de Gestão e Rastreabilidade de Marmitas Odontológicas

O **LabControl** é uma plataforma institucional para controle de acervo, biossegurança e rastreabilidade de caixas cirúrgicas e estojos instrumentais (**"marmitas"**) em clínicas odontológicas universitárias. O sistema assegura conformidade estrita com as normas da **ANVISA (RDC 15/2012)** e organiza os fluxos operacionais entre a Central de Esterilização (CME), o Almoxarifado/Balcão de Atendimento, os Acadêmicos e a Coordenação/Administração.

---

## 1. Visão Geral dos Perfis e Permissões (RBAC)

O sistema possui controle de acesso baseado em papéis para evitar duplicidade de funções e garantir integridade nos registros:

```mermaid
flowchart TD
    subgraph ADM ["Administrador / Coordenação"]
        A1["Painel Geral Executivo"]
        A2["Gestão de Acadêmicos e GRRs"]
        A3["Inventário Geral do Acervo"]
        A4["Relatórios e Auditoria Sanitária XLSX"]
        A5["Parâmetros de Biossegurança"]
    end

    subgraph BALCAO ["Atendente de Balcão / Almoxarifado"]
        B1["Almoxarifado e Balcão de Prontas"]
        B2["Terminal Scanner / Bipagem"]
        B3["Protocolo de Retirada com GRR"]
        B4["Conferência e Devolução"]
    end

    subgraph ALUNO ["Acadêmico de Odontologia"]
        S1["Minhas Marmitas em Custódia"]
        S2["Marmitas Prontas para Retirada"]
        S3["Alertas de Vencimento e Devolução"]
    end

    style ADM fill:#faf5ff,stroke:#9333ea,stroke-width:2px
    style BALCAO fill:#f0f9ff,stroke:#0284c7,stroke-width:2px
    style ALUNO fill:#f0fdf4,stroke:#16a34a,stroke-width:2px

    style A1 fill:#ffffff,stroke:#c084fc,stroke-width:1px
    style A2 fill:#ffffff,stroke:#c084fc,stroke-width:1px
    style A3 fill:#ffffff,stroke:#c084fc,stroke-width:1px
    style A4 fill:#ffffff,stroke:#c084fc,stroke-width:1px
    style A5 fill:#ffffff,stroke:#c084fc,stroke-width:1px

    style B1 fill:#ffffff,stroke:#38bdf8,stroke-width:1px
    style B2 fill:#ffffff,stroke:#38bdf8,stroke-width:1px
    style B3 fill:#ffffff,stroke:#38bdf8,stroke-width:1px
    style B4 fill:#ffffff,stroke:#38bdf8,stroke-width:1px

    style S1 fill:#ffffff,stroke:#4ade80,stroke-width:1px
    style S2 fill:#ffffff,stroke:#4ade80,stroke-width:1px
    style S3 fill:#ffffff,stroke:#4ade80,stroke-width:1px
```

### Matriz de Responsabilidades

| Perfil | Escopo e Acessos | Ações Exclusivas |
| :--- | :--- | :--- |
| **Administrador** *(Coordenação de Biossegurança)* | Gestão estratégica, governança, acervo patrimonial e auditoria. | Cadastrar/editar acadêmicos, definir parâmetros RDC 15, auditar extravios e exportar laudos em planilha **.XLSX**. |
| **Atendente de Balcão** *(Almoxarifado)* | Operação direta de atendimento e guichê de atendimento clínico. | Bipagem no scanner, conferência visual de envelopes grau cirúrgico, liberação de retirada e recebimento de devolução. *(Sem acesso a cadastro de alunos)*. |
| **Acadêmico** *(Estudante)* | Consulta pessoal das marmitas em sua posse e acervo estéril. | Visualizar tempo restante de validade estéril, histórico próprio de retiradas e localização de marmitas prontas no estoque. |

---

## 2. Ciclo de Vida da Marmita Odontológica

Toda marmita cirúrgica transita por etapas bem definidas para garantir a esterilidade dos instrumentais e a segurança do paciente:

```mermaid
stateDiagram-v2
    [*] --> Expurgado: Recepção de Material Usado
    Expurgado --> Em_Lavagem: Limpeza Enzimática e Ultrassônica
    Em_Lavagem --> Secagem_Embalagem: Inspeção Visual e Grau Cirúrgico
    Secagem_Embalagem --> Na_Autoclave: Selagem com Integrador Classe 5
    Na_Autoclave --> Pronta_Esteril: Ciclo Aprovado 134C e 2.1 bar
    
    Pronta_Esteril --> Em_Uso_Clinico: Retirada no Balcão com GRR
    Pronta_Esteril --> Alerta_Vencimento: Atingiu 12 dias em estoque
    Alerta_Vencimento --> Expirada: Ultrapassou 15 dias sem uso
    Expirada --> Expurgado: Re-esterilização Obrigatória ANVISA
    
    Em_Uso_Clinico --> Devolvida: Procedimento Clínico Finalizado
    Devolvida --> Expurgado: Entrada na CME para Novo Ciclo
```

---

## 3. Fluxo Operacional: Retirada e Devolução no Balcão

O processo de liberação e devolução ocorre via Terminal Scanner com registro instantâneo de custódia:

```mermaid
sequenceDiagram
    autonumber
    actor A as Acadêmico
    actor B as Atendente de Balcão
    participant S as Terminal Scanner
    participant DB as Banco de Dados

    Note over A,B: 1. Fluxo de Retirada para Atendimento Clínico
    A->>B: Solicita marmita informando Matrícula GRR
    B->>S: Bipa código da marmita (exemplo CIR-001)
    S->>DB: Consulta status e validade estéril da marmita
    S->>DB: Valida situação cadastral do aluno no sistema
    B->>B: Confere integridade e viragem do indicador classe 5
    B->>S: Confirma liberação vinculando ao GRR do aluno
    S->>DB: Registra retirada e atualiza status para Em Uso
    B-->>A: Entrega marmita esterilizada ao aluno

    Note over A,B: 2. Atendimento Clínico Concluído
    A->>B: Devolve marmita no guichê de expurgo
    B->>S: Bipa ou seleciona a marmita em devolução
    B->>B: Confere instrumentais e integridade da caixa
    B->>S: Registra devolução com observações do estado
    S->>DB: Atualiza status para Decontaminada e libera custódia
    DB-->>S: Encaminha marmita para novo ciclo na CME
```

---

## 4. Fluxo de Auditoria Sanitária e Exportação XLSX

Para inspeções de vigilância sanitária e fechamentos mensais da faculdade, a aba **Relatórios & Auditoria** processa os dados clínicos e gera planilhas analíticas no formato Microsoft Excel:

```mermaid
flowchart TD
    subgraph DADOS ["Fontes de Dados do Sistema"]
        D1[("Acervo Geral de Marmitas")]
        D2[("Trilha de Transações de Balcão")]
        D3[("Laudos Físico-Químicos de Autoclave")]
        D4[("Base de Acadêmicos e Custódia")]
    end

    subgraph SELECAO ["Interface de Auditoria"]
        T1["Seletor de Tipo de Relatório"]
        T2["Seletor de Mês e Período"]
        T1 -->|Mensal| V1["Consolidado Mensal e Giro por Especialidade"]
        T1 -->|Diário| V2["Movimentações e Tempo em Clínica Hoje"]
        T1 -->|Semanal| V3["Histograma de Segunda a Sexta"]
        T1 -->|Esterilização| V4["Parâmetros de Autoclave e Testes Biológicos"]
        T1 -->|Auditoria| V5["Custódia Ativa por Matrícula GRR"]
    end

    D1 --> SELECAO
    D2 --> SELECAO
    D3 --> SELECAO
    D4 --> SELECAO

    BTN["Botão: Exportar Relatório Mensal XLSX"]
    SELECAO --> BTN

    subgraph ARQUIVO ["Planilha Microsoft Excel Gerada .xlsx"]
        S1["Aba 1: Resumo Executivo e Conformidade ANVISA"]
        S2["Aba 2: Acervo Detalhado de Marmitas"]
        S3["Aba 3: Histórico de Movimentações de Balcão"]
        S4["Aba 4: Laudos Técnicos de Autoclaves Cristófoli"]
        S5["Aba 5: Giro por Especialidade Odontológica"]
    end

    BTN --> ARQUIVO

    style DADOS fill:#f8fafc,stroke:#94a3b8,stroke-width:1px
    style SELECAO fill:#f1f5f9,stroke:#64748b,stroke-width:1px
    style ARQUIVO fill:#ecfdf5,stroke:#10b981,stroke-width:2px
    style BTN fill:#059669,stroke:#047857,color:#ffffff,font-weight:bold
```

---

## 5. Estrutura de Pastas e Componentes do Projeto

```text
src/
├── components/
│   ├── DashboardView.tsx          # Painel executivo do Administrador (KPIs, custódia e biossegurança)
│   ├── StudentManagementView.tsx  # Cadastro e gestão de acadêmicos (acesso exclusivo Admin)
│   ├── KitInventoryView.tsx       # Inventário patrimonial completo das marmitas
│   ├── ReportsView.tsx            # Relatórios dinâmicos e motor de exportação XLSX (SheetJS)
│   ├── SettingsView.tsx           # Configuração de prazos e parâmetros sanitários
│   ├── ReceptionCounterView.tsx   # Almoxarifado e Balcão de atendimento
│   ├── WithdrawalProtocolView.tsx # Terminal de Scanner e conferência de integridade
│   ├── StudentPortalView.tsx      # Espaço do Acadêmico (Minhas Marmitas e Marmitas Prontas)
│   ├── Header.tsx                 # Cabeçalho com seletor único de perfil no canto superior direito
│   ├── Sidebar.tsx                # Menu lateral adaptativo conforme papel ativo
│   └── RoleSwitcherModal.tsx      # Modal de alternância de usuário
├── data/
│   └── mockData.ts                # Base de dados clínicos, marmitas, ciclos de autoclave e alunos
├── types.ts                       # Tipagem TypeScript centralizada do sistema
├── App.tsx                        # Roteamento de abas e controle de estado global
└── main.tsx                       # Ponto de entrada da aplicação
```

---

## 6. Principais Tecnologias Utilizadas

- **React 18** com **TypeScript**
- **Vite** para compilação ágil
- **Tailwind CSS** para estilização técnica e acessível
- **SheetJS (xlsx)** para geração nativa de planilhas Excel `.xlsx` no navegador do cliente
- **Material Symbols Outlined** para iconografia técnica de saúde e biossegurança
