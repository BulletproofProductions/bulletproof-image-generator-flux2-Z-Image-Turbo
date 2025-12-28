import type { Template } from "@/lib/types/generation";

// ==========================================
// Lighting Templates
// ==========================================
export const lightingTemplates: Template[] = [
  // Natural Lighting
  {
    id: "lighting-golden-hour",
    name: "Golden Hour",
    description: "Warm, soft light during sunrise or sunset with golden tones",
    promptFragment: "golden hour lighting, warm sunlight, soft shadows",
  },
  {
    id: "lighting-natural",
    name: "Natural Light",
    description: "Soft, diffused natural daylight",
    promptFragment: "natural daylight, soft diffused light, ambient lighting",
  },
  {
    id: "lighting-overcast",
    name: "Overcast Day",
    description: "Soft, even lighting from cloudy sky",
    promptFragment: "overcast lighting, soft diffused clouds, even illumination, no harsh shadows",
  },
  {
    id: "lighting-blue-hour",
    name: "Blue Hour",
    description: "Cool twilight tones just before sunrise or after sunset",
    promptFragment: "blue hour lighting, twilight ambiance, cool blue tones, magical atmosphere",
  },
  {
    id: "lighting-harsh-sun",
    name: "Harsh Sunlight",
    description: "Direct midday sun with strong shadows",
    promptFragment: "harsh sunlight, direct sun, strong shadows, high contrast daylight",
  },
  {
    id: "lighting-dappled",
    name: "Dappled Light",
    description: "Light filtering through leaves creating patterns",
    promptFragment: "dappled sunlight, light filtering through leaves, natural patterns, forest light",
  },
  // Studio Lighting
  {
    id: "lighting-studio",
    name: "Studio Lighting",
    description: "Professional studio setup with controlled lighting",
    promptFragment: "professional studio lighting, softbox lighting, even illumination",
  },
  {
    id: "lighting-softbox",
    name: "Softbox Setup",
    description: "Soft, flattering light from diffused source",
    promptFragment: "softbox lighting, diffused light source, flattering illumination, minimal shadows",
  },
  {
    id: "lighting-ring-light",
    name: "Ring Light",
    description: "Even, flattering light popular for portraits",
    promptFragment: "ring light, even facial illumination, catchlight in eyes, beauty lighting",
  },
  {
    id: "lighting-rembrandt",
    name: "Rembrandt Lighting",
    description: "Classic portrait lighting with triangle under eye",
    promptFragment: "Rembrandt lighting, triangle shadow under eye, classic portrait style, artistic illumination",
  },
  {
    id: "lighting-butterfly",
    name: "Butterfly Lighting",
    description: "Glamour lighting from above creating butterfly shadow",
    promptFragment: "butterfly lighting, paramount lighting, shadow under nose, glamour portrait style",
  },
  {
    id: "lighting-split",
    name: "Split Lighting",
    description: "Half face lit, half in shadow for dramatic effect",
    promptFragment: "split lighting, half face illuminated, half in shadow, dramatic contrast",
  },
  // Dramatic & Artistic
  {
    id: "lighting-dramatic",
    name: "Dramatic Shadows",
    description: "High contrast lighting with deep shadows",
    promptFragment: "dramatic lighting, chiaroscuro, strong shadows, high contrast",
  },
  {
    id: "lighting-cinematic",
    name: "Cinematic",
    description: "Film-style lighting with dramatic atmosphere",
    promptFragment: "cinematic lighting, film noir style, moody atmosphere",
  },
  {
    id: "lighting-backlit",
    name: "Backlit",
    description: "Light source behind the subject creating silhouette effect",
    promptFragment: "backlit, rim lighting, silhouette effect, glowing edges",
  },
  {
    id: "lighting-rim",
    name: "Rim Light",
    description: "Highlights edges of subject from behind",
    promptFragment: "rim lighting, edge highlighting, subject separation, halo effect",
  },
  {
    id: "lighting-low-key",
    name: "Low Key",
    description: "Dark, moody lighting with minimal illumination",
    promptFragment: "low key lighting, dark atmosphere, minimal illumination, mysterious shadows",
  },
  {
    id: "lighting-high-key",
    name: "High Key",
    description: "Bright, even lighting with minimal shadows",
    promptFragment: "high key lighting, bright illumination, minimal shadows, clean look",
  },
  {
    id: "lighting-chiaroscuro",
    name: "Chiaroscuro",
    description: "Strong contrast between light and dark areas",
    promptFragment: "chiaroscuro lighting, dramatic light and shadow, Renaissance style, artistic contrast",
  },
  // Night & Artificial
  {
    id: "lighting-moonlight",
    name: "Moonlight",
    description: "Cool, ethereal moonlit atmosphere",
    promptFragment: "moonlight, cool blue tones, nighttime ambiance, ethereal glow",
  },
  {
    id: "lighting-neon",
    name: "Neon Glow",
    description: "Vibrant neon lights with colorful ambient glow",
    promptFragment: "neon lighting, vibrant colored lights, cyberpunk glow",
  },
  {
    id: "lighting-candlelight",
    name: "Candlelight",
    description: "Warm, flickering intimate lighting",
    promptFragment: "candlelight, warm flickering glow, intimate atmosphere, romantic lighting",
  },
  {
    id: "lighting-firelight",
    name: "Firelight",
    description: "Warm orange glow from fire source",
    promptFragment: "firelight, warm orange glow, dancing shadows, campfire atmosphere",
  },
  {
    id: "lighting-streetlamp",
    name: "Street Lamp",
    description: "Urban night lighting from street lamps",
    promptFragment: "street lamp lighting, urban night, pool of light, city ambiance",
  },
  {
    id: "lighting-neon-sign",
    name: "Neon Sign",
    description: "Colorful glow from neon signage",
    promptFragment: "neon sign lighting, colored glow, urban night atmosphere, vibrant illumination",
  },
  {
    id: "lighting-led-strip",
    name: "LED Strip",
    description: "Modern colored LED accent lighting",
    promptFragment: "LED strip lighting, colored accent lights, modern ambiance, gradient illumination",
  },
  // Special Effects
  {
    id: "lighting-foggy",
    name: "Foggy Atmosphere",
    description: "Diffused light through fog or mist",
    promptFragment: "foggy atmosphere, diffused misty light, atmospheric haze, soft ethereal glow",
  },
  {
    id: "lighting-volumetric",
    name: "Volumetric Light",
    description: "Visible light rays through atmosphere",
    promptFragment: "volumetric lighting, god rays, visible light beams, atmospheric rays",
  },
  {
    id: "lighting-rainbow",
    name: "Rainbow Light",
    description: "Prismatic colorful light spectrum",
    promptFragment: "rainbow lighting, prismatic colors, light spectrum, iridescent glow",
  },
  {
    id: "lighting-underwater",
    name: "Underwater Light",
    description: "Filtered blue-green aquatic lighting",
    promptFragment: "underwater lighting, caustic patterns, blue-green tones, aquatic ambiance",
  },
  // FLUX.2 Specific Lighting
  {
    id: "lighting-three-point-softbox",
    name: "Three-Point Softbox",
    description: "Professional three-point softbox setup for even illumination",
    promptFragment: "three-point softbox setup creating soft, diffused highlights with no harsh shadows",
  },
  {
    id: "lighting-harsh-flash",
    name: "Harsh Flash",
    description: "Direct flash photography with high exposure",
    promptFragment: "direct flash, high exposure, harsh flash lighting, sharp details visible",
  },
  {
    id: "lighting-editorial-flash",
    name: "Editorial Flash",
    description: "Cinematic harsh flash for editorial portraits",
    promptFragment: "cinematic harsh flash lighting, editorial raw portrait, intimate documentary style",
  },
  {
    id: "lighting-cross-processed",
    name: "Cross-Processed",
    description: "Cross-processed film look with color shifts",
    promptFragment: "cross-processed lighting, extreme color shifts, cyan-magenta split, oversaturated",
  },
  {
    id: "lighting-film-set",
    name: "Film Set Lighting",
    description: "Professional movie set lighting setup",
    promptFragment: "film set lighting, professional cinema lighting, multiple light sources, controlled exposure",
  },
  {
    id: "lighting-beauty-dish",
    name: "Beauty Dish",
    description: "Soft yet contrasty beauty lighting",
    promptFragment: "beauty dish lighting, soft contrast, wraparound light, fashion photography",
  },
  {
    id: "lighting-key-fill",
    name: "Key and Fill",
    description: "Classic two-light portrait setup",
    promptFragment: "key and fill lighting, balanced illumination, portrait lighting setup",
  },
  {
    id: "lighting-practical",
    name: "Practical Lighting",
    description: "Using in-scene light sources",
    promptFragment: "practical lighting, natural in-scene lights, realistic illumination, ambient sources",
  },
];

