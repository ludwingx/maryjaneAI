<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:obsidian-sync-rules -->
# 📝 Obsidian Documentation Sync

## Mandatory Documentation Updates

Every time you make **significant changes** to the source code of this project (`mary-jane-ia/`), you **MUST** also update the corresponding Obsidian documentation located at:

```
c:\Users\T450\Documents\workspace\my-brain-obsidian\02 - Projects\13 - Mary Jane IA\
```

## What counts as "significant changes"

- Adding, removing, or renaming files/folders in the project structure
- Modifying the Prisma schema (adding/modifying/removing models, enums, or fields)
- Adding or removing npm dependencies
- Creating new API routes or pages
- Implementing a new feature, module, or component
- Changing environment variables
- Modifying AI prompts or agent logic
- Any architectural decision or refactoring

## What to update

1. **Changelog** (`06 - Changelog/Changelog.md`):
   - Add a new dated entry with category emoji, description, files affected, and reason.
   - Use the format template in the file's HTML comment.

2. **Roadmap** (`05 - Roadmap/Roadmap.md`):
   - Update task statuses from ⏳ to ✅ when completed, or 🔄 when in progress.

3. **Relevant module/architecture docs**:
   - If you modify Prisma schema → update `02 - Base de Datos/ModeloDeDatos.md`
   - If you add dependencies → update `00 - Resumen/StackTecnologico.md`
   - If you change folder structure → update `01 - Arquitectura/EstructuraDelProyecto.md`
   - If you modify AI agents/prompts → update `04 - IA/SystemPrompts.md` and/or `04 - IA/PipelineIA.md`
   - If you work on a specific module → update the corresponding file in `03 - Modulos/`

4. **Main MOC** (`MaryJaneIA.md`):
   - Update the "Estado" field in the project info table when phase changes.
   - Update the implementation phases table statuses.
   - Update "Próximos Pasos" when priorities change.

## Formatting rules for Obsidian files

- Always include frontmatter with `created` date and `tags` array.
- Use the appropriate `mj/*` tag for the file type (see tag table in MaryJaneIA.md).
- Always include the breadcrumb navigation: `◀ [[../MaryJaneIA|MaryJaneIA]]`
- Always include the return link at the bottom: `[[../MaryJaneIA|⬅ Volver al Índice del Proyecto]]`
- Use wikilinks `[[...]]` for internal links between Obsidian files.
- Use Mermaid diagrams for visual architecture documentation.

## When NOT to update docs

- Fixing typos or formatting in code
- Running commands (install, build, dev)
- Minor CSS adjustments
- Debugging sessions (unless the fix reveals an architectural issue)
<!-- END:obsidian-sync-rules -->
