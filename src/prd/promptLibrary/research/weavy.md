# Weavy / Figma Weave - research dossier
_Researched 2026-08-15. Sources numbered at the bottom, cited inline by number._

_Method note: help.weavy.ai blocks plain HTTP fetches (Cloudflare 403). Everything below was read in a real browser session against the live help centre. Model comparison tables were parsed cell by cell out of the HTML `<table>`, not from flattened page text, so each model lines up with its own credit price. Where a value could not be aligned reliably it is marked so._

## What Weavy is

Weavy, now branded **Figma Weave**, is a node-based canvas for generative image, video, audio and 3D work. A node is a function with inputs on its left and outputs on its right; you build a workflow by dragging a wire from one node's output handle to another node's compatible input handle [1]. The pitch from Figma's own blog is that "the process of making and editing imagery, video, audio, and 3D becomes a sequence you and your teammates can inspect, tweak, and repeat" [16].

Two categories of node exist, and the split is the single most important economic fact about the tool [1]:

- **Generative AI nodes** have a Run button and cost credits per generation.
- **Non-generative nodes** (painter, blur, compositor, prompt concatenator, and so on) cost nothing to run.

Node handles are colour coded: green = image, purple = text, red = video, purple = LoRA, blue = array / list / 3D, white = multiple input options, lime = mask [1].

Nodes are added by browsing the left sidebar, pressing Tab on the canvas, or right-clicking the canvas and typing a name [1].

## Node catalog

