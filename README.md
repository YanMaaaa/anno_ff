# VidaForge review materials

This repository contains our annotation audits and VBench video comparisons. Open the section for the reviewer question you want to check.

<details>
<summary><strong>DuHq W1 / Q1: What does the early VBench score difference mean?</strong></summary>

## Question

Does Mixed's roughly 0.9 advantage over Selected in VBench Total correspond to visible differences in early video generation? Sec. 4.2 describes this training stage. Fig. 16 and Tab. 13 give the scores for each dimension.

## Where the difference comes from

Using VBench's official weights, Imaging Quality and Aesthetic Quality contribute 0.464 of the 0.894 Total difference, or 51.9%. Subject Consistency, Background Consistency, Temporal Flickering, and Motion Smoothness contribute another 0.318, or 35.5%. The per-dimension calculation is in [data/total_difference.json](vbench/data/total_difference.json).

## Video selection and review

We selected two groups with large score gaps for each of these six dimensions: one favoring Mixed and one favoring Selected. For each direction, we chose the largest gap among prompts not already selected, using a fixed training seed. The 12 groups include four cases from each of three training seeds. Each group compares Mixed, Selected, and Rejected videos from the same prompt.

Each video has 49 frames at 16 fps. We include the original videos and timestamped 7×7 grids showing every frame.

One author watched the videos and made three pairwise comparisons on each group's selected dimension. DeepSeek V4.1 Flash, GPT-6.1-Terra, and GPT-6-Astra each reviewed the full-frame grids. The models received anonymous A/B/C labels and no VBench scores or generation prompts. The [judge prompt](vbench/judge_prompt.md) defines the six dimensions and allows ties and unjudgeable cases.

## Results

The A/B/C judgments are complete.

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
| Case definitions and relative media paths | [data/manifest.json](vbench/data/manifest.json) |
| Author's 36 pairwise answers | [data/human.json](vbench/data/human.json), [CSV](vbench/data/human_pairs.csv) |
| Three models' 216 dimension rankings, with comparison notes for each selected dimension | [data/models.json](vbench/data/models.json) |
| Per-case comparison and counts | [data/summary.json](vbench/data/summary.json), [CSV](vbench/data/comparisons.csv) |
| Read-only viewer | [index.html](vbench/index.html) |

In the viewer, you can play the videos and enlarge the frame grids, then read the author's answers and the models' rankings and English comparison notes. Recipe names and judgments are hidden at first; you can open them separately.

From the repository root, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000/vbench/ for VBench or http://localhost:8000/ for annotation audits. No extra packages or API key are needed. Keep the terminal open while browsing and press `Ctrl+C` to stop.

</details>

<details>
<summary><strong>DuHq W2 / Q2: Camera, Caption, and Tag annotation quality</strong></summary>

<!-- ANNOTATION_AUDIT_START -->
We audit VidaForge's Camera, Caption, and Tag annotations. For each audit, we share timestamped thumbnails for the 100 clips reviewed by an author and full item-level results for all 1,000 clips. The read-only viewer shows the thumbnails beside the annotations and judgments.

We check whether annotations match the video and cover its main content. On CAPability [1], we evaluate L0 to L3 captions and compare captions with and without Camera metadata to test the caption levels and the effect of Camera input.

## 1. Annotation schemas

Each VidaForge-3M clip has three types of annotations. The paper's appendices give their full definitions and generation prompts.

| Annotation | Content | Schema | Generation prompt |
| --- | --- | --- | --- |
| Camera | Structured labels for camera motion, steadiness, rotation, translation, zoom, and related properties | Appendix C.1 | Appendix D.1 |
| Caption | Four levels, L0–L3, from a short summary to a detailed description | Appendix C.2 | Appendix D.2 |
| Tag | Seven fields: domain, scene, subjects, actions, style, text, and watermark | Appendix C.3 | Appendix D.3 |

We use Gemma-4-E4B-it for Camera and Qwen3.6-27B-FP8 for Caption and Tag.

Each caption level adds detail. L0 summarizes the main subject, action, and scene. L1 describes the event sequence briefly. L2 adds temporal changes, subject relations, and background. L3 gives a more detailed account of the content and camera behavior.

## 2. Audit samples

Camera and Caption share 1,000 clips, covering all 78 Camera field and label combinations. We sample 30 clips per combination, include all available clips for combinations with fewer than 30, and randomly fill the set to 1,000 unique clips. Tag uses a separate set of 1,000 clips, covering all 65 label categories with at least 10 examples per category.

For the 100-clip human review sets, Camera sampling covers different labels and cases where the models agree or disagree. Caption uses random sampling. Tag includes both normal cases and cases flagged for possible errors or omissions.

