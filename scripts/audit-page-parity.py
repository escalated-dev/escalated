"""Which Inertia pages do the backends render that the frontend does not have?

Run it with the backend checkouts beside this repo:

    python scripts/audit-page-parity.py

Set ESCALATED_ROOT to the directory holding them if they live elsewhere.
Exits non-zero when a backend renders a page this repo cannot resolve.

A backend rendering a page the frontend has no component for is not an error --
Inertia resolves nothing and the panel comes up blank. Status 200, tests green,
empty screen. The only way to see it is to compare the two lists.
"""
import os
import re
import sys

# The sibling checkouts: every Escalated repo lives beside this one. Set
# ESCALATED_ROOT if they are somewhere else.
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.environ.get('ESCALATED_ROOT') or os.path.dirname(HERE)
FRONTEND = HERE

# Every sibling repo, not a hand-kept list. A hardcoded one silently skipped
# escalated-laravel-mobile-api, which renders page names like any other backend.
SUFFIXES = ('.php', '.rb', '.py', '.ts', '.js', '.ex', '.exs', '.go', '.cs', '.java', '.dart')


SKIP_DIRS = {
    '.git', 'node_modules', 'vendor', 'build', 'dist', '_build', 'deps',
    'obj', 'bin', '.gradle', 'target', 'coverage', '__pycache__', 'tmp',
}

PAGE = re.compile(r"""['"`](Escalated/[A-Za-z0-9/_]+)['"`]""")


def walk(root, suffixes):
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for name in files:
            if name.endswith(suffixes):
                yield os.path.join(base, name)


def backend_repos():
    """Every Escalated repo beside this one, this one excepted."""
    if not os.path.isdir(ROOT):
        return []

    return sorted(
        name for name in os.listdir(ROOT)
        if name.startswith('escalated-')
        and os.path.isdir(os.path.join(ROOT, name))
        # .git is a directory in a clone and a file in a worktree; skipping
        # the file form silently dropped escalated-laravel-mobile-api, which
        # renders page names like any other backend.
        and os.path.exists(os.path.join(ROOT, name, '.git'))
    )


def rendered_pages():
    """page name -> set of repos that render it."""
    found = {}

    for repo in backend_repos():
        root = os.path.join(ROOT, repo)
        label = repo.replace('escalated-', '')

        for path in walk(root, SUFFIXES):
            try:
                source = open(path, encoding='utf-8', errors='ignore').read()
            except OSError:
                continue

            for page in PAGE.findall(source):
                found.setdefault(page, set()).add(label)

    return found


def frontend_pages():
    """Every page component the frontend ships, as an Escalated/... name."""
    pages = set()
    root = os.path.join(FRONTEND, 'src', 'pages')

    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for name in files:
            if not name.endswith('.vue'):
                continue

            rel = os.path.relpath(os.path.join(base, name), root)
            pages.add('Escalated/' + rel[:-4].replace(os.sep, '/'))

    return pages


def main():
    rendered = rendered_pages()
    shipped = frontend_pages()

    missing = sorted(p for p in rendered if p not in shipped)
    unused = sorted(p for p in shipped if p not in rendered)

    print('backends render %d distinct pages; the frontend ships %d\n' % (len(rendered), len(shipped)))

    print('=' * 74)
    print('RENDERED BY A BACKEND, NOT IN THE FRONTEND  (blank screen)')
    print('=' * 74)

    for page in missing:
        print('  %-52s %s' % (page, ', '.join(sorted(rendered[page]))))

    if not missing:
        print('  none')

    print()
    print('=' * 74)
    print('IN THE FRONTEND, RENDERED BY NO BACKEND  (unreachable, or named differently)')
    print('=' * 74)

    for page in unused:
        print('  %s' % page)

    if not unused:
        print('  none')

    return 1 if missing else 0


if __name__ == '__main__':
    sys.exit(main())