| NODE | what it does | inputs -> outputs | source # |
|---|---|---|---|
| **Import** | Brings a file in by click, drag-drop, or pasted link. Images JPEG/JPG/PNG/HEIC/WEBP, video MP4/QUICKTIME, audio MP3/WAV/OGG, 3D **GLB only**. No direct Google Drive or iCloud upload. | file -> image / video / audio / 3D | 3 |
| **Export** | Writes the result to a chosen folder, keeping the original format (a PNG generation exports as PNG). Works with image and video nodes. | image or video -> file | 3 |
| **Preview** | Shows a generated result in a clean separate node. | any media -> display | 3 |
| **Compare** | Compares two images with a slider or a toggle. | image, image -> comparison view | 3 |
| **Import Model** | Imports a model from **Fal, Replicate or CivitAI** by pasting the model page URL. Parameters appear in the right toolbar. Has a "Save model" button to make it available across all workflows. Starter plan and above only. | URL -> a runnable model node | 3, 14 |
| **Import LoRA** | Uploads your own LoRA file. Connect it to a LoRA-capable model's `LoRA1` input; strength is set by wiring a Number node (set type to float, 0 to 1) into `LoRA1 scale`. | LoRA file -> LoRA | 3, 13 |
| **Import Multiple LoRAs** | Same, but holds a LoRA list you extend with a + button on the right panel. Alternatively wire a second Import LoRA node into `LoRA2` with its own `LoRA2 scale`. | LoRA files -> LoRA | 3, 13 |
| **Router** | Fans one input out to many outputs, so you can re-point a whole branch by changing one wire instead of rewiring every model. Created by double-clicking an output. | any -> many | 3 |
| **Output** | Marks the end result of a workflow and **unlocks the Tool tab**. Required to publish a workflow as a Tool. | any -> tool output | 3, 12 |
| **Sticky Notes** | Canvas annotation. | none | 2 |
| **Prompt** | Free-form text prompt, any length. Supports **Variables**: click "Add Variables" and a new text input handle appears on the node, so other Text nodes can be slotted into one master prompt. Display can show variable source, value, or both. | text -> text | 4, 15 |
| **Prompt Concatenator** | Combines multiple text inputs into one string, plus its own extra typed text. Add more inputs with the + button at bottom left. Non-generative, so it is free. | many text -> text | 4, 1 |
| **Prompt Enhancer** | Runs your prompt through an LLM of your choice (dropdown on the left) to clarify and expand it. The enhancement instructions themselves are editable in a text box below the dropdown. | text -> text | 4 |
| **Run Any LLM** | Sends text and image inputs to any LLM in the dropdown, returns text. | text + image -> text | 4 |
| **Image Describer** | Analyses an image and writes a strong description of the key attributes that make it look the way it does, so you can edit those attributes and regenerate. LLM selectable; guidelines editable via "Image Instructions". | image -> text | 4 |
| **Video Describer** | Same, for video. Guidelines under "Model Instructions". | video -> text | 4 |
| **Number** | Numeric attribute with settable min, max and decimal places. Surfaced on canvas via "Set as Output" next to an attribute. Used for LoRA strength. | -> number | 5, 13 |
| **Text** | A text value node, usable as a prompt input anywhere. | -> text | 5 |
| **Toggle** | True/false attribute visualiser. | -> boolean | 5 |
| **List Selector** | Builds a dropdown from manual values, an Array node, or a model's own list attributes. | -> selection | 5 |
| **Seed** | Exposes the seed attribute; each output gets a seed, random or manually fixed. | -> seed | 5 |
| **Array** | Multiple text inputs split into groups, manually or by splitting a connected text input on a chosen separator. Feeds List Selector and the text iterators. | text -> array | 5 |
| **Text / Image / Video Iterator** | Batches several inputs through one model as separate runs, keeping each input distinct. Text Iterator also accepts a **CSV upload** (drop a CSV on the canvas and it generates iterator nodes per column). You can also create an iterator from an existing multi-result node via its three-dot menu. | many -> many runs | 6, 17, 18 |
| **Unpack a Node** | Splits a node holding multiple batch results into individual nodes grouped together. | multi-result -> nodes | 17 |
| **Compositor** | The big one. Layer-based compositing of images, videos, shapes and text into one output. Per-layer blend modes, opacity, reorder, position, scale, rotation. Supports **groups** (opacity and blend mode apply to everything inside), a **Fill** background colour or transparent canvas, native **shape layers** (rectangle, ellipse, triangle, star), native **text layers**, and an **Assets panel** holding all media in the composition including unused items. Media can be dragged straight in without a node. Includes a built-in **Timeline** (enable via Edit) for video layers: duration, frame rate, trim, visibility, lock, mute. Non-generative, so free. | many images / videos / shapes -> one image or video | 7, 8, 1 |
| **Painter** | Paint on an image input or a blank canvas. Three tabs, Brush / Eraser / Canvas, each with size, hardness and colour. Explicitly built "primarily for creating hand-painted masks or sketches for sketch-to-image models". **Outputs both an image and a mask.** | image -> image + mask | 2 |
| **Gen Effect** | Describe a visual effect in plain language (optionally with a reference image), click Generate effect, and the node builds a custom effect **with its own auto-generated control sliders** matched to what you asked for. You can request specific sliders in the prompt. Editable and regenerable via Edit. Saveable to the Saved section for reuse. | prompt (+ ref image) then image or video -> image or video | 9 |
| **Levels** | Histogram-based brightness, contrast and tonal range with shadow / midtone / highlight controls; shifts black, grey and white points. | image / video -> image / video | 2 |
| **Crop** | Crop and resize by preset aspect ratio or custom dimensions. | image / video -> image / video | 2 |
| **Resize** | Stretches or squashes to custom dimensions. Documented use case: "meeting model input requirements or adjusting reference images to specific sizes". | image / video -> image / video | 2 |
| **Blur** | Fast Box Blur or Gaussian Blur with intensity control. | image / video -> image / video | 2 |
| **Invert** | Inverts input, "especially useful for when you want to invert a mask". | image / video / mask -> same | 2 |
| **Channels** | Access R, G, B and Alpha channels separately. For advanced compositing. | image / video -> channel | 2 |
| **Extract Video Frame** | Pull one frame out as a still, picked via timeline, frame number or timecode. | video -> image | 2 |
| **Mask Extractor** | Auto-segments the image into parts; Shift adds a part to the mask, Alt+Shift subtracts. Toggle between viewing original and mask. | image -> mask | 10 |
| **Mask By Text** | Generates a mask from a written description plus an image. | image + text -> mask | 10 |
| **Matte Grow / Shrink** | Chokes or expands a matte with a slider, for cleaning up masks. | image / video / mask -> mask | 10 |
| **Merge Alpha** | Applies a mask as an alpha channel on an image. | image + mask -> RGBA image | 10 |
| **Video Matte** | Extracts a matte pass from video, matte type chosen from a dropdown. | video -> matte | 10 |
| **Video Mask by Text** | Prompt-driven masking of objects in video. | video + text -> mask | 10 |

**On the "Keyframe" node:** nothing solid found. There is no Keyframe article anywhere in the help centre, and a targeted scan of the video comparison table and all three "Delights" release notes turned up zero occurrences of the word. What the video models table *does* show is that most video models take **First Frame** and **Last Frame** image inputs, and several models are literally named "Kling O1 / 2.5 / 2.1 First & Last Frame" [19]. _(inference: the Keyframe node in the current UI is most likely a helper that supplies first/last frame images to video models, but this is UNVERIFIED and should not be stated as fact.)_