// ==========================================
// Camera/Composition Templates
// ==========================================
export const cameraTemplates: Template[] = [
  // Standard Shots
  {
    id: "camera-closeup",
    name: "Close-up",
    description: "Tight framing focusing on details",
    promptFragment: "close-up shot, detailed view, intimate framing",
  },
  {
    id: "camera-extreme-closeup",
    name: "Extreme Close-up",
    description: "Very tight framing on specific feature",
    promptFragment: "extreme close-up, tight framing on details, dramatic proximity",
  },
  {
    id: "camera-medium-shot",
    name: "Medium Shot",
    description: "Waist-up framing showing body language",
    promptFragment: "medium shot, waist-up framing, conversational distance",
  },
  {
    id: "camera-medium-closeup",
    name: "Medium Close-up",
    description: "Head and shoulders framing",
    promptFragment: "medium close-up, head and shoulders, interview style framing",
  },
  {
    id: "camera-wide",
    name: "Wide Shot",
    description: "Full scene view showing environment and context",
    promptFragment: "wide shot, full scene view, environmental context",
  },
  {
    id: "camera-extreme-wide",
    name: "Extreme Wide Shot",
    description: "Vast establishing shot showing full environment",
    promptFragment: "extreme wide shot, establishing shot, vast environment, epic scale",
  },
  {
    id: "camera-full-body",
    name: "Full Body Shot",
    description: "Complete figure from head to toe",
    promptFragment: "full body shot, head to toe framing, complete figure visible",
  },
  // Angles
  {
    id: "camera-low-angle",
    name: "Low Angle",
    description: "Shot from below looking up, making subject appear powerful",
    promptFragment: "low angle shot, looking up, heroic perspective",
  },
  {
    id: "camera-high-angle",
    name: "High Angle",
    description: "Shot from above looking down",
    promptFragment: "high angle shot, looking down, elevated perspective",
  },
  {
    id: "camera-birds-eye",
    name: "Bird's Eye",
    description: "Overhead view looking directly down",
    promptFragment: "bird's eye view, overhead shot, top-down perspective",
  },
  {
    id: "camera-worms-eye",
    name: "Worm's Eye View",
    description: "Extreme low angle from ground level",
    promptFragment: "worm's eye view, ground level, extreme low angle, dramatic upward perspective",
  },
  {
    id: "camera-dutch",
    name: "Dutch Angle",
    description: "Tilted camera creating dynamic, unsettling feel",
    promptFragment: "dutch angle, tilted frame, dynamic composition",
  },
  {
    id: "camera-eye-level",
    name: "Eye Level",
    description: "Neutral angle at subject's eye level",
    promptFragment: "eye level shot, neutral perspective, natural viewpoint",
  },
  // Portrait Specific
  {
    id: "camera-portrait",
    name: "Portrait",
    description: "Classic portrait framing with shallow depth of field",
    promptFragment: "portrait shot, shallow depth of field, bokeh background",
  },
  {
    id: "camera-headshot",
    name: "Headshot",
    description: "Professional head and shoulders portrait",
    promptFragment: "professional headshot, head and shoulders, clean composition",
  },
  {
    id: "camera-three-quarter",
    name: "Three-Quarter View",
    description: "Face turned slightly away from camera",
    promptFragment: "three-quarter view, face slightly turned, classic portrait angle",
  },
  {
    id: "camera-profile",
    name: "Profile Shot",
    description: "Side view of subject",
    promptFragment: "profile shot, side view, silhouette perspective",
  },
  // Creative & Technical
  {
    id: "camera-macro",
    name: "Macro",
    description: "Extreme close-up revealing tiny details",
    promptFragment: "macro photography, extreme close-up, fine details visible",
  },
  {
    id: "camera-over-shoulder",
    name: "Over-the-shoulder",
    description: "Shot from behind subject's shoulder",
    promptFragment: "over-the-shoulder shot, POV framing, conversational angle",
  },
  {
    id: "camera-pov",
    name: "Point of View",
    description: "First-person perspective as if through subject's eyes",
    promptFragment: "POV shot, first-person perspective, subjective view",
  },
  {
    id: "camera-tilt-shift",
    name: "Tilt-Shift",
    description: "Miniature effect with selective focus",
    promptFragment: "tilt-shift effect, miniature look, selective focus, toy-like appearance",
  },
  {
    id: "camera-fisheye",
    name: "Fisheye",
    description: "Ultra-wide angle with curved distortion",
    promptFragment: "fisheye lens, ultra-wide angle, curved distortion, extreme perspective",
  },
  {
    id: "camera-telephoto",
    name: "Telephoto Compression",
    description: "Compressed perspective from long lens",
    promptFragment: "telephoto compression, flattened perspective, background proximity",
  },
  // Composition Rules
  {
    id: "camera-rule-thirds",
    name: "Rule of Thirds",
    description: "Subject placed at intersection points",
    promptFragment: "rule of thirds composition, off-center subject, balanced framing",
  },
  {
    id: "camera-centered",
    name: "Centered Composition",
    description: "Subject placed directly in center",
    promptFragment: "centered composition, symmetrical framing, subject in middle",
  },
  {
    id: "camera-symmetrical",
    name: "Symmetrical",
    description: "Perfect symmetry in composition",
    promptFragment: "symmetrical composition, mirror balance, perfect symmetry",
  },
  {
    id: "camera-leading-lines",
    name: "Leading Lines",
    description: "Lines guiding eye to subject",
    promptFragment: "leading lines composition, visual guides to subject, depth perspective",
  },
  {
    id: "camera-framing",
    name: "Natural Frame",
    description: "Subject framed by environmental elements",
    promptFragment: "natural framing, subject framed by environment, frame within frame",
  },
  {
    id: "camera-negative-space",
    name: "Negative Space",
    description: "Lots of empty space around subject",
    promptFragment: "negative space composition, minimalist framing, isolated subject",
  },
  // Depth & Focus
  {
    id: "camera-shallow-dof",
    name: "Shallow Depth of Field",
    description: "Blurred background with sharp subject",
    promptFragment: "shallow depth of field, bokeh background, sharp subject focus, blurred surroundings",
  },
  {
    id: "camera-deep-focus",
    name: "Deep Focus",
    description: "Everything in sharp focus",
    promptFragment: "deep focus, everything sharp, full scene clarity, no blur",
  },
  {
    id: "camera-split-diopter",
    name: "Split Diopter",
    description: "Both foreground and background in focus",
    promptFragment: "split diopter effect, dual focus planes, foreground and background sharp",
  },
  // FLUX.2 Camera Settings
  {
    id: "camera-f1-4",
    name: "Wide Aperture (f/1.4)",
    description: "Very shallow depth of field with extreme bokeh",
    promptFragment: "f/1.4 aperture, extremely shallow depth of field, creamy bokeh, subject isolation",
  },
  {
    id: "camera-f2-8",
    name: "Portrait Aperture (f/2.8)",
    description: "Classic portrait depth of field",
    promptFragment: "f/2.8 aperture, shallow depth of field, smooth background blur, portrait quality",
  },
  {
    id: "camera-f5-6",
    name: "Balanced Aperture (f/5.6)",
    description: "Good balance between sharpness and depth",
    promptFragment: "f/5.6 aperture, balanced depth of field, sharp subject with soft background",
  },
  {
    id: "camera-f8",
    name: "Sharp Aperture (f/8)",
    description: "Maximum sharpness across the frame",
    promptFragment: "f/8 aperture, optimal sharpness, detailed rendering, professional quality",
  },
  {
    id: "camera-f11",
    name: "Landscape Aperture (f/11)",
    description: "Deep focus for landscapes and architecture",
    promptFragment: "f/11 aperture, deep focus, front to back sharpness, landscape photography",
  },
  {
    id: "camera-golden-ratio",
    name: "Golden Ratio",
    description: "Composition based on golden spiral",
    promptFragment: "golden ratio composition, golden spiral framing, naturally balanced",
  },
  {
    id: "camera-diagonal",
    name: "Diagonal Composition",
    description: "Dynamic diagonal lines in frame",
    promptFragment: "diagonal composition, dynamic angles, visual tension, energetic framing",
  },
  {
    id: "camera-fill-frame",
    name: "Fill the Frame",
    description: "Subject fills entire frame",
    promptFragment: "fill the frame composition, tight framing, impactful close view, no wasted space",
  },
  {
    id: "camera-layers",
    name: "Layered Composition",
    description: "Foreground, middle, background layers",
    promptFragment: "layered composition, foreground interest, middle ground subject, background depth",
  },
  {
    id: "camera-motion-blur",
    name: "Motion Blur",
    description: "Intentional movement blur effect",
    promptFragment: "motion blur, movement captured, dynamic blur, slow shutter effect",
  },
  {
    id: "camera-freeze-motion",
    name: "Frozen Motion",
    description: "Sharp capture of fast movement",
    promptFragment: "frozen motion, high shutter speed, crisp action, sharp movement capture",
  },
];

// ==========================================
// Style Templates
// ==========================================
export const styleTemplates: Template[] = [
  // Realistic
  {
    id: "style-photorealistic",
    name: "Photorealistic",
    description: "Hyper-realistic, photograph-like quality",
    promptFragment: "photorealistic, ultra-realistic, photograph quality, highly detailed",
  },
  {
    id: "style-hyperrealistic",
    name: "Hyperrealistic",
    description: "Beyond photo-real with enhanced details",
    promptFragment: "hyperrealistic, extreme detail, perfect clarity, lifelike rendering",
  },
  {
    id: "style-raw-photo",
    name: "Raw Photography",
    description: "Unprocessed, natural photo look",
    promptFragment: "raw photography style, unprocessed look, natural colors, authentic",
  },
  {
    id: "style-film-photography",
    name: "Film Photography",
    description: "Analog film aesthetic with grain",
    promptFragment: "film photography, analog film, natural grain, nostalgic color tones",
  },
  // FLUX.2 Era-Specific Photography Styles
  {
    id: "style-modern-digital",
    name: "Modern Digital",
    description: "Clean, sharp contemporary digital photography",
    promptFragment: "shot on modern digital camera, clean sharp, high dynamic range, contemporary look",
  },
  {
    id: "style-2000s-digicam",
    name: "2000s Digicam",
    description: "Early digital camera aesthetic with candid feel",
    promptFragment: "early digital camera, slight noise, flash photography, candid, 2000s digicam style",
  },
  {
    id: "style-80s-vintage-photo",
    name: "80s Vintage Photo",
    description: "1980s film photography with warm cast",
    promptFragment: "film grain, warm color cast, soft focus, 80s vintage photo, nostalgic",
  },
  {
    id: "style-analog-film",
    name: "Analog Film",
    description: "Classic film stock look with organic colors",
    promptFragment: "shot on analog film, natural grain, organic colors, film stock aesthetic",
  },
  {
    id: "style-kodak-portra",
    name: "Kodak Portra 400",
    description: "Warm, natural skin tones with fine grain",
    promptFragment: "shot on Kodak Portra 400, natural grain, warm skin tones, organic colors, film photography",
  },
  {
    id: "style-kodak-gold",
    name: "Kodak Gold 200",
    description: "Warm golden tones with classic consumer film look",
    promptFragment: "shot on Kodak Gold 200, golden warm tones, consumer film aesthetic, nostalgic colors",
  },
  {
    id: "style-kodak-ektar",
    name: "Kodak Ektar 100",
    description: "Vivid colors with fine grain for landscapes",
    promptFragment: "shot on Kodak Ektar 100, vivid saturated colors, fine grain, ultra-sharp",
  },
  {
    id: "style-fuji-superia",
    name: "Fuji Superia 400",
    description: "Cool tones with punchy colors",
    promptFragment: "shot on Fuji Superia 400, cool tones, punchy colors, consumer film look",
  },
  {
    id: "style-fuji-velvia",
    name: "Fuji Velvia 50",
    description: "Highly saturated slide film for landscapes",
    promptFragment: "shot on Fuji Velvia 50, extremely saturated colors, rich contrast, slide film, vivid",
  },
  {
    id: "style-ilford-hp5",
    name: "Ilford HP5 Plus",
    description: "Classic black and white with beautiful grain",
    promptFragment: "shot on Ilford HP5 Plus 400, black and white, beautiful grain structure, classic monochrome",
  },
  {
    id: "style-cinestill-800t",
    name: "CineStill 800T",
    description: "Cinematic tungsten film with halation",
    promptFragment: "shot on CineStill 800T, tungsten balanced, red halation around highlights, cinematic film look",
  },
  {
    id: "style-expired-film",
    name: "Expired Film",
    description: "Degraded film with unpredictable color shifts",
    promptFragment: "expired film, color shifts, unpredictable tones, degraded emulsion, vintage decay",
  },
  {
    id: "style-cross-processed",
    name: "Cross-Processed",
    description: "Slide film processed as negative with extreme colors",
    promptFragment: "cross-processed, extreme color shifts, high contrast, unconventional colors, experimental",
  },
  {
    id: "style-instant-polaroid",
    name: "Polaroid Instant",
    description: "Classic instant camera aesthetic",
    promptFragment: "Polaroid instant photo, unique color palette, soft edges, nostalgic instant film",
  },
  {
    id: "style-instax",
    name: "Fuji Instax",
    description: "Modern instant film look",
    promptFragment: "Fuji Instax style, bright colors, slightly overexposed, modern instant film",
  },
  {
    id: "style-daguerreotype",
    name: "Daguerreotype",
    description: "Early photography process look",
    promptFragment: "daguerreotype style, silver plate, early photography, historical process, mirror-like surface",
  },
  {
    id: "style-tintype",
    name: "Tintype",
    description: "Civil War era photography aesthetic",
    promptFragment: "tintype photograph, wet plate collodion, dark tones, Civil War era, historical portrait",
  },
  {
    id: "style-lomography",
    name: "Lomography",
    description: "Lo-fi, experimental analog photography",
    promptFragment: "lomography style, vignette, light leaks, saturated colors, lo-fi aesthetic, experimental",
  },
  // 3D & CGI
  {
    id: "style-3d-animation",
    name: "3D Animation",
    description: "Modern 3D animated movie style like Pixar",
    promptFragment: "3D animation style, Pixar-like, CGI rendering, smooth surfaces",
  },
  {
    id: "style-3d-render",
    name: "3D Render",
    description: "Clean CGI rendered look",
    promptFragment: "3D render, CGI quality, clean surfaces, professional rendering",
  },
  {
    id: "style-unreal-engine",
    name: "Unreal Engine",
    description: "Game engine cinematic quality",
    promptFragment: "Unreal Engine style, game engine quality, cinematic rendering, RTX lighting",
  },
  {
    id: "style-octane-render",
    name: "Octane Render",
    description: "High-end GPU rendering aesthetic",
    promptFragment: "Octane render, GPU rendering, subsurface scattering, realistic materials",
  },
  {
    id: "style-claymation",
    name: "Claymation",
    description: "Stop-motion clay animation style",
    promptFragment: "claymation style, stop-motion, clay textures, handcrafted look",
  },
  // Illustration & Digital Art
  {
    id: "style-digital-art",
    name: "Digital Art",
    description: "Modern digital illustration style",
    promptFragment: "digital art, digital illustration, clean lines, vibrant colors",
  },
  {
    id: "style-concept-art",
    name: "Concept Art",
    description: "Professional concept art for games/movies",
    promptFragment: "concept art style, professional illustration, detailed environments",
  },
  {
    id: "style-matte-painting",
    name: "Matte Painting",
    description: "Cinematic background painting style",
    promptFragment: "matte painting, cinematic background, epic scale, detailed landscapes",
  },
  {
    id: "style-vector",
    name: "Vector Art",
    description: "Clean, scalable vector illustration",
    promptFragment: "vector art style, clean lines, flat colors, scalable illustration",
  },
  {
    id: "style-flat-design",
    name: "Flat Design",
    description: "Minimalist flat illustration style",
    promptFragment: "flat design, minimalist illustration, no gradients, simple shapes",
  },
  {
    id: "style-isometric",
    name: "Isometric",
    description: "Isometric 3D illustration style",
    promptFragment: "isometric design, 2.5D perspective, clean geometric shapes",
  },
  // Traditional Art
  {
    id: "style-oil-painting",
    name: "Oil Painting",
    description: "Classical oil painting with rich textures",
    promptFragment: "oil painting style, rich textures, classical art, brush stroke details",
  },
  {
    id: "style-watercolor",
    name: "Watercolor",
    description: "Soft, flowing watercolor painting aesthetic",
    promptFragment: "watercolor painting, soft washes, flowing colors, artistic brush strokes",
  },
  {
    id: "style-acrylic",
    name: "Acrylic Painting",
    description: "Bold acrylic paint texture",
    promptFragment: "acrylic painting, bold strokes, vibrant pigments, textured surface",
  },
  {
    id: "style-gouache",
    name: "Gouache",
    description: "Matte opaque watercolor style",
    promptFragment: "gouache painting, matte finish, opaque colors, vintage illustration",
  },
  {
    id: "style-pencil-sketch",
    name: "Pencil Sketch",
    description: "Hand-drawn pencil illustration",
    promptFragment: "pencil sketch, hand-drawn, graphite shading, sketch aesthetic",
  },
  {
    id: "style-charcoal",
    name: "Charcoal Drawing",
    description: "Expressive charcoal sketch style",
    promptFragment: "charcoal drawing, expressive strokes, dramatic contrast, fine art",
  },
  {
    id: "style-ink-wash",
    name: "Ink Wash",
    description: "Traditional ink wash painting style",
    promptFragment: "ink wash painting, sumi-e style, brush strokes, monochromatic elegance",
  },
  {
    id: "style-pastel",
    name: "Pastel Art",
    description: "Soft pastel chalk artwork",
    promptFragment: "pastel art, soft chalky texture, gentle colors, dreamy aesthetic",
  },
  // Animation Styles
  {
    id: "style-anime",
    name: "Anime",
    description: "Japanese animation style with expressive features",
    promptFragment: "anime style, Japanese animation, expressive eyes, cel shading",
  },
  {
    id: "style-manga",
    name: "Manga",
    description: "Japanese comic black and white style",
    promptFragment: "manga style, black and white, screentones, dynamic lines, Japanese comic",
  },
  {
    id: "style-studio-ghibli",
    name: "Studio Ghibli",
    description: "Whimsical Ghibli animation style",
    promptFragment: "Studio Ghibli style, whimsical, hand-painted backgrounds, warm atmosphere",
  },
  {
    id: "style-cartoon",
    name: "Cartoon",
    description: "Western cartoon animation style",
    promptFragment: "cartoon style, animated, exaggerated features, bold outlines",
  },
  {
    id: "style-disney",
    name: "Disney Classic",
    description: "Classic Disney animation aesthetic",
    promptFragment: "Disney animation style, classic hand-drawn, expressive characters, magical",
  },
  {
    id: "style-comic-book",
    name: "Comic Book",
    description: "Western comic book illustration",
    promptFragment: "comic book style, bold lines, halftone dots, dynamic poses, superhero aesthetic",
  },
  {
    id: "style-graphic-novel",
    name: "Graphic Novel",
    description: "Mature graphic novel illustration",
    promptFragment: "graphic novel style, detailed illustration, dramatic shading, mature themes",
  },
  // Vintage & Retro
  {
    id: "style-vintage",
    name: "Vintage",
    description: "Retro, nostalgic aesthetic with aged tones",
    promptFragment: "vintage style, retro aesthetic, faded colors, nostalgic feel",
  },
  {
    id: "style-film-noir",
    name: "Film Noir",
    description: "Classic black and white with high contrast",
    promptFragment: "film noir style, black and white, high contrast, vintage cinema",
  },
  {
    id: "style-retro-80s",
    name: "80s Retro",
    description: "1980s nostalgic aesthetic",
    promptFragment: "80s retro style, neon colors, synthwave, vintage 1980s aesthetic",
  },
  {
    id: "style-retro-70s",
    name: "70s Retro",
    description: "1970s groovy aesthetic",
    promptFragment: "70s retro style, groovy colors, disco era, warm earth tones",
  },
  {
    id: "style-art-deco",
    name: "Art Deco",
    description: "1920s Art Deco geometric style",
    promptFragment: "Art Deco style, geometric patterns, gold accents, elegant 1920s aesthetic",
  },
  {
    id: "style-art-nouveau",
    name: "Art Nouveau",
    description: "Organic flowing Art Nouveau style",
    promptFragment: "Art Nouveau style, organic curves, flowing lines, nature-inspired ornaments",
  },
  {
    id: "style-victorian",
    name: "Victorian",
    description: "Ornate Victorian era aesthetic",
    promptFragment: "Victorian style, ornate details, sepia tones, 19th century aesthetic",
  },
  // Modern Artistic Movements
  {
    id: "style-pop-art",
    name: "Pop Art",
    description: "Bold colors and graphic style inspired by Warhol",
    promptFragment: "pop art style, bold colors, graphic design, Andy Warhol inspired",
  },
  {
    id: "style-surrealism",
    name: "Surrealism",
    description: "Dreamlike surrealist imagery",
    promptFragment: "surrealism style, dreamlike, Salvador Dali inspired, impossible imagery",
  },
  {
    id: "style-impressionism",
    name: "Impressionism",
    description: "Soft brushwork capturing light",
    promptFragment: "impressionism style, visible brushstrokes, light and color focus, Monet inspired",
  },
  {
    id: "style-expressionism",
    name: "Expressionism",
    description: "Emotional, distorted artistic expression",
    promptFragment: "expressionism style, emotional intensity, distorted forms, bold colors",
  },
  {
    id: "style-cubism",
    name: "Cubism",
    description: "Geometric fragmented Picasso style",
    promptFragment: "cubism style, geometric fragments, multiple perspectives, Picasso inspired",
  },
  {
    id: "style-minimalist",
    name: "Minimalist",
    description: "Clean, simple aesthetic with limited elements",
    promptFragment: "minimalist style, clean design, simple composition, negative space",
  },
  {
    id: "style-abstract",
    name: "Abstract",
    description: "Non-representational abstract art",
    promptFragment: "abstract art style, non-representational, shapes and colors, conceptual",
  },
  // Genre Specific
  {
    id: "style-cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic, neon-lit dystopian aesthetic",
    promptFragment: "cyberpunk style, neon colors, futuristic, dystopian aesthetic",
  },
  {
    id: "style-steampunk",
    name: "Steampunk",
    description: "Victorian-era mechanical aesthetic",
    promptFragment: "steampunk style, Victorian mechanics, brass and copper, gear aesthetic",
  },
  {
    id: "style-fantasy",
    name: "Fantasy Art",
    description: "Epic fantasy illustration style",
    promptFragment: "fantasy art style, magical, epic illustration, mythical creatures",
  },
  {
    id: "style-sci-fi",
    name: "Sci-Fi",
    description: "Science fiction futuristic aesthetic",
    promptFragment: "sci-fi style, futuristic technology, space age, advanced civilization",
  },
  {
    id: "style-horror",
    name: "Horror",
    description: "Dark, unsettling horror aesthetic",
    promptFragment: "horror style, dark atmosphere, unsettling imagery, gothic horror",
  },
  {
    id: "style-gothic",
    name: "Gothic",
    description: "Dark romantic gothic aesthetic",
    promptFragment: "gothic style, dark romantic, ornate architecture, mysterious atmosphere",
  },
  {
    id: "style-vaporwave",
    name: "Vaporwave",
    description: "Nostalgic internet aesthetic",
    promptFragment: "vaporwave style, pastel colors, glitch art, 90s internet aesthetic, retro digital",
  },
  {
    id: "style-dark-fantasy",
    name: "Dark Fantasy",
    description: "Grim dark fantasy world",
    promptFragment: "dark fantasy style, grim atmosphere, dark medieval, ominous mood",
  },
  // Special Effects
  {
    id: "style-double-exposure",
    name: "Double Exposure",
    description: "Multiple images blended together",
    promptFragment: "double exposure effect, blended imagery, artistic overlay, creative composite",
  },
  {
    id: "style-glitch-art",
    name: "Glitch Art",
    description: "Digital glitch aesthetic",
    promptFragment: "glitch art, digital corruption, RGB split, data distortion aesthetic",
  },
  {
    id: "style-holographic",
    name: "Holographic",
    description: "Iridescent holographic effect",
    promptFragment: "holographic style, iridescent colors, rainbow shimmer, futuristic effect",
  },
  {
    id: "style-neon-noir",
    name: "Neon Noir",
    description: "Dark noir with neon accents",
    promptFragment: "neon noir style, dark atmosphere, neon accents, cyberpunk noir",
  },
  {
    id: "style-low-poly",
    name: "Low Poly",
    description: "Geometric low polygon 3D style",
    promptFragment: "low poly style, geometric polygons, faceted surfaces, modern 3D",
  },
  {
    id: "style-pixel-art",
    name: "Pixel Art",
    description: "Retro pixel art game style",
    promptFragment: "pixel art, retro game style, 8-bit aesthetic, blocky pixels",
  },
];

