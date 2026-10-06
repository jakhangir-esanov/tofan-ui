# ast-index Rules

## Mandatory Search Rules

1. **ALWAYS use ast-index FIRST** for any code search task
2. **NEVER duplicate results**: if ast-index found usages/implementations, that IS the complete answer
3. **DO NOT run grep "for completeness"** after ast-index returns results
4. **Use grep/Search ONLY when:**
   - ast-index returns empty results
   - Searching for regex patterns (ast-index uses literal match)
   - Searching for string literals inside code (`"some text"`)
   - Searching in comments content

## Command Reference

| Task | Command |
|------|---------|
| Universal search | `ast-index search "query"` |
| Find class/component | `ast-index class "ComponentName"` |
| Find symbol | `ast-index symbol "SymbolName"` |
| Find usages | `ast-index usages "SymbolName"` |
| Find implementations | `ast-index implementations "Interface"` |
| Call hierarchy | `ast-index call-tree "function" --depth 3` |
| Find callers | `ast-index callers "functionName"` |
| Module deps | `ast-index deps "module-name"` |
| File outline | `ast-index outline "file.ts"` |

## Index Management

- `ast-index rebuild`: full reindex (run once after clone)
- `ast-index update`: after git pull/merge
- `ast-index stats`: show index statistics