**On the "threedee" sidebar category:** the documented 3D surface is (a) Import node accepting **GLB only**, confirmed twice [3, 11], and (b) the image-to-3D model nodes listed in the model catalog below [20]. There is no documented 3D viewport, relight, camera rig or material editor node. Note the colour guide groups 3D with Array/List under blue [1].

## Model catalog

Prices are credits per run as published, and the docs carry a standing caveat: "The models and prices listed above may change. The most up-to-date prices are the ones on Figma Weave" [19, 20, 21, 22, 23].

### Image generation (text to image) [21]

| MODEL | multi-image? | reference / structure conditioning? | cost | source # |
|---|---|---|---|---|
| ChatGPT Images 2.0 | No | none listed | 1 to 37 | 21 |
| GPT Image 1 | No | none listed. Additional option: **Transparent Background**. Noted as excelling at "Style and Reference Imitation" | 8 | 21 |
| Reve | **Yes** | optional Reference Image | 4 | 21 |
| Higgsfield Image | No | optional Reference Image; Different Style Options | 21 | 21 |
| Imagen 4 / Imagen 3 / Imagen 3 Fast | No | negative prompt only | 6 / 6 / 3 | 21 |
| Flux 2 Pro | **Yes** | optional Image | 5 | 21 |
| Flux 2 Flex | **Yes** | optional Image | 14 | 21 |
| Flux 2 Dev LoRA | **Yes** | optional **LoRA + LoRA Weight** + Image 1 | 4 | 21 |
| Flux 1.1 Ultra | No | optional Image | 7 | 21 |
| Flux Pro 1.1 | No | optional Image | 5 | 21 |
| Flux Fast | No | none | 0.4 | 21 |
| Flux Dev LoRA | No | optional Image + **LoRA + LoRA Weight**; Multiple LoRA Input | 4 | 21 |
| Recraft V3 | No | Baked Styles | 5 | 21 |
| Mystic | No | **Style Image + Control Image** | 12 | 21 |
| Ideogram V3 | **Yes** | **Remix Image + Style Reference** + negative prompt | 4 | 21 |
| **Ideogram V3 Character** | **Yes** | **Character Reference Image + Mask** + negative prompt | 15 | 21 |
| Stable Diffusion 3.5 | No | optional Image | 8 | 21 |
| Minimax Image 01 | No | none | 1 | 21 |
| Bria | No | negative prompt | 6 | 21 |
| Dalle 3 | No | none | 5 | 21 |
| **Luma Photon** | **Yes** | **Reference Image + Style Reference + Character Reference Image** | 2 | 21 |
| Nvidia Sana | No | negative prompt | 0.2 | 21 |
| **Nvidia Consistory** | **Yes** | purpose-built for consistency: mandatory Subject Prompt + Scene Prompt 1 + Scene Prompt 2 + Style Prompt; additional option **Subject Tokens** | 5 | 21 |

### Image editing [22]