// ==========================================
// Location Templates
// ==========================================
export const locationTemplates: Template[] = [
  // Urban
  {
    id: "location-urban",
    name: "Urban City",
    description: "Modern cityscape with buildings and streets",
    promptFragment: "urban city setting, modern architecture, city streets, metropolitan",
  },
  {
    id: "location-downtown",
    name: "Downtown District",
    description: "Busy downtown area with skyscrapers",
    promptFragment: "downtown setting, skyscrapers, busy streets, commercial district",
  },
  {
    id: "location-alley",
    name: "Back Alley",
    description: "Narrow urban alleyway",
    promptFragment: "back alley setting, narrow urban passage, brick walls, atmospheric",
  },
  {
    id: "location-rooftop",
    name: "Rooftop",
    description: "Building rooftop with city view",
    promptFragment: "rooftop setting, city skyline view, elevated perspective, urban backdrop",
  },
  {
    id: "location-subway",
    name: "Subway Station",
    description: "Underground metro station",
    promptFragment: "subway station, underground metro, tiled walls, urban transit",
  },
  {
    id: "location-parking-garage",
    name: "Parking Garage",
    description: "Multi-level parking structure",
    promptFragment: "parking garage, concrete structure, fluorescent lighting, industrial urban",
  },
  {
    id: "location-bridge",
    name: "City Bridge",
    description: "Urban bridge crossing",
    promptFragment: "city bridge, urban crossing, water below, architectural structure",
  },
  // Nature - Forests & Woods
  {
    id: "location-forest",
    name: "Forest",
    description: "Dense woodland with trees and natural elements",
    promptFragment: "forest setting, dense trees, woodland, natural greenery",
  },
  {
    id: "location-enchanted-forest",
    name: "Enchanted Forest",
    description: "Magical mystical woodland",
    promptFragment: "enchanted forest, magical woods, ethereal atmosphere, mystical trees",
  },
  {
    id: "location-bamboo-forest",
    name: "Bamboo Forest",
    description: "Tall bamboo grove",
    promptFragment: "bamboo forest, tall bamboo stalks, green filtered light, Asian aesthetic",
  },
  {
    id: "location-autumn-forest",
    name: "Autumn Forest",
    description: "Fall foliage woodland",
    promptFragment: "autumn forest, fall colors, orange and red leaves, seasonal beauty",
  },
  {
    id: "location-pine-forest",
    name: "Pine Forest",
    description: "Coniferous pine woodland",
    promptFragment: "pine forest, evergreen trees, needle floor, crisp atmosphere",
  },
  // Nature - Water
  {
    id: "location-beach",
    name: "Beach",
    description: "Coastal scene with sand and ocean",
    promptFragment: "beach setting, sandy shore, ocean waves, coastal scene",
  },
  {
    id: "location-tropical-beach",
    name: "Tropical Beach",
    description: "Paradise tropical shoreline",
    promptFragment: "tropical beach, palm trees, turquoise water, paradise setting",
  },
  {
    id: "location-rocky-coast",
    name: "Rocky Coastline",
    description: "Dramatic rocky shore",
    promptFragment: "rocky coastline, dramatic cliffs, crashing waves, rugged shore",
  },
  {
    id: "location-lake",
    name: "Lake",
    description: "Serene lakeside setting",
    promptFragment: "lake setting, calm waters, reflective surface, peaceful atmosphere",
  },
  {
    id: "location-waterfall",
    name: "Waterfall",
    description: "Cascading waterfall scene",
    promptFragment: "waterfall setting, cascading water, mist, natural wonder",
  },
  {
    id: "location-river",
    name: "River",
    description: "Flowing river setting",
    promptFragment: "river setting, flowing water, banks and stones, natural waterway",
  },
  {
    id: "location-underwater",
    name: "Underwater",
    description: "Beneath the water surface",
    promptFragment: "underwater setting, aquatic environment, ocean depths, marine atmosphere",
  },
  // Nature - Mountains & Terrain
  {
    id: "location-mountains",
    name: "Mountains",
    description: "Majestic mountain landscape",
    promptFragment: "mountain setting, majestic peaks, alpine landscape, rocky terrain",
  },
  {
    id: "location-snowy-peaks",
    name: "Snowy Peaks",
    description: "Snow-covered mountain tops",
    promptFragment: "snowy mountain peaks, white caps, alpine winter, pristine snow",
  },
  {
    id: "location-desert",
    name: "Desert",
    description: "Sandy desert landscape",
    promptFragment: "desert setting, sand dunes, arid landscape, dry climate",
  },
  {
    id: "location-canyon",
    name: "Canyon",
    description: "Deep canyon with rock walls",
    promptFragment: "canyon setting, deep gorge, layered rock walls, dramatic depth",
  },
  {
    id: "location-meadow",
    name: "Meadow",
    description: "Open grassy field",
    promptFragment: "meadow setting, open field, wildflowers, gentle grass",
  },
  {
    id: "location-hilltop",
    name: "Hilltop",
    description: "Elevated hillside view",
    promptFragment: "hilltop setting, elevated view, rolling hills, panoramic landscape",
  },
  {
    id: "location-cave",
    name: "Cave",
    description: "Underground cavern",
    promptFragment: "cave setting, underground cavern, rock formations, dark interior",
  },
  {
    id: "location-glacier",
    name: "Glacier",
    description: "Icy glacial landscape",
    promptFragment: "glacier setting, ice formations, blue ice, frozen landscape",
  },
  {
    id: "location-volcano",
    name: "Volcano",
    description: "Volcanic landscape",
    promptFragment: "volcanic setting, lava rock, dramatic terrain, primordial landscape",
  },
  // Indoor - Residential
  {
    id: "location-living-room",
    name: "Living Room",
    description: "Home living space",
    promptFragment: "living room setting, home interior, comfortable furnishings, domestic space",
  },
  {
    id: "location-bedroom",
    name: "Bedroom",
    description: "Personal bedroom space",
    promptFragment: "bedroom setting, personal space, bed and furnishings, intimate interior",
  },
  {
    id: "location-kitchen",
    name: "Kitchen",
    description: "Home kitchen area",
    promptFragment: "kitchen setting, cooking space, appliances and counters, domestic kitchen",
  },
  {
    id: "location-bathroom",
    name: "Bathroom",
    description: "Bathroom interior",
    promptFragment: "bathroom setting, tiled interior, fixtures, clean space",
  },
  {
    id: "location-home-office",
    name: "Home Office",
    description: "Residential workspace",
    promptFragment: "home office, residential workspace, desk setup, personal study",
  },
  // Indoor - Commercial
  {
    id: "location-cafe",
    name: "Cafe",
    description: "Cozy cafe or coffee shop interior",
    promptFragment: "cafe setting, coffee shop interior, cozy atmosphere, warm ambiance",
  },
  {
    id: "location-restaurant",
    name: "Restaurant",
    description: "Dining establishment interior",
    promptFragment: "restaurant setting, dining interior, elegant tables, fine dining atmosphere",
  },
  {
    id: "location-bar",
    name: "Bar",
    description: "Bar or pub interior",
    promptFragment: "bar setting, pub interior, dim lighting, bottles and glasses",
  },
  {
    id: "location-nightclub",
    name: "Nightclub",
    description: "Dance club interior",
    promptFragment: "nightclub setting, dance floor, colorful lights, party atmosphere",
  },
  {
    id: "location-hotel-lobby",
    name: "Hotel Lobby",
    description: "Grand hotel entrance",
    promptFragment: "hotel lobby, grand entrance, elegant decor, hospitality setting",
  },
  {
    id: "location-office",
    name: "Modern Office",
    description: "Corporate office space",
    promptFragment: "modern office, corporate setting, desks and computers, professional space",
  },
  {
    id: "location-library",
    name: "Library",
    description: "Room filled with books",
    promptFragment: "library setting, bookshelves, reading area, scholarly atmosphere",
  },
  {
    id: "location-gym",
    name: "Gym",
    description: "Fitness center interior",
    promptFragment: "gym setting, fitness equipment, workout space, athletic environment",
  },
  // Indoor - Special
  {
    id: "location-studio",
    name: "Studio Backdrop",
    description: "Clean studio background for focused portraits",
    promptFragment: "studio backdrop, clean background, professional setting, neutral backdrop",
  },
  {
    id: "location-photo-studio",
    name: "Photo Studio",
    description: "Professional photography studio",
    promptFragment: "photo studio, professional setup, lighting equipment, creative space",
  },
  {
    id: "location-art-gallery",
    name: "Art Gallery",
    description: "Museum or gallery space",
    promptFragment: "art gallery, museum interior, white walls, exhibition space",
  },
  {
    id: "location-theater",
    name: "Theater",
    description: "Performance venue interior",
    promptFragment: "theater setting, stage and seats, velvet curtains, performance venue",
  },
  {
    id: "location-warehouse",
    name: "Warehouse",
    description: "Industrial warehouse space",
    promptFragment: "warehouse setting, industrial space, high ceilings, raw brick and metal",
  },
  {
    id: "location-abandoned-building",
    name: "Abandoned Building",
    description: "Derelict structure interior",
    promptFragment: "abandoned building, derelict interior, decay and debris, atmospheric ruin",
  },
  // Fantasy & Sci-Fi
  {
    id: "location-futuristic",
    name: "Futuristic City",
    description: "Sci-fi environment with advanced technology",
    promptFragment: "futuristic setting, sci-fi environment, advanced technology, sleek design",
  },
  {
    id: "location-space-station",
    name: "Space Station",
    description: "Orbital space habitat",
    promptFragment: "space station interior, orbital habitat, futuristic corridors, zero gravity",
  },
  {
    id: "location-alien-planet",
    name: "Alien Planet",
    description: "Extraterrestrial world",
    promptFragment: "alien planet, extraterrestrial landscape, otherworldly terrain, sci-fi world",
  },
  {
    id: "location-medieval-castle",
    name: "Medieval Castle",
    description: "Fantasy castle interior",
    promptFragment: "medieval castle, stone walls, torches, fantasy architecture",
  },
  {
    id: "location-throne-room",
    name: "Throne Room",
    description: "Royal throne chamber",
    promptFragment: "throne room, royal chamber, grand architecture, regal setting",
  },
  {
    id: "location-magic-realm",
    name: "Magic Realm",
    description: "Mystical magical world",
    promptFragment: "magical realm, fantasy world, enchanted environment, mystical atmosphere",
  },
  {
    id: "location-cyberpunk-city",
    name: "Cyberpunk City",
    description: "Neon-lit dystopian metropolis",
    promptFragment: "cyberpunk city, neon lights, dystopian urban, high-tech low-life",
  },
  // Abstract & Creative
  {
    id: "location-abstract",
    name: "Abstract",
    description: "Non-representational, artistic background",
    promptFragment: "abstract background, artistic setting, non-representational, creative backdrop",
  },
  {
    id: "location-void",
    name: "Void Space",
    description: "Empty infinite space",
    promptFragment: "void background, infinite space, empty darkness, minimalist setting",
  },
  {
    id: "location-gradient",
    name: "Gradient Background",
    description: "Smooth color gradient backdrop",
    promptFragment: "gradient background, smooth color transition, professional backdrop",
  },
  {
    id: "location-bokeh",
    name: "Bokeh Background",
    description: "Blurred light circles",
    promptFragment: "bokeh background, blurred lights, dreamy circles, out of focus backdrop",
  },
  {
    id: "location-dreamscape",
    name: "Dreamscape",
    description: "Surreal dream environment",
    promptFragment: "dreamscape setting, surreal environment, dream world, ethereal atmosphere",
  },
];

