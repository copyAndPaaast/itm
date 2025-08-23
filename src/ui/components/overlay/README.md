# Reusable Overlay System

A comprehensive, reusable overlay system for the ITM application providing consistent modal dialogs, editors, and full-screen overlays.

## Components

### `Overlay`
The core reusable overlay component with a flexible API.

```jsx
import { Overlay } from './components/overlay'

<Overlay
  open={isOpen}
  onClose={handleClose}
  title="Edit Node Type"
  subtitle="Configure node properties and behavior"
  content={<NodeTypeEditor />}
  actions={<SaveCancelButtons />}
  maxWidth="md"
/>
```

### `OverlayProvider`
Global context provider for managing overlays throughout the app.

```jsx
import { OverlayProvider, useOverlay } from './components/overlay'

// Wrap your app
<OverlayProvider>
  <App />
</OverlayProvider>

// Use in any component
const { showDialog, showEditor, hideOverlay } = useOverlay()
```

## API Reference

### Overlay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | `false` | Whether overlay is visible |
| `onClose` | function | `() => {}` | Close handler |
| `title` | ReactNode | `null` | Main title content |
| `subtitle` | ReactNode | `null` | Subtitle/description |
| `content` | ReactNode | `null` | Main overlay content |
| `actions` | ReactNode | `null` | Action buttons |
| `maxWidth` | string | `'md'` | Maximum width ('xs', 'sm', 'md', 'lg', 'xl') |
| `fullWidth` | boolean | `true` | Use full available width |
| `fullScreen` | boolean | `false` | Full-screen mode |
| `disableBackdropClick` | boolean | `false` | Prevent closing on backdrop click |
| `disableEscapeKeyDown` | boolean | `false` | Prevent closing on ESC key |
| `sx` | object | `{}` | Custom dialog styling |
| `contentSx` | object | `{}` | Custom content area styling |

### OverlayProvider Methods

#### `showOverlay(config)`
Show overlay with full configuration object.

#### `showDialog(title, content, actions, options)`
Convenience method for simple dialogs.

#### `showEditor(title, content, actions, options)`
Convenience method for editor overlays.

#### `showFullScreen(title, content, actions, options)`
Convenience method for full-screen overlays.

#### `hideOverlay()`
Hide the current overlay.

#### `updateOverlay(updates)`
Update overlay content while open.

## Usage Patterns

### 1. Simple Dialog
```jsx
const { showDialog } = useOverlay()

const confirmDelete = () => {
  showDialog(
    'Confirm Delete',
    <Typography>Are you sure?</Typography>,
    <Stack direction="row" spacing={1}>
      <Button variant="outlined">Cancel</Button>
      <Button variant="contained" color="error">Delete</Button>
    </Stack>
  )
}
```

### 2. Node Type Editor
```jsx
const { showEditor } = useOverlay()

const editNodeType = (nodeType) => {
  showEditor(
    'Edit Node Type',
    <NodeTypeForm nodeType={nodeType} />,
    <SaveCancelActions />,
    {
      subtitle: 'Configure properties and validation rules',
      disableBackdropClick: true
    }
  )
}
```

### 3. System Manager
```jsx
const { showFullScreen } = useOverlay()

const openSystemManager = () => {
  showFullScreen(
    'System Manager',
    <SystemManagementDashboard />,
    <SystemActions />
  )
}
```

### 4. Custom Configuration
```jsx
const { showOverlay } = useOverlay()

const showCustom = () => {
  showOverlay({
    title: 'Custom Overlay',
    content: <CustomContent />,
    maxWidth: 'xs',
    disableBackdropClick: true,
    sx: { '& .MuiDialog-paper': { backgroundColor: 'primary.light' } }
  })
}
```

## Benefits

### ✅ **Reusable**
- Single overlay component for all modal needs
- Consistent API across different use cases
- No need to create new modal components

### ✅ **Flexible**
- Support for any content type
- Configurable sizing and behavior
- Custom styling options

### ✅ **Accessible**
- Built on Material-UI Dialog with accessibility features
- Proper ARIA attributes
- Keyboard navigation support

### ✅ **Professional**
- Consistent styling with theme integration
- Smooth animations and transitions
- Mobile-responsive design

### ✅ **Developer Friendly**
- Context-based API (no prop drilling)
- TypeScript-friendly interfaces
- Comprehensive examples and documentation

## Future Extensions

This overlay system is designed to be extended for:
- Node type editing
- System configuration
- Relationship management
- User profile editing
- Settings panels
- Help and documentation
- Complex multi-step workflows

The flexible API ensures that any future modal needs can be handled with this single, consistent system.