| MODEL | multi-image? | reference / structure conditioning? | cost | source # |
|---|---|---|---|---|
| **ChatGPT Images 2.0 Edit** (GPT Image 2) | **Yes** | prompt + image, no separate reference input | **1 to 37** | 22 |
| **Gemini 3.1 Flash (Nano Banana 2)** | **Yes** | optional Image; Enable Web Search | 4 to 18 | 22 |
| **Gemini 3 Pro** | **Yes** | optional Image; Enable Web Search | 15 to 30 | 22 |
| Gemini 2.0 Flash | **Yes** | prompt + image | 0.1 | 22 |
| **Seedream V5 Edit** | **Yes** | optional Image; Enhance Prompt Mode | 4 | 22 |
| Seedream V4.5 Edit | **Yes** | optional Image | 4 | 22 |
| Seedream V4 Edit | **Yes** | prompt + image | 4 | 22 |
| SeedEdit 3.0 | No | prompt + image | 4 | 22 |
| Reve Edit | No | prompt + image | 4 | 22 |
| **Qwen Image Edit 2511** | **Yes** | optional Image, negative prompt, **LoRA + LoRA Strength** | 10 | 22 |
| Qwen Edit Image Plus | **Yes** | negative prompt | 3 | 22 |
| **Flux 2 Inpaint Klein 9B** | No | mandatory **Image + Mask**, optional **Reference Image**, LoRA | 10 | 22 |
| Flux 2 Max | **Yes** | optional Image | 10 | 22 |
| **Runway Gen-4 Image** | **Yes** | optional Image; additional option **Reference Tags** | 6 | 22 |
| Klux Kontext | No | prompt + image | 3 | 22 |
| **Flux Kontext Multi Image** | **Yes** | mandatory **Image 1 + Image 2** | 10 | 22 |
| **Flux Kontext LoRA** | No | optional Image + **LoRA + LoRA Weight**; Add multiple LoRAs | 12 | 22 |
| GPT Image 1.5 Edit | **Yes** | prompt + image | 7 | 22 |
| GPT Image 1 Edit | **Yes** | prompt + image | 8 | 22 |
| Flux Fill Pro | No | prompt + Image + **Mask** | 6 | 22 |
| Flux Dev LoRA Inpaint | No | prompt + Image + **Mask**, **LoRA + Weight**, multiple LoRAs | 4 | 22 |
| Ideogram V3 Inpaint | **Yes** | prompt + Image + **Mask**; Add Multiple Image Inputs, Style | 11 | 22 |
| Ideogram V2 Inpaint | No | prompt + **Mask**, optional Image + negative prompt; Style | 10 | 22 |
| SD3 Inpaint | No | prompt + Image + **Mask** | 4 | 22 |
| Bria Inpaint | No | prompt + Image + **Mask** | 5 | 22 |
| Flux Pro Outpaint | No | prompt + image | 6 | 22 |
| SD3 Outpaint | No | image, optional prompt | 5 | 22 |
| SD3 / Bria Remove Background | No | image | 2 / 0.6 | 22 |
| SD3 / Bria Content-Aware Fill | No | Image + **Mask** | 4 / 5 | 22 |
| **Replace Background** | **Yes** | prompt + Subject Image + optional **Style Reference Image 1**; Style | 4 | 22 |
| Bria Replace Background | **Yes** | Background Prompt + Image + optional **Reference Image** | 2 | 22 |
| Kolors Virtual Try On | **Yes** | Person Image + Garment Image | 8 | 22 |
| **Relight 2.0** | No | prompt + image, negative prompt; Denoise, Downscale | 10 | 22 |

### Generate from image, i.e. structure conditioning [23]

This is the ControlNet family and it is the direct answer to question 3.

| MODEL | multi-image? | conditioning | cost | source # |
|---|---|---|---|---|
| **Flux Depth Pro** | No | prompt + **Control Image** (depth). Add Multiple LoRAs | 6 | 23 |
| **Flux Canny Pro** | No | prompt + **Control Image** (edges) | 6 | 23 |
| **Flux ControlNet & LoRA** | No | **Control Image** mandatory; optional prompt, negative prompt, LoRA. Note in docs: "You need to add the LoRA as a link" | 10 | 23 |
| **Stable Diffusion controlnets** | No | prompt + **Control Image** | 1 | 23 |
| Flux Dev Redux | No | Image (style/content transfer) | 3 | 23 |
| **Qwen Edit Multiangle** | No | Image + optional prompt. Docs note: "Has Camera Control Options on the toolbar" | 4 | 23 |
| Image to Image | No | prompt + Image, negative prompt | 10 | 23 |
| **Sketch To Image** | No | prompt + **Sketch Image**; Type option | 0.1 | 23 |

### 3D (image to 3D) [20]

| MODEL | inputs | additional options | cost | source # |
|---|---|---|---|---|
| Sam 3D Objects | Image + Prompt | none listed | 3 | 20 |
| Trellis | Image | Texture size, Mesh Simplifications | 2 | 20 |
| Hunyuan 3D | **Front Image**, optional **Back / Left / Right Image** | Target face number | 18 | 20 |
| Hunyuan 3D V2.1 | Image | Textured mesh | 25 | 20 |
| Hunyuan 3D V3 | Input Image, optional **Back / Left / Right Image** | Polygon types | 80 | 20 |
| Trellis 3D V2 | Image | Topology and Remesh | 30 | 20 |
| Rodin V2 | Image, optional Prompt | Materials, Quality Mesh options | 36 | 20 |
| Rodin | Image, optional Prompt | Materials, **T pose mode** | 48 | 20 |
| Meshy V6 | Image, optional Texture Prompt + Texture Image | Topology and Remesh | 96 | 20 |

### Enhance / upscale [24]

Topaz Upscale 19, Topaz Sharpen 19, Recraft Crisp Upscale 5, Magnific Upscale 12 (Style option, optional prompt), Magnific Precision Upscale 18, Magnific Precision Upscale V2 18 (details and grain), Magnific Skin Enhancer 18 (skin details, optional prompt), Enhancor Image Upscale 36, Enhancor Realistic Skin 36 [24].

