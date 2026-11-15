# VBench visual comparison

## Question

Does Mixed's roughly 0.9 advantage over Selected in VBench Total correspond to visible differences in early video generation? Sec. 4.2 describes this training stage. Fig. 16 and Tab. 13 give the scores for each dimension.

## Where the difference comes from

Using VBench's official weights, Imaging Quality and Aesthetic Quality contribute 0.464 of the 0.894 Total difference, or 51.9%. Subject Consistency, Background Consistency, Temporal Flickering, and Motion Smoothness contribute another 0.318, or 35.5%. The per-dimension calculation is in [data/total_difference.json](data/total_difference.json).

## Video selection and review

We selected two groups with large score gaps for each of these six dimensions: one favoring Mixed and one favoring Selected. For each direction, we chose the largest gap among prompts not already selected, using a fixed training seed. The 12 groups include four cases from each of three training seeds. Each group compares Mixed, Selected, and Rejected videos from the same prompt.

Each video has 49 frames at 16 fps. We include the original videos and timestamped 7×7 grids showing every frame.

One author watched the videos and made three pairwise comparisons on each group's selected dimension. DeepSeek V4.1 Flash, GPT-6.1-Terra, and GPT-6-Astra each reviewed the full-frame grids. The models received anonymous A/B/C labels and no VBench scores or generation prompts. The [judge prompt](judge_prompt.md) defines the six dimensions and allows ties and unjudgeable cases.

## Results

The A/B/C judgments are complete. Recipe and score assignments for cases 02, 05, 08, and 12 still need confirmation; the counts below use the current assignments.

| Reviewer | Same direction as VBench | No clear difference | Opposite direction | Unable to judge |
| --- | ---: | ---: | ---: | ---: |
| Author | 6 | 5 | 1 | 0 |
| DeepSeek V4.1 Flash | 6 | 4 | 2 | 0 |
| GPT-6.1-Terra | 6 | 2 | 3 | 1 |
| GPT-6-Astra | 5 | 7 | 0 | 0 |

The counts compare Mixed and Selected on each case's selected dimension. A tie means the reviewer saw no clear difference. The counts describe these examples, chosen for large score gaps in both directions.

## Files and viewer

| Material | File |
| --- | --- |
| Case definitions and relative media paths | [data/manifest.json](data/manifest.json) |
| Author's 36 pairwise answers | [data/human.json](data/human.json), [CSV](data/human_pairs.csv) |
| Three models' 216 dimension rankings, with comparison notes for each selected dimension | [data/models.json](data/models.json) |
| Per-case comparison and counts | [data/summary.json](data/summary.json), [CSV](data/comparisons.csv) |
| Read-only viewer | [index.html](index.html) |

In the viewer, you can play the videos and enlarge the frame grids, then read the author's answers and the models' rankings and English comparison notes. Recipe names and judgments are hidden at first; you can open them separately.

From the repository root, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000/vbench/ for VBench or http://localhost:8000/ for annotation audits. No extra packages or API key are needed. Keep the terminal open while browsing and press `Ctrl+C` to stop.
