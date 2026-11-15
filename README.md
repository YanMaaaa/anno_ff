# VidaForge Review Materials

This repository contains the annotation audits and VBench video comparisons discussed in our responses. Open the section for the relevant reviewer question.

<details>
<summary><strong>DuHq W1 / Q1: What does the early VBench score difference mean?</strong></summary>

## Question

Does the roughly 0.9 VBench Total advantage of Mixed over Selected correspond to visible differences in early video generation? Sec. 4.2 describes the early training stage; Fig. 16 and Tab. 13 report the dimension scores.

## Where the difference comes from

Using VBench's official weights, Imaging Quality and Aesthetic Quality contribute 0.464 of the 0.894 Total difference, or 51.9%. Subject Consistency, Background Consistency, Temporal Flickering, and Motion Smoothness contribute another 0.318, or 35.5%. The per-dimension calculation is in [data/total_difference.json](vbench/data/total_difference.json).

## Video selection and review

For each of these six dimensions, we selected two groups with large score gaps: one favoring Mixed and one favoring Selected. The selection used the largest gap in each direction among unused prompts for a fixed training seed. The 12 groups contain four cases from each of three training seeds. Each group compares Mixed, Selected, and Rejected videos from the same prompt.

Each video has 49 frames at 16 fps. All frames appear in a timestamped 7×7 grid. The original videos are also included.

One author watched the videos and answered three pairwise questions on each group's selected dimension. DeepSeek V4.1 Flash, GPT-6.1-Terra, and GPT-6-Astra each reviewed the full-frame grids. The models received anonymous A/B/C labels and no VBench scores or generation prompts. The [judge prompt](vbench/judge_prompt.md) defines the six dimensions and allows ties and unjudgeable cases.

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
| Case definitions and relative media paths | [data/manifest.json](vbench/data/manifest.json) |
| Author's 36 pairwise answers | [data/human.json](vbench/data/human.json), [CSV](vbench/data/human_pairs.csv) |
| Three models' 216 dimension rankings, with comparison notes for each selected dimension | [data/models.json](vbench/data/models.json) |
| Per-case comparison and counts | [data/summary.json](vbench/data/summary.json), [CSV](vbench/data/comparisons.csv) |
| Read-only viewer | [index.html](vbench/index.html) |

The viewer shows video playback, full-frame grids, author answers, model rankings, and English comparison notes. Recipe names and judgments start hidden and can be opened separately.

From the repository root, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://localhost:8000/vbench/** for VBench or **http://localhost:8000/** for annotation audits. No extra packages or API key are needed. Keep the terminal open while browsing and press `Ctrl+C` to stop.

</details>

<details>
<summary><strong>DuHq W2 / Q2: Camera, Caption, and Tag annotation quality</strong></summary>

<!-- ANNOTATION_AUDIT_START -->
This repository shares quality audits of **Camera, Caption, and Tag** annotations in VidaForge. The materials include timestamped thumbnails for the 100 author-reviewed clips in each audit and full item-level results for all 1,000 clips per audit. A read-only viewer displays the thumbnails alongside annotations and review results.

We check whether annotations match the video and cover its main content. We also evaluate **L0–L3 captions on CAPability [1]** and compare captions with and without Camera metadata to assess the caption levels and the role of Camera input.

## 1. Annotation schemas

VidaForge-3M provides three types of annotations for each clip. Full definitions and generation prompts appear in the paper's appendices.

| Annotation | Content | Schema | Generation prompt |
| --- | --- | --- | --- |
| Camera | Structured labels for camera motion, steadiness, rotation, translation, zoom, and related properties | Appendix C.1 | Appendix D.1 |
| Caption | Four levels, L0–L3, from a short summary to a detailed description | Appendix C.2 | Appendix D.2 |
| Tag | Seven fields: domain, scene, subjects, actions, style, text, and watermark | Appendix C.3 | Appendix D.3 |

We use **Gemma-4-E4B-it** for Camera and **Qwen3.6-27B-FP8** for Caption and Tag.

The caption levels add detail progressively. **L0** summarizes the main subject, action, and scene. **L1** describes the event sequence briefly. **L2** adds temporal changes, subject relations, and background. **L3** gives a more detailed account of the content and camera behavior.

## 2. Audit samples

**Camera and Caption share 1,000 clips**, covering all 78 Camera field–label combinations. We sample 30 clips per combination, include all available clips for combinations with fewer than 30, and randomly fill the set to 1,000 unique clips. **Tag uses a separate set of 1,000 clips**, covering all 65 label categories with at least 10 examples per category.