### Video (relevant for keyframe context) [19]

34 video models including Seedance 2.0 and 2.0 Reference, Kling 3 / 2.5 / 2.1 / 1.6 / O1, Veo 3.1 and Veo 3 (both text-to and image-to variants), Veo 2, Sora 2, Wan 2.5 / 2.2, Runway Gen-4.5 / Gen-4 / Gen-4 Turbo / Gen-3, LTX 2, Moonvalley, Grok Imagine Video, Pixverse V4.5, Luma Ray 2 and Ray 2 Flash, Minimax Video Director and Video 01, Hunyuan, Skyreels, Higgsfield Video. Common inputs are Prompt, First Frame, Last Frame, Reference and Negative Prompt. Per-model credit prices in this table did not parse into reliably aligned cells, so they are deliberately not quoted here [19].

## Consistency machinery

Real, documented, and going well beyond prompt-plus-image chaining:

1. **LoRA import, first-class.** Import LoRA and Import Multiple LoRAs nodes upload your own LoRA files. Strength is a wired Number node set to float between 0 and 1 into the model's `LoRA<n> scale` input, so strength is itself a graph value you can iterate over. "Your imported LoRA will be saved with your workflow, allowing you to reuse it in future sessions." LoRA-capable models include Flux Dev LoRA, Flux 2 Dev LoRA, Flux Kontext LoRA, Flux Dev LoRA Inpaint, Flux ControlNet & LoRA, Qwen Image Edit 2511 and Flux 2 Inpaint Klein 9B [3, 13, 21, 22, 23].
2. **Custom model import** from Fal, Replicate and CivitAI by pasting a URL, saveable across all workflows [14].
3. **Dedicated reference inputs that are distinct from the main image input.** This is real and it matters: Luma Photon exposes three separate handles, Reference Image, **Style Reference** and **Character Reference Image**. Ideogram V3 exposes Remix Image and Style Reference. Ideogram V3 Character exposes a Character Reference Image plus a Mask. Mystic exposes Style Image and Control Image as two different inputs. Flux 2 Inpaint Klein 9B has a Reference Image separate from its Image + Mask. Replace Background has a Style Reference Image separate from the Subject Image. Runway Gen-4 Image has a "Reference Tags" option [21, 22].
4. **ControlNet-style structure conditioning is present and explicit**, via a mandatory **Control Image** input: Flux Depth Pro (depth), Flux Canny Pro (edges), Flux ControlNet & LoRA, and Stable Diffusion controlnets. Plus Sketch To Image, which takes a Sketch Image [23].
5. **Masks are a first-class datatype**, with their own lime-coloured handle [1]. There is a whole Matte Tools family to author them: Mask Extractor (auto-segmentation, shift-add / alt-shift-subtract), Mask By Text (prompt-driven), Matte Grow/Shrink (choke or spread), Merge Alpha, Invert, Channels, plus video equivalents [10, 2]. The Painter node outputs an image **and** a mask [2]. Many editing models take a Mask input directly.
6. **A purpose-built consistency model**, Nvidia Consistory, whose entire input contract is Subject Prompt + multiple Scene Prompts + Style Prompt with "Subject Tokens" as an option, i.e. it holds one subject fixed across several scenes [21].
7. **Seed node** to pin the stochastic component [5].
8. **Multi-view 3D conditioning**: Hunyuan 3D and Hunyuan 3D V3 take Front / Back / Left / Right images, and Rodin has a T-pose mode [20].
9. **Qwen Edit Multiangle** has camera control options on the toolbar, which is a documented way to rotate a fixed subject [23].
10. **Published Tools are the official consistency answer at the workflow level.** Figma's blog frames it explicitly: running a pre-built tool "delivers a consistent result every time, so you can repeatedly tackle common use cases in just a few clicks" [16].

**What I am NOT claiming.** Weave's own FAQ on consistent characters is thin and does not endorse any specific mechanism. Its full technical content is: "There are many different ways to create consistent characters, and new and improved models come out every day. Consistent character creation, like any other generative AI creation, requires a strong and clear prompt and a good image input," followed by a link to one example workflow [25]. So the reference inputs and ControlNet nodes above are verified as **existing**, but Weave publishes no official guidance ranking them or recommending a specific consistency recipe.

## Credits and cost