// ==========================================
// Pose Templates
// ==========================================
export const poseTemplates: Template[] = [
  // Standing
  {
    id: "pose-standing",
    name: "Standing",
    description: "Upright standing position",
    promptFragment: "standing pose, upright position, confident stance",
  },
  {
    id: "pose-standing-relaxed",
    name: "Relaxed Standing",
    description: "Casual relaxed standing",
    promptFragment: "relaxed standing pose, casual stance, weight on one leg",
  },
  {
    id: "pose-standing-confident",
    name: "Power Pose",
    description: "Confident assertive stance",
    promptFragment: "power pose, confident stance, hands on hips, assertive posture",
  },
  {
    id: "pose-standing-crossed-arms",
    name: "Arms Crossed",
    description: "Standing with folded arms",
    promptFragment: "arms crossed pose, standing with folded arms, confident posture",
  },
  {
    id: "pose-hands-in-pockets",
    name: "Hands in Pockets",
    description: "Casual hands in pockets",
    promptFragment: "hands in pockets, casual stance, relaxed posture",
  },
  {
    id: "pose-contrapposto",
    name: "Contrapposto",
    description: "Classic weight shift pose",
    promptFragment: "contrapposto pose, weight shifted, classical stance, elegant posture",
  },
  // Sitting
  {
    id: "pose-sitting",
    name: "Sitting",
    description: "Seated position on chair or surface",
    promptFragment: "sitting pose, seated position, relaxed posture",
  },
  {
    id: "pose-sitting-crossed-legs",
    name: "Cross-Legged",
    description: "Sitting with legs crossed",
    promptFragment: "cross-legged sitting, elegant seated pose, legs crossed",
  },
  {
    id: "pose-sitting-floor",
    name: "Floor Sitting",
    description: "Sitting on the ground",
    promptFragment: "sitting on floor, ground-level pose, relaxed seating",
  },
  {
    id: "pose-sitting-edge",
    name: "Perched",
    description: "Sitting on edge of surface",
    promptFragment: "perched pose, sitting on edge, alert posture",
  },
  {
    id: "pose-lounging",
    name: "Lounging",
    description: "Relaxed lounging position",
    promptFragment: "lounging pose, relaxed recline, comfortable position",
  },
  {
    id: "pose-meditation",
    name: "Meditation",
    description: "Cross-legged meditation pose",
    promptFragment: "meditation pose, lotus position, zen posture, peaceful sitting",
  },
  // Leaning
  {
    id: "pose-leaning",
    name: "Leaning",
    description: "Leaning against wall or surface",
    promptFragment: "leaning pose, casual stance, resting against surface",
  },
  {
    id: "pose-leaning-wall",
    name: "Wall Lean",
    description: "Leaning against a wall",
    promptFragment: "leaning against wall, casual wall pose, relaxed stance",
  },
  {
    id: "pose-leaning-forward",
    name: "Forward Lean",
    description: "Leaning forward with interest",
    promptFragment: "forward lean pose, engaged posture, attentive stance",
  },
  {
    id: "pose-leaning-back",
    name: "Backward Lean",
    description: "Leaning back casually",
    promptFragment: "leaning back, relaxed recline, casual backward lean",
  },
  // Lying
  {
    id: "pose-lying",
    name: "Lying Down",
    description: "Horizontal resting position",
    promptFragment: "lying down pose, reclined position, horizontal posture",
  },
  {
    id: "pose-lying-side",
    name: "Side Lying",
    description: "Lying on one side",
    promptFragment: "side lying pose, resting on side, comfortable recline",
  },
  {
    id: "pose-lying-back",
    name: "Lying on Back",
    description: "Supine position facing up",
    promptFragment: "lying on back, supine position, face up recline",
  },
  {
    id: "pose-lying-stomach",
    name: "Lying on Stomach",
    description: "Prone position facing down",
    promptFragment: "lying on stomach, prone position, face down pose",
  },
  // Dynamic Movement
  {
    id: "pose-walking",
    name: "Walking",
    description: "Mid-stride walking motion",
    promptFragment: "walking pose, mid-stride, natural movement",
  },
  {
    id: "pose-running",
    name: "Running",
    description: "Dynamic running motion",
    promptFragment: "running pose, dynamic motion, athletic movement",
  },
  {
    id: "pose-jumping",
    name: "Jumping",
    description: "Mid-air jumping action",
    promptFragment: "jumping pose, mid-air, dynamic leap, energetic",
  },
  {
    id: "pose-crouching",
    name: "Crouching",
    description: "Low crouching or squatting position",
    promptFragment: "crouching pose, low stance, squatting position",
  },
  {
    id: "pose-kneeling",
    name: "Kneeling",
    description: "On one or both knees",
    promptFragment: "kneeling pose, on knees, lowered stance",
  },
  {
    id: "pose-turning",
    name: "Mid-Turn",
    description: "Caught mid-turn movement",
    promptFragment: "mid-turn pose, turning motion, dynamic twist",
  },
  {
    id: "pose-stepping",
    name: "Stepping Forward",
    description: "Taking a step forward",
    promptFragment: "stepping pose, forward movement, purposeful stride",
  },
  // Action Poses
  {
    id: "pose-reaching",
    name: "Reaching",
    description: "Reaching for something",
    promptFragment: "reaching pose, extended arm, grasping motion",
  },
  {
    id: "pose-pointing",
    name: "Pointing",
    description: "Pointing gesture",
    promptFragment: "pointing pose, directional gesture, indicating motion",
  },
  {
    id: "pose-waving",
    name: "Waving",
    description: "Hand wave gesture",
    promptFragment: "waving pose, greeting gesture, raised hand wave",
  },
  {
    id: "pose-stretching",
    name: "Stretching",
    description: "Full body stretch",
    promptFragment: "stretching pose, body stretch, extended limbs, flexible position",
  },
  {
    id: "pose-dancing",
    name: "Dance Pose",
    description: "Elegant dance position",
    promptFragment: "dance pose, elegant position, graceful stance",
  },
  {
    id: "pose-action-hero",
    name: "Action Hero",
    description: "Dynamic heroic stance",
    promptFragment: "action hero pose, dynamic stance, powerful position",
  },
  {
    id: "pose-defensive",
    name: "Defensive Stance",
    description: "Guarded protective position",
    promptFragment: "defensive pose, guarded stance, protective position",
  },
  // Professional/Casual
  {
    id: "pose-arms-behind-back",
    name: "Arms Behind Back",
    description: "Hands clasped behind",
    promptFragment: "arms behind back, hands clasped, formal stance",
  },
  {
    id: "pose-chin-rest",
    name: "Chin Rest",
    description: "Hand resting under chin",
    promptFragment: "chin rest pose, hand under chin, thoughtful position",
  },
  {
    id: "pose-head-tilt",
    name: "Head Tilt",
    description: "Slight head tilt",
    promptFragment: "head tilt pose, angled head, curious expression",
  },
  {
    id: "pose-looking-away",
    name: "Looking Away",
    description: "Gaze directed off-camera",
    promptFragment: "looking away pose, off-camera gaze, contemplative direction",
  },
  {
    id: "pose-over-shoulder",
    name: "Over Shoulder Look",
    description: "Looking back over shoulder",
    promptFragment: "over shoulder look, backward glance, turned pose",
  },
];