For the 100-clip human subsets, Camera sampling covers labels and model agreement/disagreement, Caption uses random sampling, and Tag includes both normal cases and cases flagged for possible errors or omissions.

## 3. Human review and model-assisted extension

For each annotation type, an author familiar with the project reviewed 100 clips. **GPT-6-Astra** reviewed the remaining 900 clips. We first tried training reviewers without a video-pipeline background, but found that the camera-motion and caption-level rules required substantial training, so an author conducted the human review.

Reviewers inspect timestamped thumbnails covering each full clip in temporal order, alongside its annotations. Camera review uses frames sampled at **8 fps**; Caption and Tag review use **4 fps**.

## 4. Review rules

**Camera.** We check each label against the video. For example, a rightward camera-translation label requires visible evidence of that movement. Each judgment is marked *supported*, *incorrect*, or *uncertain*.

$$
\text{Support rate}=\frac{N_{\text{supported}}}{N_{\text{supported}}+N_{\text{incorrect}}}\times100\%
$$

Items with insufficient visual evidence are marked uncertain. We report their counts and exclude them from the support-rate denominator.

**Tag.** We check existing labels in all seven fields and separately look for missing main subjects and actions. We report label support and the share of clips with major omissions.

**Caption.** The two evaluations address different questions:

- **Public benchmark:** We use CAPability's official questions, reference answers, and scoring procedure to assess whether the **L0–L3 schema adds information at each level and how Camera input affects captions**.
- **Videos from VidaForge-3M:** Following CAPability's evaluation framework, we use DeepSeek to draft rubric questions and reference answers for action, event, camera movement, and object count. We verify them against the video, then assess **caption correctness and coverage**.

Each eligible question receives a score of $+1$, $0$, or $-1$. Let their counts be $N_{+1}$, $N_0$, and $N_{-1}$:

$$
\text{Precision}=\frac{N_{+1}}{N_{+1}+N_{-1}}\times100\%
$$

$$
\text{Coverage}=\frac{N_{+1}}{N_{+1}+N_0+N_{-1}}\times100\%
$$

A score of $+1$ denotes a correct answer. The rules for $0$ and $-1$ depend on the dimension. For Action, we follow CAPability:

| Action description in the caption | Score |
| --- | ---: |
| Correctly describes the target action | +1 |
| Describes other actions but omits the target action | −1 |
| Describes no actions | 0 |

We compute each metric within each dimension, then take an equal-weight average:

$$
\text{Overall metric}=\frac{M_{\text{Action}}+M_{\text{Event}}+M_{\text{Camera}}+M_{\text{Count}}}{4}
$$

## 5. Camera results

We audit Camera labels from **Gemma-4-E4B-it**, the model used for VidaForge-3M, and use labels generated by **Qwen3.6-27B-FP8** on the same clips as a comparison.

| Review scope | Gemma-4-E4B-it support rate | Qwen3.6-27B-FP8 support rate |
| --- | ---: | ---: |
| 100 clips: human review | 73.90% | 79.05% |
| 1,000 clips: 100 human + 900 GPT-6-Astra | 76.33% | 77.45% |

**About three quarters of Camera labels are visually supported in both the human and extended audits, giving direct quantitative evidence of their semantic quality.**

## 6. Tag results

We check whether existing labels match the video. For **subjects and actions, the two multi-label fields**, we also check for missing main content.

| Review scope | Label support rate | Clips with a missing main subject or action |
| --- | ---: | ---: |
| 100 clips: human review | 93.27% | 29.0% |
| 1,000 clips: 100 human + 900 GPT-6-Astra | 95.55% | 26.0% |

A clip counts as having an omission if either subjects or actions misses at least one main item.

**Existing tags have high visual support, and most clips cover the main content in both multi-label fields, subjects and actions.**

## 7. CAPability: evaluating the multi-level caption schema

**CAPability [1] evaluates both correctness and thoroughness, making it suitable for testing whether more detailed captions add accurate and useful information.** We use the video evaluation procedure from its official repository to assess the L0–L3 schema. Level definitions and generation prompts appear in Appendix C.2 and D.2.

We generate captions with **Qwen3.6-27B-FP8** and use **GPT-6-Luna** as a comparison. Both use the same multi-level generation prompt and Camera metadata. **GPT-6.1-Terra** scores both using the official evaluation prompts.