- Credits are a single universal currency standardising payment across models from many providers [26].
- **Only generative nodes cost credits.** Non-generative nodes (painter, blur, compositor, prompt concatenator, crop, resize, levels, invert, channels, mask tools, iterators, routers, prompt nodes) run **free** [1]. This is the biggest architectural lever in the whole tool.
- Cost is **dynamic per model**: "Some models have different parameters that may affect the model's price, such as the number of seconds or resolution. If this applies to the model you are using, you will see the credit price change when you adjust these parameters" [26]. This matches the observed ChatGPT Images 2.0 Edit behaviour of 9 credits at medium quality and 37 at high, against the docs' published range of 1 to 37 [22].
- Two ways to check cost before running: click the model node and read the top-right corner, or hover the model name in the left Toolbox [26].
- **Plan allowances** [27]: Free 150 credits/month and a cap of **5 workflows**, with **video models and imported models unavailable**. Starter 1,500/month, unlimited workflows, all models and tools. Professional 4,000/month plus custom font import. Team 4,500/month **per user**, shared credits across the team with either a per-user limit or equal sharing. Enterprise has custom allocation, own API keys, expanded indemnity.
- **Replenishment**: credits renew monthly. Free and Starter **reset** at the start of each month. Pro and Team **roll over for up to three months** [26, 28].
- **Top-ups**: Starter $10 = 1,000 credits; Pro and Team $10 = 1,200 credits. Top-up credits carry over month to month regardless of plan and stay valid for **one year**, even across a plan change [26, 28].
- **Verified vs unverified models** [29]: a "Verified by Figma" badge means a contract exists between Figma and the provider, your content is used only to deliver the service to you, is **not used for training when accessed through Weave**, and comes with contractual indemnity. Unverified models are governed by the provider's own terms, which Weave links from the node. Unverified does not mean the provider trains on your data. On Free, Starter and Pro you get a one-time confirmation prompt before running an unverified model. No models are blocked or removed.

## Saved workflows and reuse

Four distinct mechanisms, and they are not the same thing:

1. **The Saved section** (left panel) holds three kinds of item, and **saved items are shared across the entire workspace**, so anything you save is available to every member [30].
   - **Saved Models**: any model with its custom settings, saved as a named preset with an optional description. This replaced the older "My Models" section.
   - **Saved Nodes**: a single customised tool node saved as a preset. Gen Effect nodes are explicitly saveable this way [9].
   - **Saved Groups**: select two or more nodes, right-click, **Save group**, then give it a name, optional description and a thumbnail (captured either from the group itself or from the whole workflow). Drag it onto any canvas later.
   - Rename, re-describe and delete via the pencil icon in the Saved section header. Everything in Saved is also reachable from the canvas right-click menu under "Saved", without opening the panel.
2. **Groups on canvas**: Cmd/Ctrl+G, with editable title, title size, and group colour, plus "Resize to Fit" [31]. This is organisation, not reuse.
3. **Tools** (formerly "Design Apps") [12]. Add an **Output node** connected to your end result, which unlocks the Tool tab. The tool's exposed attributes are auto-generated from **nodes that have no input** (Prompt nodes, Import Image nodes and so on). You hide an attribute by **locking** the node via its three-dot menu; a lock icon shows current state. Click **Publish**, then **Share**. Shared users see tool mode; the creator always sees editable mode. Shared users can switch to editable mode to experiment, and reopening the original share link resets them to the published version. You can keep editing the workflow without disturbing their live tool until you Publish again. **Every Publish creates a timestamped version** (name, date, time); the current version shows next to the Publish button and past versions are selectable from a dropdown, viewable and shareable but not editable.
4. **Publishing to the Figma Community** [32]. Share button, then "Publish to Community" at the bottom of the share modal, with name, description, subcategory, tags and an image. Published workflows land at figma.com/community/ai-workflows and appear in Community search and feeds, where others can discover and duplicate them.

**Weave inside Figma and via MCP.** As of Config 2026, Weave tools run directly on the Figma Design canvas: select an image, choose a tool, configure inputs, generate without leaving Figma [33]. Figma's blog says 20-plus AI image tasks ship as pre-packaged Weave tools including style transfers, product shoots and material extraction, and describes an upcoming Figma node where "any edits you make to the frame in Figma will reflect in real time across your Weave workflow" [16]. Separately, Weave tools are runnable from external agents through the **Figma MCP server**: list tools, inspect a tool's required inputs, upload an image/video/audio/3D file, run, poll, cancel. Runs consume **Weave** credits, not Figma AI credits, and the agent shows the cost and asks for confirmation first, except for runs that cost nothing. Requires linking your Figma account under Settings > Profile > Linked accounts in Weave, requires Starter or above, and only reads tools from your **currently active** Weave workspace. **Creating or editing Weave workflows via MCP is not supported** [34].

