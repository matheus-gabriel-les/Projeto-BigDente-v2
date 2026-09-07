# LabControl - Sistema de Gestão e Rastreabilidade de Marmitas Odontológicas

O **LabControl** é uma plataforma institucional para controle de acervo, biossegurança e rastreabilidade de caixas cirúrgicas e estojos instrumentais (**"marmitas"**) em clínicas odontológicas universitárias. O sistema assegura conformidade estrita com as normas da **ANVISA (RDC 15/2012)** e organiza os fluxos operacionais entre a Central de Esterilização (CME), o Almoxarifado/Balcão de Atendimento, os Acadêmicos e a Coordenação/Administração.

---

## 1. Visão Geral dos Perfis e Permissões (RBAC)

O sistema possui controle de acesso baseado em papéis para evitar duplicidade de funções e garantir integridade nos registros:

```mermaid
graph TD
    classDef admin fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87;
    classDef recep fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#075985;
    classDef student fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#166534;

    subgraph ADM ["Administrador / Coordenação"]
        A1[Painel Geral Executivo]
        A2[Gestão de Acadêmicos e GRRs]
        A3[Inventário Geral do Acervo]
        A4[Relatórios & Auditoria Sanitária XLSX]
        A5[Parâmetros de Biossegurança]
    end
    class ADM,A1,A2,A3,A4,A5 admin;

    subgraph BALCAO ["Atendente de Balcão / Almoxarifado"]
        B1[Almoxarifado & Balcão de Prontas]
        B2[Terminal Scanner / Bipagem]
        B3[Protocolo de Retirada com GRR]
        B4[Conferência e Devolução]
    end
    class BALCAO,B1,B2,B3,B4 recep;

    subgraph ALUNO ["Acadêmico de Odontologia"]
        S1[Minhas Marmitas em Custódia]
        S2[Marmitas Prontas para Retirada]
        S3[Alertas de Vencimento e Devolução]
    end
    class ALUNO,S1,S2,S3 student;
```

### Matriz de Responsabilidades

| Perfil | Escopo e Acessos | Ações Exclusivas |
| :--- | :--- | :--- |
| **Administrador** *(Coordenação de Biossegurança)* | Gestão estratégica, governança, acervo patrimonial e auditoria. | Cadastrar/editar acadêmicos, definir parâmetros RDC 15, auditar extravios e exportar laudos em planilha **.XLSX**. |
| **Atendente de Balcão** *(Almoxarifado)* | Operação direta de atendimento e guichê de atendimento clínico. | Bipagem no scanner, conferência visual de envelopes grau cirúrgico, liberação de retirada e recebimento de devolução. *(Sem acesso a cadastro de alunos)*. |
| **Acadêmico** *(Estudante)* | Consulta pessoal das marmitas em sua posse e acervo estéril. | Visualizar tempo restante de validade estéril, histórico próprio de retiradas e localização de marmitas prontas no estoque. |

---

## 2. Ciclo de Vida da Marmita Odontológica

Toda marmita cirúrgica transita por estados bem definidos para garantir a esterilidade dos instrumentais e a segurança do paciente:

```mermaid
stateDiagram-v2
    [*] --> Expurgado: Recepção de Material Usado
    Expurgado --> Em_Lavagem: Limpeza Enzimática e Ultrassônica
    Em_Lavagem --> Secagem_Embalagem: Inspeção Visual e Grau Cirúrgico
    Secagem_Embalagem --> Na_Autoclave: Selagem com Integrador Classe 5
    
    Na_Autoclave --> Pronta_Estéril: Ciclo Aprovado (134°C / 2.1 bar)
    
    state Pronta_Estéril {
        [*] --> Disponivel_Almoxarifado
        Disponivel_Almoxarifado --> Alerta_Expiração: > 12 dias sem uso
        Alerta_Expiração --> Expirada: > 15 dias sem uso
    }
    
    Disponivel_Almoxarifado --> Em_Uso_Clinico: Retirada no Balcão (Bipagem + GRR)
    Expirada --> Expurgado: Re-esterilização Obrigatória (ANVISA)
    
    Em_Uso_Clinico --> Devolvida: Término do Procedimento Clínico
    Devolvida --> Expurgado: Entrada na CME para Novo Ciclo
```