| Level | Qwen Precision | Qwen Coverage | GPT-6-Luna Precision | GPT-6-Luna Coverage |
| --- | ---: | ---: | ---: | ---: |
| L0 | 47.35% | 18.07% | 51.00% | 16.00% |
| L1 | 47.49% | 33.28% | 49.95% | 36.65% |
| L2 | 50.38% | 37.99% | 54.54% | 41.31% |
| L3 | 51.97% | 41.19% | 55.30% | 42.41% |

**Precision and coverage generally improve as descriptions become more detailed from L0 to L3. This supports the schema's ability to add information while maintaining correctness. Qwen performs close to GPT-6-Luna overall.**

## 8. Caption quality on videos from VidaForge-3M

We evaluate **L3 captions, the most detailed level in our framework**, generated with Camera metadata and the Qwen caption model, for correctness and coverage.

| Review scope | Precision | Coverage |
| --- | ---: | ---: |
| 100 clips: human review | 90.83% | 81.29% |
| 1,000 clips: 100 human + 900 GPT-6-Astra | 89.82% | 79.35% |

**Both audits show high correctness in L3 captions and coverage of most content targeted by the evaluation questions.**

## 9. How Camera input affects captions

We hold the Qwen generator and multi-level prompt fixed, changing only whether Camera labels are supplied as auxiliary information. We compare L3 correctness and coverage across all four dimensions.

### 9.1 CAPability

| Dimension | Precision without Camera | Precision with Camera | Coverage without Camera | Coverage with Camera |
| --- | ---: | ---: | ---: | ---: |
| Action | 55.06% | 54.66% | 55.06% | 54.66% |
| Event | 78.20% | 78.59% | 47.89% | 48.29% |
| Camera movement | 38.11% | 47.21% | 34.81% | 46.78% |
| Object count | 27.57% | 27.42% | 14.69% | 15.04% |
| **Four-dimension average** | **49.73%** | **51.97%** | **38.11%** | **41.19%** |

Camera input clearly improves both precision and coverage for camera descriptions, as well as the four-dimension averages. Changes in the other dimensions are small.

### 9.2 Videos from VidaForge-3M

For each clip, we use identical verified questions to evaluate captions with and without Camera input.

| Dimension | Precision without Camera | Precision with Camera | Coverage without Camera | Coverage with Camera |
| --- | ---: | ---: | ---: | ---: |
| Action | 78.60% | 78.61% | 78.46% | 78.28% |
| Event | 95.80% | 95.85% | 79.75% | 78.82% |
| Camera movement | 92.35% | 86.30% | 62.46% | 69.08% |
| Object count | 98.32% | 98.51% | 91.36% | 91.23% |
| **Four-dimension average** | **91.27%** | **89.82%** | **78.01%** | **79.35%** |

Captions without Camera input already have high precision on these clips. Camera input expands camera-information coverage but lowers its precision. Changes in the other dimensions are small. Overall, coverage increases while precision decreases.

### 9.3 Video properties and interpretation

| Property | CAPability | VidaForge-3M audit clips |
| --- | ---: | ---: |
| Mean duration | 16.84 s | 5.55 s |
| Maximum duration | 433.73 s | 10.00 s |

CAPability includes longer videos and more complex counting and directional camera-motion questions. The VidaForge-3M audit videos have been split into clips of at most 10 seconds, and static cameras are more common.

Task difficulty may help explain this pattern: harder videos may benefit more from explicit camera information, while adding camera detail to simpler clips also creates more opportunities for error.

**These results support Camera metadata as a way to improve camera-information coverage. The direct caption audit also shows that Camera-conditioned captions retain high overall correctness.**

## 10. Audit materials

Each JSON file contains all 1,000 reviewed samples, their annotations, judgments, evidence, and summary statistics. Images are included for the 100 author-reviewed samples in each audit.

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
3. Open **http://localhost:8000/** in your browser. Keep the terminal open while browsing; press `Ctrl+C` to stop the server.

The viewer needs no additional packages or API key. Use the local URL above so it can load the JSON files and thumbnails.

It opens the 100 samples with thumbnails by default. Switch between **Camera**, **Caption**, and **Tag**, select a sample, or use **Previous / Next**. Choose **All 1,000 records** to browse the extended audit. Camera labels can be viewed for either model; Caption displays both L3 variants and their paired judgments. Click **Open full-size** below a thumbnail to see the original image.
<!-- ANNOTATION_AUDIT_END -->

</details>

## References

[1] Liu, Zhihang, et al. “CAPability: A Comprehensive Visual Caption Benchmark for Evaluating Both Correctness and Thoroughness.” NeurIPS, 2025.