// ==========================================
// Action Templates
// ==========================================
export const actionTemplates: Template[] = [
  // Emotions/Expressions as Actions
  {
    id: "action-smiling",
    name: "Smiling",
    description: "Happy, smiling expression",
    promptFragment: "smiling, happy expression, warm smile",
  },
  {
    id: "action-laughing",
    name: "Laughing",
    description: "Genuine laughter expression",
    promptFragment: "laughing, genuine laughter, joyful expression",
  },
  {
    id: "action-thinking",
    name: "Thinking",
    description: "Contemplative, thoughtful expression",
    promptFragment: "thinking, contemplative expression, pensive mood",
  },
  {
    id: "action-talking",
    name: "Talking",
    description: "Engaged in conversation",
    promptFragment: "talking, mid-conversation, expressive gestures",
  },
  {
    id: "action-whispering",
    name: "Whispering",
    description: "Speaking softly, secretive",
    promptFragment: "whispering, speaking softly, secretive gesture",
  },
  {
    id: "action-shouting",
    name: "Shouting",
    description: "Calling out loudly",
    promptFragment: "shouting, calling out, raised voice, energetic",
  },
  // Work & Productivity
  {
    id: "action-working",
    name: "Working",
    description: "Engaged in work or task",
    promptFragment: "working, focused on task, productive activity",
  },
  {
    id: "action-typing",
    name: "Typing",
    description: "Typing on keyboard or device",
    promptFragment: "typing, keyboard work, focused on screen",
  },
  {
    id: "action-writing",
    name: "Writing",
    description: "Writing by hand",
    promptFragment: "writing, pen in hand, focused on paper",
  },
  {
    id: "action-reading",
    name: "Reading",
    description: "Reading a book or document",
    promptFragment: "reading, holding book, focused attention",
  },
  {
    id: "action-studying",
    name: "Studying",
    description: "Intense focused learning",
    promptFragment: "studying, concentrated learning, surrounded by materials",
  },
  {
    id: "action-presenting",
    name: "Presenting",
    description: "Giving a presentation",
    promptFragment: "presenting, public speaking, confident gesture",
  },
  {
    id: "action-meeting",
    name: "In a Meeting",
    description: "Participating in discussion",
    promptFragment: "in meeting, business discussion, collaborative setting",
  },
  // Physical Activities
  {
    id: "action-dancing",
    name: "Dancing",
    description: "Dynamic dancing movement",
    promptFragment: "dancing, dynamic movement, rhythmic motion",
  },
  {
    id: "action-exercising",
    name: "Exercising",
    description: "Physical workout activity",
    promptFragment: "exercising, workout activity, physical exertion",
  },
  {
    id: "action-yoga",
    name: "Yoga",
    description: "Yoga practice pose",
    promptFragment: "yoga pose, mindful stretching, zen practice",
  },
  {
    id: "action-running",
    name: "Running",
    description: "Jogging or sprinting",
    promptFragment: "running, athletic motion, active movement",
  },
  {
    id: "action-swimming",
    name: "Swimming",
    description: "Swimming motion",
    promptFragment: "swimming, in water motion, athletic stroke",
  },
  {
    id: "action-climbing",
    name: "Climbing",
    description: "Climbing activity",
    promptFragment: "climbing, ascending motion, gripping holds",
  },
  {
    id: "action-jumping",
    name: "Jumping",
    description: "Mid-jump action",
    promptFragment: "jumping, leaping motion, airborne action",
  },
  // Leisure Activities
  {
    id: "action-playing-music",
    name: "Playing Music",
    description: "Playing an instrument",
    promptFragment: "playing music, musical instrument, performance",
  },
  {
    id: "action-singing",
    name: "Singing",
    description: "Vocal performance",
    promptFragment: "singing, vocal performance, musical expression",
  },
  {
    id: "action-painting",
    name: "Painting",
    description: "Creating art",
    promptFragment: "painting, creating art, brush in hand, artistic activity",
  },
  {
    id: "action-cooking",
    name: "Cooking",
    description: "Preparing food",
    promptFragment: "cooking, preparing food, culinary activity",
  },
  {
    id: "action-gaming",
    name: "Gaming",
    description: "Playing video games",
    promptFragment: "gaming, playing video games, controller in hand",
  },
  {
    id: "action-gardening",
    name: "Gardening",
    description: "Tending to plants",
    promptFragment: "gardening, tending plants, outdoor activity",
  },
  {
    id: "action-photography",
    name: "Taking Photos",
    description: "Using a camera",
    promptFragment: "taking photos, camera in hand, capturing moment",
  },
  // Social Actions
  {
    id: "action-hugging",
    name: "Hugging",
    description: "Embracing someone",
    promptFragment: "hugging, embracing, affectionate gesture",
  },
  {
    id: "action-handshake",
    name: "Handshake",
    description: "Formal greeting",
    promptFragment: "handshake, formal greeting, business gesture",
  },
  {
    id: "action-waving",
    name: "Waving",
    description: "Greeting wave",
    promptFragment: "waving, greeting gesture, friendly wave",
  },
  {
    id: "action-cheering",
    name: "Cheering",
    description: "Celebratory cheering",
    promptFragment: "cheering, celebrating, excited gesture, arms raised",
  },
  {
    id: "action-applauding",
    name: "Applauding",
    description: "Clapping hands",
    promptFragment: "applauding, clapping, appreciation gesture",
  },
  {
    id: "action-toasting",
    name: "Toasting",
    description: "Raising glass for toast",
    promptFragment: "toasting, raising glass, celebratory gesture",
  },
  // Daily Activities
  {
    id: "action-eating",
    name: "Eating",
    description: "Enjoying food",
    promptFragment: "eating, enjoying food, dining activity",
  },
  {
    id: "action-drinking",
    name: "Drinking",
    description: "Having a beverage",
    promptFragment: "drinking, beverage in hand, refreshment",
  },
  {
    id: "action-coffee",
    name: "Drinking Coffee",
    description: "Enjoying coffee",
    promptFragment: "drinking coffee, holding coffee cup, morning routine",
  },
  {
    id: "action-sleeping",
    name: "Sleeping",
    description: "Asleep or resting",
    promptFragment: "sleeping, peaceful rest, eyes closed",
  },
  {
    id: "action-stretching",
    name: "Stretching",
    description: "Morning stretch or workout stretch",
    promptFragment: "stretching, extending limbs, flexible movement",
  },
  {
    id: "action-phone-call",
    name: "Phone Call",
    description: "On the phone",
    promptFragment: "on phone, phone call, conversation on mobile",
  },
  {
    id: "action-texting",
    name: "Texting",
    description: "Using smartphone",
    promptFragment: "texting, using phone, smartphone activity",
  },
  {
    id: "action-walking",
    name: "Walking",
    description: "Casual walking",
    promptFragment: "walking, casual stroll, moving forward",
  },
  // Contemplative Actions
  {
    id: "action-meditating",
    name: "Meditating",
    description: "Mindfulness practice",
    promptFragment: "meditating, mindfulness, peaceful concentration",
  },
  {
    id: "action-daydreaming",
    name: "Daydreaming",
    description: "Lost in thought",
    promptFragment: "daydreaming, lost in thought, distant gaze",
  },
  {
    id: "action-stargazing",
    name: "Stargazing",
    description: "Looking at the sky",
    promptFragment: "stargazing, looking up at sky, contemplative gaze",
  },
  {
    id: "action-watching",
    name: "Watching",
    description: "Observing something",
    promptFragment: "watching, observing intently, focused attention",
  },
];

