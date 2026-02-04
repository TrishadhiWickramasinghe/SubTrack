# Component Usage Guide: Checkbox, Dropdown, Input, and Card

This guide documents the proper prop names and usage patterns for the common components in the SubTrack project.

## Checkbox Component

**Import:**
```tsx
import Checkbox from '@components/common/Checkbox';
// or
import Checkbox from '../../../components/common/Checkbox';
```

**Prop Names:**
- `checked` - Boolean state of the checkbox (boolean)
- `onValueChange` - Callback when checkbox state changes (function)
- `label` - Optional label text (string)
- `description` - Optional description text (string)
- `disabled` - Disable the checkbox (boolean, default: false)
- `required` - Mark as required (boolean, default: false)
- `error` - Error message to display (string)
- `size` - Size variant: 'small' | 'medium' | 'large' (default: 'medium')
- `shape` - Border shape: 'square' | 'circle' | 'rounded' (default: 'rounded')
- `color` - Primary color (string)
- `labelPosition` - Position of label: 'left' | 'right' (default: 'right')
- `showIcon` - Show checkmark icon (boolean, default: true)
- `icon` - Icon name (string, default: 'check')
- `animation` - Animation type: 'scale' | 'bounce' | 'fade' | 'none' (default: 'scale')
- `containerStyle` - Container style override (ViewStyle)
- `testID` - Test identifier (string)

**Usage Examples:**

```tsx
// Basic usage
<Checkbox
  checked={enableNotifications}
  onValueChange={setEnableNotifications}
/>

// With label and description
<Checkbox
  checked={enableAnalytics}
  onValueChange={setEnableAnalytics}
  label="Usage Analytics"
  description="Help us improve by sharing anonymous usage data"
/>

// In preference list (from SetupScreen.tsx)
<View style={styles.preferenceItem}>
  <View style={styles.preferenceInfo}>
    <Ionicons name="notifications" size={20} color={colors.primary} />
    <View style={styles.preferenceText}>
      <Text style={[styles.preferenceTitle, { color: colors.text }]}>
        Push Notifications
      </Text>
      <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
        Get reminders before subscription renewals
      </Text>
    </View>
  </View>
  <Checkbox
    checked={enableNotifications}
    onValueChange={setEnableNotifications}
  />
</View>
```

**Note:** The prop is `checked` (not `value`), and the callback is `onValueChange` (not `onChange`).

---

## Dropdown Component

**Import:**
```tsx
import Dropdown from '@components/common/Dropdown';
// or
import Dropdown from '../../../components/common/Dropdown';
```

**Prop Names:**
- `items` - Array of dropdown items (DropdownItem[]) - **REQUIRED**
- `selectedValue` - Currently selected value (string | number)
- `onSelect` - Callback when selection changes (function) - **REQUIRED**
- `placeholder` - Placeholder text (string, default: 'Select an option')
- `label` - Label text above dropdown (string)
- `error` - Error message (string)
- `success` - Success state (boolean)
- `required` - Mark as required (boolean)
- `disabled` - Disable dropdown (boolean)
- `searchable` - Enable search functionality (boolean, default: false)
- `multiSelect` - Enable multi-select mode (boolean, default: false)
- `selectedValues` - Array of selected values for multi-select ((string | number)[])
- `onMultiSelect` - Callback for multi-select changes (function)
- `searchPlaceholder` - Search box placeholder (string, default: 'Search...')
- `emptyMessage` - Message when no items found (string, default: 'No items found')
- `variant` - Dropdown style: 'outlined' | 'filled' | 'standard' (default: 'outlined')
- `size` - Size variant: 'small' | 'medium' | 'large' (default: 'medium')
- `dropdownHeight` - Max height of dropdown menu (number, default: 200)
- `testID` - Test identifier (string)

**DropdownItem Type:**
```tsx
type DropdownItem = {
  label: string;           // Display text
  value: string | number;  // Value to return
  icon?: string;          // Optional icon name
  iconColor?: string;     // Icon color
  disabled?: boolean;     // Whether item is disabled
  customElement?: React.ReactNode;  // Custom element instead of label
  group?: string;         // Group name for grouping
};
```

