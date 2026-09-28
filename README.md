# RoboChrono project page

A static research website for **RoboChrono: A Real Robot Benchmark for Streaming Task Understanding**.

This edition builds on the original [li-zzmm/robochrono](https://github.com/li-zzmm/robochrono) project page and its recordings. The public website source is maintained in [continuity3/robochrono](https://github.com/continuity3/robochrono). The website’s GitHub entries link to the benchmark repository, [mfan-res/ROBOCHRONO](https://github.com/mfan-res/ROBOCHRONO). The public preprint is hosted in the benchmark repository: [read the paper](https://github.com/mfan-res/ROBOCHRONO/blob/main/docs/paper/RoboChrono.pdf).

## Preview locally

From the repository directory, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765. No installation or build step is required. The site also supports opening `index.html` directly; clipboard access may require the local server or manual copying.

## Content and assets

- `index.html`: paper summary, authors, affiliations, capabilities, findings, and citation.
- `styles.css`: white visual theme, responsive layout, and reduced-motion styles.
- `script.js`: Tianji/GIM hero preview switching, embodiment tabs, continuous video gallery, visibility-aware videos, motion controls, video/figure dialogs, and citation copying.
- `assets/brands/`: supplied Tianji, GIM, and Shenzhen University marks, displayed in that order. The Tianji SVG frames an embedded, unchanged original image; the Shenzhen University SVG is extracted from the supplied Illustrator artwork.
- `assets/figures/`: figures from the public preprint and supplied figure PDFs. The overview and capability chart use the final public-version figures, with provenance and companion results data. SVG text is outlined so it renders without external fonts.
- `assets/paper/robochrono.pdf`: a matching local copy of the public preprint. The three visible Paper entries use the canonical GitHub PDF link.
- `assets/videos/`: original repository recordings; Stack Cubes previews are already encoded at 2× speed. The Tianji hero excerpt uses seconds 16–34 of `stack-cubes-tianji-2x.mp4`, preserving its 2× speed. The hero defaults to Tianji and can switch to the existing 20-second `stack-cubes-gim-main-2x.mp4` recording using the thumbnail tabs below the video.
- `assets/images/gim-hero.jpg`: GIM preview thumbnail extracted at 6 seconds from the original Stack Cubes recording.
- `assets/videos/gallery/`: trimmed, silent web previews from `yyyyywv/egocentric`, with posters and a per-clip source manifest. Gallery excerpts play at their original speed and are attributed under CC BY-NC 4.0.

The author list follows the supplied author screenshot, with Shihao Li placed after Yiyang Ma. The first seven authors are marked as equal contributors; Zhuo Xu, Long Chen, and Ruoxiang Li are marked as corresponding authors. Affiliations incorporate the author-requested updates: Yuzhou Wu lists Tianji Tec. and Shenzhen University; Longteng Fan, Shihao Li, Yifan Wu, Zichen Zhang, Ruiqi Yang, Weibin Kong, Yihang Xu, Haoran Liu, Tao Xu, Zhuo Xu, and Long Chen list General Intelligence Machine only.

Displayed results are scoped to the manuscript's reported evaluation. Model coverage and aggregation differ; the visual-evidence ablation uses five open-weight models on a balanced subset of 312 stems.

## GitHub Pages

The publication target is [continuity3.github.io/robochrono](https://continuity3.github.io/robochrono/). In the [repository Pages settings](https://github.com/continuity3/robochrono/settings/pages), select **Deploy from a branch**, then **main** and **/ (root)**. The root contains `.nojekyll` and uses repository-relative asset paths, so no build step is required. The absolute social-image and citation URLs in `index.html` use this target.

The displayed `model-capabilities-public.svg` comes from the public preprint’s corrected Figure 4 and matches all 18 models / 180 reported values in its Table 3. Its companion JSON preserves the reported group scores. `benchmark-overview-public.png` uses the public preprint’s causal-evaluation overview; earlier source figures remain archived in the assets.

The dataset entries list [Tianji Dataset (gimai/RC-Tianji)](https://huggingface.co/datasets/gimai/RC-Tianji) first, followed by [GIM Dataset (gimai/RC-GIM)](https://huggingface.co/datasets/gimai/RC-GIM), in both the hero and resources sections. GitHub entries link to the benchmark repository, [mfan-res/ROBOCHRONO](https://github.com/mfan-res/ROBOCHRONO). All three Paper entries open the public preprint in the benchmark repository. The public website source repository remains available separately.

## Browser checks

Verified in Chrome at 320, 390, 768, 1024, and 1440 px widths, including keyboard tab switching, image dialogs, citation copying, video playback controls, reduced motion, and readable content without JavaScript.