## What I could NOT verify

- **The Keyframe node.** Not documented anywhere in the help centre. No article, and zero hits scanning the video model comparison and all three "Delights" release-note articles. See the inference note in the node catalog. **UNVERIFIED.**
- **The exact sidebar category taxonomy** the user observed (search, recent, assets, toolbox, image, video, threedee, audio, models). The help centre organises docs as Tools / Helpers / Iterators / Datatypes / Models Comparison, which does not map one-to-one. Nothing solid found on the shipping sidebar's own grouping.
- **What is in "audio" and "assets"** as sidebar categories. There is a Lip Sync Models Comparison article and the Import node accepts MP3/WAV/OGG, and the Compositor has an Assets panel with audio support, but I did not open the lip-sync table and cannot enumerate the audio node set. Not researched, not guessed.
- **Per-model video credit prices.** The video table's price row did not split into aligned cells, and I will not guess at digit boundaries.
- **Whether ChatGPT Images 2.0 Edit's quality tiers are exactly medium=9 / high=37.** The docs publish a range of 1 to 37 and say cost changes with parameters [22, 26]; the specific tier values come from the user's own UI observation, not from a source I fetched.
- **Whether any generative node ever runs free.** The docs say only that non-generative nodes are free [1] and that MCP runs "that don't cost credits skip this step" [34], implying some zero-cost runs exist, but nothing enumerates them.
- **Any official Figma or Weave guidance specifically on multi-image or reference workflows for character or product consistency.** The one FAQ that exists is nearly contentless [25]. The only official consistency framing found is at the workflow level, that published Tools give repeatable results [16]. There is no Figma help-centre article on Weave reference workflows that I located.
- **Model context limits**, prompt character caps, and per-model prompt-format guidance. Not covered by these sources at all.

## Sources