// ==========================================
// Clothing Templates
// ==========================================
export const clothingTemplates: Template[] = [
  // Casual
  {
    id: "clothing-casual",
    name: "Casual",
    description: "Everyday casual wear",
    promptFragment: "casual clothing, everyday wear, relaxed outfit",
  },
  {
    id: "clothing-tshirt-jeans",
    name: "T-Shirt & Jeans",
    description: "Classic casual combination",
    promptFragment: "t-shirt and jeans, classic casual look, comfortable clothing",
  },
  {
    id: "clothing-hoodie",
    name: "Hoodie",
    description: "Comfortable hooded sweatshirt",
    promptFragment: "wearing hoodie, comfortable sweatshirt, casual streetwear",
  },
  {
    id: "clothing-sweater",
    name: "Sweater",
    description: "Cozy knit sweater",
    promptFragment: "wearing sweater, cozy knitwear, comfortable top",
  },
  {
    id: "clothing-cardigan",
    name: "Cardigan",
    description: "Button-up knit cardigan",
    promptFragment: "wearing cardigan, button-up knit, layered casual",
  },
  {
    id: "clothing-polo",
    name: "Polo Shirt",
    description: "Smart casual polo",
    promptFragment: "polo shirt, smart casual, collared casual top",
  },
  // Formal & Business
  {
    id: "clothing-formal",
    name: "Formal",
    description: "Business or formal attire",
    promptFragment: "formal attire, business wear, professional clothing",
  },
  {
    id: "clothing-suit",
    name: "Business Suit",
    description: "Professional suit and tie",
    promptFragment: "business suit, professional attire, formal suiting",
  },
  {
    id: "clothing-blazer",
    name: "Blazer",
    description: "Smart blazer jacket",
    promptFragment: "wearing blazer, smart jacket, semi-formal wear",
  },
  {
    id: "clothing-dress-shirt",
    name: "Dress Shirt",
    description: "Formal button-down shirt",
    promptFragment: "dress shirt, button-down formal, professional top",
  },
  {
    id: "clothing-tuxedo",
    name: "Tuxedo",
    description: "Black tie formal wear",
    promptFragment: "tuxedo, black tie attire, formal evening wear",
  },
  {
    id: "clothing-business-casual",
    name: "Business Casual",
    description: "Smart but relaxed office wear",
    promptFragment: "business casual, smart office wear, professional relaxed",
  },
  // Dresses & Skirts
  {
    id: "clothing-dress",
    name: "Dress",
    description: "Casual or formal dress",
    promptFragment: "wearing dress, one-piece outfit, feminine attire",
  },
  {
    id: "clothing-evening-gown",
    name: "Evening Gown",
    description: "Formal evening dress",
    promptFragment: "evening gown, formal long dress, elegant attire",
  },
  {
    id: "clothing-cocktail-dress",
    name: "Cocktail Dress",
    description: "Semi-formal short dress",
    promptFragment: "cocktail dress, semi-formal dress, party attire",
  },
  {
    id: "clothing-sundress",
    name: "Sundress",
    description: "Light summer dress",
    promptFragment: "sundress, light summer dress, casual feminine",
  },
  {
    id: "clothing-maxi-dress",
    name: "Maxi Dress",
    description: "Long flowing dress",
    promptFragment: "maxi dress, long flowing dress, bohemian style",
  },
  {
    id: "clothing-skirt",
    name: "Skirt",
    description: "Various skirt styles",
    promptFragment: "wearing skirt, feminine bottom wear, versatile style",
  },
  // Athletic & Active
  {
    id: "clothing-athletic",
    name: "Athletic",
    description: "Sports or workout clothing",
    promptFragment: "athletic wear, sports clothing, workout outfit",
  },
  {
    id: "clothing-yoga",
    name: "Yoga Wear",
    description: "Flexible yoga attire",
    promptFragment: "yoga wear, stretchy athletic, flexible clothing",
  },
  {
    id: "clothing-running-gear",
    name: "Running Gear",
    description: "Running attire",
    promptFragment: "running gear, athletic shorts and top, sports attire",
  },
  {
    id: "clothing-swimwear",
    name: "Swimwear",
    description: "Swimming attire",
    promptFragment: "swimwear, beach attire, swimming outfit",
  },
  {
    id: "clothing-sports-uniform",
    name: "Sports Uniform",
    description: "Team sports attire",
    promptFragment: "sports uniform, team jersey, athletic competition wear",
  },
  // Streetwear & Urban
  {
    id: "clothing-streetwear",
    name: "Streetwear",
    description: "Urban street fashion style",
    promptFragment: "streetwear, urban fashion, trendy street style",
  },
  {
    id: "clothing-hypebeast",
    name: "Hypebeast",
    description: "High-end streetwear",
    promptFragment: "hypebeast style, designer streetwear, exclusive urban fashion",
  },
  {
    id: "clothing-urban-layers",
    name: "Urban Layers",
    description: "Layered street style",
    promptFragment: "urban layered look, multiple layers, street fashion",
  },
  {
    id: "clothing-denim-jacket",
    name: "Denim Jacket",
    description: "Classic jean jacket",
    promptFragment: "denim jacket, jean jacket, classic casual outerwear",
  },
  {
    id: "clothing-bomber-jacket",
    name: "Bomber Jacket",
    description: "Classic bomber style",
    promptFragment: "bomber jacket, classic outerwear, casual cool",
  },
  // Elegant & Luxury
  {
    id: "clothing-elegant",
    name: "Elegant",
    description: "Sophisticated, upscale fashion",
    promptFragment: "elegant attire, sophisticated fashion, upscale clothing",
  },
  {
    id: "clothing-haute-couture",
    name: "Haute Couture",
    description: "High fashion designer wear",
    promptFragment: "haute couture, high fashion, designer clothing",
  },
  {
    id: "clothing-designer",
    name: "Designer Wear",
    description: "Luxury brand clothing",
    promptFragment: "designer clothing, luxury fashion, premium attire",
  },
  {
    id: "clothing-silk",
    name: "Silk Attire",
    description: "Luxurious silk garments",
    promptFragment: "silk clothing, luxurious fabric, elegant material",
  },
  // Vintage & Retro
  {
    id: "clothing-vintage",
    name: "Vintage",
    description: "Retro or period-appropriate clothing",
    promptFragment: "vintage clothing, retro fashion, period attire",
  },
  {
    id: "clothing-retro-50s",
    name: "1950s Style",
    description: "Classic 50s fashion",
    promptFragment: "1950s fashion, retro fifties style, classic vintage",
  },
  {
    id: "clothing-retro-70s",
    name: "1970s Style",
    description: "Groovy 70s fashion",
    promptFragment: "1970s fashion, seventies style, disco era clothing",
  },
  {
    id: "clothing-retro-80s",
    name: "1980s Style",
    description: "Bold 80s fashion",
    promptFragment: "1980s fashion, eighties style, bold retro",
  },
  {
    id: "clothing-retro-90s",
    name: "1990s Style",
    description: "90s grunge and minimalist",
    promptFragment: "1990s fashion, nineties style, grunge minimalist",
  },
  // Cultural & Traditional
  {
    id: "clothing-traditional",
    name: "Traditional Wear",
    description: "Cultural traditional clothing",
    promptFragment: "traditional clothing, cultural attire, heritage wear",
  },
  {
    id: "clothing-kimono",
    name: "Kimono",
    description: "Traditional Japanese garment",
    promptFragment: "wearing kimono, Japanese traditional, elegant robe",
  },
  {
    id: "clothing-hanbok",
    name: "Hanbok",
    description: "Traditional Korean attire",
    promptFragment: "wearing hanbok, Korean traditional, colorful formal",
  },
  {
    id: "clothing-saree",
    name: "Saree",
    description: "Traditional Indian garment",
    promptFragment: "wearing saree, Indian traditional, elegant draping",
  },
  {
    id: "clothing-cheongsam",
    name: "Cheongsam",
    description: "Traditional Chinese dress",
    promptFragment: "wearing cheongsam, Chinese traditional dress, elegant fitted",
  },
  // Special & Themed
  {
    id: "clothing-uniform",
    name: "Uniform",
    description: "Professional or school uniform",
    promptFragment: "wearing uniform, professional attire, standardized clothing",
  },
  {
    id: "clothing-military",
    name: "Military Style",
    description: "Military-inspired fashion",
    promptFragment: "military style clothing, tactical fashion, army aesthetic",
  },
  {
    id: "clothing-punk",
    name: "Punk",
    description: "Punk rock fashion",
    promptFragment: "punk fashion, rebellious style, leather and studs",
  },
  {
    id: "clothing-goth",
    name: "Gothic",
    description: "Gothic fashion style",
    promptFragment: "gothic fashion, dark clothing, dramatic black attire",
  },
  {
    id: "clothing-bohemian",
    name: "Bohemian",
    description: "Boho chic style",
    promptFragment: "bohemian style, boho chic, free-spirited fashion",
  },
  {
    id: "clothing-minimalist",
    name: "Minimalist",
    description: "Clean simple fashion",
    promptFragment: "minimalist fashion, clean simple lines, neutral colors",
  },
  // Outerwear
  {
    id: "clothing-winter-coat",
    name: "Winter Coat",
    description: "Heavy winter outerwear",
    promptFragment: "winter coat, heavy outerwear, cold weather clothing",
  },
  {
    id: "clothing-leather-jacket",
    name: "Leather Jacket",
    description: "Classic leather jacket",
    promptFragment: "leather jacket, classic outerwear, edgy style",
  },
  {
    id: "clothing-trench-coat",
    name: "Trench Coat",
    description: "Classic trench style",
    promptFragment: "trench coat, classic outerwear, sophisticated style",
  },
  {
    id: "clothing-raincoat",
    name: "Raincoat",
    description: "Weather protection",
    promptFragment: "raincoat, waterproof outerwear, weather protection",
  },
  // Fantasy & Costume
  {
    id: "clothing-fantasy-armor",
    name: "Fantasy Armor",
    description: "Medieval or fantasy armor",
    promptFragment: "fantasy armor, medieval plate, warrior attire",
  },
  {
    id: "clothing-royal-robes",
    name: "Royal Robes",
    description: "Regal royal garments",
    promptFragment: "royal robes, regal attire, majestic clothing",
  },
  {
    id: "clothing-futuristic",
    name: "Futuristic",
    description: "Sci-fi inspired fashion",
    promptFragment: "futuristic clothing, sci-fi fashion, advanced textiles",
  },
  {
    id: "clothing-cyberpunk",
    name: "Cyberpunk Fashion",
    description: "Tech-enhanced urban wear",
    promptFragment: "cyberpunk fashion, tech wear, neon accented clothing",
  },
];

// ==========================================
// Expression Templates
// ==========================================
export const expressionTemplates: Template[] = [
  // Positive Emotions
  {
    id: "expression-neutral",
    name: "Neutral",
    description: "Calm, neutral facial expression",
    promptFragment: "neutral expression, calm face, relaxed features",
  },
  {
    id: "expression-happy",
    name: "Happy",
    description: "Joyful, pleased expression",
    promptFragment: "happy expression, joyful face, pleased look",
  },
  {
    id: "expression-joyful",
    name: "Joyful",
    description: "Radiating with joy",
    promptFragment: "joyful expression, beaming happiness, radiant smile",
  },
  {
    id: "expression-content",
    name: "Content",
    description: "Peaceful satisfaction",
    promptFragment: "content expression, peaceful satisfaction, gentle smile",
  },
  {
    id: "expression-excited",
    name: "Excited",
    description: "Enthusiastic and thrilled",
    promptFragment: "excited expression, enthusiastic face, thrilled look",
  },
  {
    id: "expression-amused",
    name: "Amused",
    description: "Entertained smirk",
    promptFragment: "amused expression, entertained smirk, playful look",
  },
  {
    id: "expression-proud",
    name: "Proud",
    description: "Self-satisfied pride",
    promptFragment: "proud expression, self-satisfied look, accomplished face",
  },
  {
    id: "expression-loving",
    name: "Loving",
    description: "Warm affectionate gaze",
    promptFragment: "loving expression, warm affectionate gaze, tender look",
  },
  {
    id: "expression-hopeful",
    name: "Hopeful",
    description: "Optimistic and expecting",
    promptFragment: "hopeful expression, optimistic look, expectant face",
  },
  // Confident & Serious
  {
    id: "expression-confident",
    name: "Confident",
    description: "Self-assured, bold expression",
    promptFragment: "confident expression, self-assured look, bold demeanor",
  },
  {
    id: "expression-determined",
    name: "Determined",
    description: "Resolute and focused",
    promptFragment: "determined expression, resolute face, focused determination",
  },
  {
    id: "expression-serious",
    name: "Serious",
    description: "Focused, serious demeanor",
    promptFragment: "serious expression, focused look, determined face",
  },
  {
    id: "expression-stern",
    name: "Stern",
    description: "Strict serious look",
    promptFragment: "stern expression, strict look, unyielding face",
  },
  {
    id: "expression-intense",
    name: "Intense",
    description: "Deep concentrated gaze",
    promptFragment: "intense expression, concentrated gaze, penetrating look",
  },
  {
    id: "expression-stoic",
    name: "Stoic",
    description: "Emotionless and controlled",
    promptFragment: "stoic expression, emotionless face, controlled demeanor",
  },
  // Thoughtful & Contemplative
  {
    id: "expression-thoughtful",
    name: "Thoughtful",
    description: "Deep in thought",
    promptFragment: "thoughtful expression, deep in thought, contemplative face",
  },
  {
    id: "expression-pensive",
    name: "Pensive",
    description: "Lost in deep thought",
    promptFragment: "pensive expression, lost in thought, reflective look",
  },
  {
    id: "expression-curious",
    name: "Curious",
    description: "Interested and questioning",
    promptFragment: "curious expression, interested look, questioning face",
  },
  {
    id: "expression-wondering",
    name: "Wondering",
    description: "Imaginative pondering",
    promptFragment: "wondering expression, imaginative look, dreamy pondering",
  },
  {
    id: "expression-skeptical",
    name: "Skeptical",
    description: "Doubtful and questioning",
    promptFragment: "skeptical expression, doubtful look, questioning face",
  },
  {
    id: "expression-focused",
    name: "Focused",
    description: "Concentrated attention",
    promptFragment: "focused expression, concentrated look, attentive face",
  },
  // Surprised & Amazed
  {
    id: "expression-surprised",
    name: "Surprised",
    description: "Shocked or amazed expression",
    promptFragment: "surprised expression, shocked look, wide eyes",
  },
  {
    id: "expression-amazed",
    name: "Amazed",
    description: "Wonder and astonishment",
    promptFragment: "amazed expression, wonder-filled face, astonished look",
  },
  {
    id: "expression-shocked",
    name: "Shocked",
    description: "Stunned disbelief",
    promptFragment: "shocked expression, stunned look, disbelief face",
  },
  {
    id: "expression-bewildered",
    name: "Bewildered",
    description: "Confused amazement",
    promptFragment: "bewildered expression, confused look, puzzled face",
  },
  // Negative & Complex Emotions
  {
    id: "expression-sad",
    name: "Sad",
    description: "Sorrowful expression",
    promptFragment: "sad expression, sorrowful look, downcast face",
  },
  {
    id: "expression-melancholic",
    name: "Melancholic",
    description: "Deep sadness and longing",
    promptFragment: "melancholic expression, deep sadness, wistful look",
  },
  {
    id: "expression-worried",
    name: "Worried",
    description: "Anxious and concerned",
    promptFragment: "worried expression, anxious look, concerned face",
  },
  {
    id: "expression-fearful",
    name: "Fearful",
    description: "Scared and alarmed",
    promptFragment: "fearful expression, scared look, alarmed face",
  },
  {
    id: "expression-angry",
    name: "Angry",
    description: "Rage and frustration",
    promptFragment: "angry expression, furious look, enraged face",
  },
  {
    id: "expression-frustrated",
    name: "Frustrated",
    description: "Annoyed and vexed",
    promptFragment: "frustrated expression, annoyed look, vexed face",
  },
  {
    id: "expression-disgusted",
    name: "Disgusted",
    description: "Revulsion and distaste",
    promptFragment: "disgusted expression, revulsion, distaste face",
  },
  {
    id: "expression-disappointed",
    name: "Disappointed",
    description: "Let down and dismayed",
    promptFragment: "disappointed expression, let down look, dismayed face",
  },
  // Mysterious & Enigmatic
  {
    id: "expression-mysterious",
    name: "Mysterious",
    description: "Enigmatic, intriguing expression",
    promptFragment: "mysterious expression, enigmatic look, intriguing gaze",
  },
  {
    id: "expression-secretive",
    name: "Secretive",
    description: "Hiding something",
    promptFragment: "secretive expression, knowing look, hidden meaning",
  },
  {
    id: "expression-smirking",
    name: "Smirking",
    description: "Knowing half-smile",
    promptFragment: "smirking expression, knowing half-smile, clever look",
  },
  {
    id: "expression-mischievous",
    name: "Mischievous",
    description: "Playfully naughty",
    promptFragment: "mischievous expression, playful naughty look, impish grin",
  },
  {
    id: "expression-seductive",
    name: "Seductive",
    description: "Alluring and enticing",
    promptFragment: "seductive expression, alluring look, enticing gaze",
  },
  // Other Expressions
  {
    id: "expression-dreamy",
    name: "Dreamy",
    description: "Lost in fantasy",
    promptFragment: "dreamy expression, lost in fantasy, faraway look",
  },
  {
    id: "expression-sleepy",
    name: "Sleepy",
    description: "Drowsy and tired",
    promptFragment: "sleepy expression, drowsy look, tired eyes",
  },
  {
    id: "expression-bored",
    name: "Bored",
    description: "Uninterested and dull",
    promptFragment: "bored expression, uninterested look, dull face",
  },
  {
    id: "expression-embarrassed",
    name: "Embarrassed",
    description: "Flustered and shy",
    promptFragment: "embarrassed expression, flustered look, shy face",
  },
  {
    id: "expression-awkward",
    name: "Awkward",
    description: "Uncomfortable and uneasy",
    promptFragment: "awkward expression, uncomfortable look, uneasy face",
  },
  {
    id: "expression-blank",
    name: "Blank",
    description: "Empty expressionless face",
    promptFragment: "blank expression, expressionless face, vacant look",
  },
];