## 3. Human review and model-assisted extension

For each annotation type, an author familiar with the project reviewed 100 clips, and GPT-6-Astra reviewed the remaining 900. We first tried training reviewers without a video-pipeline background. The camera-motion and caption-level rules required substantial training, so we chose an author for the human review.

Reviewers check the annotations against timestamped thumbnails of the full clip, viewed in time order. Camera review uses frames sampled at 8 fps; Caption and Tag review use 4 fps.

## 4. Review rules

For Camera, we check each label against the video. For example, a rightward camera-translation label requires visible evidence of that movement. Each judgment is marked *supported*, *incorrect*, or *uncertain*.

$$
\text{Support rate}=\frac{N_{\text{supported}}}{N_{\text{supported}}+N_{\text{incorrect}}}\times100\%
$$

Items with insufficient visual evidence are marked uncertain. We report their counts and exclude them from the support-rate denominator.

For Tag, we check existing labels in all seven fields and also look for missing main subjects and actions. We report label support and the share of clips with major omissions.

We evaluate Caption in two ways:

- On the public benchmark, we use CAPability's official questions, reference answers, and scoring procedure to test whether the L0 to L3 schema adds information at each level and how Camera input affects captions.
- For videos from VidaForge-3M, we follow CAPability's evaluation framework. DeepSeek drafts rubric questions and reference answers for action, event, camera movement, and object count. We check them against the video before assessing caption correctness and coverage.

Each eligible question receives a score of $+1$, $0$, or $-1$. Let their counts be $N_{+1}$, $N_0$, and $N_{-1}$:

$$
\text{Precision}=\frac{N_{+1}}{N_{+1}+N_{-1}}\times100\%
$$

$$
\text{Coverage}=\frac{N_{+1}}{N_{+1}+N_0+N_{-1}}\times100\%
$$

A score of $+1$ means a correct answer. The rules for $0$ and $-1$ depend on the dimension. For Action, we follow CAPability:

| Action description in the caption | Score |
| --- | ---: |
| Correctly describes the target action | +1 |
| Describes other actions but omits the target action | −1 |
| Describes no actions | 0 |

We compute each metric for each dimension, then average the four dimensions equally:

$$
\text{Overall metric}=\frac{M_{\text{Action}}+M_{\text{Event}}+M_{\text{Camera}}+M_{\text{Count}}}{4}
$$

## 5. Camera results

We audit the Gemma-4-E4B-it Camera labels used in VidaForge-3M and compare them with Qwen3.6-27B-FP8 labels for the same clips.

| Review scope | Gemma-4-E4B-it support rate | Qwen3.6-27B-FP8 support rate |
| --- | ---: | ---: |
| 100 clips: human review | 73.90% | 79.05% |
| 1,000 clips: 100 human + 900 GPT-6-Astra | 76.33% | 77.45% |

The human and extended audits both find visual support for about three quarters of Camera labels, direct evidence of their semantic quality.

## 6. Tag results

We check whether existing labels match the video. We also check whether the two multi-label fields, subjects and actions, miss any main content.

| Review scope | Label support rate | Clips with a missing main subject or action |
| --- | ---: | ---: |
| 100 clips: human review | 93.27% | 29.0% |
| 1,000 clips: 100 human + 900 GPT-6-Astra | 95.55% | 26.0% |

A clip counts as having an omission if either subjects or actions misses at least one main item.

Existing tags have high visual support. In most clips, both multi-label fields cover the main subjects and actions.

## 7. CAPability: evaluating the multi-level caption schema

CAPability [1] measures caption correctness and thoroughness. We use its official repository's video evaluation procedure to test whether the L0 to L3 schema adds accurate, useful information as captions become more detailed. Appendix C.2 and D.2 define the levels and generation prompts.

We compare captions from Qwen3.6-27B-FP8 and GPT-6-Luna, using the same multi-level generation prompt and Camera metadata. GPT-6.1-Terra scores both with the official evaluation prompts.

| Level | Qwen Precision | Qwen Coverage | GPT-6-Luna Precision | GPT-6-Luna Coverage |
| --- | ---: | ---: | ---: | ---: |
| L0 | 47.35% | 18.07% | 51.00% | 16.00% |
| L1 | 47.49% | 33.28% | 49.95% | 36.65% |
| L2 | 50.38% | 37.99% | 54.54% | 41.31% |
| L3 | 51.97% | 41.19% | 55.30% | 42.41% |

Precision and coverage generally increase from L0 to L3. These results support adding detail while maintaining correctness. Qwen's overall performance is close to GPT-6-Luna's.

## 8. Caption quality on videos from VidaForge-3M

We evaluate the correctness and coverage of L3, our most detailed captions, generated by Qwen with Camera metadata.