**Usage Examples:**

```tsx
// Basic dropdown (from SetupScreen.tsx)
<Dropdown
  label="Currency"
  placeholder="Select currency"
  selectedValue={selectedCurrency}
  items={currencies.map((curr: any) => ({
    label: `${curr.code} - ${curr.name}`,
    value: curr.code,
    icon: curr.symbol,
  }))}
  onSelect={(value) => setSelectedCurrency(value)}
  icon="globe-outline"
/>

// Simple dropdown with basic items
<Dropdown
  items={[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ]}
  selectedValue={selectedOption}
  onSelect={(value) => setSelectedOption(value)}
  placeholder="Choose one"
/>

// Dropdown with icons
<Dropdown
  label="Category"
  items={categories.map(cat => ({
    label: cat.name,
    value: cat.id,
    icon: cat.icon,
    iconColor: cat.color,
  }))}
  selectedValue={selectedCategory}
  onSelect={(value) => setSelectedCategory(value)}
/>
```

**Note:** The prop is `selectedValue` (not `value`), and the callback is `onSelect` (which receives the selected value).

---

## Input Component

**Import:**
```tsx
import Input from '@components/common/Input';
// or
import { Input } from '@components/common/Input';
```

**Prop Names:**
- `variant` - Style variant: 'outlined' | 'filled' | 'underlined' | 'ghost' (default: 'outlined')
- `size` - Size: 'small' | 'medium' | 'large' (default: 'medium')
- `disabled` - Disable input (boolean, default: false)
- `loading` - Show loading state (boolean, default: false)
- `readonly` - Read-only state (boolean, default: false)
- `error` - Error message or state (string | boolean)
- `success` - Success message or state (string | boolean)
- `warning` - Warning message or state (string | boolean)
- `label` - Label text (string)
- `placeholder` - Placeholder text (string)
- `floatingLabel` - Use floating label (boolean, default: false)
- `value` - Input value (string) - **extends TextInputProps**
- `onChangeText` - Callback when text changes (function)
- `leftIcon` - React element for left icon (ReactNode)
- `rightIcon` - React element for right icon (ReactNode)
- `clearButton` - Show clear button (boolean)
- `required` - Mark as required (boolean)
- `keyboardType` - Keyboard type (string) - **from TextInputProps**
- `autoCapitalize` - Auto capitalize mode (string) - **from TextInputProps**
- `autoFocus` - Auto focus on mount (boolean) - **from TextInputProps**
- `prefix` - Prefix element (ReactNode) - e.g., currency symbol
- `suffix` - Suffix element (ReactNode)
- `containerStyle` - Container style override (ViewStyle)
- `inputStyle` - Input text style override (TextStyle)
- `testID` - Test identifier (string)

**Usage Examples:**

```tsx
// Basic text input (from SetupScreen.tsx)
<Input
  label="Full Name"
  placeholder="Enter your name"
  value={name}
  onChangeText={setName}
  icon="person-outline"
  required
  autoFocus
/>

// Email input
<Input
  label="Email Address"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  icon="mail-outline"
  keyboardType="email-address"
  autoCapitalize="none"
  required
/>

// Numeric input with currency prefix (from BudgetScreen.tsx)
<Input
  label="Budget Amount"
  value={budgetAmount}
  onChangeText={setBudgetAmount}
  placeholder="Enter amount"
  keyboardType="numeric"
  prefix={<Text style={[styles.currencyPrefix, { color: colors.text }]}>$</Text>}
/>

// Input with all options
<Input
  label="Custom Input"
  placeholder="Type here"
  value={inputValue}
  onChangeText={setInputValue}
  variant="outlined"
  size="medium"
  required
  error={validationError}
  clearButton
  leftIcon={<Icon name="search" />}
/>
```

**Note:** The prop is `value` and callback is `onChangeText` (standard TextInput naming). Use `error` for error states and `label` for label text.

