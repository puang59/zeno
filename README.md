# zeno

zeno is a terminal-native coding agent that runs on your machine and uses your local codebase, files, Git history, and development tools to investigate and work on your projects.

## TODO

### Tools

zeno's capabilities are built around small tools that the agent can call when needed.

#### FileSystem - Core

##### Read-only

- [x] `list_files` - list files and directories
- [x] `read_file` - read the contents of a file
- [x] `search_files` - search files for matching text or patterns
- [x] `file_exists` - check whether a file or directory exists
- [x] `get_file_info` - get file size, type, modification time, etc.

##### Write

- [x] `write_file` - write or replace the contents of a file
- [x] `delete_file` - delete a file
- [ ] `move_file` - move a file to a new location
- [ ] `create_directory` - create a new directory

### Git

- [ ] `git_status` - get the current working tree status
- [ ] `git_diff` - get changes in the working tree
- [ ] `git_diff_file` - get changes for a specific file
- [ ] `git_log` - view commit history
- [ ] `git_show` - inspect a specific commit
- [ ] `git_blame` - find who changed each line and when
- [ ] `git_branch` - get the current branch
- [ ] `git_list_branches` - list local and remote branches
- [ ] `git_show_commit` - inspect the details of a specific commit

### Code Intelligence

- [ ] `find_definition` - find where a symbol is defined
- [ ] `find_references` - find where a symbol is used
- [ ] `find_imports` - find files importing a module or symbol
- [ ] `find_exports` - find files exporting a module or symbol
- [ ] `find_symbol` - find a symbol across the codebase

### Terminal

- [ ] `run_command` - execute a shell command
- [ ] `run_tests` - run the project's test suite
- [ ] `run_build` - run the project's build process
- [ ] `run_linter` - run the project's linter

### Package & Dependencies

- [ ] `get_package_info` - inspect project package information
- [ ] `list_dependencies` - list project dependencies
- [ ] `find_dependency` - find where a dependency is used
- [ ] `get_dependency_version` - get the installed version of a dependency

### Project & Environment

- [ ] `get_project_root` - find the root directory of the project
- [ ] `get_current_directory` - get the current working directory
- [ ] `get_os_info` - get operating system and architecture information
- [ ] `get_runtime_version` - get runtime versions such as Node, Bun, or Python
- [ ] `get_environment_info` - inspect the development environment

### Terminal Context

- [ ] `get_last_command` - get the most recently executed command
- [ ] `get_command_output` - get output from a previous command
- [ ] `get_terminal_history` - inspect recent terminal command history

### Documentation & Project Context

- [ ] `find_readme` - find README and documentation files
- [ ] `read_documentation` - read project documentation
- [ ] `find_config` - find relevant project configuration files
- [ ] `find_env_example` - find example environment configuration files

### Web & External Information

- [ ] `web_search` - search the web for relevant information
- [ ] `fetch_url` - fetch content from a URL
- [ ] `search_documentation` - search documentation for a library or framework

### Safety & Agent Control

- [ ] `request_permission` - request permission before sensitive actions
- [ ] `confirm_action` - ask the user to confirm an action
- [ ] `show_diff` - show proposed file changes before applying them
- [ ] `rollback_changes` - revert changes made by the agent