| Review scope | Precision | Coverage |
| --- | ---: | ---: |
| 100 clips: human review | 90.83% | 81.29% |
| 1,000 clips: 100 human + 900 GPT-6-Astra | 89.82% | 79.35% |

In both audits, L3 captions score highly on correctness and cover most of the content asked about in the evaluation questions.

## 9. How Camera input affects captions

We keep the Qwen model and multi-level prompt fixed and change only whether Camera labels are supplied as extra information. We compare L3 correctness and coverage across all four dimensions.

### 9.1 CAPability

| Dimension | Precision without Camera | Precision with Camera | Coverage without Camera | Coverage with Camera |
| --- | ---: | ---: | ---: | ---: |
| Action | 55.06% | 54.66% | 55.06% | 54.66% |
| Event | 78.20% | 78.59% | 47.89% | 48.29% |
| Camera movement | 38.11% | 47.21% | 34.81% | 46.78% |
| Object count | 27.57% | 27.42% | 14.69% | 15.04% |
| **Four-dimension average** | **49.73%** | **51.97%** | **38.11%** | **41.19%** |

Camera input improves precision and coverage for camera descriptions and raises the four-dimension averages. Changes in the other dimensions are small.

### 9.2 Videos from VidaForge-3M

For each clip, we use identical verified questions to evaluate captions with and without Camera input.

| Dimension | Precision without Camera | Precision with Camera | Coverage without Camera | Coverage with Camera |
| --- | ---: | ---: | ---: | ---: |
| Action | 78.60% | 78.61% | 78.46% | 78.28% |
| Event | 95.80% | 95.85% | 79.75% | 78.82% |
| Camera movement | 92.35% | 86.30% | 62.46% | 69.08% |
| Object count | 98.32% | 98.51% | 91.36% | 91.23% |
| **Four-dimension average** | **91.27%** | **89.82%** | **78.01%** | **79.35%** |

Captions without Camera input already have high precision on these clips. Adding Camera input increases coverage of camera details but reduces precision for those details. The other dimensions change little. Overall, coverage rises and precision falls.

### 9.3 Video properties and interpretation

| Property | CAPability | VidaForge-3M audit clips |
| --- | ---: | ---: |
| Mean duration | 16.84 s | 5.55 s |
| Maximum duration | 433.73 s | 10.00 s |

CAPability includes longer videos and more complex counting and directional camera-motion questions. The VidaForge-3M audit videos have been split into clips of at most 10 seconds, and static cameras are more common.

Task difficulty may help explain this pattern. Harder videos may benefit more from explicit camera information, while adding camera detail to simpler clips creates more opportunities for error.

These results support using Camera metadata to cover more camera information. The caption audit also finds high overall correctness in captions generated with Camera input.

## 10. Audit materials

Each JSON file contains all 1,000 reviewed samples with their annotations, judgments, evidence, and summary statistics. Each audit also includes images for the 100 samples reviewed by an author.

| Audit | Full results | Thumbnails for 100 samples |
| --- | --- | --- |
| Camera | [data/camera.json](data/camera.json) | [images/camera/](images/camera/) |
| Caption | [data/caption.json](data/caption.json) | [images/caption/](images/caption/) |
| Tag | [data/tag.json](data/tag.json) | [images/tag/](images/tag/) |

Camera and Caption share sample numbers; Tag uses its own numbering.

Caption records contain both L3 variants, rubric questions, reference judgments, and scores. Tag records include both existing-label checks and subject/action omission checks. Camera records contain both Gemma and Qwen judgments.

### Run the viewer locally

1. Download this repository as a ZIP from the anonymous repository page and extract it, including the `data/` and `images/` folders.
2. Open a terminal in the extracted folder containing `index.html`. With Python 3 installed, run:

   ```bash
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

   On Windows, use `py -3 -m http.server 8000 --bind 127.0.0.1`.
3. Open http://localhost:8000/ in your browser. Keep the terminal open while browsing; press `Ctrl+C` to stop the server.

The viewer needs no additional packages or API key. Use the local URL above so it can load the JSON files and thumbnails.

By default, the viewer opens the 100 samples with thumbnails. Switch between Camera, Caption, and Tag, select a sample, or use Previous / Next. Choose All 1,000 records to browse the extended audit. Camera labels can be viewed for either model; Caption displays both L3 variants and their paired judgments. Click Open full-size below a thumbnail to see the original image.
<!-- ANNOTATION_AUDIT_END -->

</details>

## References

[1] Liu, Zhihang, et al. “CAPability: A Comprehensive Visual Caption Benchmark for Evaluating Both Correctness and Thoroughness.” NeurIPS, 2025.
