# Componentes e Utilitários

Este documento descreve os componentes, hooks e utilitários criados para melhorar a manutenibilidade e evitar repetição de código.

## 📦 Componentes UI

### Button
Botão reutilizável com variantes de estilo e estados de loading.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (padrão: 'primary')
- `size`: 'sm' | 'md' | 'lg' (padrão: 'md')
- `isLoading`: boolean - mostra indicador de carregamento

**Exemplo:**
```tsx
import { Button } from '@/components';

<Button variant="primary" size="md" isLoading={loading}>
  Salvar
</Button>
```

### Input
Campo de entrada com label, ícone e mensagem de erro.

**Props:**
- `label`: string - rótulo do campo
- `error`: string - mensagem de erro
- `icon`: ReactNode - ícone à esquerda

**Exemplo:**
```tsx
import { Input } from '@/components';

<Input
  label="Email"
  error={emailError}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### PhoneInput
Input especializado para telefones brasileiros com formatação automática.

**Exemplo:**
```tsx
import { PhoneInput } from '@/components';

<PhoneInput
  label="Telefone"
  value={telefone}
  onChange={setTelefone}
/>
```

### Card
Container com estilo de card.

**Props:**
- `variant`: 'default' | 'gradient' (padrão: 'default')

**Exemplo:**
```tsx
import { Card } from '@/components';

<Card variant="gradient">
  <h2>Conteúdo do Card</h2>
</Card>
```

### Alert
Mensagem de alerta com diferentes variantes.

**Props:**
- `variant`: 'error' | 'success' | 'warning' | 'info' (padrão: 'info')
- `onClose`: () => void - callback para fechar o alerta

**Exemplo:**
```tsx
import { Alert } from '@/components';

<Alert variant="error" onClose={() => setError('')}>
  Erro ao processar
</Alert>
```

### Modal
Modal/Dialog reutilizável.

**Props:**
- `isOpen`: boolean - controla visibilidade
- `onClose`: () => void - callback ao fechar
- `title`: string - título do modal
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (padrão: 'md')
- `showCloseButton`: boolean (padrão: true)

**Exemplo:**
```tsx
import { Modal } from '@/components';

<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Título">
  <p>Conteúdo do modal</p>
</Modal>
```

### Loading
Indicador de carregamento.

**Props:**
- `size`: 'sm' | 'md' | 'lg' (padrão: 'md')
- `text`: string - texto opcional
- `fullScreen`: boolean - ocupa tela inteira

**Exemplo:**
```tsx
import { Loading } from '@/components';

<Loading size="lg" text="Carregando..." fullScreen />
```

## 🪝 Hooks Customizados

### useAuth
Hook para gerenciar autenticação.

**Retorno:**
- `user`: User | null
- `loading`: boolean
- `login`: (userData: User, redirectPath?: string) => void
- `logout`: (redirectPath?: string) => void

**Exemplo:**
```tsx
import { useAuth } from '@/hooks';

const { user, loading, logout } = useAuth('/admin', 'admin');
```

### useCuidadoras
Hook para gerenciar cuidadoras.

**Retorno:**
- `cuidadoras`: Cuidadora[]
- `loading`: boolean
- `error`: string | null
- `loadCuidadoras`: () => Promise<void>
- `addCuidadora`: (data) => Promise<Cuidadora>
- `updateCuidadora`: (id, updates) => Promise<Cuidadora>
- `deleteCuidadora`: (id) => Promise<void>

**Exemplo:**
```tsx
import { useCuidadoras } from '@/hooks';

const { cuidadoras, loading, addCuidadora } = useCuidadoras();
```

### useEscalas
Hook para gerenciar escalas.

**Retorno:**
- `escalas`: Escala[]
- `config`: ConfiguracaoHorarios | null
- `loading`: boolean
- `error`: string | null
- `upcomingEscalas`: Escala[] - escalas futuras
- `pastEscalas`: Escala[] - escalas passadas
- `loadEscalas`: () => Promise<void>
- `addEscala`: (data) => Promise<Escala>
- `updateEscala`: (id, updates) => Promise<Escala>
- `deleteEscala`: (id) => Promise<void>

**Exemplo:**
```tsx
import { useEscalas } from '@/hooks';

const { escalas, upcomingEscalas, loading } = useEscalas(cuidadoraId);
```

## 🛠️ Utilitários

### lib/utils.ts

**formatPhone(value: string): string**
Formata telefone no padrão brasileiro (00) 00000-0000

**cleanPhone(value: string): string**
Remove formatação do telefone, retornando apenas números

**formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string**
Formata data no formato brasileiro

**isToday(date: Date): boolean**
Verifica se uma data é hoje

**getMonthDays(date: Date): (Date | null)[]**
Gera array de dias do mês para calendário

**getDiasSemanaNomes(dias: number[], completo?: boolean): string**
Converte array de números em nomes de dias da semana

**cn(...classes): string**
Combina classes CSS de forma condicional

### lib/constants.ts

Contém constantes compartilhadas:
- `CORES_CUIDADORAS` - cores para identificação
- `DIAS_SEMANA` - dias da semana abreviados
- `DIAS_SEMANA_COMPLETO` - dias da semana completos
- `CONFIG_PADRAO` - configurações padrão
- `MENSAGENS_ERRO` - mensagens de erro padronizadas
- `TIPO_ESCALA` - tipos de escala

## 📝 Boas Práticas

1. **Importações centralizadas**: Use `@/components` e `@/hooks` para importar múltiplos itens
2. **Tipagem**: Todos os componentes e hooks são totalmente tipados
3. **Consistência**: Use os componentes para manter UI consistente
4. **Reutilização**: Extraia lógica repetida para hooks customizados
5. **Constantes**: Use constantes compartilhadas ao invés de valores hardcoded

## 🔄 Migração de Código Legado

Para migrar código existente:

1. Substitua inputs/buttons por componentes reutilizáveis
2. Substitua lógica de API por hooks customizados
3. Use utilitários para formatação
4. Importe constantes ao invés de duplicar valores
5. Substitua classes CSS deprecated:
   - `bg-gradient-to-*` → `bg-linear-to-*`
   - `flex-shrink-0` → `shrink-0`
