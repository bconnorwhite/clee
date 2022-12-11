# ls

A simple `ls` implementation using clee.

## Help

`yarn ls -h`

```
    __    
   / /____
  / / ___/
 / (__  ) 
/_/____/  
          

List directory contents

Usage: ls [options] [path]

Arguments:
  [path]         The path to the directory to list.

Options:
  -a, --all      Include directory entries whose names begin with a dot.
  -l, --long     List files in the long format.
  -r, --reverse  Reverse the order of the sort.
  -v, --version  Display version
  -h, --help     Display help for command
```

## List

`yarn ls`

```
README.md    node_modules package.json source       yarn.lock
```

## List All

`yarn ls -a`

```
.gitignore   README.md    node_modules package.json source       yarn.lock
```

## List Long

`yarn ls -l`

```
- README.md
d node_modules
- package.json
d source
- yarn.lock
```

## List Long, All, Reverse

`yarn ls -lar`

```
- yarn.lock
d source
- package.json
d node_modules
- README.md
- .gitignore
```

## Version

`yarn ls -v`

```
1.0.0
```