// ==========================================
// Mood/Atmosphere Templates (FLUX.2)
// ==========================================
export const moodTemplates: Template[] = [
  // Positive Moods
  {
    id: "mood-clean",
    name: "Clean & Professional",
    description: "Polished, professional atmosphere",
    promptFragment: "clean professional mood, polished aesthetic, refined atmosphere",
  },
  {
    id: "mood-warm",
    name: "Warm & Inviting",
    description: "Cozy, welcoming atmosphere",
    promptFragment: "warm inviting mood, cozy atmosphere, welcoming ambiance",
  },
  {
    id: "mood-joyful",
    name: "Joyful & Uplifting",
    description: "Happy, positive energy",
    promptFragment: "joyful mood, uplifting atmosphere, positive energy, celebratory",
  },
  {
    id: "mood-peaceful",
    name: "Peaceful & Serene",
    description: "Calm, tranquil atmosphere",
    promptFragment: "peaceful mood, serene atmosphere, tranquil ambiance, zen-like",
  },
  {
    id: "mood-romantic",
    name: "Romantic",
    description: "Intimate, loving atmosphere",
    promptFragment: "romantic mood, intimate atmosphere, soft romantic ambiance",
  },
  {
    id: "mood-whimsical",
    name: "Whimsical & Playful",
    description: "Fun, lighthearted atmosphere",
    promptFragment: "whimsical mood, playful atmosphere, lighthearted, fantastical",
  },
  {
    id: "mood-magical",
    name: "Magical & Enchanting",
    description: "Mystical, fairy-tale atmosphere",
    promptFragment: "magical mood, enchanting atmosphere, mystical ambiance, fairy-tale",
  },
  {
    id: "mood-hopeful",
    name: "Hopeful & Optimistic",
    description: "Forward-looking, positive atmosphere",
    promptFragment: "hopeful mood, optimistic atmosphere, promising, inspirational",
  },
  // Dramatic & Intense Moods
  {
    id: "mood-dramatic",
    name: "Dramatic & Intense",
    description: "High emotion, theatrical atmosphere",
    promptFragment: "dramatic mood, intense atmosphere, theatrical, high emotion",
  },
  {
    id: "mood-mysterious",
    name: "Mysterious & Enigmatic",
    description: "Intriguing, secretive atmosphere",
    promptFragment: "mysterious mood, enigmatic atmosphere, intriguing, secretive ambiance",
  },
  {
    id: "mood-tense",
    name: "Tense & Suspenseful",
    description: "Anticipation, edge-of-seat atmosphere",
    promptFragment: "tense mood, suspenseful atmosphere, anticipation, thriller ambiance",
  },
  {
    id: "mood-eerie",
    name: "Eerie & Unsettling",
    description: "Creepy, uncomfortable atmosphere",
    promptFragment: "eerie mood, unsettling atmosphere, creepy ambiance, uncanny",
  },
  {
    id: "mood-haunting",
    name: "Haunting & Ethereal",
    description: "Ghost-like, lingering atmosphere",
    promptFragment: "haunting mood, ethereal atmosphere, spectral, lingering presence",
  },
  {
    id: "mood-epic",
    name: "Epic & Grand",
    description: "Monumental, larger-than-life atmosphere",
    promptFragment: "epic mood, grand atmosphere, monumental scale, larger-than-life",
  },
  // Melancholic Moods
  {
    id: "mood-melancholic",
    name: "Melancholic & Wistful",
    description: "Sad, longing atmosphere",
    promptFragment: "melancholic mood, wistful atmosphere, nostalgic sadness, longing",
  },
  {
    id: "mood-somber",
    name: "Somber & Reflective",
    description: "Serious, contemplative atmosphere",
    promptFragment: "somber mood, reflective atmosphere, contemplative, introspective",
  },
  {
    id: "mood-lonely",
    name: "Lonely & Isolated",
    description: "Solitary, desolate atmosphere",
    promptFragment: "lonely mood, isolated atmosphere, solitary feeling, desolate",
  },
  {
    id: "mood-bittersweet",
    name: "Bittersweet",
    description: "Mixed emotions, poignant atmosphere",
    promptFragment: "bittersweet mood, poignant atmosphere, mixed emotions, touching",
  },
  // Documentary & Editorial
  {
    id: "mood-documentary",
    name: "Documentary & Raw",
    description: "Authentic, unpolished atmosphere",
    promptFragment: "documentary mood, raw atmosphere, authentic, unfiltered",
  },
  {
    id: "mood-editorial",
    name: "Editorial & Fashion",
    description: "High fashion, curated atmosphere",
    promptFragment: "editorial mood, fashion atmosphere, curated aesthetic, high-end",
  },
  {
    id: "mood-candid",
    name: "Candid & Natural",
    description: "Unposed, spontaneous atmosphere",
    promptFragment: "candid mood, natural atmosphere, spontaneous, unposed authentic",
  },
  {
    id: "mood-intimate-documentary",
    name: "Intimate Documentary",
    description: "Personal, close documentary style",
    promptFragment: "intimate documentary mood, personal atmosphere, close observation, humorous documentary style",
  },
  // Energy & Action
  {
    id: "mood-energetic",
    name: "Energetic & Dynamic",
    description: "High energy, active atmosphere",
    promptFragment: "energetic mood, dynamic atmosphere, high energy, vibrant movement",
  },
  {
    id: "mood-rebellious",
    name: "Rebellious & Edgy",
    description: "Counter-culture, defiant atmosphere",
    promptFragment: "rebellious mood, edgy atmosphere, counter-culture, defiant",
  },
  {
    id: "mood-triumphant",
    name: "Triumphant & Victorious",
    description: "Achievement, celebration atmosphere",
    promptFragment: "triumphant mood, victorious atmosphere, achievement, celebratory",
  },
  // Nostalgic & Vintage
  {
    id: "mood-nostalgic",
    name: "Nostalgic & Retro",
    description: "Past-focused, memory-evoking atmosphere",
    promptFragment: "nostalgic mood, retro atmosphere, memory-evoking, vintage feeling",
  },
  {
    id: "mood-summer-mystery",
    name: "Summer Mystery",
    description: "Warm seasonal with intrigue",
    promptFragment: "summer mystery vibe, warm intrigue, seasonal atmosphere with secrets",
  },
  // Professional Contexts
  {
    id: "mood-corporate",
    name: "Corporate & Business",
    description: "Professional, formal atmosphere",
    promptFragment: "corporate mood, business atmosphere, professional, formal setting",
  },
  {
    id: "mood-luxury",
    name: "Luxury & Premium",
    description: "High-end, exclusive atmosphere",
    promptFragment: "luxury mood, premium atmosphere, exclusive, sophisticated elegance",
  },
  {
    id: "mood-minimalist",
    name: "Minimalist & Zen",
    description: "Simple, uncluttered atmosphere",
    promptFragment: "minimalist mood, zen atmosphere, simple, uncluttered, essential",
  },
];

// ==========================================
// Camera Model Templates (FLUX.2)
// ==========================================
export const cameraModelTemplates: Template[] = [
  // Modern Professional Digital
  {
    id: "camera-model-sony-a7iv",
    name: "Sony A7IV",
    description: "Modern full-frame mirrorless with excellent dynamic range",
    promptFragment: "shot on Sony A7IV, clean sharp, high dynamic range, modern digital",
  },
  {
    id: "camera-model-sony-a7riv",
    name: "Sony A7R IV",
    description: "High resolution full-frame mirrorless",
    promptFragment: "shot on Sony A7R IV, 61 megapixel, extreme detail, high resolution",
  },
  {
    id: "camera-model-canon-5d-mark-iv",
    name: "Canon 5D Mark IV",
    description: "Professional DSLR workhorse",
    promptFragment: "shot on Canon 5D Mark IV, professional quality, rich colors, reliable rendering",
  },
  {
    id: "camera-model-canon-r5",
    name: "Canon EOS R5",
    description: "High-end mirrorless with superb image quality",
    promptFragment: "shot on Canon EOS R5, 45 megapixel, exceptional detail, professional mirrorless",
  },
  {
    id: "camera-model-nikon-z8",
    name: "Nikon Z8",
    description: "Professional mirrorless with excellent colors",
    promptFragment: "shot on Nikon Z8, professional colors, excellent dynamic range, modern Nikon",
  },
  {
    id: "camera-model-nikon-d850",
    name: "Nikon D850",
    description: "High resolution professional DSLR",
    promptFragment: "shot on Nikon D850, 45.7 megapixel, professional DSLR quality, excellent detail",
  },
  // Medium Format
  {
    id: "camera-model-hasselblad-x2d",
    name: "Hasselblad X2D",
    description: "Premium medium format with legendary quality",
    promptFragment: "shot on Hasselblad X2D, medium format, legendary color science, premium quality",
  },
  {
    id: "camera-model-fujifilm-gfx100",
    name: "Fujifilm GFX 100S",
    description: "100MP medium format with Fujifilm colors",
    promptFragment: "shot on Fujifilm GFX 100S, 100 megapixel, medium format, beautiful Fujifilm colors",
  },
  {
    id: "camera-model-phase-one",
    name: "Phase One IQ4",
    description: "Ultimate resolution medium format",
    promptFragment: "shot on Phase One IQ4, 150 megapixel, ultimate detail, commercial quality",
  },
  // Fujifilm APS-C
  {
    id: "camera-model-fujifilm-xt5",
    name: "Fujifilm X-T5",
    description: "Premium APS-C with film simulations",
    promptFragment: "shot on Fujifilm X-T5, 40 megapixel APS-C, Fujifilm color science, retro design",
  },
  {
    id: "camera-model-fujifilm-xpro3",
    name: "Fujifilm X-Pro3",
    description: "Rangefinder-style with classic aesthetics",
    promptFragment: "shot on Fujifilm X-Pro3, rangefinder style, classic film look, street photography",
  },
  // Leica
  {
    id: "camera-model-leica-m11",
    name: "Leica M11",
    description: "Legendary rangefinder with Leica rendering",
    promptFragment: "shot on Leica M11, Leica rendering, rangefinder quality, legendary color science",
  },
  {
    id: "camera-model-leica-q3",
    name: "Leica Q3",
    description: "Premium compact with Leica DNA",
    promptFragment: "shot on Leica Q3, 28mm Summilux, Leica look, premium compact quality",
  },
  {
    id: "camera-model-leica-sl2",
    name: "Leica SL2",
    description: "Full-frame mirrorless with Leica quality",
    promptFragment: "shot on Leica SL2, full-frame mirrorless, Leica image quality, professional",
  },
  // Film Cameras
  {
    id: "camera-model-contax-t2",
    name: "Contax T2",
    description: "Cult classic compact film camera",
    promptFragment: "shot on Contax T2, Carl Zeiss lens, film aesthetic, vintage compact quality",
  },
  {
    id: "camera-model-mamiya-rz67",
    name: "Mamiya RZ67",
    description: "Medium format film legend",
    promptFragment: "shot on Mamiya RZ67, 6x7 medium format film, legendary portrait camera",
  },
  {
    id: "camera-model-hasselblad-500cm",
    name: "Hasselblad 500CM",
    description: "Iconic medium format film camera",
    promptFragment: "shot on Hasselblad 500CM, 6x6 medium format film, classic Hasselblad rendering",
  },
  {
    id: "camera-model-leica-m6",
    name: "Leica M6",
    description: "Classic 35mm film rangefinder",
    promptFragment: "shot on Leica M6, 35mm film, rangefinder photography, classic Leica look",
  },
  {
    id: "camera-model-nikon-fm2",
    name: "Nikon FM2",
    description: "Classic manual 35mm film SLR",
    promptFragment: "shot on Nikon FM2, 35mm film SLR, manual focus, classic Nikon rendering",
  },
  {
    id: "camera-model-canon-ae1",
    name: "Canon AE-1",
    description: "Iconic 35mm film SLR",
    promptFragment: "shot on Canon AE-1, 35mm film, classic Canon look, 1970s aesthetic",
  },
  // Vintage & Character
  {
    id: "camera-model-holga",
    name: "Holga 120",
    description: "Toy camera with light leaks and vignetting",
    promptFragment: "shot on Holga 120, toy camera aesthetic, light leaks, heavy vignette, lo-fi",
  },
  {
    id: "camera-model-diana",
    name: "Diana F+",
    description: "Dreamy toy camera with soft focus",
    promptFragment: "shot on Diana F+, dreamy soft focus, plastic lens, experimental film",
  },
  {
    id: "camera-model-polaroid-sx70",
    name: "Polaroid SX-70",
    description: "Classic instant camera",
    promptFragment: "shot on Polaroid SX-70, instant film, unique color palette, vintage instant",
  },
  // Smartphone for Authenticity
  {
    id: "camera-model-iphone",
    name: "iPhone",
    description: "Modern smartphone camera look",
    promptFragment: "shot on iPhone, smartphone photography, computational photography, modern mobile",
  },
];

