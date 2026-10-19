---
# Every folder in content/sketches/ is one sketch (a "page bundle") in the "sketches" section.
# This _index.md is the section's own page, at /sketches/.
title: "Sketches"

# "cascade" passes these settings down to every page in this section.
# publishResources: false means only images a template actually uses get published,
# so e.g. multi-MB gallery originals aren't copied to the site, only Hugo's resized versions.
cascade:
  build:
    publishResources: false
---
