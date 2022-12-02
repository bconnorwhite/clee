# Design Decisions

## Flag Separators
- Flags must have an `=` or space separator:
```
-f=value
-f value
```
This format adds extra parsing complexity, and is cursed anyways:
```
-fvalue
```