// ==========================================
// Lens Templates (FLUX.2)
// ==========================================
export const lensTemplates: Template[] = [
  // Prime Lenses - Wide
  {
    id: "lens-14mm",
    name: "14mm Ultra-Wide",
    description: "Ultra-wide for dramatic perspectives",
    promptFragment: "14mm ultra-wide lens, dramatic perspective, environmental context, architectural",
  },
  {
    id: "lens-24mm",
    name: "24mm Wide Angle",
    description: "Wide angle for environmental portraits",
    promptFragment: "24mm wide angle lens, environmental context, slight perspective, storytelling",
  },
  {
    id: "lens-28mm",
    name: "28mm Classic Wide",
    description: "Classic street photography focal length",
    promptFragment: "28mm lens, classic street focal length, natural perspective, documentary",
  },
  // Prime Lenses - Standard
  {
    id: "lens-35mm",
    name: "35mm Standard Wide",
    description: "Versatile classic focal length",
    promptFragment: "35mm lens, classic focal length, natural perspective, versatile framing",
  },
  {
    id: "lens-35mm-f14",
    name: "35mm f/1.4",
    description: "Fast 35mm with shallow depth",
    promptFragment: "35mm f/1.4 lens, wide aperture, shallow depth of field, environmental portraits",
  },
  {
    id: "lens-50mm",
    name: "50mm Normal",
    description: "Human eye equivalent perspective",
    promptFragment: "50mm lens, normal focal length, natural human perspective, classic standard",
  },
  {
    id: "lens-50mm-f12",
    name: "50mm f/1.2",
    description: "Ultra-fast fifty with dreamy bokeh",
    promptFragment: "50mm f/1.2 lens, ultra-fast aperture, dreamy bokeh, creamy background",
  },
  // Prime Lenses - Portrait
  {
    id: "lens-85mm",
    name: "85mm Portrait",
    description: "Classic portrait focal length",
    promptFragment: "85mm portrait lens, flattering compression, beautiful bokeh, portrait rendering",
  },
  {
    id: "lens-85mm-f14",
    name: "85mm f/1.4",
    description: "Fast portrait lens with creamy bokeh",
    promptFragment: "85mm f/1.4 lens, portrait quality, extremely shallow depth of field, subject isolation",
  },
  {
    id: "lens-100mm",
    name: "100mm Short Tele",
    description: "Tight portraits and details",
    promptFragment: "100mm lens, short telephoto, tight portraits, compressed perspective",
  },
  {
    id: "lens-105mm-f14",
    name: "105mm f/1.4",
    description: "Premium portrait telephoto",
    promptFragment: "105mm f/1.4 lens, premium portrait quality, extreme bokeh, professional rendering",
  },
  // Prime Lenses - Telephoto
  {
    id: "lens-135mm",
    name: "135mm Portrait Tele",
    description: "Beautiful compression for portraits",
    promptFragment: "135mm lens, portrait telephoto, beautiful compression, isolated subject",
  },
  {
    id: "lens-200mm",
    name: "200mm Telephoto",
    description: "Compressed backgrounds, sports and wildlife",
    promptFragment: "200mm telephoto lens, strong compression, distant subject isolation",
  },
  {
    id: "lens-400mm",
    name: "400mm Super Telephoto",
    description: "Extreme compression for wildlife",
    promptFragment: "400mm super telephoto, extreme compression, wildlife photography, distant subjects",
  },
  // Zoom Lenses
  {
    id: "lens-24-70mm",
    name: "24-70mm f/2.8",
    description: "Professional standard zoom",
    promptFragment: "24-70mm f/2.8 zoom lens, professional versatility, sharp throughout range",
  },
  {
    id: "lens-70-200mm",
    name: "70-200mm f/2.8",
    description: "Professional telephoto zoom",
    promptFragment: "70-200mm f/2.8 zoom lens, telephoto versatility, portrait and event quality",
  },
  {
    id: "lens-16-35mm",
    name: "16-35mm f/2.8",
    description: "Professional wide zoom",
    promptFragment: "16-35mm f/2.8 zoom lens, wide-angle versatility, landscape and architecture",
  },
  // Specialty Lenses
  {
    id: "lens-macro",
    name: "Macro Lens",
    description: "Extreme close-up capability",
    promptFragment: "macro lens, extreme close-up, fine detail, 1:1 magnification capable",
  },
  {
    id: "lens-tilt-shift",
    name: "Tilt-Shift Lens",
    description: "Selective focus and perspective control",
    promptFragment: "tilt-shift lens, selective focus plane, perspective correction, miniature effect capable",
  },
  {
    id: "lens-fisheye",
    name: "Fisheye Lens",
    description: "Extreme wide with curved distortion",
    promptFragment: "fisheye lens, 180 degree view, curved distortion, extreme wide angle",
  },
  {
    id: "lens-soft-focus",
    name: "Soft Focus Lens",
    description: "Intentionally soft romantic rendering",
    promptFragment: "soft focus lens, dreamy softness, romantic rendering, gentle glow",
  },
  // Vintage & Character Lenses
  {
    id: "lens-helios-44",
    name: "Helios 44-2 58mm",
    description: "Swirly bokeh vintage Soviet lens",
    promptFragment: "Helios 44-2 58mm lens, swirly bokeh, vintage Soviet rendering, character lens",
  },
  {
    id: "lens-petzval",
    name: "Petzval Lens",
    description: "Classic swirly bokeh portrait lens",
    promptFragment: "Petzval lens, dramatic swirly bokeh, center sharpness, artistic rendering",
  },
  {
    id: "lens-zeiss-planar",
    name: "Zeiss Planar 50mm",
    description: "Classic Zeiss rendering",
    promptFragment: "Zeiss Planar 50mm, classic Zeiss rendering, smooth bokeh, micro-contrast",
  },
  {
    id: "lens-leica-summilux",
    name: "Leica Summilux",
    description: "Legendary Leica fast prime",
    promptFragment: "Leica Summilux lens, legendary rendering, Leica glow, premium optics",
  },
  {
    id: "lens-leica-noctilux",
    name: "Leica Noctilux",
    description: "Ultra-fast Leica with unique rendering",
    promptFragment: "Leica Noctilux f/0.95, ultra-fast, unique glow, extreme shallow depth",
  },
];

// ==========================================
// Color Palette Templates (FLUX.2)
// ==========================================
export const colorPaletteTemplates: Template[] = [
  // Warm Palettes
  {
    id: "color-warm-golden",
    name: "Warm Golden",
    description: "Golden hour warm tones",
    promptFragment: "warm golden color palette, golden tones, sun-kissed warmth",
  },
  {
    id: "color-warm-amber",
    name: "Amber Tones",
    description: "Rich amber and honey colors",
    promptFragment: "amber color palette, honey tones, rich warm browns, autumn warmth",
  },
  {
    id: "color-warm-sunset",
    name: "Sunset Colors",
    description: "Orange, pink, and purple sunset hues",
    promptFragment: "sunset color palette, orange and pink, purple hues, warm gradient sky",
  },
  {
    id: "color-warm-terracotta",
    name: "Terracotta & Earth",
    description: "Earthy warm clay tones",
    promptFragment: "terracotta color palette, earthy clay tones, warm earth colors, natural warmth",
  },
  // Cool Palettes
  {
    id: "color-cool-blue",
    name: "Cool Blue",
    description: "Calming blue tones",
    promptFragment: "cool blue color palette, calming blues, serene tones, peaceful blues",
  },
  {
    id: "color-cool-teal",
    name: "Teal & Cyan",
    description: "Deep teal and cyan tones",
    promptFragment: "teal and cyan color palette, deep aquatic tones, ocean colors",
  },
  {
    id: "color-cool-mint",
    name: "Mint & Sage",
    description: "Fresh mint and sage greens",
    promptFragment: "mint and sage color palette, fresh green tones, calming natural colors",
  },
  {
    id: "color-cool-lavender",
    name: "Lavender Dream",
    description: "Soft purple and lavender tones",
    promptFragment: "lavender color palette, soft purple tones, dreamy pastels, gentle violet",
  },
  // Vibrant Palettes
  {
    id: "color-vibrant-neon",
    name: "Neon Vibrant",
    description: "Electric neon colors",
    promptFragment: "neon color palette, electric bright colors, vibrant fluorescent, high saturation",
  },
  {
    id: "color-vibrant-tropical",
    name: "Tropical Vibrant",
    description: "Bold tropical colors",
    promptFragment: "tropical color palette, vibrant paradise colors, bold exotic hues",
  },
  {
    id: "color-vibrant-pop",
    name: "Pop Art Colors",
    description: "Bold primary pop art palette",
    promptFragment: "pop art color palette, bold primary colors, high contrast, graphic colors",
  },
  {
    id: "color-vibrant-rainbow",
    name: "Rainbow Spectrum",
    description: "Full color spectrum",
    promptFragment: "rainbow color palette, full spectrum, all colors represented, prismatic",
  },
  // Muted & Pastel Palettes
  {
    id: "color-muted-desaturated",
    name: "Muted & Desaturated",
    description: "Subtle, low saturation tones",
    promptFragment: "muted color palette, desaturated tones, subtle colors, understated",
  },
  {
    id: "color-muted-pastel",
    name: "Soft Pastels",
    description: "Gentle pastel colors",
    promptFragment: "pastel color palette, soft gentle colors, light delicate tones",
  },
  {
    id: "color-muted-dusty",
    name: "Dusty Vintage",
    description: "Faded vintage color tones",
    promptFragment: "dusty color palette, faded vintage tones, weathered colors, aged appearance",
  },
  {
    id: "color-muted-nordic",
    name: "Nordic Minimalist",
    description: "Scandinavian neutral palette",
    promptFragment: "nordic color palette, Scandinavian neutrals, white and grey, minimal colors",
  },
  // Monochromatic
  {
    id: "color-mono-black-white",
    name: "Black & White",
    description: "Classic monochrome",
    promptFragment: "black and white, monochrome, grayscale, classic contrast",
  },
  {
    id: "color-mono-sepia",
    name: "Sepia Tone",
    description: "Warm brown monochrome",
    promptFragment: "sepia toned, warm brown monochrome, vintage sepia, antique photo",
  },
  {
    id: "color-mono-cyanotype",
    name: "Cyanotype Blue",
    description: "Blue monochrome print process",
    promptFragment: "cyanotype blue, Prussian blue monochrome, blueprint aesthetic",
  },
  // Specific Color Schemes
  {
    id: "color-split-complementary",
    name: "Split Complementary",
    description: "Harmonious contrast palette",
    promptFragment: "split complementary colors, harmonious contrast, balanced color tension",
  },
  {
    id: "color-analogous",
    name: "Analogous Colors",
    description: "Adjacent colors on color wheel",
    promptFragment: "analogous color palette, harmonious adjacent colors, smooth color flow",
  },
  {
    id: "color-triadic",
    name: "Triadic Harmony",
    description: "Three evenly spaced colors",
    promptFragment: "triadic color harmony, three-color balance, vibrant color triangle",
  },
  // Themed Palettes
  {
    id: "color-cyber-neon",
    name: "Cyberpunk Neon",
    description: "Pink, purple, and cyan cyberpunk",
    promptFragment: "cyberpunk neon palette, pink purple cyan, electric night colors, futuristic glow",
  },
  {
    id: "color-forest-earth",
    name: "Forest & Earth",
    description: "Deep greens and browns",
    promptFragment: "forest earth palette, deep greens, rich browns, woodland colors, natural",
  },
  {
    id: "color-ocean-depth",
    name: "Ocean Depths",
    description: "Deep sea blues and teals",
    promptFragment: "ocean depth palette, deep sea colors, dark blues, aquatic teal, marine",
  },
  {
    id: "color-desert-sand",
    name: "Desert Sands",
    description: "Sandy beige and rust tones",
    promptFragment: "desert sand palette, sandy beige, rust orange, arid earth tones",
  },
  {
    id: "color-night-sky",
    name: "Night Sky",
    description: "Deep blues and purples with stars",
    promptFragment: "night sky palette, deep midnight blue, cosmic purple, starlit darkness",
  },
];

// ==========================================
// All Templates Export
// ==========================================
export const allTemplates = {
  lighting: lightingTemplates,
  camera: cameraTemplates,
  style: styleTemplates,
  location: locationTemplates,
  pose: poseTemplates,
  action: actionTemplates,
  clothing: clothingTemplates,
  expression: expressionTemplates,
  // FLUX.2 Specific Categories
  mood: moodTemplates,
  cameraModel: cameraModelTemplates,
  lens: lensTemplates,
  colorPalette: colorPaletteTemplates,
};

export type TemplateCategory = keyof typeof allTemplates;

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return allTemplates[category];
}

/**
 * Get a template by ID from any category
 */
export function getTemplateById(id: string): Template | undefined {
  for (const templates of Object.values(allTemplates)) {
    const template = templates.find((t) => t.id === id);
    if (template) return template;
  }
  return undefined;
}
