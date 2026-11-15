You are comparing the visible quality of three generated videos, labeled A, B, and C.
They come from early pretraining checkpoints. Recognizable subjects or complete actions
may not have emerged. Apply the same criteria to all three videos.

INPUT
Each video is represented by one 7-by-7 contact sheet containing all 49 frames.
Read left to right, then top to bottom. The frames run from 0.0000 to 3.0000 seconds
at 16 frames per second. Each cell has a frame index and a timestamp. The timestamp
bars and grid layout were added for inspection and are not part of the video.
You receive no generation prompt, model identity, recipe identity, or automatic score.

TASK
Inspect the complete temporal sequence for each video before comparing them.
First report whether a subject and background can be tracked, and whether visible
motion or deformation is present. A subject can be tracked without identifying its
exact category; report what visible form you are tracking. Do not invent a subject
or an intended action when none is discernible.

Then compare these six dimensions independently:

1. imaging_quality: Technical image quality. Look for blur, noise, clipped highlights,
   broken local structure, ringing, and other visible artifacts. Sharp edges alone
   do not establish better quality. Do not score the accuracy of a guessed prompt.
2. aesthetic_quality: Visual composition and coherence of color, lighting, and layout.
   Judge the visible arrangement even when recognizable objects are absent. Vivid
   colors or strong contrast alone do not establish a more pleasing image.
3. subject_consistency: Does a trackable subject retain its appearance and structure
   over time? Distinguish continuous motion or deformation from sudden replacement,
   disappearance, or incompatible structural changes. If there is no trackable
   subject, mark this dimension unjudgeable for that video.
4. background_consistency: Does a trackable background retain its spatial layout and
   appearance over time? Allow coherent viewpoint changes. Look for unexplained
   replacement, distortion, or abrupt layout changes. If no background can be
   distinguished, mark this dimension unjudgeable for that video.
5. temporal_flickering: Look for abrupt or alternating changes in brightness, color,
   or texture between neighboring frames. Distinguish these from gradual changes
   and visible displacement. If these changes are too subtle at the supplied image
   resolution, mark them unjudgeable. A static video can have low flicker; that does
   not imply that its motion is good.
6. motion_smoothness: For visible movement or deformation, compare continuity of
   displacement, direction, and shape across consecutive frames. Look for sudden
   jumps or reversals inconsistent with the surrounding sequence. If a video is
   effectively static or motion cannot be resolved, mark motion smoothness
   unjudgeable, rather than ranking it first for having little motion.

For temporal dimensions, base the judgment on frame-to-frame evidence. The contact
sheets do not reproduce playback, so do not claim to have watched playback or heard
audio. Do not infer unseen intermediate frames. Do not infer that a recognizable
object must be better in every dimension. One dimension's ranking must not dictate
another's ranking.

OUTPUT
Return only JSON matching the supplied schema. Write descriptive text in simple
Chinese for the reviewer; retain the prescribed English keys and enum values.
For each dimension:
- Provide a short observation for each of A, B, C, citing timestamp ranges that
  support it. Use actual displayed times and concrete visible features. One or two
  ranges per video are enough; the full interval is appropriate for a global or
  absence judgment. State the evidence gap for an unjudgeable video.
- Rank judgeable videos from best to worst. Inner arrays represent ties:
  [["A", "C"], ["B"]] means A and C tie above B.
- Put unjudgeable videos in a separate list, each with a reason. They are not last
  place. Each label must appear exactly once across ranking and unjudgeable.
- In comparison, explain the main visible difference or why a tie is appropriate.
  With fewer than two judgeable videos, say a comparison is not possible.

Do not produce numerical quality scores, an overall ranking, or a winner across
dimensions. A tie is appropriate when no clear relative difference is visible.
