# VBench Visual Comparison

## Question

Does the roughly 0.9 VBench Total advantage of Mixed over Selected correspond to visible differences in early video generation? Sec. 4.2 describes the early training stage; Fig. 16 and Tab. 13 report the dimension scores.

## Where the difference comes from

Using VBench's official weights, Imaging Quality and Aesthetic Quality contribute 0.464 of the 0.894 Total difference, or 51.9%. Subject Consistency, Background Consistency, Temporal Flickering, and Motion Smoothness contribute another 0.318, or 35.5%. The per-dimension calculation is in [data/total_difference.json](data/total_difference.json).

## Video selection and review

For each of these six dimensions, we selected two groups with large score gaps: one favoring Mixed and one favoring Selected. The selection used the largest gap in each direction among unused prompts for a fixed training seed. The 12 groups contain four cases from each of three training seeds. Each group compares Mixed, Selected, and Rejected videos from the same prompt.

Each video has 49 frames at 16 fps. All frames appear in a timestamped 7×7 grid. The original videos are also included.

One author watched the videos and answered three pairwise questions on each group's selected dimension. DeepSeek V4.1 Flash, GPT-6.1-Terra, and GPT-6-Astra each reviewed the full-frame grids. The models received anonymous A/B/C labels and no VBench scores or generation prompts. The [judge prompt](judge_prompt.md) defines the six dimensions and allows ties and unjudgeable cases.

## Results

Recipe and score assignments for cases 02, 05, 08, and 12 are awaiting confirmation. The saved A/B/C judgments are complete; the following counts use the current assignments.

| Reviewer | Same direction as VBench | No clear difference | Opposite direction | Unable to judge |
| --- | ---: | ---: | ---: | ---: |
| Author | 6 | 5 | 1 | 0 |
| DeepSeek V4.1 Flash | 6 | 4 | 2 | 0 |
| GPT-6.1-Terra | 6 | 2 | 3 | 1 |
| GPT-6-Astra | 5 | 7 | 0 | 0 |

Each row compares Mixed and Selected on the dimension used to select each case. A tie means that no clear difference was seen. The cases were selected to inspect large score differences in both directions, so these counts describe the selected examples.

## Files and viewer

| Material | File |
| --- | --- |
| Case definitions and relative media paths | [data/manifest.json](data/manifest.json) |
| Author's 36 pairwise answers | [data/human.json](data/human.json), [CSV](data/human_pairs.csv) |
| Three models' 216 dimension rankings, with comparison notes for each selected dimension | [data/models.json](data/models.json) |
| Per-case comparison and counts | [data/summary.json](data/summary.json), [CSV](data/comparisons.csv) |
| Read-only viewer | [index.html](index.html) |

The viewer shows video playback, full-frame grids, author answers, model rankings, and English comparison notes. Recipe names and judgments start hidden and can be opened separately.

From the repository root, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://localhost:8000/vbench/** for VBench or **http://localhost:8000/** for annotation audits. No extra packages or API key are needed. Keep the terminal open while browsing and press `Ctrl+C` to stop.