---

## 3. Fluxo Operacional: Retirada e Devolução no Balcão

O processo de liberação e devolução ocorre via Terminal Scanner com registro instantâneo de custódia:

```mermaid
sequenceDiagram
    autonumber
    actor A as Acadêmico (Aluno)
    actor B as Atendente de Balcão
    participant S as Terminal Scanner
    participant DB as Base de Dados / Trilha

    Note over A,B: Fluxo de Retirada para Clínica
    A->>B: Solicita marmita informando Matrícula (GRR)
    B->>S: Bipa código da marmita (ex: CIR-001)
    S->>DB: Verifica status da marmita (deve ser 'Ready' e dentro da validade)
    S->>DB: Valida situação do aluno (status 'Active')
    B->>B: Confere integridade do envelope e indicador químico classe 5
    B->>S: Confirma liberação vinculando ao GRR
    S->>DB: Atualiza status para 'In Use' e grava transação com timestamp
    B-->>A: Entrega marmita esterilizada

    Note over A,B: Atendimento Clínico Concluído
    A->>B: Devolve a marmita no guichê de expurgo
    B->>S: Bipa ou seleciona a marmita em devolução
    B->>B: Confere presença dos instrumentais e integridade da caixa
    B->>S: Registra devolução com observações
    S->>DB: Atualiza status para 'Decontaminated' e desvincula custódia
    DB-->>S: Marmita encaminhada para ciclo de esterilização CME
```

---

## 4. Fluxo de Auditoria Sanitária e Exportação XLSX

Para inspeções de vigilância sanitária e fechamentos de mês da faculdade, a aba **Relatórios & Auditoria** processa os dados clínicos e gera planilhas analíticas:

```mermaid
flowchart TD
    subgraph DADOS ["Fontes de Dados do Sistema"]
        D1[(Acervo de Marmitas)]
        D2[(Trilha de Transações de Balcão)]
        D3[(Laudos Físico-Químicos de Autoclave)]
        D4[(Base de Acadêmicos e Custódia)]
    end

    subgraph SELECAO ["Interface de Auditoria"]
        T1[Seletor de Tipo de Relatório]
        T2[Seletor de Mês / Período]
        T1 -->|Mensal| V1[Consolidado Mensal & Giro por Especialidade]
        T1 -->|Diário| V2[Movimentações e Tempo em Clínica Hoje]
        T1 -->|Semanal| V3[Histograma de Segunda a Sexta]
        T1 -->|Esterilização| V4[Parâmetros Autoclave & Testes Biológicos]
        T1 -->|Auditoria| V5[Custódia Ativa por Matrícula GRR]
    end

    DADOS --> SELECAO

    BTN[Botão 'Exportar Relatório Mensal XLSX']
    SELECAO --> BTN

    subgraph ARQUIVO ["Planilha Microsoft Excel Gerada (.xlsx)"]
        S1[Aba 1: Resumo Executivo & Conformidade ANVISA]
        S2[Aba 2: Acervo Detalhado de Marmitas]
        S3[Aba 3: Histórico de Movimentações de Balcão]
        S4[Aba 4: Laudos Técnicos de Autoclaves Cristófoli]
        S5[Aba 5: Giro por Especialidade Odontológica]
    end

    BTN --> ARQUIVO
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
- **Tailwind CSS** para estilização técnica e acessível (Design System baseado em tons neutros, estados de alta legibilidade e sem excesso de gradientes)
- **SheetJS (xlsx)** para geração nativa de planilhas Excel `.xlsx` no navegador do cliente
- **Material Symbols Outlined** para iconografia técnica de saúde e biossegurança