---

## Card Component

**Import:**
```tsx
import Card from '@components/common/Card';
// or
import { Card } from '@components/common/Card';
```

**Prop Names:**
- `children` - Card content (ReactNode) - **REQUIRED**
- `variant` - Card style: 'elevated' | 'outlined' | 'filled' | 'ghost' (default: 'elevated')
- `padding` - Internal padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `margin` - External margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'none')
- `borderRadius` - Corner radius: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'round' (default: 'md')
- `disabled` - Disable card (boolean, default: false)
- `loading` - Show loading state (boolean, default: false)
- `selected` - Selected state (boolean, default: false)
- `onPress` - Callback when card is pressed (function)
- `onLongPress` - Callback on long press (function)
- `pressable` - Make card pressable (boolean, default: false)
- `backgroundColor` - Override background color (string)
- `borderColor` - Override border color (string)
- `elevation` - Shadow elevation (number, default: 2)
- `style` - Container style override (ViewStyle)
- `contentStyle` - Content style override (ViewStyle)
- `accessibilityLabel` - Accessibility label (string)
- `accessibilityRole` - Accessibility role (string)
- `testID` - Test identifier (string)

**Usage Examples:**

```tsx
// Basic card (from SetupScreen.tsx)
<Card style={[styles.stepCard, { backgroundColor: colors.card }]}>
  <View style={styles.stepHeader}>
    <View style={[styles.stepIcon, { backgroundColor: colors.primary + '20' }]}>
      <Ionicons name="person" size={24} color={colors.primary} />
    </View>
    <View>
      <Text style={[styles.stepCardTitle, { color: colors.text }]}>
        Personal Information
      </Text>
      <Text style={[styles.stepCardDescription, { color: colors.textSecondary }]}>
        This helps us personalize your experience
      </Text>
    </View>
  </View>
  
  <View style={styles.form}>
    {/* Form content */}
  </View>
</Card>

// Pressable card
<Card
  pressable
  onPress={() => handleCardPress()}
  variant="outlined"
  padding="lg">
  <Text>Tap me!</Text>
</Card>

// Card with custom styling
<Card
  variant="elevated"
  padding="md"
  borderRadius="lg"
  backgroundColor={colors.background}
  style={{ marginVertical: 12 }}>
  <Text>Content here</Text>
</Card>
```

**Note:** Card uses `children` for content (ReactNode), not `content`. It supports `onPress` for interactivity and uses the `pressable` prop to enable tap handling.

---

## Summary Table

| Component | Main Props | Callback | Value Prop |
|-----------|-----------|----------|-----------|
| **Checkbox** | `checked`, `onValueChange` | `onValueChange(boolean)` | `checked` (boolean) |
| **Dropdown** | `items`, `selectedValue`, `onSelect` | `onSelect(value)` | `selectedValue` (string \| number) |
| **Input** | `value`, `onChangeText`, `label` | `onChangeText(text)` | `value` (string) |
| **Card** | `children`, `variant`, `padding` | `onPress()` | N/A (container) |

---

## Common Patterns

### Form with all components
```tsx
<Card variant="outlined" padding="lg">
  <Input
    label="Name"
    value={name}
    onChangeText={setName}
    required
  />
  
  <Dropdown
    label="Currency"
    items={currencyItems}
    selectedValue={currency}
    onSelect={setCurrency}
  />
  
  <Checkbox
    checked={agreed}
    onValueChange={setAgreed}
    label="I agree to terms"
  />
  
  <Button onPress={handleSubmit} title="Submit" />
</Card>
```

### State Management Pattern
```tsx
const [name, setName] = useState('');
const [currency, setCurrency] = useState('USD');
const [agreed, setAgreed] = useState(false);

// Input uses onChangeText callback
<Input value={name} onChangeText={setName} />

// Dropdown uses onSelect callback
<Dropdown selectedValue={currency} onSelect={setCurrency} />

// Checkbox uses onValueChange callback
<Checkbox checked={agreed} onValueChange={setAgreed} />
```
