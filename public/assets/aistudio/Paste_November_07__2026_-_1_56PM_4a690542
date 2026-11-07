What you're looking at is a Cinema 4D-style professional 3D modelling workspace, specifically an older, compact desktop interface rather than a modern web-based 3D editor.

The important thing is that its appearance is not just about the dark grey colour scheme. Its identity comes from the entire arrangement: tightly packed toolbars, small icons, thin separators, docked panels, a dominant viewport, object hierarchy, material thumbnails, coordinate controls and a timeline.

If I were briefing a coding agent to recreate this interface, I would describe it as a pixel-conscious recreation of a traditional desktop 3D modelling application, preserving the density, proportions, hierarchy and interaction patterns.

# 1. Overall interface anatomy

REFERENCE SCREENSHOT · 1366 × 705 PX

[Gryun Kim - ASYMMETRY](https://images.openai.com/static-rsc-4/bRedfQPHVZw-pDGfZxuo-WuFJLQN9BzCGMbf9ES2-EHu0Hj9PJ9Kzd8LjseTbkoXXweCh1WZ0QYfbjfdWFgbocN94FHADUFiLoYYFR93xn8PVj8WI8HZ3jmWqk-ydjKJe3zjXg0CJUUXev9yOWthl9feh5yjVp_jWVf0y29uBfE?purpose=inline)

[g-ryun.com](https://g-ryun.com/asymmetry-title-sequence?utm_source=chatgpt.com)

The reference is a classic Cinema 4D desktop layout. The uploaded screenshot remains the authoritative reference for the exact arrangement.

The application is divided into seven major interface regions:

| Region            | Approximate position    | Purpose                                   |
| ----------------- | ----------------------- | ----------------------------------------- |
| Main menu         | Top, y: 0–22            | Application commands                      |
| Main toolbar      | Top, y: 23–62           | Modelling and transform tools             |
| Left tool palette | x: 0–38                 | Selection, primitives and modelling tools |
| Main viewport     | x: 39–902, y: 80–511    | 3D scene visualization                    |
| Object Manager    | x: 903–1365, y: 22–355  | Scene hierarchy                           |
| Attribute Manager | x: 903–1365, y: 356–704 | Selected object properties                |
| Bottom workspace  | y: 512–704              | Timeline, materials and coordinates       |

These regions should be implemented as independent dockable interface panels, not as one large static layout.

# 2. Colour system and visual language

The interface uses a restrained, industrial desktop aesthetic. Almost everything is grey, with orange used to communicate active tools and selected states.

Approximate colour palette

Main chrome

\#292929

Panel background

\#393939

Panel headers

\#484848

Viewport grid

\#5B5B5B

Secondary text

\#A6A6A6

Primary text

\#E0E0E0

Active orange

\#E88724

Borders

\#777777

Dark surfaces

\#151515

These are approximate visual estimates, not extracted colour values.

### Colour rules

- Backgrounds: dark and neutral grey.
- Panel headers: slightly lighter than the panel body.
- Borders: thin, subtle grey lines.
- Text: mostly light grey, never pure white everywhere.
- Active tools: orange background or orange icon highlights.
- Selected geometry and controls: orange accents.
- Viewport: neutral grey with a darker grid.
- 3D model: dark graphite material with subtle highlights.

Important: Avoid modern design conventions such as rounded cards, large headings, floating navigation, excessive padding, colourful gradients and oversized icons.

This interface is compact and functional. It should feel like desktop engineering software.

# 3. Top menu bar

[Preferences: Interface](https://images.openai.com/static-rsc-4/FPqDG7PrRHFA2A7F1GxYo9xyzIDjeorVerKD97RuiH37N2PgBK1E05fSLvgM-0pHRRfBroxYhwZV0-WtMnhczaUSp-Hy6JHv8-abVuS61i6SgKpdunoqmAT32D8ALXAjaaXO-nw7IYie_LSq6xSQuNrq_GqxyqSt5m4CZ5vwbOk?purpose=inline)

[help.maxon.net](https://help.maxon.net/c4d/s22/us/html/PREFSINTERFACE-PREF_INTERFACE_MAIN_GROUP.html?utm_source=chatgpt.com)

The topmost strip is approximately 22 pixels tall.

It contains horizontally arranged menus:

- File
- Edit
- Create
- Select
- Tools
- Mesh
- Snap
- Animate
- Simulate
- Render
- Sculpt
- Motion Tracker
- MoGraph
- Character
- Pipeline
- Plugins
- V-Ray Bridge
- 3DToAll
- Redshift
- Script
- Window
- Help

On the far right is a layout selector labelled `Layout: Startup`.

### Behaviour

Each menu should:

- Open a compact dropdown.
- Use small text and minimal padding.
- Support nested submenus.
- Highlight hovered options.
- Remain visually integrated with the menu bar.

The layout selector should allow switching between saved workspace arrangements.

# 4. Main toolbar

This is the horizontal strip immediately below the menu bar.

It is approximately 40 pixels tall and contains multiple groups of square icon buttons.

[概述](https://images.openai.com/static-rsc-4/T-CkbRe_XvY6gN1Llaa6J6B92qPwXB95SOsBNq9hp0rh6zNNsUQFIunRs7cjs4nI9-trzCW7O1jaChUFJoI_S4zZmqka_lh_PSykbYvyBYK56xD5xteGsZnKJXt9UhCCFIySz16OtK5MYZY2OUdF-DfC26tzGjX5UYGKhl4rAsU?purpose=inline)

[aonosuke.github.io](https://aonosuke.github.io/C4D-Help-CN/help/CN/html/5425.html?utm_source=chatgpt.com)

### Toolbar groups

A. General controls

- Undo
- Redo

B. Selection tools

- Live selection
- Move
- Scale
- Rotate
- Universal transform

C. Axis constraints

- X axis
- Y axis
- Z axis

D. Modelling and object tools

- Axis/object editing controls
- Primitive creation
- Polygon and surface-related tools
- Spline and object generation tools

E. Animation and rendering

- Render controls
- Render settings
- Preview-related controls

F. Lighting and scene creation

- Primitive cube
- Pen/spline tools
- Generator objects
- Deformers
- Camera and lighting tools

The screenshot contains a series of icons rather than text-labelled buttons.

### Exact visual characteristics

- Buttons approximately 32–38 pixels wide.
- Small gaps between icon groups.
- Icons are predominantly monochrome.
- Active tools have orange backgrounds.
- Buttons have subtle bevels and borders.
- Tooltips appear on hover.
- Some buttons contain small dropdown indicators.

The agent should use SVG icons or a consistent icon set, not emoji or text characters.

# 5. Left vertical toolbar

[Spline Modeling: Sweep: Cinema 4D Tutorial](https://images.openai.com/static-rsc-4/oVngfgeFNUAfUih-HCMjc4yYj8i4WJg7J-ijZae3ZyOTAUnmmkfV5c0D4nF3Sm3zk6lrORHww3P7C2bRl5w5rkhcZg8ndyLSpxg64yQFryuATCc1g3-i7acXJdYiHwIOyeWhQGI9Oc2yovw8oX_9p1N30QPK0nCKvf2b5GCZVts?purpose=inline)

This toolbar occupies approximately 38 pixels in width.

It is attached to the left side of the viewport.

It contains vertically stacked square tool buttons, including:

- Selection-related controls.
- Primitive/object tools.
- Polygon and point editing tools.
- Modelling operations.
- Coordinate and axis tools.
- Snap and other interaction controls.

### Design

- Fixed narrow width.
- Approximately 34–36 pixel button heights.
- Small icons centred inside buttons.
- Orange active-state accents.
- Thin separation between tool groups.
- A darker strip behind the icons.

The toolbar should scroll if the available vertical space is insufficient.

# 6. Main 3D viewport

Most important workspace component

[3D Kilo Class Submarine Project 636 - TurboSquid 2267043](https://images.openai.com/static-rsc-4/w1UZvwJPU1t7dQuLd4M2GSi0FpZ-11jyIWYo8zxA4ctND0AXdVox0b9AUeyn7R-g-2vV0PyNMRAcklb9_KNcb2Uzi_LdFo3EKbmVMoaJ13j1bXylHAbfwrrz3k1b7u5UlAnhsK9QYz5dAkarE8vD2uR2Ae5hLE-zfnSpR2OQPQU?purpose=inline)

[turbosquid.com](https://www.turbosquid.com/3d-models/3d-kilo-class-submarine-project-636-2267043?utm_source=chatgpt.com)

The viewport is the largest component and occupies approximately 63% of the full screenshot width.

In this example, it displays a submarine model in perspective view.

### Viewport header

At the top of the viewport is a compact secondary toolbar:

- View
- Cameras
- Display
- Options
- Filter
- Panel

This is a context-specific viewport menu, separate from the application's main menu.

The upper-right side also has small viewport controls.

### Viewport rendering

The scene has:

1. A grey perspective grid.
2. A three-dimensional coordinate system.
3. A dark submarine model.
4. Perspective camera projection.
5. Directional lighting and material shading.
6. Visible surface details and geometry.
7. A small XYZ orientation indicator in the bottom-left corner.
8. Grid spacing information in the bottom-right corner.

### Viewport appearance

The viewport background is a medium grey, approximately #626262.

The grid uses thin, low-contrast lines. The main axes are more prominent.

The model uses a dark charcoal material. It is not brightly coloured.

The viewport should support:

- Orbiting the camera.
- Panning.
- Zooming.
- Selecting objects.
- Selecting points, edges and polygons.
- Dragging and transforming geometry.
- Switching between perspective and orthographic views.
- Grid and axis visibility.
- Shading modes.
- Object framing and camera navigation.

### Critical implementation detail

Do not build the viewport as an ordinary HTML canvas with a picture of a submarine.

It must be an actual 3D rendering surface, preferably using Three.js or another WebGL-based renderer.

The viewport should be independent of the surrounding interface so the scene can continue rendering while the user resizes or rearranges panels.

# 7. Right-side Object Manager

[Why You Can't See Your Objects in Cinema 4D](https://images.openai.com/static-rsc-4/JcApRZoUsaTzcVBusnHeUgw6UZGGYfAKnQt03VP19gEmVeiGRgVJw4tL9HBOrz30Ya2z9wkR_IOo_Ghi6nP1uY51iu0P6c702axbcFsUM1plMsrggD9Nrs_KiXF8Gw0zt7-egA8pvDQn8zq5qinA2R2Zpj5XEil3qteeOL-XHFU?purpose=inline)

[schoolofmotion.com](https://www.schoolofmotion.com/blog/missing-objects-cinema-4d?utm_source=chatgpt.com)

This is the upper-right panel.

Approximate dimensions:

- Width: 463 pixels.
- Height: 334 pixels.

It starts directly beneath the main toolbar.

### Header

The panel contains a compact toolbar with:

- File
- Edit
- View
- Objects
- Tags
- Bookmarks

On the right are small controls for searching, filtering and panel management.

### Object hierarchy

In the screenshot, the hierarchy contains:

`Virginia_class_Submarine`

It has a small expandable hierarchy arrow and an object-type icon.

There are also two small coloured visibility/status indicators.

### What the panel should support

- Parent-child object hierarchies.
- Expand and collapse.
- Object selection.
- Drag-and-drop hierarchy changes.
- Object renaming.
- Visibility toggles.
- Editor/render visibility.
- Object locking.
- Object tagging.
- Search and filtering.
- Context menus.
- Multiple object selection.

### Visual treatment

- Dark grey panel background.
- Small light-grey text.
- Compact rows.
- Indentation for nested objects.
- Tiny status indicators.
- Thin vertical separators.
- No large object cards.

The object hierarchy should remain readable even when hundreds of scene objects are loaded.

# 8. Attribute Manager

This occupies the lower-right section.

Approximate position:

- X: 903 pixels.
- Y: 356 pixels.
- Width: 463 pixels.
- Height: 349 pixels.

The header contains:

- Mode
- Edit
- User Data

There are small utility icons on the right, including search, locking and layout-related controls.

### Purpose

This panel displays contextual properties of whichever object, material, tag or tool is selected.

For example, selecting a cube could expose:

- Position.
- Rotation.
- Scale.
- Object dimensions.
- Segments.
- Display properties.
- Visibility.

Selecting a material could expose:

- Base colour.
- Roughness.
- Metallic properties.
- Texture maps.
- Reflection.
- Transparency.

Selecting a camera could expose:

- Focal length.
- Projection.
- Sensor settings.
- Depth of field.

### Important distinction

This is not simply a static properties sidebar.

It is a context-sensitive editor whose contents change based on the current selection.

It should have its own scrolling region and compact property controls.

# 9. Bottom section: Timeline, Materials and Coordinates

This is particularly important because the bottom section is split into multiple independent workspaces.

[ОПИСАНИЕ ИНТЕРФЕЙСА, Рабочее пространство - Создание трехмерной графики в CINEMA 4D](https://images.openai.com/static-rsc-4/2wQCVPaf82D-_VONUgHZ1XuLSBUosS1WhN4MgHUHBHvQmgL0H2C1cd7egKrhRX47Rg2LOj5gpmxhdMWC8cy5qXBoba9fU3LOy-fF1J8YSFPdSpK4N62rMYI6ipA3pnavg8Qfgzkx_lXAdjLKQYcj0g-MDxEXv41ItP2XP0Dn5_A?purpose=inline)

[bstudy.net](https://bstudy.net/903186/tehnika/opisanie_interfeysa?utm_source=chatgpt.com)

### A. Timeline

The timeline occupies the horizontal area below the viewport.

It contains:

- Frame ruler.
- Frame numbers.
- Current-frame indicator.
- Playback controls.
- Previous/next frame controls.
- Play and stop controls.
- Animation-related buttons.
- Timeline navigation.

In the screenshot, the timeline runs from frame 0 to approximately frame 90.

The current frame is frame 0.

The timeline is compact and sits immediately below the 3D viewport.

### B. Material Manager

The lower-left section displays three material thumbnails:

- Props
- Parts
- Submari... (truncated)

Above these thumbnails is another compact toolbar:

- Create
- Edit
- Function
- Texture

The materials are displayed as spherical previews inside small square slots.

The panel supports:

- Material creation.
- Material duplication.
- Material renaming.
- Material editing.
- Dragging materials onto objects.
- Material assignment.
- Texture management.

The material previews are small and dark, matching the application's overall appearance.

### C. Coordinate Manager

The lower-middle section displays coordinate and transformation fields.

It contains X, Y and Z input fields in multiple groups.

These represent values such as:

- Position X, Y, Z.
- Scale X, Y, Z.
- Rotation H, P, B.

At the bottom are dropdowns for coordinate space and transformation mode, plus an Apply button.

The values in the screenshot are zeroed.

The controls use compact rectangular inputs with grey borders.

# 10. Docking and panel architecture

This is one of the most important things to get right.

The interface should not be developed as a collection of independently positioned HTML divs with hardcoded pixel coordinates.

It needs a proper desktop-style docking system.

The reference uses a layout that can be understood as:

MAIN MENU

MAIN TOOLBAR

TOOLS

## 3D VIEWPORT

Perspective · Grid · Scene

TIMELINE

OBJECT MANAGER

ATTRIBUTE MANAGER

MATERIAL MANAGER

COORDINATE MANAGER

Structural interpretation of the screenshot, not a pixel-perfect rendering.

The implementation should support:

- Resizing panels using draggable splitters.
- Docking panels into other panel regions.
- Undocking panels into floating windows.
- Hiding and restoring panels.
- Saving workspace layouts.
- Restoring the Startup layout.
- Remembering panel dimensions.
- Maintaining a minimum viewport size.

The default workspace must reproduce the screenshot's proportions.

# 11. Typography, spacing and iconography

These details make the difference between a convincing recreation and something that merely resembles the screenshot.

| Element             | Recommended specification  |
| ------------------- | -------------------------- |
| Main font           | Arial or system sans-serif |
| Menu font           | 11–12px                    |
| Panel headings      | 10–11px                    |
| Object names        | 11–12px                    |
| Toolbar icons       | 20–25px                    |
| Toolbar buttons     | 32–38px                    |
| Panel borders       | 1px                        |
| Input height        | 22–25px                    |
| Standard spacing    | 2–5px                      |
| Panel header height | 21–24px                    |
| Button radius       | 0–3px                      |

Avoid:

- Large typography.
- Excessive empty space.
- Rounded modern cards.
- Thick borders.
- Modern floating sidebars.
- Oversized controls.
- Bright white backgrounds.

The interface should be information-dense, but not visually cluttered.

# 12. Recommended technical architecture

If this is being built as a web application, I would use the following architecture:

| Component           | Recommended technology              |
| ------------------- | ----------------------------------- |
| Application shell   | React                               |
| 3D viewport         | Three.js                            |
| 3D integration      | React Three Fiber (optional)        |
| Docking system      | FlexLayout or Golden Layout         |
| Icons               | Custom SVG / Lucide                 |
| State management    | Zustand                             |
| Styling             | CSS variables and custom CSS        |
| Scene serialization | Three.js JSON / custom scene format |
| Timeline            | Custom animation controller         |
| Material previews   | Three.js render targets             |

I would separate the application into these components:

```
src/
├── app/
│   ├── ApplicationShell.jsx
│   ├── MenuBar.jsx
│   ├── MainToolbar.jsx
│   └── WorkspaceManager.jsx
│
├── viewport/
│   ├── Viewport.jsx
│   ├── ViewportToolbar.jsx
│   ├── SceneRenderer.jsx
│   ├── CameraController.jsx
│   ├── GridHelper.jsx
│   └── SelectionManager.jsx
│
├── panels/
│   ├── ObjectManager.jsx
│   ├── AttributeManager.jsx
│   ├── MaterialManager.jsx
│   ├── CoordinateManager.jsx
│   └── Timeline.jsx
│
├── tools/
│   ├── SelectionTools.jsx
│   ├── TransformTools.jsx
│   ├── ModellingTools.jsx
│   └── ToolRegistry.js
│
├── scene/
│   ├── SceneManager.js
│   ├── ObjectRegistry.js
│   └── MaterialRegistry.js
│
├── state/
│   ├── workspaceStore.js
│   ├── sceneStore.js
│   └── selectionStore.js
│
└── styles/
    ├── theme.css
    ├── panels.css
    ├── toolbar.css
    └── viewport.css
```

# 13. The actual instructions I would give the coding agent

This is the most important part. I would give the agent the following as its implementation brief, with your screenshot attached as the visual reference.

# TASK: Recreate the Classic Cinema 4D Desktop Interface

## Objective

Recreate the supplied screenshot as closely as possible. The screenshot is the authoritative visual reference.

Build a professional desktop-style 3D modelling interface inspired by the classic Cinema 4D workspace.

This is not a request to create a modern dashboard or a generic 3D editor. The goal is to reproduce the exact visual character, panel arrangement, density, proportions, colour scheme and interaction patterns of the reference.

## 1. Application Layout

Implement the following interface regions:

1. Main menu bar at the very top.
2. Horizontal main toolbar directly underneath.
3. Narrow vertical modelling toolbar on the left.
4. Large central 3D viewport.
5. Object Manager in the upper-right.
6. Attribute Manager in the lower-right.
7. Timeline directly beneath the viewport.
8. Material Manager in the bottom-left.
9. Coordinate Manager in the bottom-centre.

Use the supplied screenshot's 1366 × 705 dimensions as the initial layout reference.

Approximate proportions:

- Left toolbar: 38px.
- Right management column: 34% of the available application width.
- Main viewport: approximately 63% of the available width.
- Main toolbar: 40px high.
- Menu bar: 22px high.
- Timeline: approximately 65px high.
- Bottom material and coordinate workspace: approximately 130px high.

Maintain the same relative proportions when the window is resized.

## 2. Visual Design

Reproduce the classic dark-grey desktop application appearance.

Use:

- Dark charcoal application background.
- Medium-grey panel surfaces.
- Slightly lighter panel headers.
- Thin grey borders and separators.
- Small light-grey text.
- Orange active tool indicators.
- Compact rectangular controls.
- Small monochrome toolbar icons.

Avoid modern web application styling.

Do not use:

- Rounded cards.
- Large navigation elements.
- Oversized typography.
- Gradient backgrounds.
- Excessive padding.
- Floating dashboard widgets.
- Bright accent colours.

The interface should look like a traditional professional engineering and 3D modelling application.

## 3. Main Menu

Create a compact horizontal menu containing:

File, Edit, Create, Select, Tools, Mesh, Snap, Animate, Simulate, Render, Sculpt, Motion Tracker, MoGraph, Character, Pipeline, Plugins, V-Ray Bridge, 3DToAll, Redshift, Script, Window and Help.

Include a workspace layout selector on the right, initially set to Startup.

Menus must open functional dropdowns.

## 4. Main Toolbar

Create compact icon-based toolbar groups for:

- Undo and redo.
- Selection.
- Move.
- Scale.
- Rotate.
- Universal transform.
- X, Y and Z axis constraints.
- Object creation.
- Modelling operations.
- Rendering.
- Animation.
- Camera and lighting.

Use consistent SVG icons.

Implement hover states, active states, tooltips and dropdown indicators.

## 5. Left Toolbar

Create a narrow vertical toolbar with grouped selection, object creation, geometry editing, modelling and snapping tools.

Keep the buttons compact and vertically stacked.

## 6. 3D Viewport

This is the application's central workspace and must be a genuine interactive 3D scene, not a static image.

Use Three.js or an equivalent WebGL renderer.

Implement:

- Perspective camera.
- Grid floor.
- XYZ axis indicators.
- Scene lighting.
- Object rendering.
- Orbit controls.
- Pan controls.
- Zoom controls.
- Object selection.
- Transform controls.
- Object framing.
- Different viewport shading modes.
- Grid visibility.
- Viewport display settings.

The initial viewport should have a neutral grey background, subtle perspective grid and dark graphite-style model shading, matching the supplied reference.

If the submarine model asset is unavailable, use a suitable placeholder 3D object. Do not substitute a flat image.

## 7. Object Manager

Create a compact scene hierarchy in the upper-right panel.

Include:

- Expand/collapse controls.
- Object icons.
- Object names.
- Visibility controls.
- Editor/render visibility states.
- Object selection.
- Renaming.
- Drag-and-drop hierarchy management.
- Context menus.
- Search.

The initial scene should have an object named Virginia_class_Submarine if the corresponding asset is supplied.

Selecting an object in the hierarchy must select the corresponding object in the 3D viewport.

## 8. Attribute Manager

Create a context-sensitive properties editor.

Its contents should update based on the selected object, material or tool.

Include appropriate controls for:

- Position.
- Rotation.
- Scale.
- Dimensions.
- Object-specific settings.
- Material properties.
- Camera settings.
- Visibility.

Use compact labels, input fields, dropdowns and collapsible property groups.

## 9. Timeline

Implement a horizontal timeline below the viewport.

Include:

- Frame ruler.
- Current-frame indicator.
- Playback controls.
- Play and pause.
- Previous and next frame.
- Frame navigation.
- Animation track support.

Use a compact professional layout similar to the reference.

## 10. Material Manager

Create a bottom-left material workspace.

Display materials as small spherical previews with their names underneath.

Include:

- Create.
- Edit.
- Duplicate.
- Rename.
- Delete.
- Assign material to selected object.
- Texture management.

Material previews must be actual rendered previews.

## 11. Coordinate Manager

Create a bottom-centre coordinate editor.

Display editable X, Y and Z values for position, scale and rotation.

Include coordinate-space selection, transformation mode and an Apply button.

Changes should update the selected 3D object.

## 12. Docking System

The panels must be independently resizable.

Implement:

- Horizontal and vertical splitters.
- Panel resizing.
- Docking.
- Undocking.
- Floating panels.
- Panel visibility controls.
- Workspace saving.
- Workspace restoration.

Provide a default Startup workspace that matches the screenshot.

Do not use hardcoded absolute positioning for the entire application. Use a proper docking and split-panel architecture.

## 13. Functional Requirements

All visible controls should have meaningful behaviour.

The interface must not be a static mockup.

Connect:

- Object selection to viewport selection.
- Viewport selection to Object Manager.
- Selection to Attribute Manager.
- Coordinate inputs to object transformations.
- Material assignment to rendered objects.
- Timeline controls to animation playback.
- Toolbar actions to their respective tools.

Keep the UI state and 3D scene state synchronised.

## 14. Implementation Quality

Prioritise accurate visual reproduction before expanding the toolset.

Build reusable components and maintain separation between:

- Application interface.
- Docking and layout management.
- 3D rendering.
- Scene management.
- Object selection.
- Materials.
- Animation.
- Tool behaviour.

Do not unnecessarily restructure existing project architecture.

If a project already exists, inspect its dependencies and conventions before making changes.

## 15. Acceptance Criteria

The finished application should:

1. Closely resemble the supplied screenshot at 1366 × 705.
2. Have the same overall panel arrangement.
3. Reproduce the dark-grey and orange visual language.
4. Have compact professional toolbars.
5. Have a genuinely interactive 3D viewport.
6. Have functional object and attribute managers.
7. Have a working timeline interface.
8. Have a material preview manager.
9. Have editable coordinate controls.
10. Support panel resizing and workspace persistence.

Visual fidelity is a priority. Do not modernise the design or introduce your own dashboard interpretation.

First establish the complete interface shell and match the screenshot. Then implement and connect the functional components.

# 14. My most important recommendation

I would approach this in three development stages:

1. Stage 1 – Visual recreation

   Reproduce every panel, toolbar, separator, menu, icon size, colour and proportion. Use placeholder content where necessary.
2. Stage 2 – Actual 3D functionality

   Connect Three.js, object selection, transforms, camera controls, materials and scene hierarchy.
3. Stage 3 – Professional desktop behaviour

   Implement docking, floating panels, workspace persistence, contextual attributes and animation.

One distinction I would insist on: Don't let the coding agent create a beautiful modern 3D editor that happens to have the same features. Make it recreate this old-school Cinema 4D interface first. The visual density, small controls, tightly packed panels and industrial appearance are what give this software its identity.

The screenshot should remain open beside the agent throughout implementation, and visual comparisons should be made at the same 1366 × 705 resolution.