1. **Understanding Nodes**, https://help.weavy.ai/en/articles/12292386-understanding-nodes - the generative vs non-generative split (credits vs free), node anatomy, handle colour code, four ways to add a node.
2. **Editing Tools**, https://help.weavy.ai/en/articles/12268186-editing-tools - Levels, Compositor summary, Painter (mask + sketch purpose, dual image+mask output), Crop, Resize, Blur, Invert, Channels, Extract Video Frame.
3. **Helpers Overview**, https://help.weavy.ai/en/articles/12268300-helpers-overview - Import (exact supported formats, GLB-only 3D), Export, Preview, Import Model, Import LoRA, Import Multiple LoRAs, Router, Output, Compare.
4. **Text Tools**, https://help.weavy.ai/en/articles/12268282-text-tools - Prompt, Prompt Concatenator, Prompt Enhancer, Run Any LLM, Image Describer, Video Describer.
5. **Datatypes**, https://help.weavy.ai/en/articles/12268346-datatypes - Number, Text, Toggle, List Selector, Seed, Array.
6. **Iterators**, https://help.weavy.ai/en/articles/12343281-iterators - text/image/video iterators, CSV import.
7. **The Compositor node**, https://help.weavy.ai/en/articles/15887786-the-compositor-node - layers, groups, blend modes, shape layers, text layers, background fill, assets panel.
8. **Timeline Editor**, https://help.weavy.ai/en/articles/14689260-timeline-editor - the timeline lives inside the Compositor; duration, frame rate, trim, lock, mute.
9. **Gen Effect Node**, https://help.weavy.ai/en/articles/16118602-gen-effect-node - plain-language custom effects with auto-generated sliders, editable, saveable.
10. **Matte Tools**, https://help.weavy.ai/en/articles/12414117-matte-tools - Mask Extractor, Mask By Text, Matte Grow/Shrink, Merge Alpha, Video Matte, Video Mask by Text.
11. **What Kinds of 3D Models does Figma Weave Support?**, https://help.weavy.ai/en/articles/12343740-what-kinds-of-3d-models-does-figma-weave-support - GLB only, confirmed.
12. **Tools**, https://help.weavy.ai/en/articles/12267755-tools - Output node unlocks the Tool tab, attribute exposure from input-less nodes, locking, publishing, sharing, timestamped version management.
13. **Importing LoRAs in Figma Weave**, https://help.weavy.ai/en/articles/11046940-importing-loras-in-figma-weave - the LoRA1/LoRA2 + Number-node-as-float-scale wiring pattern.
14. **Importing Models**, https://help.weavy.ai/en/articles/12265334-importing-models - Fal, Replicate, CivitAI by URL; Save model to Saved section; Starter and above.
15. **Prompt Variables**, https://help.weavy.ai/en/articles/14047674-prompt-variables - variable handles on a Prompt node, display modes.
16. **Connecting Figma and Weave**, https://www.figma.com/blog/connecting-figma-and-weave/ - Figma's own framing, 20-plus packaged tools in Figma Design, the repeatability claim, the planned live-linked Figma node.
17. **New Figma Weave Delights #2**, https://help.weavy.ai/en/articles/14878372-new-figma-weave-delights-2 - Unpack a Node, creating iterators from existing nodes.
18. **New Figma Weave Delights #3**, https://help.weavy.ai/en/articles/15068263-new-figma-weave-delights-3 - duplicate with connections, CSV to text iterator.
19. **Video Models Comparison**, https://help.weavy.ai/en/articles/12344226-video-models-comparison - the 34-model video roster and the First Frame / Last Frame input pattern.
20. **3D Models Comparison**, https://help.weavy.ai/en/articles/12344357-3d-models-comparison - the nine image-to-3D models, their inputs, multi-view inputs, credit prices.
21. **Image Models Comparison**, https://help.weavy.ai/en/articles/12284752-image-models-comparison - the text-to-image roster, per-model mandatory and optional inputs, multi-image-reference flags, credit prices.
22. **Edit Image Models Comparison**, https://help.weavy.ai/en/articles/12343904-edit-image-models-comparison - the 35-model editing roster including GPT Image 2, Nano Banana 2, Seedream V5, Qwen, Flux Kontext, Runway Gen-4, Ideogram, plus mask and reference inputs and prices.
23. **Generate from Image Models Comparison**, https://help.weavy.ai/en/articles/12344174-generate-from-image-models-comparison - the ControlNet family, Control Image inputs, Sketch To Image, Qwen Edit Multiangle camera controls.
24. **Enhance Images Models Comparison**, https://help.weavy.ai/en/articles/12344205-enhance-images-models-comparison - Topaz, Magnific, Recraft, Enhancor upscalers and prices.
25. **How can I create a consistent character on Figma Weave?**, https://help.weavy.ai/en/articles/12344493-how-can-i-create-a-consistent-character-on-figma-weave - the entire official consistency guidance, which is minimal. Cited to show how little exists.
26. **Figma Weave's Credit System**, https://help.weavy.ai/en/articles/12267166-figma-weave-s-credit-system - dynamic per-parameter pricing, the two ways to check cost, renewal and rollover, top-up rates, one-year top-up validity.
27. **Figma Weave's Subscription Plans**, https://help.weavy.ai/en/articles/12267070-figma-weave-s-subscription-plans - per-plan credit allowances, the Free plan's 5-workflow cap and video/imported-model exclusion, team credit sharing.
28. **Do unused credits roll over to the next month?**, https://help.weavy.ai/en/articles/12669991-do-unused-credits-roll-over-to-the-next-month - three-month rollover on Pro/Team, reset on Free/Starter.
29. **Verified and Unverified Models**, https://help.weavy.ai/en/articles/14034721-verified-and-unverified-models - what the "Verified by Figma" badge contractually means for training and indemnity.
30. **Using the Saved section**, https://help.weavy.ai/en/articles/15495911-using-the-saved-section - Saved Models, Saved Nodes, Saved Groups, workspace-wide sharing, thumbnails, right-click access.
31. **Group and Ungroup Nodes**, https://help.weavy.ai/en/articles/13560959-group-and-ungroup-nodes - grouping, titles, colours, Resize to Fit.
32. **Publish Weave workflows to the Figma Community**, https://help.weavy.ai/en/articles/15624624-publish-weave-workflows-to-the-figma-community - the publish path and the ai-workflows Community destination.
33. **What's new from Config 2026**, https://help.weavy.ai/en/articles/15623550-what-s-new-from-config-2026 - Weave tools inside Figma Design, Community publishing.
34. **Running Weave tools from external agents (MCP)**, https://help.weavy.ai/en/articles/16202764-running-weave-tools-from-external-agents-mcp - the MCP capability list, credit behaviour, active-workspace constraint, and the explicit limit that workflow creation/editing is not supported.

**Fetches that failed:** WebFetch and curl both received HTTP 403 from help.weavy.ai (Cloudflare bot protection); all Weave help-centre content above was read instead through a live browser session at the same URLs. The Intercom search API endpoint returned the SPA shell rather than results, so the "Keyframe" scan was done by fetching candidate articles directly. weave.figma.com/pricing was referenced by the help centre but not fetched, so the dollar prices of the plans themselves are not stated here.
