---
layout: default
---

[Leaflet Routing Machine / Here](https://github.com/trailbehind/lrm-Here)
================================

Download prebuilt files:

<ul>
{% for version in site.data.versions reversed %}
  <li>
    <a href="{{site.baseurl}}/dist/lrm-here-{{ version.version }}.js">
      lrm-here-{{ version.version }}.js
    </a>
    (<a href="{{site.baseurl}}/dist/lrm-here-{{ version.version }}.min.js">
      lrm-here-{{ version.version }}.min.js
    </a>)
  </li>
{% endfor %}
</ul>

Just load one of these files with a `<script>` tag in your page, after
Leaflet and Leaflet Routing Machine has been loaded.

Or, to use with for example Browserify:

```sh
npm install --save lrm-graphhopper
```

See the [lrm-here project page](https://github.com/trailbehind/lrm-Here) for info 
and docs on using the plugin.
