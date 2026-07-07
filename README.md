# pi-request-dump-extension

A [pi](https://github.com/earendil-works/pi) package that dumps request context for debugging.

It writes three kinds of JSON files for each prompt/request:

- `*-user-prompt-raw.json`: top-level user prompt, images, system prompt, system-prompt build options, and active session branch entries.
- `*-raw-llm-context.json`: pi's logical LLM context immediately before provider serialization.
- `*-provider-payload.json`: final provider-specific payload sent to the LLM provider.

By default, dumps are written under the current project:

```text
.pi/request-dumps/
```

## Install

From npm:

```bash
pi install npm:pi-request-dump-extension
```

For a single run:

```bash
pi -e npm:pi-request-dump-extension
```

From a local checkout:

```bash
pi -e /path/to/pi-request-dump-extension
```

## Configuration

Set `PI_REQUEST_DUMP_DIR` to override the dump directory. Relative paths are resolved from pi's current working directory.

```bash
PI_REQUEST_DUMP_DIR=/tmp/pi-request-dumps pi -e npm:pi-request-dump-extension
```

## Security

The dump files can contain full prompts, project instructions, tool outputs, file contents, and provider payloads. Treat them as sensitive data and do not commit them accidentally.
